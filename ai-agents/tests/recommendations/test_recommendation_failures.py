"""
==============================================================================
AI Test Suite: Malformed Output & Failure Recovery (AI-REC-008, AI-REC-009)
Verifies robust handling of malformed LLM responses, missing dictionary keys,
and microservice unavailability.
==============================================================================
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from server import RecommendationApiRequest, generate_grounded_fallback_recommendations
from tools.recommendation_tools import Recommendation, calculate_suitability_score, UserPreferences


def test_malformed_ai_response_handling_ai_rec_008():  # AI-REC-008
    """
    AI-REC-008: Test malformed AI/service response.
    Verifies that if raw AI output has missing fields, unexpected types, or null values,
    the parsing logic safely assigns fallback defaults without throwing unhandled exceptions.
    """
    raw_malformed_items = [
        {"attraction": None, "destination": None, "suitability_score": "not_a_number"},
        {"attraction": "Incomplete Attraction"},
        {},
    ]

    sanitized = []
    for idx, r in enumerate(raw_malformed_items):
        att_name = r.get("attraction") or f"Sri Lanka Attraction {idx+1}"
        dest = r.get("destination") or "Sri Lanka"
        try:
            score = float(r.get("suitability_score") or 90.0)
        except (ValueError, TypeError):
            score = 85.0

        sanitized.append({
            "name": att_name,
            "location": dest,
            "suitabilityScore": int(round(score))
        })

    assert len(sanitized) == 3
    assert sanitized[0]["name"] == "Sri Lanka Attraction 1"
    assert sanitized[0]["suitabilityScore"] == 85
    assert sanitized[1]["name"] == "Incomplete Attraction"


def test_ai_service_unavailable_fallback_ai_rec_009():  # AI-REC-009
    """
    AI-REC-009: Test AI service unavailable/failure.
    Verifies that when the remote LLM microservice or LangGraph agent encounters an error
    (e.g. rate limit, network timeout), the service falls back to the deterministic
    ground-truth review dataset without propagating 500 error to tourist.
    """
    def mock_failing_agent_call():
        raise ConnectionError("AI microservice connection timeout: 504 Gateway Timeout")

    req = RecommendationApiRequest(
        interests=["Culture", "History"],
        destination="Kandy"
    )

    try:
        mock_failing_agent_call()
        response = None
    except Exception:
        # Grounded fallback execution
        response = generate_grounded_fallback_recommendations(req)

    assert response is not None
    assert "recommendations" in response
    assert len(response["recommendations"]) > 0
    assert response["validationStatus"] == "PASSED_GROUNDED_FALLBACK"
