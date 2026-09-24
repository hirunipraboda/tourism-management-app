"""
ml_recommender.py
Machine Learning Content-Based Recommendation & Similarity Engine.
Uses TF-IDF Vectorization across category, activity type, description, and aggregated
user review text to compute a Cosine Similarity matrix between attractions.
Includes cold-start fallback to Bayesian popular places.
"""

from typing import Dict, List, Optional
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class ContentRecommender:
    def __init__(self, attractions_df: pd.DataFrame, reviews_df: pd.DataFrame):
        self.attractions_df = attractions_df.copy()
        self.reviews_df = reviews_df.copy()
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
            max_features=1500
        )
        self.similarity_matrix = None
        self.id_to_idx = {}
        self.idx_to_id = {}
        self._fit_content_model()

    def _prepare_corpus(self) -> List[str]:
        """
        Combines attraction metadata and review text into a rich textual document per attraction.
        """
        # Aggregate review texts per attraction
        if not self.reviews_df.empty:
            agg_reviews = self.reviews_df.groupby("attractionId")["text"].apply(
                lambda s: " ".join(s)
            ).reset_index()
            merged = self.attractions_df.merge(agg_reviews, on="attractionId", how="left")
            merged["review_corpus"] = merged["text"].fillna("")
        else:
            merged = self.attractions_df.copy()
            merged["review_corpus"] = ""

        corpus = []
        for idx, row in merged.iterrows():
            a_id = int(row["attractionId"])
            self.id_to_idx[a_id] = idx
            self.idx_to_id[idx] = a_id

            # Weight category heavily by repeating it
            category_text = f"{row['category']} " * 3
            activity_text = f"{row['activityType']} " * 2
            desc = str(row.get("description", ""))
            location = str(row.get("location", ""))
            reviews_text = str(row.get("review_corpus", ""))

            combined_doc = f"{category_text} {activity_text} {location} {desc} {reviews_text}"
            corpus.append(combined_doc)

        return corpus

    def _fit_content_model(self):
        """Computes TF-IDF vectors and cosine similarity matrix."""
        corpus = self._prepare_corpus()
        tfidf_matrix = self.vectorizer.fit_transform(corpus)
        self.similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

    def get_similar_attractions(self, attraction_id: int, limit: int = 4) -> List[Dict]:
        """
        Finds the most content-similar attractions to a given attractionId.
        """
        if attraction_id not in self.id_to_idx:
            return self.get_cold_start_popular(limit=limit)

        idx = self.id_to_idx[attraction_id]
        sim_scores = list(enumerate(self.similarity_matrix[idx]))
        
        # Sort by similarity score descending, exclude self (score 1.0)
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = [item for item in sim_scores if item[0] != idx][:limit]

        similar_items = []
        for match_idx, score in sim_scores:
            a_id = self.idx_to_id[match_idx]
            match_row = self.attractions_df[self.attractions_df["attractionId"] == a_id].iloc[0]
            similar_items.append({
                "attractionId": int(a_id),
                "name": str(match_row["name"]),
                "category": str(match_row["category"]),
                "activityType": str(match_row["activityType"]),
                "estimatedCost": float(match_row["estimatedCostPerDay"]),
                "similarityScore": round(float(score), 3),
                "location": str(match_row.get("location", "")),
                "imageUrl": str(match_row.get("imageUrl", ""))
            })

        return similar_items

    def get_cold_start_popular(self, limit: int = 6) -> List[Dict]:
        """
        Fallback recommendation when a user has zero history or missing context.
        Returns top attractions based on review volume and average ratings.
        """
        if self.reviews_df.empty:
            top_slice = self.attractions_df.head(limit)
        else:
            stats = self.reviews_df.groupby("attractionId").agg(
                avgRating=("rating", "mean"),
                reviewCount=("rating", "count")
            ).reset_index()
            merged = self.attractions_df.merge(stats, on="attractionId", how="left")
            merged["avgRating"] = merged["avgRating"].fillna(4.0)
            merged["reviewCount"] = merged["reviewCount"].fillna(0)
            # Bayesian rank formula
            c = merged["avgRating"].mean()
            m = 3.0
            merged["bayesianScore"] = (
                (merged["reviewCount"] / (merged["reviewCount"] + m)) * merged["avgRating"] +
                (m / (merged["reviewCount"] + m)) * c
            )
            top_slice = merged.sort_values(by=["bayesianScore", "reviewCount"], ascending=[False, False]).head(limit)

        results = []
        for _, row in top_slice.iterrows():
            results.append({
                "attractionId": int(row["attractionId"]),
                "name": str(row["name"]),
                "category": str(row["category"]),
                "activityType": str(row["activityType"]),
                "estimatedCost": float(row["estimatedCostPerDay"]),
                "avgRating": round(float(row.get("avgRating", 4.5)), 2),
                "reviewCount": int(row.get("reviewCount", 10)),
                "location": str(row.get("location", "")),
                "imageUrl": str(row.get("imageUrl", ""))
            })
        return results
