"""
==============================================================================
TourLink Smart Tourism Platform - Travel Logistics & Availability Agent
Module: Travel Logistics & Availability Agent (LangGraph Workflow)
==============================================================================
Lecture Alignment:
- Lecture 05: LLM, Tool calling, Tools, Agent loop, Structured tool inputs/outputs
- Lecture 06: Grounded generation, Retriever as a tool, Dense FAISS embeddings
- Lecture 07: Specialized agent, Think -> Act -> Observe loop, State,
              Guardrails, Error handling, Bounded execution (MAX_STEPS)

Responsibility:
- Obtain and organize factual travel logistics, public transit routes, schedules,
  durations, distances, and transport availability for Sri Lankan tourism.
- Provides structured logistics to the Travel Planning Agent.
- Strictly bounded: Does NOT create itineraries, score personalized recommendations,
  analyze user reviews, or perform actual booking transactions.
- Bounded execution prevents infinite loops (MAX_STEPS = 5).
- Structured output validated via Pydantic (LogisticsResult).
==============================================================================
"""

import os
import sys
import json
import uuid
from typing import Annotated, List, Optional, Sequence, TypedDict, Dict, Any

# Windows DLL Application Control policy compatibility fallback
try:
    import uuid_utils
except ImportError:
    import types
    u = types.ModuleType("uuid_utils")
    u.UUID = uuid.UUID
    uc = types.ModuleType("uuid_utils.compat")
    uc.uuid7 = uuid.uuid4
    sys.modules["uuid_utils"] = u
    sys.modules["uuid_utils.compat"] = uc

from pydantic import BaseModel, Field, ValidationError

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

from tools.transport_tools import (
    build_logistics_vectorstore,
    create_logistics_search_tool,
    create_transport_schedule_tool,
    TransportService
)
from tools.route_tools import (
    create_route_search_tool,
    RouteService
)
from tools.availability_tools import (
    create_availability_tools,
    AvailabilityService
)


# ---------------------------------------------------------------------------
# Pydantic Schemas for Structured Input & Output
# ---------------------------------------------------------------------------
class LogisticsRequest(BaseModel):
    """Structured input schema for user or Travel Planning Agent logistics requests."""
    origin: str = Field(
        description="Starting location, city, or transit hub (e.g. 'Colombo', 'Kandy', 'Galle')"
    )
    destination: str = Field(
        description="Target destination city, station, or attraction (e.g. 'Kandy', 'Ella', 'Galle', 'Nuwara Eliya')"
    )
    transport_type: Optional[str] = Field(
        default=None,
        description="Optional preferred mode of transport: 'Train', 'Bus', 'Highway Express Bus', 'Taxi'"
    )
    travel_date: Optional[str] = Field(
        default=None,
        description="Optional tentative travel date or timing window (e.g. 'tomorrow morning', '2026-03-25')"
    )
    preferred_time: Optional[str] = Field(
        default=None,
        description="Optional preferred departure time (e.g. 'morning', 'afternoon', '07:00 AM')"
    )
    requested_information: Optional[str] = Field(
        default=None,
        description="Specific query or focus (e.g. 'train schedules', 'bus routes', 'travel duration', 'availability')"
    )


class TransportOption(BaseModel):
    """Structured schema representing a single validated transport option."""
    transport_type: str = Field(description="Mode of transit: 'Train', 'Bus', 'Highway Express Bus', 'Taxi'")
    route: str = Field(description="Name or official number of route (e.g. 'Main Line', 'Route 01', 'EX1-001')")
    departure_location: Optional[str] = Field(default=None, description="Departure station, bus stand, or terminal")
    arrival_location: Optional[str] = Field(default=None, description="Arrival station, bus stand, or terminal")
    departure_time: Optional[str] = Field(default=None, description="Scheduled departure time(s) or frequency")
    arrival_time: Optional[str] = Field(default=None, description="Estimated arrival time or schedule window")
    estimated_duration: Optional[str] = Field(default=None, description="Estimated transit duration (e.g. '3 hours 15 mins')")
    availability: Optional[str] = Field(default=None, description="Availability status and reservation requirement")
    source: Optional[str] = Field(default="prototype knowledge base", description="Data source attribution")


class LogisticsResult(BaseModel):
    """Structured output schema returned by the Travel Logistics & Availability Agent."""
    origin: str = Field(description="Origin city or location")
    destination: str = Field(description="Destination city or location")
    travel_date: Optional[str] = Field(default=None, description="Requested travel date or time window")
    transport_options: List[TransportOption] = Field(
        default_factory=list,
        description="List of verified practical transport options"
    )
    information_limitations: List[str] = Field(
        default_factory=list,
        description="Clear statements of missing, unverified, or live-data limitations"
    )
    unsupported_requests_note: Optional[str] = Field(
        default=None,
        description="Clear boundary explanation if user requested itinerary generation, recommendation scoring, or booking"
    )


# ---------------------------------------------------------------------------
# Agent State Definition (Lecture 07: State Management)
# ---------------------------------------------------------------------------
class LogisticsAgentState(TypedDict):
    """State tracked across the LangGraph agent execution loop."""
    messages: Annotated[Sequence[BaseMessage], add_messages]
    current_request: Dict[str, Any]
    tool_results: List[str]
    errors: List[str]
    execution_step_count: int
    final_result: Optional[Dict[str, Any]]


# ---------------------------------------------------------------------------
# System Prompt (Lecture 07: Guardrails & Specialized Scope)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are the TourLink Travel Logistics & Availability Agent for the TourLink Smart Tourism Platform in Sri Lanka.

YOUR MISSION:
Obtain, verify, and organize factual travel logistics and availability information needed by travelers and the Travel Planning Agent.

WHAT YOU RESEARCH:
- Transport options (Train, Bus, Highway Express Bus, Taxi)
- Public transport routes and numbers (e.g., Bus Route 01, Route 10, Train 1005 Podi Menike)
- Departure and arrival stations/terminals
- Timetables, departure frequencies, and estimated journey durations
- Approximate travel distances
- Transport availability information (scheduled service patterns)
- Attraction opening/closing times when needed for travel timing feasibility

STRICT OPERATIONAL RULES:
1. ALWAYS USE AVAILABLE TOOLS: Call your tools (`search_logistics_information`, `search_transport_routes`, `search_transport_schedule`, `check_transport_availability`, `search_attraction_hours`) whenever factual transit information is needed.
2. RETRIEVAL GROUNDING: Ground all answers exclusively in retrieved tool results. NEVER fabricate, invent, or assume transit routes, schedules, bus numbers, seat availability, or prices.
3. PROTOTYPE KNOWLEDGE BASE ATTRIBUTION: All data in this system is sourced from a prototype tourism knowledge base. Clearly state that live, real-time seat availability or dynamically changing timetables cannot be verified without official live API connections.
4. ABSOLUTE RESPONSIBILITY BOUNDARIES (NEVER PERFORM OTHER AGENTS' WORK):
   - DO NOT CREATE ITINERARIES: If asked to build a trip itinerary (e.g. "Create a 5-day Sri Lanka itinerary"), refuse politely and state:
     "Itinerary generation and daily scheduling are handled by the Travel Planning Agent. As the Travel Logistics & Availability Agent, I can provide the transit routes, travel durations, and schedules required for your destinations."
   - DO NOT PROVIDE RECOMMENDATIONS OR REVIEW ANALYSIS: If asked which destination or attraction is best, refuse politely and state:
     "Personalized destination recommendations, review sentiment analysis, and suitability scoring are handled by the Recommendation & Feedback Analysis Agent."
   - DO NOT REPLACE DESTINATION RESEARCH: Detailed cultural and historical descriptions belong to the Destination Research Agent.
   - DO NOT PERFORM BOOKINGS: If asked to book a ticket (e.g. "Book me a train ticket"), refuse politely and state:
     "Ticket booking functionality is not currently connected to live booking engines. I can provide schedule and availability guidance, but cannot process reservations."
5. INFORMATION LIMITATIONS: If no route, schedule, or availability data is found for a corridor, explicitly list it in `information_limitations`. Do not guess.

STRUCTURED OUTPUT FORMAT:
You must conclude your final response with valid JSON adhering to this exact schema:
```json
{
  "origin": "<Origin>",
  "destination": "<Destination>",
  "travel_date": "<Date or null>",
  "transport_options": [
    {
      "transport_type": "Train / Bus / etc.",
      "route": "...",
      "departure_location": "...",
      "arrival_location": "...",
      "departure_time": "...",
      "arrival_time": "...",
      "estimated_duration": "...",
      "availability": "...",
      "source": "prototype knowledge base"
    }
  ],
  "information_limitations": [
    "..."
  ],
  "unsupported_requests_note": "<Optional note if boundary was triggered, else null>"
}
```
"""

MAX_STEPS = 5  # Bounded execution guardrail (Lecture 07)


# ---------------------------------------------------------------------------
# Safe Operational Execution Tracer (Lecture 07: Safe Tracing)
# ---------------------------------------------------------------------------
class SafeExecutionTracer:
    """
    Safe execution logger that records operational events (tools invoked, documents found,
    validation milestones) without exposing hidden chain-of-thought, sensitive reasoning,
    or secret keys.
    """

    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        self.logs: List[Dict[str, Any]] = []

    def log_step(self, step: int, action: str, details: Dict[str, Any]):
        entry = {
            "agent": "Travel Logistics & Availability Agent",
            "step": step,
            "action": action,
            **details
        }
        self.logs.append(entry)
        if self.verbose:
            print(f"\n[AGENT TRACE | Step {step}] Action: {action}")
            for k, v in details.items():
                print(f"   • {k}: {v}")

    def get_logs(self) -> List[Dict[str, Any]]:
        return self.logs


# ---------------------------------------------------------------------------
# Travel Logistics & Availability Agent Class
# ---------------------------------------------------------------------------
class TravelLogisticsAgent:
    """
    Encapsulates the Travel Logistics & Availability Agent LangGraph workflow.
    """

    def __init__(
        self,
        model_name: str = "gemini-3.5-flash-lite",
        temperature: float = 0.0,
        retriever=None,
        tracer: Optional[SafeExecutionTracer] = None
    ):
        self.model_name = model_name
        self.temperature = temperature
        self.tracer = tracer or SafeExecutionTracer(verbose=False)

        # Build or use existing FAISS retriever
        if retriever is None:
            vectorstore = build_logistics_vectorstore()
            self.retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
        else:
            self.retriever = retriever

        # Initialize underlying services
        self.transport_service = TransportService()
        self.route_service = RouteService()
        self.availability_service = AvailabilityService()

        # Build specialized LangChain tools
        self.search_logistics_tool = create_logistics_search_tool(self.retriever)
        self.search_schedule_tool = create_transport_schedule_tool(self.transport_service)
        self.search_routes_tool = create_route_search_tool(self.route_service)
        avail_tool, hours_tool = create_availability_tools(self.availability_service)
        self.check_availability_tool = avail_tool
        self.search_attraction_hours_tool = hours_tool

        self.tools = [
            self.search_logistics_tool,
            self.search_routes_tool,
            self.search_schedule_tool,
            self.check_availability_tool,
            self.search_attraction_hours_tool
        ]
        self.tools_by_name = {t.name: t for t in self.tools}

        # Initialize LLM with tool calling support
        self.llm = ChatGoogleGenerativeAI(
            model=self.model_name,
            temperature=self.temperature
        )
        self.llm_with_tools = self.llm.bind_tools(self.tools)

        # Build LangGraph workflow
        self.app = self._build_graph()

    def _agent_node(self, state: LogisticsAgentState) -> Dict[str, Any]:
        """Agent node: Evaluates state and decides whether to invoke tools or finalize response."""
        step_count = state.get("execution_step_count", 0) + 1

        # Bounded Execution Check (Lecture 07: Safety Guardrails)
        if step_count > MAX_STEPS:
            error_msg = f"Bounded execution limit reached (MAX_STEPS={MAX_STEPS}). Halting loop safely."
            self.tracer.log_step(
                step=step_count,
                action="Bounded Execution Limit Triggered",
                details={"status": "Halted", "message": error_msg}
            )
            fallback_ai_message = AIMessage(
                content=json.dumps({
                    "origin": state.get("current_request", {}).get("origin", "Unknown"),
                    "destination": state.get("current_request", {}).get("destination", "Unknown"),
                    "travel_date": state.get("current_request", {}).get("travel_date"),
                    "transport_options": [],
                    "information_limitations": [
                        "Unable to complete the logistics request within the allowed number of steps.",
                        "Execution halted to protect agentic safety bounds."
                    ],
                    "unsupported_requests_note": error_msg
                })
            )
            return {
                "messages": [fallback_ai_message],
                "errors": state.get("errors", []) + [error_msg],
                "execution_step_count": step_count
            }

        messages = state["messages"]
        response = self.llm_with_tools.invoke(messages)

        has_calls = bool(hasattr(response, "tool_calls") and response.tool_calls)
        self.tracer.log_step(
            step=step_count,
            action="LLM Reasoning Step",
            details={
                "has_tool_calls": has_calls,
                "tool_calls_requested": [c["name"] for c in response.tool_calls] if has_calls else []
            }
        )

        return {
            "messages": [response],
            "execution_step_count": step_count
        }

    def _tools_node(self, state: LogisticsAgentState) -> Dict[str, Any]:
        """Tools node: Safely executes requested tools and returns observations."""
        last_message = state["messages"][-1]
        tool_messages = []
        tool_results = list(state.get("tool_results", []))
        errors = list(state.get("errors", []))
        step_count = state.get("execution_step_count", 1)

        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            for tool_call in last_message.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                tool_id = tool_call["id"]

                if tool_name in self.tools_by_name:
                    try:
                        observation = self.tools_by_name[tool_name].invoke(tool_args)
                        self.tracer.log_step(
                            step=step_count,
                            action="Tool Executed Successfully",
                            details={
                                "tool": tool_name,
                                "args": tool_args,
                                "observation_preview": str(observation)[:120] + "..."
                            }
                        )
                    except Exception as exc:
                        observation = f"TOOL_ERROR: Execution of {tool_name} failed: {str(exc)}"
                        errors.append(observation)
                        self.tracer.log_step(
                            step=step_count,
                            action="Tool Execution Failed",
                            details={"tool": tool_name, "error": str(exc)}
                        )
                else:
                    observation = f"TOOL_ERROR: Unknown tool '{tool_name}' requested."
                    errors.append(observation)

                tool_messages.append(
                    ToolMessage(
                        content=str(observation),
                        tool_call_id=tool_id,
                        name=tool_name
                    )
                )
                tool_results.append(f"[{tool_name}] args={tool_args}")

        return {
            "messages": tool_messages,
            "tool_results": tool_results,
            "errors": errors
        }

    def _validation_node(self, state: LogisticsAgentState) -> Dict[str, Any]:
        """Validation node: Validates and parses agent output into Pydantic LogisticsResult."""
        last_message = state["messages"][-1]
        content = last_message.content if hasattr(last_message, "content") else str(last_message)
        req = state.get("current_request", {})
        origin_name = req.get("origin", "Unknown")
        dest_name = req.get("destination", "Unknown")
        travel_date = req.get("travel_date")

        raw_text = ""
        if isinstance(content, str):
            raw_text = content
        elif isinstance(content, list):
            texts = [c.get("text", "") for c in content if isinstance(c, dict) and "text" in c]
            raw_text = "\n".join(texts)

        # Clean markdown codeblocks if present
        clean_json_str = raw_text.strip()
        if "```json" in clean_json_str:
            clean_json_str = clean_json_str.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json_str:
            clean_json_str = clean_json_str.split("```")[1].split("```")[0].strip()

        parsed_result = None
        try:
            data = json.loads(clean_json_str)
            validated = LogisticsResult(**data)
            parsed_result = validated.model_dump()
            self.tracer.log_step(
                step=state.get("execution_step_count", 0),
                action="Output Validation Passed",
                details={"transport_options_count": len(validated.transport_options)}
            )
        except (json.JSONDecodeError, ValidationError) as err:
            # Safe Fallback Construction (Lecture 07: Error recovery)
            unsupported_note = None
            raw_lower = raw_text.lower()
            if "travel planning agent" in raw_lower or "itinerary" in raw_lower:
                unsupported_note = "Itinerary generation is handled by the Travel Planning Agent."
            elif "recommendation" in raw_lower or "feedback analysis" in raw_lower:
                unsupported_note = "Destination recommendations are handled by the Recommendation & Feedback Analysis Agent."
            elif "booking" in raw_lower or "ticket" in raw_lower:
                unsupported_note = "Ticket booking functionality is not currently connected."

            parsed_result = LogisticsResult(
                origin=origin_name,
                destination=dest_name,
                travel_date=travel_date,
                transport_options=[],
                information_limitations=[
                    "Response structured according to safety fallback schema.",
                    f"Summary message: {raw_text[:280]}"
                ],
                unsupported_requests_note=unsupported_note or f"Validation fallback: {str(err)}"
            ).model_dump()

            self.tracer.log_step(
                step=state.get("execution_step_count", 0),
                action="Output Validation Fallback Applied",
                details={"reason": str(err)}
            )

        return {"final_result": parsed_result}

    def _route_tools(self, state: LogisticsAgentState) -> str:
        """Conditional router: Routes to tools_node if tool calls exist, else validation_node."""
        last_message = state["messages"][-1]
        step_count = state.get("execution_step_count", 0)

        if step_count >= MAX_STEPS:
            return "validation_node"

        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools_node"

        return "validation_node"

    def _build_graph(self):
        """Construct the LangGraph StateGraph workflow."""
        graph = StateGraph(LogisticsAgentState)

        graph.add_node("agent_node", self._agent_node)
        graph.add_node("tools_node", self._tools_node)
        graph.add_node("validation_node", self._validation_node)

        graph.add_edge(START, "agent_node")
        graph.add_conditional_edges(
            "agent_node",
            self._route_tools,
            {
                "tools_node": "tools_node",
                "validation_node": "validation_node"
            }
        )
        graph.add_edge("tools_node", "agent_node")
        graph.add_edge("validation_node", END)

        return graph.compile()

    def run(self, request_input: Any) -> Dict[str, Any]:
        """
        Execute the Travel Logistics & Availability Agent.
        Supports LogisticsRequest Pydantic object, dict, or natural language string query.
        """
        # Step 1: Input Validation Guardrail
        if not request_input:
            err_result = LogisticsResult(
                origin="Unknown",
                destination="Unknown",
                transport_options=[],
                information_limitations=["ERROR: Input request is empty. Please provide a valid transit inquiry."],
                unsupported_requests_note="Input Validation Error: Empty Query"
            ).model_dump()
            return {
                "result": err_result,
                "tool_results": [],
                "errors": ["Input query is empty."],
                "step_count": 0
            }

        request_data = {}
        if isinstance(request_input, str):
            clean_str = request_input.strip()
            if not clean_str:
                err_result = LogisticsResult(
                    origin="Unknown",
                    destination="Unknown",
                    transport_options=[],
                    information_limitations=["ERROR: Input query string is blank."],
                    unsupported_requests_note="Input Validation Error: Empty Query"
                ).model_dump()
                return {
                    "result": err_result,
                    "tool_results": [],
                    "errors": ["Input query string is blank."],
                    "step_count": 0
                }
            request_data = {
                "origin": "Inferred from query",
                "destination": "Inferred from query",
                "requested_information": clean_str
            }
            user_prompt = clean_str
        elif isinstance(request_input, LogisticsRequest):
            request_data = request_input.model_dump()
            user_prompt = (
                f"Logistics Inquiry: Travel from {request_data['origin']} to {request_data['destination']}."
            )
            if request_data.get("transport_type"):
                user_prompt += f" Preferred transport mode: {request_data['transport_type']}."
            if request_data.get("travel_date"):
                user_prompt += f" Travel date/timeframe: {request_data['travel_date']}."
            if request_data.get("requested_information"):
                user_prompt += f" Details requested: {request_data['requested_information']}."
        elif isinstance(request_input, dict):
            try:
                validated_req = LogisticsRequest(**request_input)
                request_data = validated_req.model_dump()
                user_prompt = (
                    f"Logistics Inquiry: Travel from {request_data['origin']} to {request_data['destination']}."
                )
                if request_data.get("transport_type"):
                    user_prompt += f" Preferred mode: {request_data['transport_type']}."
                if request_data.get("travel_date"):
                    user_prompt += f" Travel date: {request_data['travel_date']}."
            except ValidationError as ve:
                err_result = LogisticsResult(
                    origin=request_input.get("origin", "Unknown"),
                    destination=request_input.get("destination", "Unknown"),
                    transport_options=[],
                    information_limitations=[f"ERROR: Input validation failed: {str(ve)}"],
                    unsupported_requests_note="Pydantic Input Validation Error"
                ).model_dump()
                return {
                    "result": err_result,
                    "tool_results": [],
                    "errors": [str(ve)],
                    "step_count": 0
                }
        else:
            err_result = LogisticsResult(
                origin="Unknown",
                destination="Unknown",
                transport_options=[],
                information_limitations=["ERROR: Unsupported input type provided."],
                unsupported_requests_note="Type Error"
            ).model_dump()
            return {
                "result": err_result,
                "tool_results": [],
                "errors": ["Unsupported input type."],
                "step_count": 0
            }

        # Step 2: Initialize Agent State
        initial_state: LogisticsAgentState = {
            "messages": [
                SystemMessage(content=SYSTEM_PROMPT),
                HumanMessage(content=user_prompt)
            ],
            "current_request": request_data,
            "tool_results": [],
            "errors": [],
            "execution_step_count": 0,
            "final_result": None
        }

        # Step 3: Run LangGraph StateGraph Workflow
        result_state = self.app.invoke(initial_state)

        return {
            "result": result_state.get("final_result"),
            "tool_results": result_state.get("tool_results", []),
            "errors": result_state.get("errors", []),
            "step_count": result_state.get("execution_step_count", 0),
            "trace": self.tracer.get_logs()
        }
