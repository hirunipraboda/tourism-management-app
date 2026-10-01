import uuid
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware

from agent.schemas import (
    CurateRequest,
    HumanApprovalRequest,
    AgentStateResponse,
    CuratedAttraction,
    ValidationResult
)
from agent.graph import attraction_agent_graph

app = FastAPI(
    title="Nova Destination Attraction AI Service",
    version="1.0.0",
    description="Python LangGraph AI service for multi-step reasoning, self-validation, and human-in-the-loop attraction curation."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {
        "service": "Nova Destination Attraction AI Service",
        "status": "Healthy",
        "engine": "LangGraph StateGraph"
    }


@app.post("/api/v1/attractions/curate", response_model=AgentStateResponse)
def curate_attractions(req: CurateRequest):
    thread_id = req.thread_id or f"thread_{uuid.uuid4().hex[:8]}"
    
    initial_state = {
        "thread_id": thread_id,
        "destination_id": req.destination_id,
        "destination_name": req.destination_name,
        "user_budget": req.preferences.user_budget,
        "max_duration_hours": req.preferences.max_duration_hours,
        "categories": req.preferences.categories,
        "require_accessible": req.preferences.require_accessible,
        "notes": req.preferences.notes or "",
        "candidate_attractions": [],
        "curated_plan": [],
        "validation_result": {
            "is_valid": False,
            "budget_pass": True,
            "duration_pass": True,
            "accessibility_pass": True,
            "checked_rules": [],
            "error_messages": []
        },
        "iteration_count": 0,
        "reasoning_log": [],
        "status": "STARTING",
        "human_decision": None,
        "human_feedback": None
    }
    
    config = {"configurable": {"thread_id": thread_id}}
    
    try:
        final_state = attraction_agent_graph.invoke(initial_state, config=config)
        return format_state_response(thread_id, final_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph execution failed: {str(e)}")


@app.post("/api/v1/attractions/approve", response_model=AgentStateResponse)
def approve_attractions(req: HumanApprovalRequest):
    config = {"configurable": {"thread_id": req.thread_id}}
    state_snapshot = attraction_agent_graph.get_state(config)
    
    if not state_snapshot or not state_snapshot.values:
        raise HTTPException(status_code=44, detail=f"Thread '{req.thread_id}' not found in checkpointer.")
        
    current_values = dict(state_snapshot.values)
    current_values["human_decision"] = req.decision.upper()
    if req.feedback:
        current_values["human_feedback"] = req.feedback
        
    try:
        updated_state = attraction_agent_graph.invoke(current_values, config=config)
        return format_state_response(req.thread_id, updated_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph resume failed: {str(e)}")


@app.get("/api/v1/attractions/status/{thread_id}", response_model=AgentStateResponse)
def get_status(thread_id: str = Path(...)):
    config = {"configurable": {"thread_id": thread_id}}
    state_snapshot = attraction_agent_graph.get_state(config)
    
    if not state_snapshot or not state_snapshot.values:
        raise HTTPException(status_code=404, detail=f"Thread '{thread_id}' not found in checkpointer.")
        
    return format_state_response(thread_id, state_snapshot.values)


def format_state_response(thread_id: str, state: Dict[str, Any]) -> AgentStateResponse:
    plan = [
        CuratedAttraction(
            name=item.get("name", "Attraction"),
            category=item.get("category", "General"),
            opening_hours=item.get("opening_hours", "09:00 - 18:00"),
            entry_fee=float(item.get("entry_fee", 0.0)),
            visit_duration_minutes=int(item.get("visit_duration_minutes", 60)),
            latitude=item.get("latitude"),
            longitude=item.get("longitude"),
            is_accessible=bool(item.get("is_accessible", True)),
            rationale=item.get("rationale", ""),
            scheduled_time=item.get("scheduled_time", "10:00 AM")
        ) for item in state.get("curated_plan", [])
    ]
    
    val_dict = state.get("validation_result", {})
    val_obj = ValidationResult(
        is_valid=bool(val_dict.get("is_valid", False)),
        budget_pass=bool(val_dict.get("budget_pass", True)),
        duration_pass=bool(val_dict.get("duration_pass", True)),
        accessibility_pass=bool(val_dict.get("accessibility_pass", True)),
        checked_rules=val_dict.get("checked_rules", []),
        error_messages=val_dict.get("error_messages", [])
    )
    
    return AgentStateResponse(
        thread_id=thread_id,
        destination_id=state.get("destination_id", ""),
        destination_name=state.get("destination_name", ""),
        status=state.get("status", "UNKNOWN"),
        iteration_count=state.get("iteration_count", 0),
        curated_plan=plan,
        validation_result=val_obj,
        reasoning_log=state.get("reasoning_log", []),
        human_decision=state.get("human_decision"),
        human_feedback=state.get("human_feedback")
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
