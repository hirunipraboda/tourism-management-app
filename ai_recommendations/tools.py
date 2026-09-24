"""
tools.py
Agent Tools for Sri Lankan Tourism Recommendation.
Defines Python tool functions, Pydantic argument validation schemas,
standardized OpenAI / Anthropic JSON tool definitions, and a safe dispatcher.
"""

from typing import Any, Dict, List, Optional
import pandas as pd
from pydantic import BaseModel, Field, field_validator

from scoring import score_attractions, compute_attraction_aggregates
from ml_recommender import ContentRecommender


# =====================================================================
# 1. Pydantic Validation Schemas for Tool Arguments
# =====================================================================

class SearchAttractionsArgs(BaseModel):
    interests: Optional[List[str]] = Field(
        default=None,
        description="List of user interests: Culture, History, Nature, Adventure, Food, Wildlife, Beaches"
    )
    max_budget: Optional[float] = Field(
        default=None,
        ge=0,
        description="Maximum daily budget per person in USD (e.g. 50.0)"
    )
    max_distance_km: Optional[float] = Field(
        default=None,
        ge=0,
        description="Maximum distance from user base location in km (default 250)"
    )
    min_rating: Optional[float] = Field(
        default=None,
        ge=0,
        le=5,
        description="Minimum average rating between 1.0 and 5.0"
    )
    activity_type: Optional[str] = Field(
        default="All",
        description="Type of activity: 'Sightseeing/Attractions', 'Guided Tours', or 'All'"
    )
    user_lat: Optional[float] = Field(
        default=6.9271,
        description="Latitude of user's starting point (default: Colombo 6.9271)"
    )
    user_lng: Optional[float] = Field(
        default=79.8612,
        description="Longitude of user's starting point (default: Colombo 79.8612)"
    )
    limit: Optional[int] = Field(
        default=6,
        ge=1,
        le=12,
        description="Number of recommendations to retrieve"
    )


class GetPopularAttractionsArgs(BaseModel):
    limit: Optional[int] = Field(
        default=6,
        ge=1,
        le=12,
        description="Maximum number of top-rated popular attractions to return"
    )


class GetReviewInsightsArgs(BaseModel):
    attraction_id: Optional[int] = Field(
        default=None,
        description="Optional ID of a specific attraction to get review quotes and summary for. If omitted, returns global insights."
    )


class GetSimilarAttractionsArgs(BaseModel):
    attraction_id: int = Field(
        ...,
        description="The ID of the attraction to find content-similar destinations for."
    )
    limit: Optional[int] = Field(
        default=4,
        ge=1,
        le=8,
        description="Number of similar places to retrieve"
    )


class GetUserReviewHistoryArgs(BaseModel):
    user_id: int = Field(
        ...,
        description="The user ID whose past review history should be analyzed for preferences."
    )


# =====================================================================
# 2. Tool Execution Engine Class
# =====================================================================

class TourismToolRegistry:
    def __init__(self, attractions_df: pd.DataFrame, reviews_df: pd.DataFrame):
        self.attractions_df = attractions_df.copy()
        self.reviews_df = reviews_df.copy()
        self.ml_recommender = ContentRecommender(self.attractions_df, self.reviews_df)

    def search_attractions(
        self,
        interests: Optional[List[str]] = None,
        max_budget: Optional[float] = None,
        max_distance_km: Optional[float] = None,
        min_rating: Optional[float] = None,
        activity_type: Optional[str] = "All",
        user_lat: float = 6.9271,
        user_lng: float = 79.8612,
        user_id: Optional[int] = None,
        limit: int = 6
    ) -> List[Dict]:
        """
        Searches and ranks attractions matching user criteria using the multi-factor scoring engine.
        """
        return score_attractions(
            attractions_df=self.attractions_df,
            reviews_df=self.reviews_df,
            interests=interests,
            max_budget=max_budget,
            max_distance_km=max_distance_km,
            min_rating=min_rating,
            activity_type=activity_type,
            user_lat=user_lat,
            user_lng=user_lng,
            user_id=user_id,
            limit=limit
        )

    def get_popular_attractions(self, limit: int = 6) -> List[Dict]:
        """
        Returns top-tier attractions ranked by Bayesian rating and review count across Sri Lanka.
        """
        return self.ml_recommender.get_cold_start_popular(limit=limit)

    def get_review_insights(self, attraction_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Retrieves review sentiment, average ratings, and recent traveler feedback for an attraction or overall.
        """
        if attraction_id is not None:
            reviews = self.reviews_df[self.reviews_df["attractionId"] == attraction_id]
            attr_row = self.attractions_df[self.attractions_df["attractionId"] == attraction_id]
            name = attr_row["name"].iloc[0] if not attr_row.empty else f"Attraction #{attraction_id}"
            
            if reviews.empty:
                return {
                    "attractionId": attraction_id,
                    "name": name,
                    "message": "No reviews recorded yet for this attraction.",
                    "avgRating": 4.0,
                    "reviewCount": 0
                }

            top_reviews = reviews.sort_values(by="rating", ascending=False).head(3)
            recent_reviews = reviews.sort_values(by="date", ascending=False).head(2)

            return {
                "attractionId": attraction_id,
                "name": name,
                "reviewCount": int(len(reviews)),
                "avgRating": round(float(reviews["rating"].mean()), 2),
                "ratingBreakdown": reviews["rating"].value_counts().to_dict(),
                "samplePositiveReviews": top_reviews["text"].tolist(),
                "recentReviews": recent_reviews["text"].tolist()
            }
        else:
            # Global insights
            total_revs = len(self.reviews_df)
            top_category = self.attractions_df["category"].value_counts().to_dict()
            return {
                "totalReviews": total_revs,
                "totalAttractions": len(self.attractions_df),
                "categoryDistribution": top_category,
                "topRatedAttractions": self.get_popular_attractions(limit=3)
            }

    def get_similar_attractions(self, attraction_id: int, limit: int = 4) -> List[Dict]:
        """
        Retrieves places with similar vibe, category, and review experiences using ML TF-IDF cosine similarity.
        """
        return self.ml_recommender.get_similar_attractions(attraction_id=attraction_id, limit=limit)

    def get_user_review_history(self, user_id: int) -> Dict[str, Any]:
        """
        Fetches the authenticated user's historical ratings and visited attractions.
        """
        user_revs = self.reviews_df[self.reviews_df["userId"] == user_id]
        if user_revs.empty:
            return {
                "userId": user_id,
                "hasHistory": False,
                "message": "New traveler with no previous review history.",
                "favoriteCategories": []
            }

        merged = user_revs.merge(
            self.attractions_df[["attractionId", "name", "category"]],
            on="attractionId",
            how="left"
        )
        fav_categories = (
            merged[merged["rating"] >= 4]["category"]
            .value_counts()
            .index.tolist()
        )

        return {
            "userId": user_id,
            "hasHistory": True,
            "reviewCount": len(user_revs),
            "favoriteCategories": fav_categories,
            "reviews": merged[["name", "category", "rating", "text"]].to_dict(orient="records")
        }


# =====================================================================
# 3. Standard JSON Tool Definitions for LLMs
# =====================================================================

LLM_TOOLS_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "search_attractions",
            "description": "Searches and scores Sri Lankan attractions based on user interests (Culture, History, Nature, Adventure, Food, Wildlife, Beaches), budget, distance, and activity type.",
            "parameters": {
                "type": "object",
                "properties": {
                    "interests": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Categories of interest (e.g. ['Beaches', 'Adventure'])."
                    },
                    "max_budget": {
                        "type": "number",
                        "description": "Maximum daily budget per person in USD (e.g. 50)."
                    },
                    "max_distance_km": {
                        "type": "number",
                        "description": "Maximum travel distance in kilometers from starting city."
                    },
                    "min_rating": {
                        "type": "number",
                        "description": "Minimum average review rating from 1.0 to 5.0."
                    },
                    "activity_type": {
                        "type": "string",
                        "enum": ["Sightseeing/Attractions", "Guided Tours", "All"],
                        "description": "Filter by activity type."
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Max number of attractions to return (default 6)."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_popular_attractions",
            "description": "Gets top-rated iconic attractions in Sri Lanka ranked by Bayesian popularity and review count.",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Number of popular attractions to return (default 6)."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_review_insights",
            "description": "Gets review quotes, traveler sentiment, and rating breakdowns for a specific attraction or destination.",
            "parameters": {
                "type": "object",
                "properties": {
                    "attraction_id": {
                        "type": "integer",
                        "description": "The attraction ID to retrieve detailed traveler reviews and insights for."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_similar_attractions",
            "description": "Finds attractions that are content-similar and share a similar vibe to a given attraction ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "attraction_id": {
                        "type": "integer",
                        "description": "The attraction ID to find similar places for."
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Number of similar attractions to return."
                    }
                },
                "required": ["attraction_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_review_history",
            "description": "Retrieves the user's past review history and revealed travel preferences.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "integer",
                        "description": "The user ID to fetch history for."
                    }
                },
                "required": ["user_id"]
            }
        }
    }
]


# =====================================================================
# 4. Tool Dispatcher with Pydantic Validation
# =====================================================================

def dispatch_tool(
    tool_name: str,
    arguments: Dict[str, Any],
    registry: TourismToolRegistry,
    user_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Safely validates tool arguments using Pydantic and executes the appropriate tool.
    Returns structured JSON-serializable result or descriptive error message.
    """
    try:
        if tool_name == "search_attractions":
            parsed = SearchAttractionsArgs(**arguments)
            results = registry.search_attractions(
                interests=parsed.interests,
                max_budget=parsed.max_budget,
                max_distance_km=parsed.max_distance_km,
                min_rating=parsed.min_rating,
                activity_type=parsed.activity_type,
                user_lat=parsed.user_lat or 6.9271,
                user_lng=parsed.user_lng or 79.8612,
                user_id=user_id,
                limit=parsed.limit or 6
            )
            return {"status": "success", "count": len(results), "attractions": results}

        elif tool_name == "get_popular_attractions":
            parsed = GetPopularAttractionsArgs(**arguments)
            results = registry.get_popular_attractions(limit=parsed.limit or 6)
            return {"status": "success", "count": len(results), "popular": results}

        elif tool_name == "get_review_insights":
            parsed = GetReviewInsightsArgs(**arguments)
            results = registry.get_review_insights(attraction_id=parsed.attraction_id)
            return {"status": "success", "insights": results}

        elif tool_name == "get_similar_attractions":
            parsed = GetSimilarAttractionsArgs(**arguments)
            results = registry.get_similar_attractions(
                attraction_id=parsed.attraction_id,
                limit=parsed.limit or 4
            )
            return {"status": "success", "count": len(results), "similar": results}

        elif tool_name == "get_user_review_history":
            parsed = GetUserReviewHistoryArgs(**arguments)
            results = registry.get_user_review_history(user_id=parsed.user_id)
            return {"status": "success", "history": results}

        else:
            return {"status": "error", "error": f"Unknown tool: '{tool_name}'"}

    except Exception as ex:
        return {
            "status": "error",
            "error": f"Tool execution failed for '{tool_name}': {str(ex)}"
        }
