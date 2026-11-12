import os
import operator
from typing import Annotated, TypedDict, List, Dict
import json

from dotenv import load_dotenv, find_dotenv
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langgraph.checkpoint.memory import MemorySaver
from rag_policy import retrieve_company_policy      # <-- ADDED
from inventory_mcp import check_internal_stock    # <-- ADDED
# To this:
from langsmith import traceable

from schemas import ProcurementAnalysis
from search import get_procurement_context
from policy import evaluate_policy_and_score

load_dotenv(find_dotenv())

class AgentState(TypedDict):
    input_request: str
    search_context: str
    policy_context: str
    stock_status: str
    chat_history: Annotated[List[str], operator.add]  # <-- ADDED (Short-term memory)
    long_term_memory: str                             # <-- ADDED (Long-term memory)
    analysis: ProcurementAnalysis
    evaluated_options: List[Dict]
    retries: int
    errors: str
llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0.7, groq_api_key=os.getenv("GROQ_API_KEY"))
structured_llm = llm.with_structured_output(ProcurementAnalysis, method="json_mode")

# <-- ADDED: Lightweight MCP Inventory Node
@traceable(
    name="mcp_inventory_node",
    tags=["mcp:inventory"],
    metadata={"step": "stock_check"}
)
def stock_check_node(state: AgentState):
    stock_msg = check_internal_stock(state["input_request"])
    return {"stock_status": stock_msg}


@traceable(
    name="procurement_researcher_node", 
    tags=["agent:researcher", "llm:groq"], 
    metadata={"step": "market_research"}
)
def research_node(state: AgentState):
    request = state["input_request"]
    errors = state.get("errors", "")
    
    context = get_procurement_context(request)
    internal_policy = retrieve_company_policy(request)           # <-- ADDED (RAG)
    stock_status = state.get("stock_status", "No stock found.")
    recent_turns = "\n".join(state.get("chat_history", [])[-5:]) or "None (new session)"
    past_orders = state.get("long_term_memory", "No prior purchase history.")  # <-- ADDED (MCP)
    schema_instructions = json.dumps(ProcurementAnalysis.model_json_schema(), indent=2)
    
    prompt = f"""
    You are a B2B procurement researcher. Find 3 vendor options for: {request}
    Use this live web data: {context}
    SHORT-TERM SESSION HISTORY (Follow-up context):
    {recent_turns}
    LONG-TERM COMPANY PURCHASE HISTORY (Past preferences):
    {past_orders}
    INTERNAL COMPANY POLICY (MUST FOLLOW): {internal_policy}
    INTERNAL INVENTORY STATUS: {stock_status}
    
    Previous Errors to fix: {errors}
    Flag is_estimated=True if the price is a guess and not in the web data.
    
    CRITICAL INSTRUCTION: You must respond in valid JSON matching the exact key names below.
- Vendor name key MUST be "vendor"
- Item title key MUST be "item_name"
- Unit price key MUST be "price" (numeric)
- Shipping days key MUST be "delivery_days" (integer)
- Star rating key MUST be "rating" (float 1.0-5.0)
- Product link key MUST be "url" (string URL from the web data)   # <-- ADD THIS

    REQUIRED SCHEMA:
    {schema_instructions}
    """
    
    response = structured_llm.invoke([{"role": "user", "content": prompt}])
    return {
        "analysis": response, 
        "search_context": context, 
        "policy_context": internal_policy , # <-- ADDED
        "chat_history": [f"User: {request} -> Agent Summary: {response.summary}"]  # <-- ADDED
    }
@traceable(
    name="mcp_inventory_node",
    tags=["mcp:inventory"],
    metadata={"step": "stock_check"}
)

# 2. Traced Policy Engine Node
@traceable(
    name="compliance_policy_node", 
    tags=["policy:rule_engine", "type:deterministic"], 
    metadata={"rule": "unit_limit_$500"}
)
def policy_node(state: AgentState):
    analysis = state["analysis"]
    evaluated = evaluate_policy_and_score(analysis.options, total_budget=2000.00)
    return {"evaluated_options": evaluated}

# 3. Traced Routing Node
@traceable(
    name="compliance_router_node", 
    tags=["graph:conditional_edge"], 
    metadata={"logic": "self_correcting_loop"}
)
def route_compliance(state: AgentState):
    has_compliant = any(opt["is_compliant"] for opt in state["evaluated_options"])
    retries = state.get("retries", 0)
    
    if not has_compliant and retries < 1:
        return "researcher" 
    return END

# Workflow Definition
workflow = StateGraph(AgentState)
workflow.add_node("stock_check", stock_check_node)
workflow.add_node("researcher", research_node)
workflow.add_node("policy_engine", policy_node)
workflow.set_entry_point("stock_check")
workflow.set_entry_point("researcher")
workflow.add_edge("researcher", "policy_engine")
workflow.add_conditional_edges(
    "policy_engine",
    route_compliance,
    {"researcher": "researcher", END: END}
)
memory = MemorySaver()  # <-- ADDED (Use SqliteSaver if you want memory to survive server restarts)
agent_app = workflow.compile(checkpointer=memory)
