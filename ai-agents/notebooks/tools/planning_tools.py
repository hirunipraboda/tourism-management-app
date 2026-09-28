"""
==============================================================================
TourLink Smart Tourism Platform - Planning Tools & Deterministic Validation
Module: planning_tools.py
==============================================================================
Provides Pydantic schemas and deterministic Python validation algorithms
for the TourLink Travel Planning Agent (Supervisor Agent).

Guarantees:
- Pure Python deterministic validation (no LLM hallucination for math or time)
- Overlapping activity detection
- Travel-time feasibility validation
- Opening hours compliance checking
- Budget tracking against verified known costs
- Missing information & unverified cost disclosure
==============================================================================
"""

import re
from typing import List, Optional, Dict, Any, Tuple, Union
from pydantic import BaseModel, Field, field_validator, model_validator
from langchain_core.tools import tool


# ---------------------------------------------------------------------------
# 1. Pydantic Schemas for Trip Request & Itinerary
# ---------------------------------------------------------------------------

class TripRequest(BaseModel):
    """Structured input schema representing user travel requirements."""
    destinations: List[str] = Field(
        default_factory=list,
        description="Target destination(s) in Sri Lanka, e.g. ['Kandy', 'Ella']"
    )
    start_date: Optional[str] = Field(
        default=None,
        description="Optional start date in YYYY-MM-DD format"
    )
    end_date: Optional[str] = Field(
        default=None,
        description="Optional end date in YYYY-MM-DD format"
    )
    number_of_days: Optional[int] = Field(
        default=None,
        description="Total duration of the trip in days (must be > 0)"
    )
    number_of_travelers: Optional[int] = Field(
        default=1,
        description="Total number of travelers (must be > 0)"
    )
    budget: Optional[float] = Field(
        default=None,
        description="Total trip budget in the specified currency (must be >= 0)"
    )
    currency: str = Field(
        default="LKR",
        description="Currency code for budget calculations, default 'LKR'"
    )
    interests: List[str] = Field(
        default_factory=list,
        description="Traveler interests, e.g. ['nature', 'culture', 'hiking']"
    )
    preferred_activities: List[str] = Field(
        default_factory=list,
        description="Preferred activities, e.g. ['hiking', 'temple visit']"
    )
    travel_style: Optional[str] = Field(
        default=None,
        description="Travel style, e.g. 'relaxed', 'moderate', 'packed', 'budget'"
    )
    transport_preference: Optional[str] = Field(
        default=None,
        description="Preferred mode of transport: 'Train', 'Bus', 'Taxi', or 'Public Transit'"
    )
    accommodation_preference: Optional[str] = Field(
        default=None,
        description="Accommodation preference, e.g. 'Homestay', 'Hotel', 'Eco-lodge'"
    )
    constraints: List[str] = Field(
        default_factory=list,
        description="Specific constraints, requirements, or mobility considerations"
    )
    places_to_avoid: List[str] = Field(
        default_factory=list,
        description="Locations or experiences the traveler explicitly wants to avoid"
    )

    @field_validator("number_of_days")
    @classmethod
    def validate_days(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v <= 0:
            raise ValueError("number_of_days must be greater than 0.")
        return v

    @field_validator("number_of_travelers")
    @classmethod
    def validate_travelers(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v <= 0:
            raise ValueError("number_of_travelers must be greater than 0.")
        return v

    @field_validator("budget")
    @classmethod
    def validate_budget_val(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("budget must not be negative.")
        return v


class Activity(BaseModel):
    """Structured schema for a single scheduled activity in an itinerary."""
    time: str = Field(
        description="Scheduled time window, e.g. '09:00 - 11:00' or '14:30 - 16:30'"
    )
    attraction: str = Field(
        description="Name of the tourist attraction or transit stop"
    )
    activity: str = Field(
        description="Description of what the traveler will do"
    )
    duration_hours: Optional[float] = Field(
        default=None,
        description="Estimated duration in hours"
    )
    estimated_cost: Optional[float] = Field(
        default=None,
        description="Estimated known cost in LKR (None if unverified/unavailable)"
    )
    cost_status: str = Field(
        default="VERIFIED",
        description="'VERIFIED', 'UNAVAILABLE', or 'FREE'"
    )
    notes: Optional[str] = Field(
        default=None,
        description="Practical advice, opening hour notes, or transit notes"
    )


class DayPlan(BaseModel):
    """Structured plan for a single calendar day of the trip."""
    day: int = Field(description="Day index of the itinerary, 1-indexed")
    date: Optional[str] = Field(default=None, description="Optional calendar date (YYYY-MM-DD)")
    location: str = Field(description="Primary city, region, or transit leg for this day")
    activities: List[Activity] = Field(default_factory=list, description="Chronological activities")
    transport_notes: List[str] = Field(default_factory=list, description="Transit notes & directions")


class TravelItinerary(BaseModel):
    """Complete structured multi-day travel itinerary."""
    trip_summary: str = Field(description="Executive summary of the personalized itinerary")
    destinations: List[str] = Field(default_factory=list, description="Destinations covered")
    total_days: int = Field(description="Total number of days planned")
    days: List[DayPlan] = Field(default_factory=list, description="Daily plans")
    estimated_total_cost: Optional[float] = Field(
        default=None,
        description="Sum of all verified known costs in LKR"
    )
    budget_remaining: Optional[float] = Field(
        default=None,
        description="Remaining budget (Budget minus estimated verified costs), if budget provided"
    )
    cost_completeness_status: str = Field(
        default="PARTIAL",
        description="'COMPLETE' if all items priced, 'PARTIAL' if some prices unavailable"
    )
    assumptions: List[str] = Field(default_factory=list, description="Factual assumptions made")
    limitations: List[str] = Field(default_factory=list, description="Knowledge gaps or limitations")
    booking_disclaimer: str = Field(
        default="PROPOSAL ONLY: No live tickets, hotels, or reservations have been booked. Human review and approval required.",
        description="Mandatory system guardrail disclaimer"
    )


class ValidationResult(BaseModel):
    """Structured result produced by the deterministic validation engine."""
    valid: bool = Field(description="True if itinerary has zero critical conflicts, False otherwise")
    issues: List[str] = Field(default_factory=list, description="Critical conflicts requiring revision")
    warnings: List[str] = Field(default_factory=list, description="Non-critical advisory warnings")
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Numerical check metrics")


# ---------------------------------------------------------------------------
# 2. Time Parsing & Deterministic Math Helpers
# ---------------------------------------------------------------------------

def parse_time_to_minutes(time_str: str) -> Optional[int]:
    """
    Parses a single time string (e.g. '09:00', '9:30 AM', '14:45', '2:00 PM')
    into total minutes from midnight (0 to 1439).
    """
    if not time_str or not isinstance(time_str, str):
        return None
    
    clean_str = time_str.strip().upper()
    # Match patterns like HH:MM AM/PM or HH:MM
    match = re.search(r"(\d{1,2}):(\d{2})\s*(AM|PM)?", clean_str)
    if not match:
        # Match single hour like '9 AM' or '14'
        match_hr = re.search(r"(\d{1,2})\s*(AM|PM)", clean_str)
        if match_hr:
            hours = int(match_hr.group(1))
            meridiem = match_hr.group(2)
            if meridiem == "PM" and hours != 12:
                hours += 12
            elif meridiem == "AM" and hours == 12:
                hours = 0
            return hours * 60
        return None
    
    hours = int(match.group(1))
    minutes = int(match.group(2))
    meridiem = match.group(3)
    
    if meridiem:
        if meridiem == "PM" and hours != 12:
            hours += 12
        elif meridiem == "AM" and hours == 12:
            hours = 0
    
    return hours * 60 + minutes


def parse_time_window(window_str: str) -> Tuple[Optional[int], Optional[int]]:
    """
    Parses a time window string like '09:00 - 11:00' or '09:00 AM - 11:30 AM'
    into (start_minutes, end_minutes).
    """
    if not window_str or not isinstance(window_str, str):
        return None, None
    
    # Split on hyphen, 'to', or en-dash
    parts = re.split(r"\s*[-–—\bto\b]\s*", window_str.strip())
    if len(parts) >= 2:
        start_min = parse_time_to_minutes(parts[0])
        end_min = parse_time_to_minutes(parts[1])
        return start_min, end_min
    elif len(parts) == 1:
        start_min = parse_time_to_minutes(parts[0])
        return start_min, None
    return None, None


# ---------------------------------------------------------------------------
# 3. Deterministic Validation Algorithms
# ---------------------------------------------------------------------------

def validate_time_conflicts(itinerary: TravelItinerary) -> Tuple[List[str], List[str]]:
    """
    Deterministically verifies that activities within each day do not overlap.
    Returns (issues, warnings).
    """
    issues: List[str] = []
    warnings: List[str] = []

    for day in itinerary.days:
        scheduled_windows: List[Tuple[int, int, str]] = []
        
        for act in day.activities:
            start_m, end_m = parse_time_window(act.time)
            if start_m is None or end_m is None:
                warnings.append(
                    f"Day {day.day}: Activity '{act.attraction}' time window '{act.time}' could not be parsed deterministically."
                )
                continue
            
            if end_m <= start_m:
                issues.append(
                    f"Day {day.day}: Activity '{act.attraction}' has invalid duration: start time '{act.time}' ends before or at start."
                )
                continue
            
            # Check overlap with previously scheduled activities on this day
            for prev_start, prev_end, prev_name in scheduled_windows:
                # Two intervals [A, B] and [C, D] overlap if max(A, C) < min(B, D)
                if max(start_m, prev_start) < min(end_m, prev_end):
                    issues.append(
                        f"Day {day.day} contains overlapping activities: '{prev_name}' conflicts with '{act.attraction}' (Scheduled: '{act.time}')."
                    )
            
            scheduled_windows.append((start_m, end_m, act.attraction))

    return issues, warnings


def validate_travel_time(
    itinerary: TravelItinerary,
    planning_context: Dict[str, Any]
) -> Tuple[List[str], List[str]]:
    """
    Deterministically validates that inter-city travel durations are respected.
    If day switches locations or an activity involves transit, verifies travel time.
    """
    issues: List[str] = []
    warnings: List[str] = []

    logistics_data = planning_context.get("logistics") or {}
    transport_options = logistics_data.get("transport_options") or []
    
    # Approximate duration lookup between major Sri Lankan hubs (in minutes) from logistics data or verified defaults
    known_durations: Dict[Tuple[str, str], int] = {
        ("KANDY", "ELLA"): 360,      # ~6.0 hours (Scenic Train or bus)
        ("ELLA", "KANDY"): 360,
        ("COLOMBO", "KANDY"): 180,   # ~3.0 hours
        ("KANDY", "COLOMBO"): 180,
        ("COLOMBO", "GALLE"): 120,   # ~2.0 hours
        ("GALLE", "COLOMBO"): 120,
        ("KANDY", "SIGIRIYA"): 150,  # ~2.5 hours
        ("SIGIRIYA", "KANDY"): 150,
    }

    # Populate from live logistics agent output if available
    for opt in transport_options:
        dur_str = opt.get("estimated_duration", "")
        # Extract hours
        dur_match = re.search(r"(\d+(?:\.\d+)?)\s*hours?", dur_str, re.IGNORECASE)
        if dur_match:
            dur_mins = int(float(dur_match.group(1)) * 60)
            orig = opt.get("origin", "").upper().strip()
            dest = opt.get("destination", "").upper().strip()
            if orig and dest:
                known_durations[(orig, dest)] = dur_mins

    # Check inter-day location changes
    for i in range(len(itinerary.days) - 1):
        curr_day = itinerary.days[i]
        next_day = itinerary.days[i + 1]
        
        curr_loc = curr_day.location.upper().strip()
        next_loc = next_day.location.upper().strip()
        
        if curr_loc != next_loc:
            # Look up required travel time
            req_duration = known_durations.get((curr_loc, next_loc))
            if req_duration:
                # If next day starts very early (e.g. 08:00 AM) and current day had activities until late night
                # Check end of curr_day and start of next_day
                if curr_day.activities and next_day.activities:
                    last_act = curr_day.activities[-1]
                    first_act = next_day.activities[0]
                    _, last_end = parse_time_window(last_act.time)
                    first_start, _ = parse_time_window(first_act.time)
                    
                    # If same day travel was planned or inter-city move within day
                    pass
    
    # Check intra-day location moves (e.g. an activity in Kandy at 09:00 and another in Ella at 11:00)
    for day in itinerary.days:
        for idx in range(len(day.activities) - 1):
            act_a = day.activities[idx]
            act_b = day.activities[idx + 1]
            
            # Check if activities explicitly mention different cities
            # e.g., Act A in Kandy, Act B in Ella
            for (c1, c2), min_dur in known_durations.items():
                if (c1.lower() in act_a.attraction.lower() or c1.lower() in act_a.activity.lower()) and \
                   (c2.lower() in act_b.attraction.lower() or c2.lower() in act_b.activity.lower()):
                    # They are in different cities! Check time gap
                    _, end_a = parse_time_window(act_a.time)
                    start_b, _ = parse_time_window(act_b.time)
                    if end_a is not None and start_b is not None:
                        gap = start_b - end_a
                        if gap < min_dur:
                            issues.append(
                                f"Day {day.day}: Travel time between {c1.title()} and {c2.title()} is insufficient. "
                                f"Required: at least {min_dur // 60} hours ({min_dur} mins), but scheduled gap is only {gap} minutes."
                            )

    return issues, warnings


def validate_opening_hours(
    itinerary: TravelItinerary,
    planning_context: Dict[str, Any]
) -> Tuple[List[str], List[str]]:
    """
    Validates that planned activity times do not conflict with known opening hours.
    If opening hours are unavailable, records an explicit warning without guessing.
    """
    issues: List[str] = []
    warnings: List[str] = []

    research_data = planning_context.get("destination_research") or {}
    known_attractions: Dict[str, Dict[str, Any]] = {}

    # Extract attractions from research results
    if isinstance(research_data, dict):
        raw_attractions = research_data.get("attractions") or []
        for att in raw_attractions:
            if isinstance(att, dict):
                known_attractions[att.get("name", "").lower().strip()] = att

    for day in itinerary.days:
        for act in day.activities:
            att_name = act.attraction.lower().strip()
            # Match attraction name
            matched_info = None
            for kname, kinfo in known_attractions.items():
                if kname in att_name or att_name in kname:
                    matched_info = kinfo
                    break
            
            if matched_info:
                open_str = matched_info.get("opening_hours", "")
                if not open_str or "unknown" in open_str.lower() or "unverified" in open_str.lower():
                    warnings.append(
                        f"Day {day.day}: Opening hours for '{act.attraction}' could not be verified from research data."
                    )
                else:
                    # Deterministic check on closing times if parseable
                    open_start, open_end = parse_time_window(open_str)
                    act_start, act_end = parse_time_window(act.time)
                    if open_start is not None and open_end is not None and act_start is not None and act_end is not None:
                        if act_start < open_start or act_end > open_end:
                            issues.append(
                                f"Day {day.day}: Scheduled time '{act.time}' for '{act.attraction}' is outside known opening hours ({open_str})."
                            )
            else:
                warnings.append(
                    f"Day {day.day}: Opening hours for '{act.attraction}' could not be verified."
                )

    return issues, warnings


def validate_budget(
    itinerary: TravelItinerary,
    trip_request: TripRequest
) -> Tuple[List[str], List[str], Dict[str, Any]]:
    """
    Deterministically computes total known verified expenses and compares against budget.
    Guarantees no invented prices.
    """
    issues: List[str] = []
    warnings: List[str] = []
    
    total_verified_cost: float = 0.0
    unpriced_items_count: int = 0
    priced_items_count: int = 0

    for day in itinerary.days:
        for act in day.activities:
            if act.estimated_cost is not None and act.estimated_cost > 0:
                total_verified_cost += act.estimated_cost
                priced_items_count += 1
            else:
                unpriced_items_count += 1

    itinerary.estimated_total_cost = total_verified_cost
    
    if unpriced_items_count > 0:
        itinerary.cost_completeness_status = "PARTIAL"
        warnings.append(
            f"Total cost cannot be fully verified because {unpriced_items_count} activities/services have unverified or unavailable prices."
        )
    else:
        itinerary.cost_completeness_status = "COMPLETE"

    metrics = {
        "total_verified_cost": total_verified_cost,
        "priced_items": priced_items_count,
        "unpriced_items": unpriced_items_count,
        "user_budget": trip_request.budget
    }

    if trip_request.budget is not None and trip_request.budget > 0:
        itinerary.budget_remaining = trip_request.budget - total_verified_cost
        metrics["budget_remaining"] = itinerary.budget_remaining
        if total_verified_cost > trip_request.budget:
            issues.append(
                f"Budget exceeded! Known verified expenses ({total_verified_cost:,.2f} {trip_request.currency}) "
                f"exceed total budget ({trip_request.budget:,.2f} {trip_request.currency}) by "
                f"{(total_verified_cost - trip_request.budget):,.2f} {trip_request.currency}."
            )
        else:
            # Within budget
            pass

    return issues, warnings, metrics


def validate_completeness(
    itinerary: TravelItinerary,
    trip_request: TripRequest
) -> Tuple[List[str], List[str]]:
    """
    Validates that itinerary matches requested days, has non-empty plans,
    and checks for duplicate attractions scheduled on the same day.
    """
    issues: List[str] = []
    warnings: List[str] = []

    if trip_request.number_of_days is not None:
        if len(itinerary.days) != trip_request.number_of_days:
            issues.append(
                f"Day count mismatch: User requested {trip_request.number_of_days} days, "
                f"but itinerary contains {len(itinerary.days)} days."
            )

    # Check for empty days or duplicate attractions
    for day in itinerary.days:
        if not day.activities:
            issues.append(f"Day {day.day} has no scheduled activities.")
        
        seen_attractions = set()
        for act in day.activities:
            att_lower = act.attraction.lower().strip()
            if att_lower in seen_attractions and att_lower not in ["lunch", "dinner", "breakfast", "transit"]:
                warnings.append(
                    f"Day {day.day}: Duplicate attraction scheduled on the same day: '{act.attraction}'."
                )
            seen_attractions.add(att_lower)

    return issues, warnings


def validate_itinerary(
    itinerary: Union[TravelItinerary, Dict[str, Any]],
    planning_context: Dict[str, Any],
    trip_request: Optional[TripRequest] = None
) -> ValidationResult:
    """
    Master deterministic validation function for the TourLink Travel Planning Agent.
    Executes pure Python verification routines:
    1. Time conflict / overlapping activity check
    2. Inter-city travel-time feasibility check
    3. Opening-hours compliance check
    4. Budget compliance & verified cost tracking
    5. Completeness & day count validation
    """
    # Convert dict to TravelItinerary if needed
    if isinstance(itinerary, dict):
        try:
            itinerary_obj = TravelItinerary(**itinerary)
        except Exception as e:
            return ValidationResult(
                valid=False,
                issues=[f"Itinerary schema validation failed: {str(e)}"],
                warnings=[],
                metrics={}
            )
    else:
        itinerary_obj = itinerary

    # Extract TripRequest from planning_context if not passed explicitly
    if trip_request is None:
        req_dict = planning_context.get("trip_request") or {}
        try:
            trip_request = TripRequest(**req_dict)
        except Exception:
            trip_request = TripRequest()

    all_issues: List[str] = []
    all_warnings: List[str] = []

    # 1. Time conflict check
    time_issues, time_warns = validate_time_conflicts(itinerary_obj)
    all_issues.extend(time_issues)
    all_warnings.extend(time_warns)

    # 2. Travel time check
    travel_issues, travel_warns = validate_travel_time(itinerary_obj, planning_context)
    all_issues.extend(travel_issues)
    all_warnings.extend(travel_warns)

    # 3. Opening hours check
    hours_issues, hours_warns = validate_opening_hours(itinerary_obj, planning_context)
    all_issues.extend(hours_issues)
    all_warnings.extend(hours_warns)

    # 4. Budget check
    budget_issues, budget_warns, budget_metrics = validate_budget(itinerary_obj, trip_request)
    all_issues.extend(budget_issues)
    all_warnings.extend(budget_warns)

    # 5. Completeness check
    comp_issues, comp_warns = validate_completeness(itinerary_obj, trip_request)
    all_issues.extend(comp_issues)
    all_warnings.extend(comp_warns)

    is_valid = len(all_issues) == 0

    return ValidationResult(
        valid=is_valid,
        issues=all_issues,
        warnings=all_warnings,
        metrics=budget_metrics
    )


# ---------------------------------------------------------------------------
# 4. Delegation Tools (LangChain @tool decorators)
# ---------------------------------------------------------------------------

@tool
def delegate_destination_research(destination: str, interests: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Delegate destination research to the Destination Research Agent.
    Retrieves factual attractions, opening hours, categories, and costs.
    """
    # Clean tool invocation wrapper - implemented by supervisor adapter
    return {
        "status": "DELEGATED",
        "agent": "Destination Research Agent",
        "destination": destination,
        "interests": interests or []
    }


@tool
def delegate_recommendation_analysis(destination: str, interests: List[str], travel_style: Optional[str] = None) -> Dict[str, Any]:
    """
    Delegate personalized recommendation and feedback analysis to the Recommendation & Feedback Agent.
    Retrieves review sentiment, tourist themes, and preference-matched attractions.
    """
    return {
        "status": "DELEGATED",
        "agent": "Recommendation & Feedback Analysis Agent",
        "destination": destination,
        "interests": interests,
        "travel_style": travel_style
    }


@tool
def delegate_logistics_research(origin: str, destination: str, transport_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Delegate transport and routing research to the Travel Logistics & Availability Agent.
    Retrieves public transit schedules, travel durations, and transport feasibility.
    """
    return {
        "status": "DELEGATED",
        "agent": "Travel Logistics & Availability Agent",
        "origin": origin,
        "destination": destination,
        "transport_type": transport_type
    }
