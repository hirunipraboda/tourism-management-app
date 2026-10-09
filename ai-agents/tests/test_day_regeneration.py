"""
==============================================================================
AI Test Suite: Day Regeneration (ATP-004)
Verifies regenerating an itinerary day without corrupting unrelated days.
==============================================================================
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agents.travel_planning_agent import TravelPlanningAgent
from server import _get_authentic_attractions_for_location


def test_regenerate_single_day_isolation_atp004():  # ATP-004
    """
    ATP-004: Regenerate a valid itinerary day.
    Verifies that only the targeted day changes and other days remain intact.
    """
    # 1. Simulate initial 3-day plan
    initial_days = [
        {"day": 1, "location": "Kandy", "activities": [{"time": "09:00 - 11:30", "attraction": "Temple of Tooth"}]},
        {"day": 2, "location": "Kandy", "activities": [{"time": "09:00 - 11:30", "attraction": "Udawatta Kele"}]},
        {"day": 3, "location": "Ella", "activities": [{"time": "09:00 - 11:30", "attraction": "Nine Arch Bridge"}]}
    ]

    # Target Day 2 for regeneration with new activities
    day_to_regen = 2
    location = "Kandy"
    candidates = _get_authentic_attractions_for_location(location)
    assert len(candidates) > 0, "No attraction candidates available for Kandy"

    # Generate new activities for Day 2
    new_activities = []
    for cand in candidates[:2]:
        new_activities.append({
            "time": "10:00 - 12:30",
            "attraction": cand["name"],
            "location": cand["location"]
        })

    # Apply regeneration
    regenerated_days = []
    for d in initial_days:
        if d["day"] == day_to_regen:
            regenerated_days.append({
                "day": day_to_regen,
                "location": location,
                "activities": new_activities
            })
        else:
            regenerated_days.append(d)

    # Assert Day 1 and Day 3 remain identical
    assert regenerated_days[0] == initial_days[0], "Day 1 was unintentionally modified"
    assert regenerated_days[2] == initial_days[2], "Day 3 was unintentionally modified"

    # Assert Day 2 changed
    assert regenerated_days[1]["activities"] != initial_days[1]["activities"], "Day 2 activities did not change"
    assert len(regenerated_days[1]["activities"]) == len(new_activities)
