"""
==============================================================================
AI Test Suite: Itinerary Generation (ATP-001)
Verifies multi-agent itinerary generation, schema validation, and required fields.
==============================================================================
"""

import os
import sys
import pytest

# Ensure parent directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agents.travel_planning_agent import TravelPlanningAgent
from tools.planning_tools import (
    TravelItinerary,
    validate_itinerary,
    validate_time_conflicts,
    validate_travel_time
)


def test_generate_itinerary_structure_and_schema_atp001():  # ATP-001
    """
    ATP-001: Generate AI trip plan with valid input.
    Verifies valid plan generation, required schema fields, and deterministic validation.
    """
    agent = TravelPlanningAgent()
    query = "Plan a 4-day trip to Kandy. I like culture and nature."
    
    result = agent.run(query)
    assert result is not None, "Agent returned None"
    
    itinerary = result.get("itinerary")
    assert itinerary is not None, "Missing itinerary in agent response"
    
    # Verify days count
    days = itinerary.get("days", [])
    assert len(days) == 4, f"Expected 4 days, got {len(days)}"
    
    # Verify required schema fields per day
    for idx, day in enumerate(days):
        assert "day" in day, f"Day {idx+1} missing 'day' field"
        assert "location" in day, f"Day {idx+1} missing 'location' field"
        assert "activities" in day, f"Day {idx+1} missing 'activities' field"
        activities = day.get("activities", [])
        assert len(activities) > 0, f"Day {idx+1} has no activities"
        
        for act in activities:
            assert "time" in act, "Activity missing 'time'"
            assert "activity" in act or "attraction" in act, "Activity missing title/description"
            
    # Verify validation results
    validation = result.get("validation_results") or {}
    assert validation.get("valid") is True, f"Deterministic validation failed: {validation.get('issues')}"
