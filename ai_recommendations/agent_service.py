"""
agent_service.py
FastAPI Microservice for Sri Lanka Tourism AI Agent & Recommendation Engine.
Exposes REST endpoints for the ASP.NET Core backend and web frontend.
"""

import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from seed_data import load_dataset
from tools import TourismToolRegistry
from agent import TourismAgent, AgentResponse, AgentRecommendationItem


# =====================================================================
# Request & Response DTOs for FastAPI
# =====================================================================

class FilterParams(BaseModel):
    interests: Optional[List[str]] = Field(default=None, description="Categories of interest")
    maxBudget: Optional[float] = Field(default=None, description="Max daily budget in USD")
    maxDistanceKm: Optional[float] = Field(default=None, description="Max travel distance in km")
    minRating: Optional[float] = Field(default=None, description="Min rating 1-5")
    activityType: Optional[str] = Field(default="All", description="Activity type")
    userLat: Optional[float] = Field(default=6.9271, description="Base latitude")
    userLng: Optional[float] = Field(default=79.8612, description="Base longitude")


class AgentRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Natural language query from user")
    filters: Optional[FilterParams] = Field(default=None, description="Optional UI filter context")
    userId: Optional[int] = Field(default=None, description="Logged in tourist ID")
    conversationId: Optional[str] = Field(default=None, description="Conversation session ID")


class HealthResponse(BaseModel):
    status: str
    version: str
    attractionsCount: int
    reviewsCount: int
    llmProvider: str
    model: str


# =====================================================================
# Global Registry & Agent Lifespan
# =====================================================================

tool_registry: Optional[TourismToolRegistry] = None
travel_agent: Optional[TourismAgent] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load datasets and initialize tool registry & agent
    global tool_registry, travel_agent
    print("[STARTUP] Initializing Sri Lanka Tourism AI Agent Service...")
    attractions_df, reviews_df = load_dataset()
    tool_registry = TourismToolRegistry(attractions_df, reviews_df)
    travel_agent = TourismAgent(
        registry=tool_registry,
        provider=os.getenv("LLM_PROVIDER", "auto"),
        model_name=os.getenv("OPENAI_MODEL") or os.getenv("ANTHROPIC_MODEL")
    )
    print(f"[OK] Loaded {len(attractions_df)} attractions and {len(reviews_df)} reviews.")
    print(f"[INFO] Agent ready with Provider: {travel_agent.provider}, Model: {travel_agent.model}")
    yield
    print("[SHUTDOWN] Shutting down Tourism AI Agent Service.")


# =====================================================================
# FastAPI Application
# =====================================================================

app = FastAPI(
    title="Sri Lanka Tourism AI Agent API",
    description="Agentic tool-calling recommendation service with multi-factor scoring & content similarity.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """Returns service health, loaded dataset stats, and LLM configuration."""
    if not tool_registry or not travel_agent:
        raise HTTPException(status_code=503, detail="Service not fully initialized")
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        attractionsCount=len(tool_registry.attractions_df),
        reviewsCount=len(tool_registry.reviews_df),
        llmProvider=travel_agent.provider,
        model=travel_agent.model
    )


@app.post("/agent", response_model=AgentResponse, tags=["Recommendation Agent"])
def run_agent(request: AgentRequest):
    """
    Main Agentic Recommendation Endpoint.
    Accepts natural language message and optional filter context.
    Executes tool-calling loop and returns grounded recommendations with reasons.
    """
    if not travel_agent:
        raise HTTPException(status_code=503, detail="Agent is not initialized")

    filters_dict = request.filters.model_dump() if request.filters else None
    
    response = travel_agent.execute_agent_loop(
        user_message=request.message,
        filters=filters_dict,
        user_id=request.userId,
        conversation_id=request.conversationId
    )
    return response


@app.get("/popular", tags=["Recommendations"])
def get_popular(limit: int = 6):
    """Quick access to top Bayesian-ranked popular destinations."""
    if not tool_registry:
        raise HTTPException(status_code=503, detail="Service uninitialized")
    return tool_registry.get_popular_attractions(limit=limit)


@app.get("/attractions", tags=["Attractions"])
def list_attractions():
    """Lists all available Sri Lankan attractions with metadata."""
    if not tool_registry:
        raise HTTPException(status_code=503, detail="Service uninitialized")
    return tool_registry.attractions_df.to_dict(orient="records")


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("agent_service:app", host=host, port=port, reload=True)
