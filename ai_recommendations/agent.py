"""
agent.py
Autonomous Tool-Calling Travel Recommendation Agent for Sri Lanka Tourism.
Supports OpenAI, Anthropic Claude, and intelligent offline Fallback/Mock LLM.
Implements multi-turn conversation memory, anti-hallucination grounding,
Pydantic response validation, and automatic rule-based fallback.
"""

import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError

from scoring import score_attractions
from tools import (
    TourismToolRegistry,
    LLM_TOOLS_DEFINITIONS,
    dispatch_tool
)

load_dotenv()


# =====================================================================
# 1. Output Validation Schemas
# =====================================================================

class AgentRecommendationItem(BaseModel):
    attractionId: int = Field(..., description="Unique ID of the real attraction from dataset")
    name: str = Field(..., description="Exact attraction name")
    reason: str = Field(..., description="Concise explanation tailored to user requirements")
    matchScore: float = Field(..., ge=0, le=100, description="Match score between 0 and 100")
    category: Optional[str] = Field(default="Attraction", description="Category tag")
    imageUrl: Optional[str] = Field(default="", description="Image link")
    avgRating: Optional[float] = Field(default=4.5, description="Average review score")
    reviewCount: Optional[int] = Field(default=0, description="Review count")
    estimatedCost: Optional[float] = Field(default=0.0, description="Cost in USD")
    location: Optional[str] = Field(default="", description="Location in Sri Lanka")


class AgentResponse(BaseModel):
    summary: str = Field(..., description="Natural language summary of findings and rationale")
    recommendations: List[AgentRecommendationItem] = Field(
        default_factory=list,
        max_length=6,
        description="Up to 6 recommended real attractions"
    )
    followUpQuestion: Optional[str] = Field(
        default=None,
        description="A clarifying follow-up question if key details are missing, else null"
    )
    conversationId: Optional[str] = Field(default="", description="Conversation session ID")
    usedFallback: Optional[bool] = Field(default=False, description="True if rule-based fallback was used")


# =====================================================================
# 2. System Prompt with Strict Anti-Hallucination Grounding Rules
# =====================================================================

SYSTEM_PROMPT = """You are an expert AI Travel Assistant specialized in Sri Lanka Tourism.
Your objective is to provide personalized, accurate, and inspiring attraction recommendations.

CRITICAL GROUNDING & SAFETY RULES:
1. ONLY recommend attractions that were returned by your tool calls (e.g. search_attractions, get_popular_attractions, get_similar_attractions).
2. NEVER invent fake attractions, fictitious prices, or non-existent IDs. Every attractionId MUST be a real ID from tool outputs.
3. Maximum 6 recommendations.
4. If the user's request is underspecified (missing budget, duration, interests, or travel group type), provide suitable general recommendations and ask ONE friendly, relevant follow-up question in the `followUpQuestion` field.
5. If the user's request is impossible (e.g. budget $2/day or zero matches), explain gracefully in `summary` and provide the closest affordable alternatives.
6. If the user is off-topic (e.g. asking about coding or politics), politely decline and steer them back to exploring Sri Lanka.

FINAL OUTPUT FORMAT:
You MUST respond with a valid, clean JSON object matching this schema:
{
  "summary": "Concise conversational overview of recommendations...",
  "recommendations": [
    {
      "attractionId": 1,
      "name": "Sigiriya Ancient Rock Fortress",
      "reason": "Perfect fit for history buffs; matches your $40 budget.",
      "matchScore": 96.5,
      "category": "History",
      "estimatedCost": 36.0,
      "location": "Matale District",
      "imageUrl": "..."
    }
  ],
  "followUpQuestion": "Would you prefer active hiking or relaxed cultural sites?"
}
Do NOT wrap your JSON in markdown backticks in the final answer if possible, or use standard ```json ... ``` blocks.
"""


# =====================================================================
# 3. Multi-Turn Conversation Memory Manager
# =====================================================================

class ConversationMemory:
    def __init__(self, max_history_turns: int = 5):
        self.max_history_turns = max_history_turns
        self._sessions: Dict[str, List[Dict[str, Any]]] = {}

    def get_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        return self._sessions.get(conversation_id, [])

    def add_turn(self, conversation_id: str, role: str, content: str):
        if conversation_id not in self._sessions:
            self._sessions[conversation_id] = []
        self._sessions[conversation_id].append({"role": role, "content": content})
        # Keep last (max_history_turns * 2) messages
        if len(self._sessions[conversation_id]) > self.max_history_turns * 2:
            self._sessions[conversation_id] = self._sessions[conversation_id][-(self.max_history_turns * 2):]

    def clear(self, conversation_id: str):
        if conversation_id in self._sessions:
            del self._sessions[conversation_id]


# =====================================================================
# 4. Travel Agent Class
# =====================================================================

class TourismAgent:
    def __init__(
        self,
        registry: TourismToolRegistry,
        provider: str = "auto",
        openai_api_key: Optional[str] = None,
        anthropic_api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        max_iterations: int = 5
    ):
        self.registry = registry
        self.max_iterations = max_iterations
        self.memory = ConversationMemory(max_history_turns=4)

        # Detect provider
        self.openai_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.anthropic_key = anthropic_api_key or os.getenv("ANTHROPIC_API_KEY")
        
        if provider == "auto":
            if self.openai_key:
                self.provider = "openai"
                self.model = model_name or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            elif self.anthropic_key:
                self.provider = "anthropic"
                self.model = model_name or os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
            else:
                self.provider = "mock"
                self.model = "mock-agent-engine"
        else:
            self.provider = provider
            self.model = model_name or ("gpt-4o-mini" if provider == "openai" else "claude-3-5-sonnet-20241022")

        # Set of valid attraction IDs in dataset for strict validation
        self.valid_attraction_ids = set(self.registry.attractions_df["attractionId"].astype(int).tolist())
        self.attractions_lookup = {
            int(row["attractionId"]): row.to_dict()
            for _, row in self.registry.attractions_df.iterrows()
        }

    def execute_agent_loop(
        self,
        user_message: str,
        filters: Optional[Dict[str, Any]] = None,
        user_id: Optional[int] = None,
        conversation_id: Optional[str] = None
    ) -> AgentResponse:
        """
        Runs the full agent loop: calls tools, observes outputs, reasons,
        and constructs a grounded, validated response.
        """
        conv_id = conversation_id or "default-session"

        # Combine user message with explicit UI filter context if provided
        enriched_user_prompt = user_message
        if filters:
            filter_summary = ", ".join(f"{k}={v}" for k, v in filters.items() if v is not None and v != "")
            if filter_summary:
                enriched_user_prompt += f"\n[User UI Filter Context: {filter_summary}]"

        # Check for off-topic query quickly
        off_topic_keywords = ["write code", "python script", "solve math", "stock market", "president of", "recipe for cake"]
        if any(k in user_message.lower() for k in off_topic_keywords) and not any(t in user_message.lower() for t in ["sri lanka", "travel", "tour", "beach", "hotel", "food"]):
            return AgentResponse(
                summary="I am your dedicated Sri Lanka Travel Assistant! I can help you discover beautiful beaches, heritage fortresses, wildlife safaris, and culinary tours across Sri Lanka. How can I assist with your holiday plans?",
                recommendations=[],
                followUpQuestion="Would you like recommendations for beaches, wildlife, or cultural sites?",
                conversationId=conv_id,
                usedFallback=False
            )

        try:
            if self.provider == "openai" and self.openai_key:
                response = self._run_openai_loop(enriched_user_prompt, user_id, conv_id)
            elif self.provider == "anthropic" and self.anthropic_key:
                response = self._run_anthropic_loop(enriched_user_prompt, user_id, conv_id)
            else:
                # Mock / Offline Intelligent Agent
                response = self._run_mock_loop(enriched_user_prompt, user_id, conv_id, filters)

            # Post-check: filter hallucinations & enrich metadata
            sanitized_recs = []
            for item in response.recommendations:
                if item.attractionId in self.valid_attraction_ids:
                    # Enrich from dataset
                    meta = self.attractions_lookup[item.attractionId]
                    item.category = item.category or meta.get("category", "Attraction")
                    item.imageUrl = item.imageUrl or meta.get("imageUrl", "")
                    item.location = item.location or meta.get("location", "")
                    item.estimatedCost = item.estimatedCost or float(meta.get("estimatedCostPerDay", 0))
                    sanitized_recs.append(item)

            response.recommendations = sanitized_recs[:6]
            response.conversationId = conv_id

            # Save in conversation memory
            self.memory.add_turn(conv_id, "user", user_message)
            self.memory.add_turn(conv_id, "assistant", response.summary)

            return response

        except Exception as ex:
            # Fallback to rule-based engine on any error
            return self._build_rule_based_fallback(
                user_message=user_message,
                filters=filters,
                user_id=user_id,
                conversation_id=conv_id,
                error_reason=str(ex)
            )

    # -----------------------------------------------------------------
    # OpenAI Tool Calling Implementation
    # -----------------------------------------------------------------
    def _run_openai_loop(self, user_prompt: str, user_id: Optional[int], conv_id: str) -> AgentResponse:
        from openai import OpenAI
        client = OpenAI(api_key=self.openai_key)

        history = self.memory.get_history(conv_id)
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for turn in history:
            messages.append({"role": turn["role"], "content": turn["content"]})
        messages.append({"role": "user", "content": user_prompt})

        collected_tool_results = []
        iteration = 0

        while iteration < self.max_iterations:
            iteration += 1
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=LLM_TOOLS_DEFINITIONS,
                tool_choice="auto",
                temperature=0.3
            )

            msg = response.choices[0].message
            messages.append(msg)

            if not msg.tool_calls:
                # Final response reached
                content = msg.content or "{}"
                return self._parse_json_response(content, conv_id)

            # Process tool calls
            for tool_call in msg.tool_calls:
                fn_name = tool_call.function.name
                try:
                    args = json.loads(tool_call.function.arguments)
                except Exception:
                    args = {}

                tool_result = dispatch_tool(
                    tool_name=fn_name,
                    arguments=args,
                    registry=self.registry,
                    user_id=user_id
                )
                collected_tool_results.append((fn_name, tool_result))

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(tool_result)
                })

        # Fallback if iterations exceeded
        return self._parse_json_response(messages[-1].get("content", "{}"), conv_id)

    # -----------------------------------------------------------------
    # Anthropic Tool Calling Implementation
    # -----------------------------------------------------------------
    def _run_anthropic_loop(self, user_prompt: str, user_id: Optional[int], conv_id: str) -> AgentResponse:
        import anthropic
        client = anthropic.Anthropic(api_key=self.anthropic_key)

        # Convert tools to Anthropic format
        anthropic_tools = []
        for t in LLM_TOOLS_DEFINITIONS:
            fn = t["function"]
            anthropic_tools.append({
                "name": fn["name"],
                "description": fn["description"],
                "input_schema": fn["parameters"]
            })

        history = self.memory.get_history(conv_id)
        messages = []
        for turn in history:
            messages.append({"role": turn["role"], "content": turn["content"]})
        messages.append({"role": "user", "content": user_prompt})

        iteration = 0
        while iteration < self.max_iterations:
            iteration += 1
            response = client.messages.create(
                model=self.model,
                system=SYSTEM_PROMPT,
                messages=messages,
                tools=anthropic_tools,
                max_tokens=2048,
                temperature=0.3
            )

            # Check for tool use blocks
            tool_use_blocks = [b for b in response.content if b.type == "tool_use"]
            text_blocks = [b for b in response.content if b.type == "text"]

            if not tool_use_blocks:
                content = "".join([b.text for b in text_blocks])
                return self._parse_json_response(content, conv_id)

            # Append assistant message with all content blocks
            messages.append({"role": "assistant", "content": response.content})

            # Execute tools and return tool_result content blocks
            tool_results_content = []
            for tu in tool_use_blocks:
                tool_result = dispatch_tool(
                    tool_name=tu.name,
                    arguments=tu.input,
                    registry=self.registry,
                    user_id=user_id
                )
                tool_results_content.append({
                    "type": "tool_result",
                    "tool_use_id": tu.id,
                    "content": json.dumps(tool_result)
                })

            messages.append({"role": "user", "content": tool_results_content})

        return self._build_rule_based_fallback(user_prompt, None, user_id, conv_id, "Max tool iterations reached")

    # -----------------------------------------------------------------
    # Offline Mock / Intelligent Deterministic Agent
    # -----------------------------------------------------------------
    def _run_mock_loop(
        self,
        user_prompt: str,
        user_id: Optional[int],
        conv_id: str,
        filters: Optional[Dict[str, Any]]
    ) -> AgentResponse:
        """
        Deterministic, offline tool-using simulation that parses intent,
        calls tools via the registry, and constructs a high-quality JSON response.
        """
        p_lower = user_prompt.lower()

        # Extract interests
        detected_interests = []
        for cat in ["Culture", "History", "Nature", "Adventure", "Food", "Wildlife", "Beaches"]:
            if cat.lower() in p_lower:
                detected_interests.append(cat)
        if "surf" in p_lower or "ocean" in p_lower or "snorkeling" in p_lower or "whale" in p_lower:
            if "Beaches" not in detected_interests:
                detected_interests.append("Beaches")
        if "safari" in p_lower or "elephant" in p_lower or "leopard" in p_lower or "birds" in p_lower:
            if "Wildlife" not in detected_interests:
                detected_interests.append("Wildlife")
        if "hike" in p_lower or "trek" in p_lower or "rafting" in p_lower or "climb" in p_lower:
            if "Adventure" not in detected_interests:
                detected_interests.append("Adventure")
        if "curry" in p_lower or "tea" in p_lower or "cooking" in p_lower or "spice" in p_lower:
            if "Food" not in detected_interests:
                detected_interests.append("Food")
        if "temple" in p_lower or "ancient" in p_lower or "ruin" in p_lower or "fort" in p_lower:
            if "History" not in detected_interests:
                detected_interests.append("History")

        # Extract budget
        budget_match = re.search(r'(?:under|budget|max|below|\$)\s*(\d+)', p_lower)
        max_budget = float(budget_match.group(1)) if budget_match else None

        # Execute Search Tool
        tool_args = {
            "interests": detected_interests if detected_interests else None,
            "max_budget": max_budget,
            "limit": 5
        }
        tool_output = dispatch_tool("search_attractions", tool_args, self.registry, user_id=user_id)
        attractions = tool_output.get("attractions", [])

        if not attractions:
            # Fallback to popular
            pop_output = dispatch_tool("get_popular_attractions", {"limit": 4}, self.registry)
            attractions = pop_output.get("popular", [])

        recs = []
        for a in attractions[:5]:
            reasons = a.get("matchReasons", [])
            reason_text = reasons[0] if reasons else f"Great {a.get('category')} experience in Sri Lanka."
            recs.append(AgentRecommendationItem(
                attractionId=int(a["attractionId"]),
                name=str(a["name"]),
                reason=reason_text,
                matchScore=float(a.get("matchScore", 88.0)),
                category=str(a.get("category", "Attraction")),
                imageUrl=str(a.get("imageUrl", "")),
                avgRating=float(a.get("avgRating", 4.5)),
                reviewCount=int(a.get("reviewCount", 10)),
                estimatedCost=float(a.get("estimatedCost", 30.0)),
                location=str(a.get("location", ""))
            ))

        summary_parts = []
        if detected_interests:
            summary_parts.append(f"Based on your interest in {', '.join(detected_interests)}")
        if max_budget:
            summary_parts.append(f"keeping your daily budget under ${max_budget:.0f}")
        summary_intro = " ".join(summary_parts) if summary_parts else "Based on top traveler ratings in Sri Lanka"
        
        summary = f"{summary_intro}, I have curated {len(recs)} top destinations for your journey. These locations offer exceptional experiences, verified safety, and great value."

        follow_up = None
        if not max_budget and not detected_interests:
            follow_up = "What is your approximate daily budget per person and what kinds of activities do you enjoy most (e.g. wildlife, beaches, history)?"
        elif not max_budget:
            follow_up = "Do you have a specific daily budget or preferred travel pace (relaxed vs fast-paced)?"

        return AgentResponse(
            summary=summary,
            recommendations=recs,
            followUpQuestion=follow_up,
            conversationId=conv_id,
            usedFallback=False
        )

    # -----------------------------------------------------------------
    # JSON Parsing & Sanitation
    # -----------------------------------------------------------------
    def _parse_json_response(self, text_content: str, conv_id: str) -> AgentResponse:
        """Parses and validates LLM JSON response string with robust fallback."""
        clean_text = text_content.strip()
        # Remove markdown codeblocks if present
        if "```json" in clean_text:
            clean_text = clean_text.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_text:
            clean_text = clean_text.split("```")[1].split("```")[0].strip()

        try:
            data = json.loads(clean_text)
            data["conversationId"] = conv_id
            return AgentResponse.model_validate(data)
        except (json.JSONDecodeError, ValidationError) as err:
            # Try to extract JSON object with regex
            json_match = re.search(r'(\{[\s\S]*\})', clean_text)
            if json_match:
                try:
                    data = json.loads(json_match.group(1))
                    data["conversationId"] = conv_id
                    return AgentResponse.model_validate(data)
                except Exception:
                    pass
            # Trigger graceful fallback
            return self._build_rule_based_fallback(
                user_message="Travel inquiry",
                filters=None,
                user_id=None,
                conversation_id=conv_id,
                error_reason=f"Failed to parse LLM JSON: {str(err)}"
            )

    # -----------------------------------------------------------------
    # Rule-Based Fallback
    # -----------------------------------------------------------------
    def _build_rule_based_fallback(
        self,
        user_message: str,
        filters: Optional[Dict[str, Any]],
        user_id: Optional[int],
        conversation_id: str,
        error_reason: str = ""
    ) -> AgentResponse:
        """Constructs an instant high-quality response using rule-based scoring engine."""
        scored = score_attractions(
            attractions_df=self.registry.attractions_df,
            reviews_df=self.registry.reviews_df,
            user_id=user_id,
            limit=5
        )

        recs = []
        for a in scored:
            recs.append(AgentRecommendationItem(
                attractionId=int(a["attractionId"]),
                name=str(a["name"]),
                reason=a["matchReasons"][0] if a["matchReasons"] else "Top-rated Sri Lankan destination.",
                matchScore=float(a["matchScore"]),
                category=str(a["category"]),
                imageUrl=str(a.get("imageUrl", "")),
                avgRating=float(a["avgRating"]),
                reviewCount=int(a["reviewCount"]),
                estimatedCost=float(a["estimatedCost"]),
                location=str(a.get("location", ""))
            ))

        return AgentResponse(
            summary="Here are Sri Lanka's top-recommended destinations calculated by our personalized recommendation engine.",
            recommendations=recs,
            followUpQuestion="Would you like to narrow down these results by budget, preferred region, or activity type?",
            conversationId=conversation_id,
            usedFallback=True
        )
