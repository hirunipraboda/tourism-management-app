import math
from typing import List, Dict, Any, Tuple
from agent.schemas import ValidationResult


# Curated knowledge base for destination enrichment
KNOWLEDGE_BASE: Dict[str, List[Dict[str, Any]]] = {
    "default": [
        {
            "name": "Historical City Citadel & Museum",
            "category": "Historical",
            "opening_hours": "08:30 - 17:00",
            "entry_fee": 15.0,
            "visit_duration_minutes": 90,
            "is_accessible": True,
            "latitude": 6.9271,
            "longitude": 79.8612,
            "rationale": "High historical value with guided accessibility paths."
        },
        {
            "name": "Botanical Gardens & Eco Promenade",
            "category": "Scenic",
            "opening_hours": "07:00 - 18:30",
            "entry_fee": 10.0,
            "visit_duration_minutes": 120,
            "is_accessible": True,
            "latitude": 6.9290,
            "longitude": 79.8650,
            "rationale": "Beautiful natural scenery suitable for morning walks."
        },
        {
            "name": "National Cultural Heritage Center",
            "category": "Cultural",
            "opening_hours": "10:00 - 18:00",
            "entry_fee": 20.0,
            "visit_duration_minutes": 100,
            "is_accessible": True,
            "latitude": 6.9240,
            "longitude": 79.8600,
            "rationale": "Rich cultural artifacts and live traditional artisan performances."
        },
        {
            "name": "Sunset Coastal Viewpoint & Lighthouse",
            "category": "Scenic",
            "opening_hours": "06:00 - 20:00",
            "entry_fee": 5.0,
            "visit_duration_minutes": 60,
            "is_accessible": True,
            "latitude": 6.9310,
            "longitude": 79.8550,
            "rationale": "Spectacular ocean views and iconic architecture."
        },
        {
            "name": "Old Town Artisan Craft Market",
            "category": "Cultural",
            "opening_hours": "09:00 - 19:00",
            "entry_fee": 0.0,
            "visit_duration_minutes": 75,
            "is_accessible": False,
            "latitude": 6.9220,
            "longitude": 79.8580,
            "rationale": "Vibrant local market for unique handmade souvenirs."
        },
        {
            "name": "Mountain Peak Adventure Lookout",
            "category": "Adventure",
            "opening_hours": "06:00 - 17:00",
            "entry_fee": 35.0,
            "visit_duration_minutes": 180,
            "is_accessible": False,
            "latitude": 6.9400,
            "longitude": 79.8800,
            "rationale": "High-altitude vantage point for panoramic photography."
        }
    ]
}


def tool_search_destination_attractions(destination_name: str, categories: List[str], require_accessible: bool) -> List[Dict[str, Any]]:
    """Controlled Tool 1: Query attraction database & domain knowledge repository."""
    key = destination_name.lower().strip()
    raw_list = KNOWLEDGE_BASE.get(key, KNOWLEDGE_BASE["default"])
    
    results = []
    for item in raw_list:
        # Filter by category matching if specified
        if categories and not any(c.lower() in item["category"].lower() for c in categories):
            continue
        results.append(dict(item))
        
    # If filtered out too much, return all default items to allow reasoning engine to filter
    if not results:
        results = [dict(item) for item in raw_list]
        
    return results


def tool_calculate_itinerary_metrics(attractions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Controlled Tool 2: Calculates budget totals, total duration, time slot scheduling, and accessibility breakdown."""
    total_cost = sum(float(a.get("entry_fee", 0.0)) for a in attractions)
    total_duration_minutes = sum(int(a.get("visit_duration_minutes", 60)) for a in attractions)
    accessible_count = sum(1 for a in attractions if a.get("is_accessible", True))
    
    # Generate structured time slots starting at 09:00 AM
    current_minutes = 9 * 60  # 9:00 AM
    scheduled_items = []
    
    for a in attractions:
        start_hour = current_minutes // 60
        start_min = current_minutes % 60
        period = "AM" if start_hour < 12 else "PM"
        display_hour = start_hour if start_hour <= 12 else start_hour - 12
        if display_hour == 0:
            display_hour = 12
            
        time_str = f"{display_hour:02d}:{start_min:02d} {period}"
        item_copy = dict(a)
        item_copy["scheduled_time"] = time_str
        scheduled_items.append(item_copy)
        
        # Add duration + 30 min transit/buffer
        duration = int(a.get("visit_duration_minutes", 60))
        current_minutes += duration + 30

    return {
        "total_cost": round(total_cost, 2),
        "total_duration_hours": round(total_duration_minutes / 60.0, 2),
        "total_attractions": len(attractions),
        "accessible_count": accessible_count,
        "scheduled_items": scheduled_items
    }


def tool_validate_attraction_constraints(
    attractions: List[Dict[str, Any]],
    user_budget: float,
    max_duration_hours: float,
    require_accessible: bool
) -> ValidationResult:
    """Controlled Tool 3: Rigorous deterministic validation tool verifying output against specifications."""
    checked_rules = [
        "Rule 1: Total Entry Fees <= User Budget",
        "Rule 2: Total Duration <= Max Allocated Hours",
        "Rule 3: Wheelchair Accessibility Requirement",
        "Rule 4: Non-Empty Itinerary Selection",
        "Rule 5: No Duplicate Attraction Names"
    ]
    errors = []
    
    # Rule 4: Non-empty
    if not attractions:
        errors.append("Validation Failure: The curated attraction itinerary is empty.")
        return ValidationResult(
            is_valid=False,
            budget_pass=False,
            duration_pass=False,
            accessibility_pass=False,
            checked_rules=checked_rules,
            error_messages=errors
        )
        
    # Rule 1: Budget
    total_cost = sum(float(a.get("entry_fee", 0.0)) for a in attractions)
    budget_pass = total_cost <= user_budget
    if not budget_pass:
        errors.append(f"Budget Exceeded: Total cost ${total_cost:.2f} exceeds user budget of ${user_budget:.2f}.")
        
    # Rule 2: Duration
    total_duration_hours = sum(int(a.get("visit_duration_minutes", 60)) for a in attractions) / 60.0
    duration_pass = total_duration_hours <= max_duration_hours
    if not duration_pass:
        errors.append(f"Duration Exceeded: Total time {total_duration_hours:.1f} hrs exceeds limit of {max_duration_hours:.1f} hrs.")
        
    # Rule 3: Accessibility
    inaccessible = [a["name"] for a in attractions if not a.get("is_accessible", True)]
    accessibility_pass = True
    if require_accessible and inaccessible:
        accessibility_pass = False
        errors.append(f"Accessibility Constraint Violated: Features non-accessible sites: {', '.join(inaccessible)}.")
        
    # Rule 5: Duplicates
    names = [a["name"] for a in attractions]
    if len(names) != len(set(names)):
        errors.append("Duplicate Attraction Error: Contains duplicate attraction entries.")
        
    is_valid = budget_pass and duration_pass and accessibility_pass and len(errors) == 0
    
    return ValidationResult(
        is_valid=is_valid,
        budget_pass=budget_pass,
        duration_pass=duration_pass,
        accessibility_pass=accessibility_pass,
        checked_rules=checked_rules,
        error_messages=errors
    )
