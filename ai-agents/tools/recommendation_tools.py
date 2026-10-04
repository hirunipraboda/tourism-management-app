"""
==============================================================================
TourLink Smart Tourism Platform - Recommendation & Feedback Analysis Agent
Tool Module: Recommendation Tools (recommendation_tools.py)
==============================================================================
Lecture Alignment:
- Lecture 05: Structured tool schemas, Deterministic business logic
- Lecture 06: Grounded recommendation generation, Evidence-based reasoning
- Lecture 07: Transparent scoring, Guardrails against arbitrary ranking

Responsibility:
- Compare user preferences against attraction profiles and review evidence
- Calculate transparent, formula-based suitability scores (NO arbitrary guessing)
- Generate evidence-based explanations citing specific reviews and themes
- Surface data limitations and unverified attributes honestly
==============================================================================
"""

import os
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class UserPreferences(BaseModel):
    """Structured Pydantic schema for traveler preferences."""
    interests: List[str] = Field(default_factory=list, description="Traveler interests, e.g. ['nature', 'hiking', 'culture', 'history']")
    budget: Optional[float] = Field(default=None, description="Available budget in LKR, e.g. 10000.0")
    preferred_activities: List[str] = Field(default_factory=list, description="Specific activities preferred, e.g. ['walking', 'photography']")
    travel_style: Optional[str] = Field(default=None, description="Style of travel, e.g. 'relaxed', 'adventurous', 'backpacker', 'family'")
    preferred_environment: Optional[str] = Field(default=None, description="Preferred vibe or environment, e.g. 'quiet', 'peaceful', 'lively'")
    preferred_destination: Optional[str] = Field(default=None, description="Target city or area, e.g. 'Ella', 'Kandy', 'Galle'")
    avoid: List[str] = Field(default_factory=list, description="Elements to avoid, e.g. ['crowds', 'steep trails', 'loud noise']")


class Recommendation(BaseModel):
    """Structured recommendation item with evidence grounding."""
    attraction: str = Field(description="Name of recommended attraction")
    destination: str = Field(description="Destination city or region")
    reason: str = Field(description="Transparent, evidence-based rationale explaining the match")
    matching_preferences: List[str] = Field(default_factory=list, description="List of user preferences matched")
    supporting_feedback: List[str] = Field(default_factory=list, description="Specific quotes or references from prototype review dataset")
    sentiment_summary: Optional[str] = Field(default=None, description="Summary of tourist sentiment from reviews")
    limitations: List[str] = Field(default_factory=list, description="Drawbacks, crowd warnings, or unverified details")
    suitability_score: Optional[float] = Field(default=None, description="Transparently calculated match percentage (0-100%) based on explicit formula")
    score_breakdown: Optional[str] = Field(default=None, description="Formula breakdown explaining how the score was calculated")


class RecommendationResult(BaseModel):
    """Final structured output schema returned by the Recommendation Agent."""
    recommendations: List[Recommendation] = Field(default_factory=list, description="List of evidence-backed recommendations")
    analysis_summary: str = Field(description="High-level synthesis of traveler feedback and preference alignment")
    information_limitations: List[str] = Field(default_factory=list, description="Clear statements of missing data, unverified costs, or knowledge bounds")
    unsupported_requests_note: Optional[str] = Field(default=None, description="Refusal notice if user requested itineraries, routes, or live bookings")


def calculate_suitability_score(
    preferences: UserPreferences,
    attraction_name: str,
    destination: str,
    category: str,
    reviews: List[Dict[str, Any]],
    estimated_cost_lkr: Optional[float] = None
) -> Dict[str, Any]:
    """
    Transparent, reproducible scoring formula.
    
    Formula components:
    1. Interest Match (Weight: 35%):
       Ratio of user interests found in attraction category or activities.
    2. Environment & Vibe Match (Weight: 30%):
       Checks if user preferred environment (e.g. 'quiet', 'peaceful') is confirmed
       by review positive aspects, or penalized if in negative aspects (e.g. 'crowded').
    3. Sentiment Evidence (Weight: 20%):
       Average tourist rating normalized from 1-5 scale.
    4. Budget Feasibility (Weight: 15%):
       15% if estimated cost <= user budget, 7.5% if cost is free/unverified, 0% if over budget.
    """
    score = 0.0
    breakdown_parts = []

    # 1. Interest Match (35 pts)
    matched_interests = []
    if preferences.interests:
        cat_lower = category.lower()
        for interest in preferences.interests:
            if interest.lower() in cat_lower:
                matched_interests.append(interest)
        interest_ratio = len(matched_interests) / len(preferences.interests)
        interest_pts = round(interest_ratio * 35.0, 1)
        score += interest_pts
        breakdown_parts.append(f"Interest Match: {interest_pts}/35 pts ({len(matched_interests)}/{len(preferences.interests)} matched)")
    else:
        score += 25.0
        breakdown_parts.append("Interest Match: 25/35 pts (general match, no specific interests supplied)")

    # 2. Environment Match (30 pts)
    env_pts = 20.0  # default neutral
    if preferences.preferred_environment:
        env_pref = preferences.preferred_environment.lower()
        # Check against reviews
        text_corpus = " ".join([r.get("review_text", "").lower() for r in reviews])
        if any(term in text_corpus for term in ["peaceful", "quiet", "serene", "calm"]) and any(p in env_pref for p in ["quiet", "peaceful", "relaxing"]):
            env_pts = 30.0
            breakdown_parts.append(f"Environment Match: 30/30 pts (reviews confirm '{preferences.preferred_environment}')")
        elif "crowded" in text_corpus and "quiet" in env_pref:
            env_pts = 10.0
            breakdown_parts.append("Environment Match: 10/30 pts (drawback: reviews note occasional crowds)")
        else:
            env_pts = 20.0
            breakdown_parts.append(f"Environment Match: 20/30 pts (moderate vibe match for '{preferences.preferred_environment}')")
    else:
        breakdown_parts.append("Environment Match: 20/30 pts (neutral baseline)")
    score += env_pts

    # 3. Sentiment Evidence (20 pts)
    ratings = [r.get("rating", 4) for r in reviews if r.get("rating")]
    avg_rating = sum(ratings) / len(ratings) if ratings else 4.0
    sentiment_pts = round((avg_rating / 5.0) * 20.0, 1)
    score += sentiment_pts
    breakdown_parts.append(f"Sentiment & Rating: {sentiment_pts}/20 pts (avg rating {round(avg_rating, 1)}/5)")

    # 4. Budget Feasibility (15 pts)
    if preferences.budget is not None and estimated_cost_lkr is not None:
        if estimated_cost_lkr <= preferences.budget:
            score += 15.0
            breakdown_parts.append(f"Budget Feasibility: 15/15 pts (Est. cost LKR {estimated_cost_lkr:,.0f} <= Budget LKR {preferences.budget:,.0f})")
        else:
            score += 0.0
            breakdown_parts.append(f"Budget Feasibility: 0/15 pts (Est. cost LKR {estimated_cost_lkr:,.0f} EXCEEDS Budget LKR {preferences.budget:,.0f})")
    elif preferences.budget is not None and estimated_cost_lkr is None:
        score += 8.0
        breakdown_parts.append("Budget Feasibility: 8/15 pts (Attraction appears low cost or free, but exact cost unverified in prototype DB)")
    else:
        score += 12.0
        breakdown_parts.append("Budget Feasibility: 12/15 pts (No strict budget constraint specified)")

    final_score = round(min(100.0, max(0.0, score)), 1)
    return {
        "final_score": final_score,
        "breakdown": " | ".join(breakdown_parts),
        "matched_interests": matched_interests
    }
