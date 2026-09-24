"""
scoring.py
Rule-based scoring engine for Sri Lankan Tourism recommendations.
Implements hard filters, Haversine distance, Bayesian-weighted rating,
and multi-factor 0-100 score with explanatory match reasons.
"""

import math
from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np


DEFAULT_CONFIG = {
    "weights": {
        "interest": 0.30,
        "rating": 0.25,
        "budget": 0.15,
        "distance": 0.15,
        "popularity": 0.10,
        "history": 0.05
    },
    "bayesian_m": 3.0,          # Minimum review threshold for Bayesian shrinkage
    "default_user_lat": 6.9271,  # Colombo
    "default_user_lng": 79.8612, # Colombo
    "default_max_distance_km": 300.0,
    "default_max_budget": 150.0
}


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance in kilometers between two points 
    on the Earth using the Haversine formula.
    """
    R = 6371.0  # Earth radius in kilometers

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (math.sin(dphi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return R * c


def calculate_bayesian_rating(
    avg_rating: float,
    review_count: int,
    global_mean_rating: float,
    m: float = 3.0
) -> float:
    """
    Computes Bayesian-weighted rating:
    WR = (v / (v + m)) * R + (m / (v + m)) * C
    """
    if review_count == 0:
        return global_mean_rating
    return (review_count / (review_count + m)) * avg_rating + (m / (review_count + m)) * global_mean_rating


def compute_attraction_aggregates(
    attractions_df: pd.DataFrame,
    reviews_df: pd.DataFrame,
    m: float = 3.0
) -> pd.DataFrame:
    """
    Enriches attractions_df with average rating, review count,
    and Bayesian weighted rating.
    """
    df = attractions_df.copy()
    
    if reviews_df.empty:
        df["avgRating"] = 4.0
        df["reviewCount"] = 0
        df["bayesianRating"] = 4.0
        return df

    global_mean = float(reviews_df["rating"].mean())
    review_stats = reviews_df.groupby("attractionId").agg(
        avgRating=("rating", "mean"),
        reviewCount=("rating", "count")
    ).reset_index()

    df = df.merge(review_stats, on="attractionId", how="left")
    df["avgRating"] = df["avgRating"].fillna(global_mean).round(2)
    df["reviewCount"] = df["reviewCount"].fillna(0).astype(int)

    df["bayesianRating"] = df.apply(
        lambda row: calculate_bayesian_rating(
            row["avgRating"], row["reviewCount"], global_mean, m
        ),
        axis=1
    ).round(2)

    return df


def get_user_category_affinities(
    user_id: Optional[int],
    reviews_df: pd.DataFrame,
    attractions_df: pd.DataFrame
) -> Dict[str, float]:
    """
    Calculates normalized user affinity (0.0 to 1.0) towards categories based on positive reviews (>=4 stars).
    """
    if user_id is None or reviews_df.empty:
        return {}

    user_reviews = reviews_df[reviews_df["userId"] == user_id]
    if user_reviews.empty:
        return {}

    merged = user_reviews.merge(attractions_df[["attractionId", "category"]], on="attractionId", how="inner")
    positive = merged[merged["rating"] >= 4]
    if positive.empty:
        return {}

    counts = positive["category"].value_counts(normalize=True)
    return counts.to_dict()


def apply_hard_filters(
    df: pd.DataFrame,
    interests: Optional[List[str]] = None,
    max_budget: Optional[float] = None,
    max_distance_km: Optional[float] = None,
    min_rating: Optional[float] = None,
    activity_type: Optional[str] = None,
    user_lat: float = 6.9271,
    user_lng: float = 79.8612
) -> pd.DataFrame:
    """
    Applies hard constraints to filter out non-viable attractions.
    Adds a 'distanceKm' column.
    """
    filtered = df.copy()

    # Calculate distance for all
    filtered["distanceKm"] = filtered.apply(
        lambda row: haversine_distance(user_lat, user_lng, float(row["lat"]), float(row["lng"])),
        axis=1
    ).round(1)

    # Filter by budget
    if max_budget is not None and max_budget > 0:
        filtered = filtered[filtered["estimatedCostPerDay"] <= max_budget]

    # Filter by distance
    if max_distance_km is not None and max_distance_km > 0:
        filtered = filtered[filtered["distanceKm"] <= max_distance_km]

    # Filter by min rating
    if min_rating is not None and min_rating > 0:
        filtered = filtered[filtered["avgRating"] >= min_rating]

    # Filter by activity type
    if activity_type and activity_type.lower() not in ["all", "any", ""]:
        # Case insensitive substring or exact match
        act_lower = activity_type.lower()
        if "tour" in act_lower:
            filtered = filtered[filtered["activityType"].str.lower().str.contains("tour")]
        elif "sight" in act_lower or "attraction" in act_lower:
            filtered = filtered[filtered["activityType"].str.lower().str.contains("sight|attraction")]

    # Optional filter by interests if strict (or soft-match in scoring)
    if interests and len(interests) > 0:
        # Standardize interest list
        clean_interests = [i.strip().lower() for i in interests if i.strip()]
        if clean_interests:
            filtered = filtered[filtered["category"].str.lower().isin(clean_interests)]

    return filtered


def score_attractions(
    attractions_df: pd.DataFrame,
    reviews_df: pd.DataFrame,
    interests: Optional[List[str]] = None,
    max_budget: Optional[float] = None,
    max_distance_km: Optional[float] = None,
    min_rating: Optional[float] = None,
    activity_type: Optional[str] = None,
    user_lat: float = 6.9271,
    user_lng: float = 79.8612,
    user_id: Optional[int] = None,
    config: Optional[Dict] = None,
    limit: int = 10
) -> List[Dict]:
    """
    Full rule-based scoring engine.
    Applies hard filters then calculates normalized weighted scores (0-100).
    Returns list of scored attraction dicts with matchScore and matchReasons.
    """
    cfg = config or DEFAULT_CONFIG
    weights = cfg["weights"]
    m = cfg.get("bayesian_m", 3.0)

    # 1. Enriched baseline data
    enriched_df = compute_attraction_aggregates(attractions_df, reviews_df, m=m)

    # 2. Hard filters
    filtered_df = apply_hard_filters(
        enriched_df,
        interests=None,  # We score interests continuously below so we don't zero out good alternatives
        max_budget=max_budget,
        max_distance_km=max_distance_km,
        min_rating=min_rating,
        activity_type=activity_type,
        user_lat=user_lat,
        user_lng=user_lng
    )

    # Fallback if hard filters yielded empty
    if filtered_df.empty:
        # Relax filters
        filtered_df = apply_hard_filters(
            enriched_df,
            interests=None,
            max_budget=None,
            max_distance_km=None,
            min_rating=None,
            activity_type=None,
            user_lat=user_lat,
            user_lng=user_lng
        )

    # 3. User affinities
    affinities = get_user_category_affinities(user_id, reviews_df, attractions_df)

    # Clean interests list
    target_interests = [i.strip().lower() for i in (interests or []) if i.strip()]

    max_rev_count = max(filtered_df["reviewCount"].max(), 1)
    effective_max_budget = max_budget if (max_budget and max_budget > 0) else 150.0
    effective_max_distance = max_distance_km if (max_distance_km and max_distance_km > 0) else 350.0

    scored_items = []

    for _, row in filtered_df.iterrows():
        reasons = []

        # Interest Subscore (0 to 1)
        cat_lower = str(row["category"]).lower()
        if target_interests:
            if cat_lower in target_interests:
                interest_subscore = 1.0
                reasons.append(f"Matches your interest in {row['category']}")
            else:
                interest_subscore = 0.2
        else:
            interest_subscore = 0.7  # Neutral default

        # Rating Subscore (0 to 1) normalized from 0-5
        bayesian_rating = float(row["bayesianRating"])
        rating_subscore = min(1.0, max(0.0, bayesian_rating / 5.0))
        if bayesian_rating >= 4.5:
            reasons.append(f"Top-rated destination ({bayesian_rating:.1f}/5.0 based on {row['reviewCount']} reviews)")
        elif bayesian_rating >= 4.0:
            reasons.append(f"Highly rated ({bayesian_rating:.1f}/5.0)")

        # Budget Subscore (0 to 1)
        cost = float(row["estimatedCostPerDay"])
        if cost <= effective_max_budget:
            # Cheaper places get slightly higher score, scaled
            budget_ratio = cost / effective_max_budget
            budget_subscore = 1.0 - (budget_ratio * 0.4)
            reasons.append(f"Fits within budget (${cost:.0f}/day vs max ${effective_max_budget:.0f})")
        else:
            budget_subscore = max(0.0, 1.0 - (cost - effective_max_budget) / 50.0)

        # Distance Subscore (0 to 1)
        dist = float(row["distanceKm"])
        if dist <= effective_max_distance:
            dist_ratio = dist / effective_max_distance
            dist_subscore = 1.0 - (dist_ratio * 0.5)
            reasons.append(f"Convenient distance ({dist:.0f} km from starting location)")
        else:
            dist_subscore = max(0.0, 1.0 - (dist - effective_max_distance) / 100.0)

        # Popularity Subscore (0 to 1)
        pop_subscore = min(1.0, float(row["reviewCount"]) / max_rev_count)
        if pop_subscore >= 0.7:
            reasons.append("Trending & highly popular with travelers")

        # History Affinity Subscore (0 to 1)
        history_subscore = affinities.get(row["category"], 0.0)
        if history_subscore > 0.3:
            reasons.append(f"Aligns with your past preference for {row['category']}")

        # Composite Score (0-100)
        composite = (
            weights["interest"] * interest_subscore +
            weights["rating"] * rating_subscore +
            weights["budget"] * budget_subscore +
            weights["distance"] * dist_subscore +
            weights["popularity"] * pop_subscore +
            weights["history"] * (history_subscore if affinities else 0.5)
        ) * 100.0

        match_score = round(min(99.5, max(10.0, composite)), 1)

        scored_items.append({
            "attractionId": int(row["attractionId"]),
            "name": str(row["name"]),
            "category": str(row["category"]),
            "activityType": str(row["activityType"]),
            "estimatedCost": float(row["estimatedCostPerDay"]),
            "lat": float(row["lat"]),
            "lng": float(row["lng"]),
            "distanceKm": float(dist),
            "avgRating": float(row["avgRating"]),
            "reviewCount": int(row["reviewCount"]),
            "bayesianRating": float(bayesian_rating),
            "matchScore": match_score,
            "matchReasons": reasons[:3],  # Top 3 concise reasons
            "location": str(row.get("location", "")),
            "imageUrl": str(row.get("imageUrl", "")),
            "description": str(row.get("description", ""))
        })

    # Sort descending by matchScore
    scored_items.sort(key=lambda x: x["matchScore"], reverse=True)
    return scored_items[:limit]
