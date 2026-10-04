"""
==============================================================================
TourLink Smart Tourism Platform - Destination Research Agent
Module: Destination Research Agent (LangGraph Workflow)
==============================================================================
Lecture Alignment:
- Lecture 05: LLM, Tool calling, Tools, Agent loop, Structured tool inputs/outputs
- Lecture 06: Grounded generation, Retriever as a tool
- Lecture 07: Specialized agent, Think -> Act -> Observe loop, State,
              Guardrails, Error handling, Bounded execution (MAX_STEPS)

Responsibility:
- Researches factual tourism information about destinations, attractions, and activities
- Narrowly scoped: Does NOT create itineraries, score suitability, or calculate routes
- Bounded execution prevents infinite loops
- Structured output validated via Pydantic (DestinationResearchResult)
==============================================================================
"""

import os
import json
from typing import Annotated, List, Optional, Sequence, TypedDict, Dict, Any
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

from tools.tourism_search_tool import (
    build_tourism_vectorstore,
    create_tourism_search_tool
)


# ---------------------------------------------------------------------------
# Pydantic Schemas for Structured Input & Output
# ---------------------------------------------------------------------------
class ResearchRequest(BaseModel):
    """Structured input schema for requesting destination research."""
    destination: str = Field(
        description="Target destination name (e.g. 'Kandy', 'Ella', 'Galle', 'Sigiriya', 'Colombo')"
    )
    interests: Optional[List[str]] = Field(
        default=None,
        description="Optional interest categories, e.g. ['culture', 'nature', 'adventure']"
    )
    trip_start: Optional[str] = Field(
        default=None,
        description="Optional tentative trip start date (YYYY-MM-DD)"
    )
    trip_end: Optional[str] = Field(
        default=None,
        description="Optional tentative trip end date (YYYY-MM-DD)"
    )
    requested_information: Optional[str] = Field(
        default=None,
        description="Specific attributes requested (e.g. 'opening hours', 'costs', 'nearby attractions')"
    )


class AttractionResearch(BaseModel):
    """Structured schema for a single researched attraction."""
    name: str = Field(description="Name of the tourist attraction")
    category: str = Field(description="Category (e.g. Culture, Nature, Adventure, History)")
    description: str = Field(description="Factual description based on retrieved information")
    location: str = Field(description="Location or area within the destination")
    estimated_duration_hours: str = Field(description="Estimated visit duration")
    estimated_cost: str = Field(description="Estimated entrance fee or cost indication")
    opening_hours: str = Field(description="Opening hours and access conditions")
    nearby_attractions: List[str] = Field(default_factory=list, description="Nearby attractions")
    activities: List[str] = Field(default_factory=list, description="Available activities/experiences")


class DestinationResearchResult(BaseModel):
    """Structured output schema returned by the Destination Research Agent."""
    destination: str = Field(description="Destination researched")
    attractions: List[AttractionResearch] = Field(
        default_factory=list,
        description="List of factual attractions retrieved"
    )
    information_limitations: str = Field(
        description="Clear statement of unavailable information, knowledge limitations, or verification advice"
    )
    unsupported_requests_note: Optional[str] = Field(
        default=None,
        description="Explicit explanation if any user requests exceeded scope (e.g. itinerary, booking, recommendation scoring)"
    )


# ---------------------------------------------------------------------------
# Agent State Definition (Lecture 07: State)
# ---------------------------------------------------------------------------
class DestinationAgentState(TypedDict):
    """State tracked across the agent execution loop."""
    messages: Annotated[Sequence[BaseMessage], add_messages]
    current_request: Dict[str, Any]
    tool_results: List[str]
    errors: List[str]
    execution_step_count: int
    final_result: Optional[Dict[str, Any]]


# ---------------------------------------------------------------------------
# System Prompt (Lecture 07: Guardrails & Specialized Scope)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are the TourLink Destination Research Agent for the TourLink Smart Tourism Platform.

YOUR RESPONSIBILITY:
- Research factual tourism information about destinations, attractions, and activities in Sri Lanka.
- Provide objective details: category, description, location, estimated duration, cost, opening hours, nearby attractions, and activities.

STRICT OPERATIONAL RULES:
1. ALWAYS USE TOOLS: You must call the `search_tourism_information` tool whenever factual tourism information is needed.
2. GROUNDED IN RETRIEVAL: Only use retrieved knowledge base data as the factual basis. Do NOT invent or hallucinate attractions, costs, or hours.
3. EXPLICIT LIMITATIONS: If information is unavailable in the retrieved documents, explicitly state that it is unavailable in `information_limitations`.
4. NARROW SCOPE & BOUNDARIES (DO NOT PERFORM RESPONSIBILITIES OF OTHER AGENTS):
   - DO NOT calculate personalized suitability scores or decide which attraction is best for an individual tourist. Explain: "Personalized attraction recommendations and suitability scoring are handled by the Recommendation & Feedback Analysis Agent."
   - DO NOT generate complete daily itineraries or schedule trip days. Explain: "Itinerary creation is handled by the Travel Planning Agent."
   - DO NOT calculate travel routes or check live transport schedules or weather. Explain: "Route calculation, logistics, and live transport checks are handled by the Travel Logistics & Availability Agent."
   - DO NOT perform or approve booking transactions.

STRUCTURED OUTPUT FORMAT:
When presenting your final answer, produce a clear JSON structure matching this schema:
{
  "destination": "<Destination Name>",
  "attractions": [
    {
      "name": "...",
      "category": "...",
      "description": "...",
      "location": "...",
      "estimated_duration_hours": "...",
      "estimated_cost": "...",
      "opening_hours": "...",
      "nearby_attractions": ["..."],
      "activities": ["..."]
    }
  ],
  "information_limitations": "...",
  "unsupported_requests_note": "..."
}
"""

MAX_STEPS = 5  # Bounded execution guardrail (Lecture 07)


# ---------------------------------------------------------------------------
# Destination Research Agent Class
# ---------------------------------------------------------------------------
class DestinationResearchAgent:
    """
    Encapsulates the Destination Research Agent LangGraph workflow.
    """

    def __init__(
        self,
        model_name: str = "gemini-3.5-flash-lite",
        temperature: float = 0.0,
        retriever=None
    ):
        self.model_name = model_name
        self.temperature = temperature

        # Build or use existing retriever
        if retriever is None:
            vectorstore = build_tourism_vectorstore()
            self.retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
        else:
            self.retriever = retriever

        # Create the LangChain search tool
        self.search_tool = create_tourism_search_tool(self.retriever)
        self.tools = [self.search_tool]
        self.tools_by_name = {t.name: t for t in self.tools}

        # Initialize LLM with tool calling support
        self.llm = ChatGoogleGenerativeAI(
            model=self.model_name,
            temperature=self.temperature
        )
        self.llm_with_tools = self.llm.bind_tools(self.tools)

        # Build LangGraph workflow
        self.app = self._build_graph()

    def _agent_node(self, state: DestinationAgentState) -> Dict[str, Any]:
        """Agent node: Reasons over current state and decides whether to act (call tool) or respond."""
        step_count = state.get("execution_step_count", 0) + 1

        # Bounded Execution Check (Lecture 07: Guardrails)
        if step_count > MAX_STEPS:
            error_msg = f"Bounded execution limit reached (MAX_STEPS={MAX_STEPS}). Halting loop to prevent runaway execution."
            fallback_ai_message = AIMessage(
                content=json.dumps({
                    "destination": state.get("current_request", {}).get("destination", "Unknown"),
                    "attractions": [],
                    "information_limitations": "Execution exceeded maximum allowable tool steps. Partial or no data retrieved safely.",
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
        return {
            "messages": [response],
            "execution_step_count": step_count
        }

    def _tools_node(self, state: DestinationAgentState) -> Dict[str, Any]:
        """Tools node: Executes requested tool calls and returns observations to the agent."""
        last_message = state["messages"][-1]
        tool_messages = []
        tool_results = list(state.get("tool_results", []))
        errors = list(state.get("errors", []))

        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            for tool_call in last_message.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                tool_id = tool_call["id"]

                if tool_name in self.tools_by_name:
                    try:
                        observation = self.tools_by_name[tool_name].invoke(tool_args)
                    except Exception as exc:
                        observation = f"TOOL_ERROR: Failed to execute {tool_name}: {str(exc)}"
                        errors.append(observation)
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
                tool_results.append(f"[{tool_name}] args={tool_args} -> output_preview={str(observation)[:150]}...")

        return {
            "messages": tool_messages,
            "tool_results": tool_results,
            "errors": errors
        }

    def _validation_node(self, state: DestinationAgentState) -> Dict[str, Any]:
        """Validation node: Validates and parses agent output into Pydantic schema."""
        last_message = state["messages"][-1]
        content = last_message.content if hasattr(last_message, "content") else str(last_message)
        destination_name = state.get("current_request", {}).get("destination", "Unknown")

        parsed_result = None
        # Handle string content or list of dicts (from Gemini tool output formats)
        raw_text = ""
        if isinstance(content, str):
            raw_text = content
        elif isinstance(content, list):
            # Extract text elements
            texts = [c.get("text", "") for c in content if isinstance(c, dict) and "text" in c]
            raw_text = "\n".join(texts)

        # Attempt JSON parse
        clean_json_str = raw_text.strip()
        if "```json" in clean_json_str:
            clean_json_str = clean_json_str.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json_str:
            clean_json_str = clean_json_str.split("```")[1].split("```")[0].strip()

        try:
            data = json.loads(clean_json_str)
            validated = DestinationResearchResult(**data)
            parsed_result = validated.model_dump()
        except (json.JSONDecodeError, ValidationError) as err:
            # Controlled fallback construction (Lecture 07: Error recovery)
            parsed_result = DestinationResearchResult(
                destination=destination_name,
                attractions=[],
                information_limitations=(
                    "Output parsing notice: Raw response could not be fully parsed into schema. "
                    f"Raw summary: {raw_text[:300]}"
                ),
                unsupported_requests_note=f"Output validation note: {str(err)}"
            ).model_dump()

        return {"final_result": parsed_result}

    def _route_tools(self, state: DestinationAgentState) -> str:
        """Conditional routing: Determines whether to execute tools or complete workflow."""
        last_message = state["messages"][-1]
        step_count = state.get("execution_step_count", 0)

        # If bounded execution limit reached, route to validation
        if step_count >= MAX_STEPS:
            return "validation_node"

        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools_node"

        return "validation_node"

    def _build_graph(self):
        """Construct the LangGraph StateGraph workflow."""
        graph = StateGraph(DestinationAgentState)

        # Add Nodes
        graph.add_node("agent_node", self._agent_node)
        graph.add_node("tools_node", self._tools_node)
        graph.add_node("validation_node", self._validation_node)

        # Add Edges
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
        Execute the Destination Research Agent on a given request.
        Supports ResearchRequest Pydantic object, dict, or string query.
        """
        # Step 1: Input Validation
        if not request_input:
            return {
                "destination": "Unknown",
                "attractions": [],
                "information_limitations": "ERROR: Input request is empty. Please provide a valid research request.",
                "unsupported_requests_note": "Invalid Input Validation Error"
            }

        if isinstance(request_input, str):
            if not request_input.strip():
                return {
                    "destination": "Unknown",
                    "attractions": [],
                    "information_limitations": "ERROR: Input request is empty string.",
                    "unsupported_requests_note": "Invalid Input Validation Error"
                }
            request_data = {"destination": request_input.strip(), "requested_information": request_input.strip()}
        elif isinstance(request_input, ResearchRequest):
            request_data = request_input.model_dump()
        elif isinstance(request_input, dict):
            try:
                validated_req = ResearchRequest(**request_input)
                request_data = validated_req.model_dump()
            except ValidationError as ve:
                return {
                    "destination": request_input.get("destination", "Unknown"),
                    "attractions": [],
                    "information_limitations": f"ERROR: Input validation failed: {str(ve)}",
                    "unsupported_requests_note": "Input Validation Error"
                }
        else:
            return {
                "destination": "Unknown",
                "attractions": [],
                "information_limitations": "ERROR: Unsupported request type provided.",
                "unsupported_requests_note": "Type Error"
            }

        # Step 2: Format Human Prompt for Agent
        dest = request_data.get("destination", "")
        interests = request_data.get("interests")
        req_info = request_data.get("requested_information")

        user_content = f"Please research destination: {dest}."
        if interests:
            user_content += f" The tourist has interests in: {', '.join(interests)}."
        if req_info:
            user_content += f" Specific inquiry: {req_info}."

        initial_state: DestinationAgentState = {
            "messages": [
                SystemMessage(content=SYSTEM_PROMPT),
                HumanMessage(content=user_content)
            ],
            "current_request": request_data,
            "tool_results": [],
            "errors": [],
            "execution_step_count": 0,
            "final_result": None
        }

        # Step 3: Run LangGraph Workflow
        result_state = self.app.invoke(initial_state)

        return {
            "result": result_state.get("final_result"),
            "tool_results": result_state.get("tool_results", []),
            "errors": result_state.get("errors", []),
            "step_count": result_state.get("execution_step_count", 0)
        }
