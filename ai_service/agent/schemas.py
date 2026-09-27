from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class UserPreferences(BaseModel):
    user_budget: float = Field(default=100.0, description="Maximum budget in USD")
    max_duration_hours: float = Field(default=8.0, description="Maximum visit duration in hours")
    categories: List[str] = Field(default_factory=lambda: ["Cultural", "Historical", "Scenic"], description="Preferred categories")
    require_accessible: bool = Field(default=True, description="Must be wheelchair accessible")
    notes: Optional[str] = Field(default="", description="Additional user notes or preferences")


class CurateRequest(BaseModel):
    thread_id: Optional[str] = None
    destination_id: str
    destination_name: str
    preferences: UserPreferences


class HumanApprovalRequest(BaseModel):
    thread_id: str
    decision: str = Field(..., description="APPROVE, REJECT, or REVISE")
    feedback: Optional[str] = None


class CuratedAttraction(BaseModel):
    name: str
    category: str
    opening_hours: str = "09:00 - 18:00"
    entry_fee: float = 0.0
    visit_duration_minutes: int = 60
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_accessible: bool = True
    rationale: str = ""
    scheduled_time: str = "10:00 AM"


class ValidationResult(BaseModel):
    is_valid: bool = True
    budget_pass: bool = True
    duration_pass: bool = True
    accessibility_pass: bool = True
    checked_rules: List[str] = Field(default_factory=list)
    error_messages: List[str] = Field(default_factory=list)


class AgentStateResponse(BaseModel):
    thread_id: str
    destination_id: str
    destination_name: str
    status: str
    iteration_count: int
    curated_plan: List[CuratedAttraction]
    validation_result: ValidationResult
    reasoning_log: List[Dict[str, Any]]
    human_decision: Optional[str] = None
    human_feedback: Optional[str] = None
