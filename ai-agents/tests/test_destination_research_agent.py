"""
==============================================================================
Destination Management – AI Agent Tests
Test IDs: AI-DST-001 … AI-DST-010

Framework : pytest (same as existing AI agent test structure)
File      : ai-agents/tests/test_destination_research_agent.py

Tests the DestinationResearchAgent (agents/destination_research_agent.py)
using mocks/stubs. No real Gemini API or LangGraph calls are made during
unit tests – all LLM invocations are mocked.

Structure mirrors the approach in ai-agents/tests_verification.py but uses
pytest for discoverability and isolation (consistent with the requirement to
use pytest tests/ -v).
==============================================================================
"""

import sys
import os
import json
from unittest.mock import MagicMock, patch

import pytest

# Ensure the ai-agents root is on the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_retriever():
    """Returns a mock retriever that returns empty docs without hitting a vectorstore."""
    retriever = MagicMock()
    retriever.get_relevant_documents = MagicMock(return_value=[])
    retriever.invoke = MagicMock(return_value=[])
    return retriever


@pytest.fixture
def mock_llm_response():
    """Returns a mock AIMessage with a valid DestinationResearchResult JSON."""
    return json.dumps({
        "destination": "Sigiriya",
        "attractions": [
            {
                "name": "Sigiriya Rock Fortress",
                "category": "Heritage",
                "description": "5th-century royal palace carved into rock.",
                "location": "Matale District, Central Province",
                "estimated_duration_hours": "3-4 hours",
                "estimated_cost": "USD 30 per person",
                "opening_hours": "07:00 AM – 05:30 PM",
                "nearby_attractions": ["Pidurangala Rock"],
                "activities": ["Rock climbing", "Fresco viewing"]
            }
        ],
        "information_limitations": "Live entry prices may vary. Verify at the official website.",
        "unsupported_requests_note": None
    })


# ---------------------------------------------------------------------------
# AI-DST-001  Valid destination research request returns structured result
# ---------------------------------------------------------------------------

def test_ai_dst_001_valid_destination_request_returns_structured_result(mock_retriever, mock_llm_response):
    """AI-DST-001: A valid destination string returns a result with the expected schema."""
    from agents.destination_research_agent import DestinationResearchAgent

    with patch("agents.destination_research_agent.ChatGoogleGenerativeAI") as MockLLM, \
         patch("agents.destination_research_agent.build_tourism_vectorstore") as mock_vs_builder, \
         patch("agents.destination_research_agent.create_tourism_search_tool") as mock_tool_factory:

        # Mock vectorstore
        mock_vs = MagicMock()
        mock_vs.as_retriever.return_value = mock_retriever
        mock_vs_builder.return_value = mock_vs

        # Mock search tool
        mock_tool = MagicMock()
        mock_tool.name = "search_tourism_information"
        mock_tool_factory.return_value = mock_tool

        # Mock LLM that returns no tool_calls → goes directly to validation_node
        mock_llm_instance = MagicMock()
        ai_message = MagicMock()
        ai_message.tool_calls = []
        ai_message.content = mock_llm_response
        mock_llm_instance.bind_tools.return_value = mock_llm_instance
        mock_llm_instance.invoke.return_value = ai_message
        MockLLM.return_value = mock_llm_instance

        agent = DestinationResearchAgent(retriever=mock_retriever)

        result = agent.run("Sigiriya")

    assert result is not None
    assert "result" in result
    research = result["result"]
    assert research is not None
    assert research.get("destination") == "Sigiriya"
    assert isinstance(research.get("attractions"), list)
    assert "information_limitations" in research


# ---------------------------------------------------------------------------
# AI-DST-002  Empty string input returns error response
# ---------------------------------------------------------------------------

def test_ai_dst_002_empty_string_input_returns_error(mock_retriever):
    """AI-DST-002: Empty string input should return an error without calling LLM."""
    from agents.destination_research_agent import DestinationResearchAgent

    with patch("agents.destination_research_agent.ChatGoogleGenerativeAI") as MockLLM, \
         patch("agents.destination_research_agent.build_tourism_vectorstore") as mock_vs_builder, \
         patch("agents.destination_research_agent.create_tourism_search_tool") as mock_tool_factory:

        mock_vs = MagicMock()
        mock_vs.as_retriever.return_value = mock_retriever
        mock_vs_builder.return_value = mock_vs
        mock_tool = MagicMock()
        mock_tool.name = "search_tourism_information"
        mock_tool_factory.return_value = mock_tool
        MockLLM.return_value = MagicMock()

        agent = DestinationResearchAgent(retriever=mock_retriever)
        result = agent.run("")

    assert result is not None
    # Should get a dict with information_limitations containing "ERROR"
    assert "ERROR" in result.get("information_limitations", "")


# ---------------------------------------------------------------------------
# AI-DST-003  None input returns error response
# ---------------------------------------------------------------------------

def test_ai_dst_003_none_input_returns_error(mock_retriever):
    """AI-DST-003: None input should return a controlled error response."""
    from agents.destination_research_agent import DestinationResearchAgent

    with patch("agents.destination_research_agent.ChatGoogleGenerativeAI") as MockLLM, \
         patch("agents.destination_research_agent.build_tourism_vectorstore") as mock_vs_builder, \
         patch("agents.destination_research_agent.create_tourism_search_tool") as mock_tool_factory:

        mock_vs = MagicMock()
        mock_vs.as_retriever.return_value = mock_retriever
        mock_vs_builder.return_value = mock_vs
        mock_tool = MagicMock()
        mock_tool.name = "search_tourism_information"
        mock_tool_factory.return_value = mock_tool
        MockLLM.return_value = MagicMock()

        agent = DestinationResearchAgent(retriever=mock_retriever)
        result = agent.run(None)

    assert result is not None
    assert "information_limitations" in result
    assert "ERROR" in result["information_limitations"]


# ---------------------------------------------------------------------------
# AI-DST-004  Whitespace-only string input returns error
# ---------------------------------------------------------------------------

def test_ai_dst_004_whitespace_only_input_returns_error(mock_retriever):
    """AI-DST-004: Whitespace-only string should be treated as empty."""
    from agents.destination_research_agent import DestinationResearchAgent

    with patch("agents.destination_research_agent.ChatGoogleGenerativeAI") as MockLLM, \
         patch("agents.destination_research_agent.build_tourism_vectorstore") as mock_vs_builder, \
         patch("agents.destination_research_agent.create_tourism_search_tool") as mock_tool_factory:

        mock_vs = MagicMock()
        mock_vs.as_retriever.return_value = mock_retriever
        mock_vs_builder.return_value = mock_vs
        mock_tool = MagicMock()
        mock_tool.name = "search_tourism_information"
        mock_tool_factory.return_value = mock_tool
        MockLLM.return_value = MagicMock()

        agent = DestinationResearchAgent(retriever=mock_retriever)
        result = agent.run("   ")

    assert result is not None
    assert "ERROR" in result.get("information_limitations", "")


# ---------------------------------------------------------------------------
# AI-DST-005  Dict input with valid destination is accepted
# ---------------------------------------------------------------------------

def test_ai_dst_005_dict_input_with_valid_destination(mock_retriever, mock_llm_response):
    """AI-DST-005: Dict input matching ResearchRequest schema should be accepted."""
    from agents.destination_research_agent import DestinationResearchAgent

    with patch("agents.destination_research_agent.ChatGoogleGenerativeAI") as MockLLM, \
         patch("agents.destination_research_agent.build_tourism_vectorstore") as mock_vs_builder, \
         patch("agents.destination_research_agent.create_tourism_search_tool") as mock_tool_factory:

        mock_vs = MagicMock()
        mock_vs.as_retriever.return_value = mock_retriever
        mock_vs_builder.return_value = mock_vs
        mock_tool = MagicMock()
        mock_tool.name = "search_tourism_information"
        mock_tool_factory.return_value = mock_tool

        mock_llm_instance = MagicMock()
        ai_message = MagicMock()
        ai_message.tool_calls = []
        ai_message.content = mock_llm_response
        mock_llm_instance.bind_tools.return_value = mock_llm_instance
        mock_llm_instance.invoke.return_value = ai_message
        MockLLM.return_value = mock_llm_instance

        agent = DestinationResearchAgent(retriever=mock_retriever)
        result = agent.run({
            "destination": "Sigiriya",
            "interests": ["culture", "history"],
            "trip_start": "2026-12-01",
            "trip_end": "2026-12-05"
        })

    assert result is not None
    assert "result" in result
    assert result["result"]["destination"] == "Sigiriya"


# ---------------------------------------------------------------------------
# AI-DST-006  Dict input missing destination field returns validation error
# ---------------------------------------------------------------------------

def test_ai_dst_006_dict_input_missing_destination_returns_error(mock_retriever):
    """AI-DST-006: Dict missing required 'destination' field should fail validation."""
    from agents.destination_research_agent import DestinationResearchAgent

    with patch("agents.destination_research_agent.ChatGoogleGenerativeAI") as MockLLM, \
         patch("agents.destination_research_agent.build_tourism_vectorstore") as mock_vs_builder, \
         patch("agents.destination_research_agent.create_tourism_search_tool") as mock_tool_factory:

        mock_vs = MagicMock()
        mock_vs.as_retriever.return_value = mock_retriever
        mock_vs_builder.return_value = mock_vs
        mock_tool = MagicMock()
        mock_tool.name = "search_tourism_information"
        mock_tool_factory.return_value = mock_tool
        MockLLM.return_value = MagicMock()

        agent = DestinationResearchAgent(retriever=mock_retriever)
        result = agent.run({"interests": ["culture"]})  # missing 'destination'

    assert result is not None
    # Should be a validation error – information_limitations will contain error info
    assert "information_limitations" in result
    assert "ERROR" in result["information_limitations"] or result.get("unsupported_requests_note") is not None


# ---------------------------------------------------------------------------
# AI-DST-007  Unsupported input type returns controlled error
# ---------------------------------------------------------------------------

def test_ai_dst_007_unsupported_input_type_returns_error(mock_retriever):
    """AI-DST-007: Non-string, non-dict, non-ResearchRequest input should return error."""
    from agents.destination_research_agent import DestinationResearchAgent

    with patch("agents.destination_research_agent.ChatGoogleGenerativeAI") as MockLLM, \
         patch("agents.destination_research_agent.build_tourism_vectorstore") as mock_vs_builder, \
         patch("agents.destination_research_agent.create_tourism_search_tool") as mock_tool_factory:

        mock_vs = MagicMock()
        mock_vs.as_retriever.return_value = mock_retriever
        mock_vs_builder.return_value = mock_vs
        mock_tool = MagicMock()
        mock_tool.name = "search_tourism_information"
        mock_tool_factory.return_value = mock_tool
        MockLLM.return_value = MagicMock()

        agent = DestinationResearchAgent(retriever=mock_retriever)
        result = agent.run(12345)  # integer input

    assert result is not None
    assert "information_limitations" in result
    assert "ERROR" in result["information_limitations"]


# ---------------------------------------------------------------------------
# AI-DST-008  Response structure contains all required fields
# ---------------------------------------------------------------------------

def test_ai_dst_008_response_structure_has_required_fields(mock_retriever, mock_llm_response):
    """AI-DST-008: Successful response must include destination, attractions, and information_limitations."""
    from agents.destination_research_agent import DestinationResearchAgent

    with patch("agents.destination_research_agent.ChatGoogleGenerativeAI") as MockLLM, \
         patch("agents.destination_research_agent.build_tourism_vectorstore") as mock_vs_builder, \
         patch("agents.destination_research_agent.create_tourism_search_tool") as mock_tool_factory:

        mock_vs = MagicMock()
        mock_vs.as_retriever.return_value = mock_retriever
        mock_vs_builder.return_value = mock_vs
        mock_tool = MagicMock()
        mock_tool.name = "search_tourism_information"
        mock_tool_factory.return_value = mock_tool

        mock_llm_instance = MagicMock()
        ai_message = MagicMock()
        ai_message.tool_calls = []
        ai_message.content = mock_llm_response
        mock_llm_instance.bind_tools.return_value = mock_llm_instance
        mock_llm_instance.invoke.return_value = ai_message
        MockLLM.return_value = mock_llm_instance

        agent = DestinationResearchAgent(retriever=mock_retriever)
        result = agent.run("Ella")

    research = result.get("result", {})
    assert "destination" in research
    assert "attractions" in research
    assert "information_limitations" in research


# ---------------------------------------------------------------------------
# AI-DST-009  Bounded execution – MAX_STEPS limit is respected
# ---------------------------------------------------------------------------

def test_ai_dst_009_max_steps_limit_is_imported_and_positive():
    """AI-DST-009: MAX_STEPS constant must be positive (bounded execution guardrail)."""
    from agents.destination_research_agent import MAX_STEPS
    assert isinstance(MAX_STEPS, int)
    assert MAX_STEPS > 0
    assert MAX_STEPS <= 10  # Reasonable ceiling to prevent runaway loops


# ---------------------------------------------------------------------------
# AI-DST-010  ResearchRequest schema accepts optional fields
# ---------------------------------------------------------------------------

def test_ai_dst_010_research_request_schema_accepts_optional_fields():
    """AI-DST-010: ResearchRequest Pydantic model accepts optional interests/dates."""
    from agents.destination_research_agent import ResearchRequest
    from pydantic import ValidationError

    # All optional fields omitted
    req1 = ResearchRequest(destination="Kandy")
    assert req1.destination == "Kandy"
    assert req1.interests is None
    assert req1.trip_start is None

    # With optional fields
    req2 = ResearchRequest(
        destination="Galle",
        interests=["history", "beach"],
        trip_start="2026-11-01",
        trip_end="2026-11-05",
        requested_information="entry fees"
    )
    assert req2.destination == "Galle"
    assert req2.interests == ["history", "beach"]

    # Missing required field should raise ValidationError
    with pytest.raises(ValidationError):
        ResearchRequest()  # destination is required
