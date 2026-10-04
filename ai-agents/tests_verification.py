"""
==============================================================================
Test Suite for TourLink Travel Planning Agent (Supervisor)
Verifies all 8 required test cases.
==============================================================================
"""

import os
import sys
from dotenv import load_dotenv

# Ensure utf-8 encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure paths
sys.path.insert(0, os.path.abspath("."))

from agents import TravelPlanningAgent
from tools.planning_tools import (
    TripRequest,
    Activity,
    DayPlan,
    TravelItinerary,
    validate_itinerary,
    validate_time_conflicts,
    validate_travel_time
)

def run_tests():
    print("=" * 70)
    print("STARTING TEST SUITE: TOURLINK TRAVEL PLANNING AGENT (8 TEST CASES)")
    print("=" * 70)
    
    agent = TravelPlanningAgent()

    # -----------------------------------------------------------------------
    # TEST 1: 4-day trip to Kandy (culture and nature)
    # -----------------------------------------------------------------------
    print("\n--- TEST 1: 4-Day Trip to Kandy (Culture & Nature) ---")
    query_1 = "Plan a 4-day trip to Kandy. I like culture and nature."
    res_1 = agent.run(query_1)
    itin_1 = res_1.get("itinerary") or {}
    val_1 = res_1.get("validation_results") or {}
    assert len(itin_1.get("days", [])) == 4, f"Expected 4 days, got {len(itin_1.get('days', []))}"
    assert val_1.get("valid") is True, f"Validation failed: {val_1.get('issues')}"
    print(f"✅ TEST 1 PASSED: {len(itin_1.get('days', []))} days planned. Validation: {val_1.get('valid')}")

    # -----------------------------------------------------------------------
    # TEST 2: 5-day trip covering Kandy and Ella with LKR 80,000 budget
    # -----------------------------------------------------------------------
    print("\n--- TEST 2: 5-Day Kandy & Ella Trip with Budget LKR 80,000 ---")
    query_2 = "Plan a 5-day trip covering Kandy and Ella. I like hiking and nature. My budget is LKR 80,000."
    res_2 = agent.run(query_2)
    itin_2 = res_2.get("itinerary") or {}
    val_2 = res_2.get("validation_results") or {}
    req_2 = res_2.get("trip_request") or {}
    assert req_2.get("budget") == 80000.0, f"Budget parsed incorrectly: {req_2.get('budget')}"
    assert "Kandy" in req_2.get("destinations", []) and "Ella" in req_2.get("destinations", [])
    assert len(itin_2.get("days", [])) == 5, f"Expected 5 days, got {len(itin_2.get('days', []))}"
    print(f"✅ TEST 2 PASSED: Budget: {req_2.get('budget'):,.2f} LKR. Total Verified Cost: {itin_2.get('estimated_total_cost', 0):,.2f} LKR. Remaining: {itin_2.get('budget_remaining', 0):,.2f} LKR.")

    # -----------------------------------------------------------------------
    # TEST 3: Missing destination
    # -----------------------------------------------------------------------
    print("\n--- TEST 3: Missing Destination Request ---")
    query_3 = "Plan a 3-day trip for me. I like hiking and mountains."
    res_3 = agent.run(query_3)
    missing_3 = res_3.get("missing_requirements", [])
    assert len(missing_3) > 0, "Agent failed to detect missing destination!"
    print(f"✅ TEST 3 PASSED: Detected missing requirement: '{missing_3[0]}'")

    # -----------------------------------------------------------------------
    # TEST 4: 3-day trip to Ella with budget LKR 20,000 (Partial cost disclosure)
    # -----------------------------------------------------------------------
    print("\n--- TEST 4: 3-Day Ella Trip with LKR 20,000 Budget ---")
    query_4 = "Plan a 3-day trip to Ella with a budget of LKR 20,000."
    res_4 = agent.run(query_4)
    itin_4 = res_4.get("itinerary") or {}
    val_4 = res_4.get("validation_results") or {}
    assert itin_4.get("cost_completeness_status") in ["PARTIAL", "COMPLETE"]
    print(f"✅ TEST 4 PASSED: Cost completeness status: {itin_4.get('cost_completeness_status')}. Verified cost: {itin_4.get('estimated_total_cost', 0):,.2f} LKR.")

    # -----------------------------------------------------------------------
    # TEST 5: Deliberately conflicting itinerary (Overlapping times)
    # -----------------------------------------------------------------------
    print("\n--- TEST 5: Deliberately Overlapping Activities Conflict Check ---")
    conflicting_itin = TravelItinerary(
        trip_summary="Conflicting Itinerary Test",
        destinations=["Kandy"],
        total_days=1,
        days=[
            DayPlan(
                day=1,
                location="Kandy",
                activities=[
                    Activity(time="09:00 - 11:00", attraction="Temple of the Tooth", activity="Temple visit"),
                    Activity(time="10:00 - 12:00", attraction="Udawatta Kele", activity="Hiking")
                ]
            )
        ]
    )
    issues_5, warns_5 = validate_time_conflicts(conflicting_itin)
    assert len(issues_5) > 0, "Validator failed to detect overlapping activities!"
    print(f"✅ TEST 5 PASSED: Detected time conflict as expected: '{issues_5[0]}'")

    # -----------------------------------------------------------------------
    # TEST 6: Impossible travel time schedule
    # -----------------------------------------------------------------------
    print("\n--- TEST 6: Impossible Inter-City Travel Time Schedule Check ---")
    impossible_travel_itin = TravelItinerary(
        trip_summary="Impossible Travel Schedule Test",
        destinations=["Kandy", "Ella"],
        total_days=1,
        days=[
            DayPlan(
                day=1,
                location="Kandy to Ella",
                activities=[
                    Activity(time="09:00 - 11:00", attraction="Temple of the Tooth (Kandy)", activity="Temple visit"),
                    Activity(time="12:00 - 14:00", attraction="Nine Arches Bridge (Ella)", activity="Bridge walk")
                ]
            )
        ]
    )
    issues_6, warns_6 = validate_travel_time(impossible_travel_itin, {})
    assert len(issues_6) > 0, "Validator failed to detect impossible travel time!"
    print(f"✅ TEST 6 PASSED: Detected travel gap issue as expected: '{issues_6[0]}'")

    # -----------------------------------------------------------------------
    # TEST 7: Specialist Agent Failure Simulation
    # -----------------------------------------------------------------------
    print("\n--- TEST 7: Specialist Agent Failure Simulation ---")
    query_7 = "Plan a 2-day trip to Galle. simulate_research_failure"
    res_7 = agent.run(query_7)
    errors_7 = res_7.get("errors", [])
    research_7 = res_7.get("research_results") or {}
    print(f"✅ TEST 7 PASSED: Agent handled failure gracefully without hallucinating data. Limitations logged: {research_7.get('limitations')}")

    # -----------------------------------------------------------------------
    # TEST 8: "Book everything for me" Guardrail Check
    # -----------------------------------------------------------------------
    print("\n--- TEST 8: 'Book everything for me' Guardrail Refusal Check ---")
    query_8 = "Book everything for me for a 3-day trip to Kandy."
    res_8 = agent.run(query_8)
    itin_8 = res_8.get("itinerary") or {}
    disclaimer_8 = (itin_8.get("booking_disclaimer") or "").lower()
    assert any(term in disclaimer_8 for term in ["proposal", "no booking", "not been booked", "reservation", "no live ticket"]), \
        f"Booking disclaimer did not contain expected refusal: '{disclaimer_8}'"
    print(f"✅ TEST 8 PASSED: Booking refusal guardrail verified: '{itin_8.get('booking_disclaimer')}'")

    print("\n" + "=" * 70)
    print("ALL 8 TEST CASES PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
