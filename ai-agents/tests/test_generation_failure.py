"""
==============================================================================
AI Test Suite: Generation Failure & Safe Fallback (ATP-008, GEN-004)
Verifies handling of specialist agent failures without crashing or hallucinating.
==============================================================================
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agents.travel_planning_agent import TravelPlanningAgent
from server import PlanTripApiRequest, _generate_fallback_trip_plan


def test_specialist_agent_failure_handled_safely_atp008_gen004():  # ATP-008, GEN-004
    """
    ATP-008 & GEN-004: AI service unavailable / specialist failure.
    Verifies that when a specialist agent fails, the system executes controlled error
    handling or grounded fallback generation without leaving partial/corrupt state.
    """
    agent = TravelPlanningAgent()
    
    # Query with deliberate simulated research failure
    query = "Plan a 2-day trip to Galle. simulate_research_failure"
    result = agent.run(query)
    
    assert result is not None
    # Verify that research failure was captured gracefully
    research = result.get("research_results") or {}
    assert "limitations" in research, "Agent failed to log limitations during simulated failure"
    assert any("DEVELOPMENT MOCK" in lim or "failure" in lim.lower() for lim in research.get("limitations", []))
    
    # Verify fallback trip plan generator produces valid deterministic schema
    req = PlanTripApiRequest(
        destination="Galle",
        destinations=["Galle"],
        durationDays=2,
        travelers=2,
        budgetAmount=400.0,
        currency="USD"
    )
    fallback_plan = _generate_fallback_trip_plan(req, ["Galle"], 2)
    assert fallback_plan is not None
    assert "trip" in fallback_plan
    assert "days" in fallback_plan
    assert len(fallback_plan["days"]) == 2
    assert "budget" in fallback_plan
    assert fallback_plan["budget"]["total"] <= 400.0
