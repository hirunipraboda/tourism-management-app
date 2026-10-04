"""
==============================================================================
TourLink Smart Tourism Platform - Recommendation & Feedback Analysis Agent
Module: Recommendation & Feedback Analysis Agent (LangGraph Workflow)
==============================================================================
Lecture Alignment:
- Lecture 05: LLM, Tool calling, Tool schemas, Agent loop, Structured tool inputs/outputs
- Lecture 06: Grounded generation, Retriever as a tool, Dense embeddings, FAISS RAG
- Lecture 07: Specialized agent, Think -> Act -> Observe loop, LangGraph State,
              Guardrails, Error handling, Bounded execution (MAX_STEPS)

Single Responsibility:
- Analyzes tourist feedback, reviews, and sentiment.
- Generates evidence-grounded, personalized attraction recommendations.
- Compares user preferences against destination characteristics and review evidence.
- Explains all recommendations with transparent evidence (NO arbitrary ranking).
- Explicitly refuses out-of-scope requests:
    * Itinerary planning (Handled by Travel Planning Agent)
    * Routes and transport availability (Handled by Travel Logistics Agent)
    * Authoritative factual opening hours (Handled by Destination Research Agent)
    * Financial bookings (Not supported)
==============================================================================
"""

import os
import sys
import json
import uuid
import types
from typing import Annotated, List, Optional, Sequence, TypedDict, Dict, Any
from pydantic import BaseModel, Field, ValidationError

# Windows DLL Application Control policy compatibility fallback
try:
    import uuid_utils
except ImportError:
    u = types.ModuleType("uuid_utils")
    u.UUID = uuid.UUID
    uc = types.ModuleType("uuid_utils.compat")
    uc.uuid7 = uuid.uuid4
    sys.modules["uuid_utils"] = u
    sys.modules["uuid_utils.compat"] = uc

try:
    from sklearn.metrics.cluster import _expected_mutual_info_fast
except ImportError:
    m = types.ModuleType("sklearn.metrics.cluster._expected_mutual_info_fast")
    m.expected_mutual_information = lambda *a, **k: 0
    sys.modules["sklearn.metrics.cluster._expected_mutual_info_fast"] = m

from dotenv import load_dotenv, find_dotenv
from langchain_core.messages import (
    BaseMessage,
    HumanMessage,
    AIMessage,
    SystemMessage,
    ToolMessage
)
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_google_genai import ChatGoogleGenerativeAI

from tools.review_tools import (
    build_review_vectorstore,
    create_review_search_tool,
    analyze_review_sentiment,
    analyze_feedback_themes
)
from tools.recommendation_tools import (
    UserPreferences,
    Recommendation,
    RecommendationResult,
    calculate_suitability_score
)


# ---------------------------------------------------------------------------
# Agent State Definition (Lecture 07: LangGraph State Management)
# ---------------------------------------------------------------------------
class RecommendationState(TypedDict):
    """State tracked across the agent execution loop."""
    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_preferences: Dict[str, Any]
    retrieved_reviews: List[str]
    sentiment_results: List[Dict[str, Any]]
    feedback_themes: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    execution_step_count: int
    execution_trace: List[Dict[str, Any]]
    validation_status: str
    errors: List[str]
    final_result: Optional[Dict[str, Any]]


# ---------------------------------------------------------------------------
# System Prompt & Boundary Guardrails (Lecture 07)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are the TourLink Recommendation & Feedback Analysis Agent for the TourLink Smart Tourism Platform.

YOUR SPECIALIZED RESPONSIBILITY:
- Analyze tourist reviews, feedback, and sentiment across destinations in Sri Lanka.
- Identify recurrent themes (scenery, crowds, peacefulness, cleanliness, cost, trail difficulty).
- Produce evidence-grounded, personalized attraction recommendations based on traveler preferences (interests, budget, environment, travel style).
- Transparently explain WHY each recommendation matches using retrieved review evidence.

STRICT OPERATIONAL RULES & BOUNDARIES:
1. ALWAYS USE TOOLS FOR EVIDENCE:
   - Call `search_reviews` to retrieve authentic tourist opinions, ratings, and vibes.
   - Call `analyze_review_sentiment` to determine positive and negative facets of reviews.
   - Call `analyze_feedback_themes` to detect recurring praises or common traveler complaints.

2. GROUNDED IN PROTOTYPE REVIEW DATASET:
   - All reviews originate from the "prototype tourism review dataset".
   - Do NOT invent or hallucinate reviews, ratings, or tourist quotes.
   - If no review evidence is available for an attraction or destination, explicitly state:
     "The current review knowledge base does not contain sufficient feedback to support this recommendation."

3. TRANSPARENT PREFERENCE MATCHING & NO ARBITRARY RANKING:
   - Never claim an attraction is objectively the single "best" unless supported by comparative feedback.
   - Explain matching factors (interest match, environment vibe, cost perception).
   - If cost is not verified in the review knowledge base, clearly declare: "Cost could not be verified."

4. STRICT RESPONSIBILITY BOUNDARIES (DO NOT ASSUME OTHER AGENTS' WORK):
   - ITINERARY REQUESTS: If asked to build a multi-day itinerary (e.g. "Create a 5-day itinerary for Ella"), REFUSE and state:
     "I am the Recommendation & Feedback Analysis Agent. Creating complete itineraries belongs to the Travel Planning Agent. I can provide review-backed attraction recommendations for your destinations."
   - TRANSIT / LOGISTICS REQUESTS: If asked how to travel between cities, train routes, or live schedules (e.g. "How do I travel from Kandy to Ella?"), REFUSE and state:
     "I am the Recommendation & Feedback Analysis Agent. Transit routing, train timetables, and logistics belong to the Travel Logistics & Availability Agent."
   - FACTUAL DESTINATION LOOKUPS: If asked for official opening hours or factual entrance fees (e.g. "What are the opening hours?"), REFUSE or state:
     "Authoritative destination research and opening hours belong to the Destination Research Agent. I specialize in traveler feedback and sentiment."
   - BOOKINGS: Do not perform booking transactions.

OUTPUT FORMAT:
When presenting your final answer, produce a clear structured JSON adhering to the RecommendationResult schema:
{
  "recommendations": [
    {
      "attraction": "...",
      "destination": "...",
      "reason": "...",
      "matching_preferences": ["..."],
      "supporting_feedback": ["..."],
      "sentiment_summary": "...",
      "limitations": ["..."],
      "suitability_score": 85.0,
      "score_breakdown": "..."
    }
  ],
  "analysis_summary": "...",
  "information_limitations": ["..."],
  "unsupported_requests_note": "..."
}
"""

MAX_STEPS = 5


# ---------------------------------------------------------------------------
# Agent Workflow Nodes & Graph Construction
# ---------------------------------------------------------------------------
def build_recommendation_agent(
    model_name: Optional[str] = None,
    api_key: Optional[str] = None,
    vectorstore: Optional[Any] = None
):
    """
    Constructs and compiles the LangGraph Recommendation & Feedback Analysis Agent.
    """
    # 1. Load environment and configure API key
    if not api_key:
        load_dotenv(find_dotenv(usecwd=True))
        api_key = os.getenv("GOOGLE_API_KEY")

    target_model = model_name or os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

    # Initialize Gemini LLM
    try:
        llm = ChatGoogleGenerativeAI(
            model=target_model,
            temperature=0,
            google_api_key=api_key
        )
    except Exception as e:
        # Graceful fallback to gemini-2.5-flash-lite or gemini-1.5-flash
        fallback_model = "gemini-2.5-flash-lite"
        llm = ChatGoogleGenerativeAI(
            model=fallback_model,
            temperature=0,
            google_api_key=api_key
        )

    # 2. Initialize Vector Store & Tools
    if vectorstore is None:
        vectorstore = build_review_vectorstore()

    search_reviews_tool = create_review_search_tool(vectorstore)
    tools_list = [search_reviews_tool, analyze_review_sentiment, analyze_feedback_themes]
    tools_by_name = {t.name: t for t in tools_list}
    llm_with_tools = llm.bind_tools(tools_list)

    # 3. Define Graph Nodes
    def agent_reasoning_node(state: RecommendationState) -> Dict[str, Any]:
        """Node: Agent decides whether to call review tools or synthesize recommendations."""
        step_count = state.get("execution_step_count", 0) + 1
        messages = list(state.get("messages", []))
        trace = list(state.get("execution_trace", []))

        # Ensure SystemMessage is present at start
        if not messages or not isinstance(messages[0], SystemMessage):
            messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages

        # Check bounded execution
        if step_count > MAX_STEPS:
            trace.append({
                "step": step_count,
                "action": "Bounded Execution Guardrail Triggered",
                "result": f"Execution exceeded MAX_STEPS={MAX_STEPS}. Halting safely."
            })
            halt_message = AIMessage(
                content="Unable to complete recommendation analysis within the allowed number of steps. Halting safely to prevent unbounded execution."
            )
            return {
                "messages": [halt_message],
                "execution_step_count": step_count,
                "execution_trace": trace
            }

        trace.append({
            "step": step_count,
            "action": "Agent Reasoning (Think)",
            "details": "Evaluating traveler preferences and review evidence requirements"
        })

        try:
            response = llm_with_tools.invoke(messages)
        except Exception as e:
            error_msg = f"LLM invocation error in reasoning node: {str(e)}"
            return {
                "messages": [AIMessage(content=error_msg)],
                "execution_step_count": step_count,
                "errors": state.get("errors", []) + [error_msg],
                "execution_trace": trace
            }

        return {
            "messages": [response],
            "execution_step_count": step_count,
            "execution_trace": trace
        }

    def tool_execution_node(state: RecommendationState) -> Dict[str, Any]:
        """Node: Executes tools invoked by the LLM."""
        messages = list(state.get("messages", []))
        last_message = messages[-1]
        trace = list(state.get("execution_trace", []))
        tool_messages = []
        retrieved_reviews = list(state.get("retrieved_reviews", []))
        sentiment_results = list(state.get("sentiment_results", []))
        feedback_themes = list(state.get("feedback_themes", []))

        if not hasattr(last_message, "tool_calls") or not last_message.tool_calls:
            return {"messages": []}

        for call in last_message.tool_calls:
            tool_name = call.get("name")
            tool_args = call.get("args", {})
            call_id = call.get("id", str(uuid.uuid4()))

            trace.append({
                "step": state.get("execution_step_count", 0),
                "action": f"Tool Call: {tool_name}",
                "input": tool_args
            })

            if tool_name in tools_by_name:
                try:
                    tool_fn = tools_by_name[tool_name]
                    result_str = tool_fn.invoke(tool_args)
                except Exception as err:
                    result_str = f"TOOL_EXECUTION_ERROR: {str(err)}"
            else:
                result_str = f"TOOL_ERROR: Unknown tool '{tool_name}'."

            if tool_name == "search_reviews":
                retrieved_reviews.append(result_str)
            elif tool_name == "analyze_review_sentiment":
                try:
                    sentiment_results.append(json.loads(result_str))
                except Exception:
                    pass
            elif tool_name == "analyze_feedback_themes":
                try:
                    feedback_themes.append(json.loads(result_str))
                except Exception:
                    pass

            trace.append({
                "step": state.get("execution_step_count", 0),
                "action": f"Tool Result: {tool_name}",
                "result": result_str[:200] + ("..." if len(result_str) > 200 else "")
            })

            tool_messages.append(
                ToolMessage(content=str(result_str), tool_call_id=call_id)
            )

        return {
            "messages": tool_messages,
            "retrieved_reviews": retrieved_reviews,
            "sentiment_results": sentiment_results,
            "feedback_themes": feedback_themes,
            "execution_trace": trace
        }

    def output_validation_node(state: RecommendationState) -> Dict[str, Any]:
        """Node: Validates output against RecommendationResult schema and applies guardrails."""
        messages = list(state.get("messages", []))
        last_message = messages[-1]
        trace = list(state.get("execution_trace", []))
        content = last_message.content if hasattr(last_message, "content") else str(last_message)

        # Handle list of text blocks from Google GenAI
        if isinstance(content, list):
            content = " ".join(c.get("text", str(c)) if isinstance(c, dict) else str(c) for c in content)

        trace.append({
            "step": state.get("execution_step_count", 0),
            "action": "Output Validation & Guardrail Verification",
            "validation": "Validating schema compliance and boundary constraints"
        })

        # Check for out-of-scope refusal queries
        refusal_keywords = [
            "Travel Planning Agent",
            "Travel Logistics",
            "Destination Research Agent",
            "itinerary",
            "route calculation",
            "opening hours"
        ]
        is_refusal = any(kw.lower() in content.lower() for kw in refusal_keywords)

        structured_dict = None
        # Attempt JSON extraction
        try:
            # Extract JSON block if present
            if "```json" in content:
                json_part = content.split("```json")[1].split("```")[0].strip()
            elif "{" in content and "}" in content:
                start_idx = content.find("{")
                end_idx = content.rfind("}") + 1
                json_part = content[start_idx:end_idx]
            else:
                json_part = content

            parsed = json.loads(json_part)
            validated = RecommendationResult.model_validate(parsed)
            structured_dict = validated.model_dump()
            validation_status = "PASSED"
        except Exception:
            validation_status = "REFUSAL_OR_UNSTRUCTURED" if is_refusal else "FALLBACK_PARSED"
            structured_dict = {
                "recommendations": [],
                "analysis_summary": content.strip(),
                "information_limitations": [
                    "Recommendation synthesized from available prototype review knowledge base.",
                    "Source: prototype review dataset."
                ],
                "unsupported_requests_note": content.strip() if is_refusal else None
            }

        return {
            "validation_status": validation_status,
            "final_result": structured_dict,
            "execution_trace": trace
        }

    # 4. Conditional Edge Logic
    def should_continue(state: RecommendationState) -> str:
        """Determines whether to execute tools, validate output, or end."""
        messages = list(state.get("messages", []))
        step_count = state.get("execution_step_count", 0)

        if step_count >= MAX_STEPS:
            return "validate"

        if messages:
            last_msg = messages[-1]
            if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
                return "tools"

        return "validate"

    # 5. Build StateGraph
    builder = StateGraph(RecommendationState)

    builder.add_node("agent", agent_reasoning_node)
    builder.add_node("tools", tool_execution_node)
    builder.add_node("validate", output_validation_node)

    builder.add_edge(START, "agent")
    builder.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            "validate": "validate"
        }
    )
    builder.add_edge("tools", "agent")
    builder.add_edge("validate", END)

    app = builder.compile()
    return app


# ---------------------------------------------------------------------------
# Convenience Execution & Safe Tracing Helper
# ---------------------------------------------------------------------------
def run_recommendation_query(
    app: Any,
    user_query: str,
    preferences: Optional[UserPreferences] = None
) -> Dict[str, Any]:
    """
    Executes a recommendation request through the LangGraph agent and returns safe traces.
    """
    initial_pref = preferences.model_dump() if preferences else {}
    initial_state: RecommendationState = {
        "messages": [HumanMessage(content=user_query)],
        "user_preferences": initial_pref,
        "retrieved_reviews": [],
        "sentiment_results": [],
        "feedback_themes": [],
        "recommendations": [],
        "execution_step_count": 0,
        "execution_trace": [{
            "step": 1,
            "action": "Receive User Request & Initialize Preferences",
            "input": user_query,
            "preferences": initial_pref
        }],
        "validation_status": "INITIALIZED",
        "errors": [],
        "final_result": None
    }

    final_state = app.invoke(initial_state)
    return final_state
