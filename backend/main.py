import uuid
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from sqlmodel import Session, select, func
from database import create_db_and_tables, get_session, PurchaseRequest, VendorOption, OrderTransaction, AuditLog
from graph import agent_app
from rag_policy import initialize_knowledge_base
import paypal_service

SECRET_KEY = "agentprocure-super-secret-jwt-key"
ALGORITHM = "HS256"

app = FastAPI(title="AgentProcure AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://agentprocure-ai.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def print_routes():
    print("=== Registered FastAPI Routes ===")
    for route in app.routes:
        if hasattr(route, "path"):
            print(f"Route: {route.path}")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    initialize_knowledge_base("company_policy.pdf")

# ----------------- Dummy User Store & JWT Auth -----------------
DUMMY_USERS = {
    "employee1": {"password": "password123", "role": "employee", "id": "emp_01", "name": "Alex (Engineering)"},
    "manager1": {"password": "admin123", "role": "finance_manager", "id": "mgr_01", "name": "Sarah (Finance Lead)"},
}

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/auth/login", tags=["Authentication"])
def login_endpoint(req: LoginRequest):
    user = DUMMY_USERS.get(req.username.strip())
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    expire = datetime.now(timezone.utc) + timedelta(hours=4)
    payload = {
        "sub": user["id"],
        "role": user["role"],
        "name": user["name"],
        "exp": expire,
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "user_id": user["id"],
        "name": user["name"],
    }

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {
            "id": payload.get("sub"),
            "role": payload.get("role", "employee"),
            "name": payload.get("name", "User"),
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")

def require_manager(user: dict = Depends(get_current_user)):
    if user["role"] != "finance_manager":
        raise HTTPException(status_code=403, detail="Finance Manager role required.")
    return user

# ----------------- Pydantic Requests -----------------
class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"

class ApproveRequest(BaseModel):
    request_id: int
    vendor_option_id: int
    override_reason: Optional[str] = None

class PaypalActionRequest(BaseModel):
    request_id: Optional[int] = None
    amount: Optional[float] = None
    order_id: Optional[str] = None

# ----------------- Endpoints -----------------
@app.post("/api/chat", tags=["AI Agent & Chat"])
def chat_endpoint(
    req: ChatRequest,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    past_reqs = db.exec(select(PurchaseRequest).order_by(PurchaseRequest.id.desc()).limit(5)).all()
    long_term_str = "\n".join([f"- Past Request #{r.id}: {r.prompt}" for r in past_reqs]) or "No prior requests."

    db_request = PurchaseRequest(prompt=req.message)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    db.add(
        AuditLog(
            request_id=db_request.id,
            action="REQUEST_SUBMITTED",
            actor=f"{user['role'].upper()} ({user['id']})",
            detail=req.message,
        )
    )
    db.commit()

    config = {"configurable": {"thread_id": f"{user['id']}:{req.session_id}"}}
    result = agent_app.invoke(
        {
            "input_request": req.message,
            "long_term_memory": long_term_str,
            "retries": 0,
            "errors": "",
        },
        config=config,
    )

    saved_opts = []
    for opt_data in result["evaluated_options"]:
        vendor_val = opt_data.pop("vendor", "Unknown Vendor")
        db_opt = VendorOption(request_id=db_request.id, vendor_name=vendor_val, **opt_data)
        db.add(db_opt)
        db.commit()
        db.refresh(db_opt)
        saved_opts.append(db_opt.dict())

        if not db_opt.is_compliant:
            db.add(
                AuditLog(
                    request_id=db_request.id,
                    action="POLICY_VIOLATION_FLAGGED",
                    actor="SYSTEM",
                    detail=f"{db_opt.vendor_name}: {db_opt.compliance_violations}",
                )
            )

    db.commit()

    return {
        "request_id": db_request.id,
        "summary": result["analysis"].summary,
        "options": saved_opts,
        "stock_status": result.get("stock_status"),
        "policy_context": result.get("policy_context"),
    }

@app.post("/api/approve", tags=["Approvals & RBAC"])
def approve_endpoint(
    req: ApproveRequest,
    user: dict = Depends(require_manager),
    db: Session = Depends(get_session),
):
    db_req = db.get(PurchaseRequest, req.request_id)
    db_opt = db.get(VendorOption, req.vendor_option_id)

    if not db_req or not db_opt:
        raise HTTPException(status_code=404, detail="Request or Vendor Option not found in database.")

    if not db_opt.is_compliant and not req.override_reason:
        raise HTTPException(status_code=400, detail="Non-compliant items require an override_reason.")

    db_req.status = "APPROVED"
    db_opt.selected_for_payment = True
    db_opt.override_reason = req.override_reason

    audit_detail = f"Approved {db_opt.vendor_name} for ${db_opt.price}."
    if req.override_reason:
        audit_detail += f" OVERRIDE: {req.override_reason}"

    db.add(
        AuditLog(
            request_id=db_req.id,
            action="MANAGER_APPROVAL",
            actor=f"MANAGER ({user['id']})",
            detail=audit_detail,
        )
    )
    db.commit()
    return {"status": "APPROVED"}

@app.post("/api/paypal/create-order", tags=["PayPal Payments"])
def create_paypal_order(
    req: PaypalActionRequest,
    user: dict = Depends(require_manager),
    db: Session = Depends(get_session),
):
    opt = db.exec(
        select(VendorOption)
        .where(VendorOption.request_id == req.request_id)
        .order_by(VendorOption.price.asc())
    ).first()

    if not opt:
        raise HTTPException(status_code=400, detail="No vendor options found for this request.")

    actual_price = opt.price
    idempotency_key = str(uuid.uuid4())
    order_res = paypal_service.create_paypal_order(actual_price, idempotency_key=idempotency_key)

    txn = OrderTransaction(
        request_id=req.request_id,
        paypal_order_id=order_res["id"],
        amount=actual_price,
        status="CREATED",
        idempotency_key=idempotency_key
    )
    db.add(txn)
    db.commit()

    return {"order_id": order_res["id"], "verified_amount": actual_price}

@app.post("/api/paypal/capture-order", tags=["PayPal Payments"])
def capture_order(
    req: PaypalActionRequest,
    user: dict = Depends(require_manager),
    db: Session = Depends(get_session),
):
    txn = db.exec(select(OrderTransaction).where(OrderTransaction.paypal_order_id == req.order_id)).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Order transaction not found.")
    if txn.status == "COMPLETED":
        return {"status": "COMPLETED", "message": "Already captured"}

    paypal_service.capture_paypal_order(req.order_id, txn.idempotency_key)
    txn.status = "COMPLETED"

    db_req = db.get(PurchaseRequest, txn.request_id)
    if db_req:
        db_req.status = "PAID"

    db.add(
        AuditLog(
            request_id=txn.request_id,
            action="PAYMENT_CAPTURED",
            actor=f"MANAGER ({user['id']})",
            detail=f"Captured ${txn.amount}",
        )
    )
    db.commit()
    return {"status": "COMPLETED"}

@app.get("/api/requests", tags=["Audit & History"])
def get_all_requests(user: dict = Depends(get_current_user), db: Session = Depends(get_session)):
    return db.exec(select(PurchaseRequest).order_by(PurchaseRequest.id.desc())).all()

@app.get("/api/requests/{request_id}/logs", tags=["Audit & History"])
def get_request_logs(request_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_session)):
    return db.exec(select(AuditLog).where(AuditLog.request_id == request_id)).all()

@app.get("/api/analytics", tags=["Analytics"])
def analytics(user: dict = Depends(get_current_user), db: Session = Depends(get_session)):
    total_spend = db.exec(select(func.sum(OrderTransaction.amount)).where(OrderTransaction.status == "COMPLETED")).first() or 0
    policy_blocks = len(db.exec(select(VendorOption).where(VendorOption.is_compliant == False)).all())

    return {
        "total_spend": total_spend,
        "policy_blocks_prevented": policy_blocks,
        "spend_by_department": {"Engineering": total_spend},
        "estimated_savings_vs_avg_quote": round(total_spend * 0.15, 2),
    }