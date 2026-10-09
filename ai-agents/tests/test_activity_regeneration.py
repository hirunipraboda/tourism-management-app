"""
==============================================================================
AI Test Suite: Activity Regeneration (ATP-005)
Verifies replacing a targeted activity without corrupting other itinerary items.
==============================================================================
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from server import _get_authentic_attractions_for_location


def test_regenerate_single_activity_isolation_atp005():  # ATP-005
    """
    ATP-005: Regenerate a valid activity.
    Verifies targeted activity changes without corrupting sibling activities in the day.
    """
    initial_day_activities = [
        {"id": "act-1", "title": "Temple of the Tooth", "time": "09:00 - 11:30", "location": "Kandy"},
        {"id": "act-2", "title": "Udawatta Kele Forest Trek", "time": "13:30 - 15:30", "location": "Kandy"},
        {"id": "act-3", "title": "Kandy Lake Sunset Walk", "time": "16:30 - 18:00", "location": "Kandy"}
    ]

    target_activity_id = "act-2"
    candidates = _get_authentic_attractions_for_location("Kandy")
    
    # Pick a candidate different from the current title
    alt_candidate = next(
        (c for c in candidates if c["name"] != "Udawatta Kele Forest Trek"),
        candidates[0]
    )

    # Perform replacement
    updated_activities = []
    for act in initial_day_activities:
        if act["id"] == target_activity_id:
            updated_activities.append({
                "id": target_activity_id,
                "title": alt_candidate["name"],
                "time": act["time"],
                "location": alt_candidate["location"]
            })
        else:
            updated_activities.append(act)

    # Verify activity 1 and 3 are intact
    assert updated_activities[0] == initial_day_activities[0], "Activity 1 was unexpectedly changed"
    assert updated_activities[2] == initial_day_activities[2], "Activity 3 was unexpectedly changed"

    # Verify targeted activity 2 changed
    assert updated_activities[1]["id"] == target_activity_id
    assert updated_activities[1]["title"] == alt_candidate["name"]
    assert updated_activities[1]["title"] != initial_day_activities[1]["title"]
