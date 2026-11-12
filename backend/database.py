from sqlmodel import SQLModel, Field, Relationship, Session, create_engine
from typing import Optional, List
from datetime import datetime, timezone

class PurchaseRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    prompt: str
    department: str = Field(default="Engineering")
    budget_limit: float = Field(default=2000.00)
    status: str = Field(default="PENDING_APPROVAL")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    vendor_options: List["VendorOption"] = Relationship(back_populates="request")
    audit_logs: List["AuditLog"] = Relationship(back_populates="request")

class VendorOption(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    request_id: int = Field(foreign_key="purchaserequest.id")
    vendor_name: str
    item_name: str
    price: float
    delivery_days: int
    rating: float
    is_estimated: bool = Field(default=False)
    
    # Policy & Scoring
    is_compliant: bool = Field(default=True)
    compliance_violations: Optional[str] = None
    score: float = Field(default=0.0)
    is_recommended: bool = Field(default=False)
    
    selected_for_payment: bool = Field(default=False)
    override_reason: Optional[str] = None
    
    request: Optional[PurchaseRequest] = Relationship(back_populates="vendor_options")

class OrderTransaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    request_id: int = Field(foreign_key="purchaserequest.id")
    paypal_order_id: str
    amount: float
    status: str = Field(default="CREATED")
    idempotency_key: str = Field(unique=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    request_id: int = Field(foreign_key="purchaserequest.id")
    action: str
    actor: str  # SYSTEM, EMPLOYEE, MANAGER
    detail: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    request: Optional[PurchaseRequest] = Relationship(back_populates="audit_logs")

engine = create_engine("sqlite:///agentprocure.db", echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session