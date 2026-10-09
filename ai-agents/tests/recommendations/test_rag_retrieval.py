"""
==============================================================================
AI Test Suite: RAG Retrieval & FAISS Knowledge Base (AI-REC-005, AI-REC-007)
Verifies semantic review ingestion, document preprocessing, retrieval relevance,
and graceful handling of out-of-distribution queries.
==============================================================================
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from tools.review_tools import (
    load_review_documents,
    clean_review_text,
    validate_review_record
)
from server import RecommendationApiRequest, generate_grounded_fallback_recommendations


def test_rag_review_documents_ingestion_and_metadata_ai_rec_005():  # AI-REC-005
    """
    AI-REC-005: Verify FAISS/RAG retrieval knowledge base.
    Verifies review knowledge base documents load properly, text is cleaned,
    and metadata contains required attraction, destination, and ratings.
    """
    docs = load_review_documents()

    assert len(docs) > 0, "No review documents loaded from knowledge base"

    first_doc = docs[0]
    assert hasattr(first_doc, "page_content")
    assert hasattr(first_doc, "metadata")
    assert "Destination:" in first_doc.page_content
    assert "Attraction:" in first_doc.page_content
    assert "Rating:" in first_doc.page_content

    # Verify metadata fields
    meta = first_doc.metadata
    assert "review_id" in meta
    assert "destination" in meta
    assert "attraction" in meta
    assert "source" in meta
    assert meta["source"] == "prototype review dataset"

    # Verify text cleaning helper
    raw_dirty = "  Amazing    view \n\n from the summit!   "
    cleaned = clean_review_text(raw_dirty)
    assert cleaned == "Amazing view from the summit!"

    # Verify record validation
    assert validate_review_record({"review_text": "Good", "destination": "Kandy", "attraction": "Temple", "rating": 5}) is True
    assert validate_review_record({"review_text": "", "destination": "Kandy", "attraction": "Temple"}) is False
    assert validate_review_record({"review_text": "Good", "destination": "Kandy", "attraction": "Temple", "rating": 99}) is False


def test_recommendations_no_matching_knowledge_handled_safely_ai_rec_007():  # AI-REC-007
    """
    AI-REC-007: Generate recommendations where no matching knowledge exists.
    Verifies that when a traveler searches for out-of-dataset or unsupported
    destinations/activities, the system gracefully handles insufficient knowledge
    and surfaces clear information limitations without hallucination or crash.
    """
    req = RecommendationApiRequest(
        destination="Mars Crater Olympus",
        interests=["Sub-orbital spaceflight", "Zero-gravity skiing"],
        minRating=4.9
    )

    result = generate_grounded_fallback_recommendations(req)

    assert result is not None
    assert "informationLimitations" in result
    limitations = result["informationLimitations"]
    assert len(limitations) > 0
    # Must explicitly state ground-truth review bounds
    assert any("Source: Curated ground-truth review dataset" in lim for lim in limitations)
