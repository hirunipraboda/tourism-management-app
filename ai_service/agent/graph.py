import uuid
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from agent.tools import (
    tool_search_destination_attractions,
    tool_calculate_itinerary_metrics,
    tool_validate_attraction_constraints
)


class AttractionStateDict(TypedDict):
    thread_id: str
    destination_id: str
    destination_name: str
    user_budget: float
    max_duration_hours: float
    categories: List[str]
    require_accessible: bool
    notes: str
    candidate_attractions: List[Dict[str, Any]]
    curated_plan: List[Dict[str, Any]]
    validation_result: Dict[str, Any]
    iteration_count: int
    reasoning_log: List[Dict[str, Any]]
    status: str
    human_decision: Optional[str]
    human_feedback: Optional[str]


# -------------------------------------------------------------------
# Graph Node Functions
# -------------------------------------------------------------------

def node_gather_attractions(state: AttractionStateDict) -> Dict[str, Any]:
    """Node 1: Gather candidate attractions using allow-listed search tools."""
    destination_name = state.get("destination_name", "Unknown")
    categories = state.get("categories", [])
    require_accessible = state.get("require_accessible", True)
    
    candidates = tool_search_destination_attractions(destination_name, categories, require_accessible)
    
    log_entry = {
        "step": "Gathering Attractions",
        "description": f"Querying DB & domain knowledge for destination '{destination_name}' with categories {categories}.",
        "output_summary": f"Found {len(candidates)} candidate attraction options."
    }
    
    reasoning_log = list(state.get("reasoning_log", []))
    reasoning_log.append(log_entry)
    
    return {
        "candidate_attractions": candidates,
        "reasoning_log": reasoning_log,
        "status": "REASONING"
    }


def node_curate_itinerary(state: AttractionStateDict) -> Dict[str, Any]:
    """Node 2: Multi-step reasoning to build an optimized attraction package matching constraints."""
    candidates = state.get("candidate_attractions", [])
    user_budget = state.get("user_budget", 100.0)
    max_duration_hours = state.get("max_duration_hours", 8.0)
    require_accessible = state.get("require_accessible", True)
    iteration_count = state.get("iteration_count", 0) + 1
    validation_res = state.get("validation_result", {})
    human_feedback = state.get("human_feedback", None)
    
    # Filter candidates strictly if accessible is required
    eligible = []
    for c in candidates:
        if require_accessible and not c.get("is_accessible", True):
            continue
        eligible.append(c)
        
    if not eligible:
        eligible = candidates  # Fallback to allow validator to critique
        
    # Multi-step ranking and curation logic:
    # If this is a self-correction loop due to budget or duration failure, trim expensive/long items
    selected = []
    current_cost = 0.0
    current_minutes = 0
    max_minutes = max_duration_hours * 60
    
    # If human requested revision or previous validation failed, adjust criteria
    if human_feedback and "cheaper" in human_feedback.lower():
        eligible = sorted(eligible, key=lambda x: x.get("entry_fee", 0.0))
    else:
        # Prioritize matching categories and balanced fees
        eligible = sorted(eligible, key=lambda x: (0 if any(cat.lower() in x.get("category", "").lower() for cat in state.get("categories", [])) else 1, x.get("entry_fee", 0.0)))

    for item in eligible:
        fee = float(item.get("entry_fee", 0.0))
        dur = int(item.get("visit_duration_minutes", 60))
        
        # Self-correction adjustment on high iterations
        if iteration_count > 1 and (current_cost + fee > user_budget or current_minutes + dur > max_minutes):
            continue
            
        if current_cost + fee <= user_budget * 1.1 and current_minutes + dur <= max_minutes * 1.1:
            selected.append(item)
            current_cost += fee
            current_minutes += dur

    # Run tool to format metrics and scheduled slots
    metrics = tool_calculate_itinerary_metrics(selected)
    curated_items = metrics["scheduled_items"]
    
    log_entry = {
        "step": f"Curate Itinerary (Iteration {iteration_count})",
        "description": f"Selected {len(curated_items)} attractions totaling ${metrics['total_cost']} over {metrics['total_duration_hours']} hours.",
        "output_summary": f"Scheduled items: {', '.join([i['name'] for i in curated_items])}"
    }
    
    reasoning_log = list(state.get("reasoning_log", []))
    reasoning_log.append(log_entry)
    
    return {
        "curated_plan": curated_items,
        "iteration_count": iteration_count,
        "reasoning_log": reasoning_log,
        "status": "VALIDATING"
    }


def node_self_validate(state: AttractionStateDict) -> Dict[str, Any]:
    """Node 3: Self-validation critique node running deterministic validator tool."""
    curated_plan = state.get("curated_plan", [])
    user_budget = state.get("user_budget", 100.0)
    max_duration_hours = state.get("max_duration_hours", 8.0)
    require_accessible = state.get("require_accessible", True)
    
    val_result = tool_validate_attraction_constraints(
        curated_plan,
        user_budget,
        max_duration_hours,
        require_accessible
    )
    
    val_dict = {
        "is_valid": val_result.is_valid,
        "budget_pass": val_result.budget_pass,
        "duration_pass": val_result.duration_pass,
        "accessibility_pass": val_result.accessibility_pass,
        "checked_rules": val_result.checked_rules,
        "error_messages": val_result.error_messages
    }
    
    log_entry = {
        "step": "Self-Validation Critique",
        "description": f"Executed 5 deterministic rule checks. Valid: {val_result.is_valid}.",
        "output_summary": f"Errors: {'; '.join(val_result.error_messages) if val_result.error_messages else 'None (All rules passed!)'}"
    }
    
    reasoning_log = list(state.get("reasoning_log", []))
    reasoning_log.append(log_entry)
    
    next_status = "PENDING_HUMAN_APPROVAL" if val_result.is_valid or state.get("iteration_count", 1) >= 3 else "REASONING"
    
    return {
        "validation_result": val_dict,
        "reasoning_log": reasoning_log,
        "status": next_status
    }


def node_human_approval(state: AttractionStateDict) -> Dict[str, Any]:
    """Node 4: Pauses execution for human-in-the-loop approval or feedback."""
    log_entry = {
        "step": "Human-in-the-Loop Review",
        "description": "Workflow state persisted. Awaiting user/admin approval decision.",
        "output_summary": f"Current decision: {state.get('human_decision', 'PENDING')}"
    }
    
    reasoning_log = list(state.get("reasoning_log", []))
    reasoning_log.append(log_entry)
    
    return {
        "status": "PENDING_HUMAN_APPROVAL",
        "reasoning_log": reasoning_log
    }


def node_finalize_attractions(state: AttractionStateDict) -> Dict[str, Any]:
    """Node 5: Finalize curated attraction package based on human decision."""
    decision = (state.get("human_decision") or "APPROVE").upper()
    
    if decision == "APPROVE":
        final_status = "APPROVED"
        summary = "User approved the curated attraction package. Ready for ASP.NET Core DB insertion."
    else:
        final_status = "REJECTED"
        summary = "User rejected the curated attraction package."
        
    log_entry = {
        "step": "Finalize & Export",
        "description": f"Human decision received: {decision}.",
        "output_summary": summary
    }
    
    reasoning_log = list(state.get("reasoning_log", []))
    reasoning_log.append(log_entry)
    
    return {
        "status": final_status,
        "reasoning_log": reasoning_log
    }


# -------------------------------------------------------------------
# Conditional Router Logic
# -------------------------------------------------------------------

def route_after_validation(state: AttractionStateDict) -> str:
    """Routes to human_approval if valid or max retries reached, else back to curate_itinerary for critique loop."""
    val_res = state.get("validation_result", {})
    is_valid = val_res.get("is_valid", False)
    iteration_count = state.get("iteration_count", 1)
    
    if is_valid or iteration_count >= 3:
        return "human_approval"
    return "curate_itinerary"


def route_after_human_approval(state: AttractionStateDict) -> str:
    """Routes based on human decision signal."""
    decision = (state.get("human_decision") or "").upper()
    if decision == "REVISE":
        return "curate_itinerary"
    if decision in ["APPROVE", "REJECT"]:
        return "finalize_attractions"
    # Pauses graph pass when waiting for human approval
    return END


# -------------------------------------------------------------------
# Graph Building & Export
# -------------------------------------------------------------------

def build_attraction_graph():
    builder = StateGraph(AttractionStateDict)
    
    builder.add_node("gather_attractions", node_gather_attractions)
    builder.add_node("curate_itinerary", node_curate_itinerary)
    builder.add_node("self_validate", node_self_validate)
    builder.add_node("human_approval", node_human_approval)
    builder.add_node("finalize_attractions", node_finalize_attractions)
    
    builder.add_edge(START, "gather_attractions")
    builder.add_edge("gather_attractions", "curate_itinerary")
    builder.add_edge("curate_itinerary", "self_validate")
    
    builder.add_conditional_edges(
        "self_validate",
        route_after_validation,
        {
            "human_approval": "human_approval",
            "curate_itinerary": "curate_itinerary"
        }
    )
    
    builder.add_conditional_edges(
        "human_approval",
        route_after_human_approval,
        {
            "finalize_attractions": "finalize_attractions",
            "curate_itinerary": "curate_itinerary",
            END: END
        }
    )
    
    builder.add_edge("finalize_attractions", END)
    
    memory = MemorySaver()
    return builder.compile(checkpointer=memory)


attraction_agent_graph = build_attraction_graph()
