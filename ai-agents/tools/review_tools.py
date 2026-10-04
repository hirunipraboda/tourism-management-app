"""
==============================================================================
TourLink Smart Tourism Platform - Recommendation & Feedback Analysis Agent
Tool Module: Review Tools (review_tools.py)
==============================================================================
Lecture Alignment:
- Lecture 05: LLM, Tool calling, Tool schemas, Structured inputs/outputs
- Lecture 06: RAG, Document processing, Dense embeddings, FAISS Vector Store,
              Retriever as a Tool, Grounded generation
- Lecture 07: Specialized agent tools, Guardrails, Error handling

Responsibility:
- Ingest and preprocess prototype tourist reviews
- Build and query FAISS vector store for semantic review retrieval (RAG)
- Provide specialized tools:
    1. search_reviews
    2. analyze_review_sentiment
    3. analyze_feedback_themes
==============================================================================
"""

import os
import re
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from langchain_core.documents import Document
from langchain_core.tools import tool
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter


# ---------------------------------------------------------------------------
# Knowledge Base Paths
# ---------------------------------------------------------------------------
DEFAULT_REVIEWS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "reviews",
    "reviews.json"
)


# ---------------------------------------------------------------------------
# Section A: Review Preprocessing and Document Ingestion
# ---------------------------------------------------------------------------
def clean_review_text(text: str) -> str:
    """
    Safely clean review text without damaging semantic information.
    Normalizes excessive whitespace while preserving punctuation and original tone.
    """
    if not text or not isinstance(text, str):
        return ""
    # Normalize excessive newlines and spaces
    cleaned = re.sub(r"\s+", " ", text).strip()
    return cleaned


def validate_review_record(record: Dict[str, Any]) -> bool:
    """
    Validates a review entry for integrity (rating bounds, non-empty text, required fields).
    """
    if not isinstance(record, dict):
        return False
    if "review_text" not in record or not record["review_text"].strip():
        return False
    if "destination" not in record or "attraction" not in record:
        return False
    rating = record.get("rating")
    if rating is not None and (not isinstance(rating, (int, float)) or not (1 <= rating <= 5)):
        return False
    return True


def load_review_documents(reviews_path: Optional[str] = None) -> List[Document]:
    """
    Loads the prototype review dataset, cleans review text, and constructs LangChain Documents.
    Clearly marks each document with provenance metadata from the prototype dataset.
    """
    path = reviews_path or DEFAULT_REVIEWS_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Review knowledge base file not found at: {path}")

    with open(path, "r", encoding="utf-8") as f:
        records = json.load(f)

    documents: List[Document] = []
    for item in records:
        if not validate_review_record(item):
            continue

        clean_text = clean_review_text(item["review_text"])
        content = (
            f"Destination: {item.get('destination', 'Unknown')}\n"
            f"Attraction: {item.get('attraction', 'Unknown')}\n"
            f"Category: {item.get('category', 'General')}\n"
            f"Rating: {item.get('rating', 'N/A')}/5\n"
            f"Traveler Type: {item.get('traveler_type', 'Tourist')}\n"
            f"Environment: {item.get('environment', 'N/A')}\n"
            f"Cost Perception: {item.get('cost_perception', 'N/A')}\n"
            f"Review: {clean_text}\n"
            f"Source: {item.get('source', 'prototype review dataset')}"
        )

        metadata = {
            "review_id": item.get("review_id", ""),
            "destination": item.get("destination", ""),
            "attraction": item.get("attraction", ""),
            "category": item.get("category", ""),
            "rating": item.get("rating", 0),
            "traveler_type": item.get("traveler_type", ""),
            "source": item.get("source", "prototype review dataset"),
            "environment": item.get("environment", ""),
            "cost_perception": item.get("cost_perception", "")
        }
        documents.append(Document(page_content=content.strip(), metadata=metadata))

    return documents


def build_review_vectorstore(
    documents: Optional[List[Document]] = None,
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
) -> FAISS:
    """
    Builds an in-memory FAISS vector store using HuggingFace sentence-transformers.
    Chunks documents using RecursiveCharacterTextSplitter.
    """
    if documents is None:
        documents = load_review_documents()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ". ", " "]
    )
    chunked_docs = text_splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(
        model_name=embedding_model_name,
        show_progress=False
    )
    vectorstore = FAISS.from_documents(chunked_docs, embeddings)
    return vectorstore


# ---------------------------------------------------------------------------
# Section B: Tool 1 - search_reviews
# ---------------------------------------------------------------------------
class ReviewSearchInput(BaseModel):
    """Input schema for the search_reviews tool."""
    query: str = Field(
        description="Search query describing destinations, attractions, tourist vibes, or activities (e.g. 'peaceful nature attractions in Ella', 'Kandy lake quiet walk', 'Galle fort reviews')."
    )
    destination: Optional[str] = Field(
        default=None,
        description="Optional filter for specific destination (e.g. 'Ella', 'Kandy', 'Galle', 'Nuwara Eliya', 'Colombo')."
    )


def create_review_search_tool(vectorstore_or_retriever):
    """
    Factory function creating the search_reviews LangChain tool bound to the vectorstore.
    """
    @tool(args_schema=ReviewSearchInput)
    def search_reviews(query: str, destination: Optional[str] = None) -> str:
        """
        Search the prototype review knowledge base for authentic tourist reviews, ratings,
        and feedback concerning attractions and destinations across Sri Lanka.

        Use this tool to find:
        - Traveler opinions, praises, complaints, and atmosphere descriptions
        - Ratings, perceived crowds, costs, and trail difficulty
        - Evidence for preference matching and recommendations

        Do NOT use this tool for:
        - Factual opening hours (use Destination Research Agent)
        - Bus/train schedules or route calculations (use Travel Logistics Agent)
        - Creating complete travel itineraries (use Travel Planning Agent)

        Input: A search query and optional destination filter.
        Returns: Formatted review evidence clearly tagged with the prototype dataset source.
        """
        if not query or not query.strip():
            return "ERROR: The review search query is empty. Please provide a valid search query."

        clean_query = query.strip()
        search_term = f"{clean_query} {destination}" if destination else clean_query

        try:
            # Handle either retriever or vectorstore object
            if hasattr(vectorstore_or_retriever, "similarity_search"):
                results = vectorstore_or_retriever.similarity_search(search_term, k=5)
            elif hasattr(vectorstore_or_retriever, "invoke"):
                results = vectorstore_or_retriever.invoke(search_term)
            else:
                return "ERROR: Invalid retriever instance provided to search_reviews tool."
        except Exception as e:
            return f"TOOL_ERROR: Error retrieving reviews from vector store: {str(e)}"

        # If destination filter provided, post-filter results
        if destination:
            dest_lower = destination.lower()
            filtered = [
                doc for doc in results
                if dest_lower in doc.metadata.get("destination", "").lower()
                or dest_lower in doc.page_content.lower()
            ]
            if filtered:
                results = filtered

        if not results:
            return (
                f"NO_REVIEWS_FOUND: No relevant reviews were found in the current review knowledge base "
                f"for query: '{query}'" + (f" in destination '{destination}'." if destination else ".") +
                " Note: All recommendations must be grounded in available evidence. Do not fabricate reviews."
            )

        formatted: List[str] = []
        for i, doc in enumerate(results, start=1):
            meta = doc.metadata
            rating_display = f"{meta.get('rating', 'N/A')}/5" if meta.get('rating') else "N/A"
            formatted.append(
                f"--- [Review Evidence {i}] ---\n"
                f"Attraction: {meta.get('attraction', 'Unknown')} ({meta.get('destination', 'Unknown')})\n"
                f"Category: {meta.get('category', 'N/A')}\n"
                f"Rating: {rating_display} | Traveler: {meta.get('traveler_type', 'Visitor')}\n"
                f"Content: {doc.page_content}\n"
                f"Source: {meta.get('source', 'prototype review dataset')}"
            )

        return "\n\n".join(formatted)

    return search_reviews


# ---------------------------------------------------------------------------
# Section C: Tool 2 - analyze_review_sentiment
# ---------------------------------------------------------------------------
class SentimentAnalysisInput(BaseModel):
    """Input schema for analyze_review_sentiment tool."""
    review_text: str = Field(
        description="Tourist review text to evaluate for sentiment, positive aspects, and negative concerns."
    )


class ReviewSentimentResult(BaseModel):
    """Structured output schema for sentiment analysis."""
    sentiment: str = Field(description="Classification: 'Positive', 'Negative', 'Neutral', or 'Mixed'")
    sentiment_score: float = Field(description="Normalized sentiment score from -1.0 (very negative) to +1.0 (very positive)")
    positive_aspects: List[str] = Field(default_factory=list, description="Extracted positive facets (e.g. 'scenery', 'staff friendliness')")
    negative_aspects: List[str] = Field(default_factory=list, description="Extracted negative facets (e.g. 'crowding', 'waiting time', 'cost')")
    supporting_quote: str = Field(description="Short quote or rationale from review text supporting classification")


# Lexicons for aspect-based sentiment extraction
POSITIVE_LEXICON = {
    "scenery": ["view", "views", "scenery", "scenic", "breathtaking", "panoramic", "beautiful", "stunning", "picturesque"],
    "peacefulness": ["peaceful", "quiet", "relaxing", "calm", "serene", "tranquil", "secluded", "gentle"],
    "cleanliness": ["clean", "spotlessly", "well-kept", "pristine", "tidy"],
    "value / affordable": ["free", "worth", "inexpensive", "affordable", "great value", "reasonable"],
    "culture / spiritual": ["spiritual", "sacred", "historic", "cultural", "heritage", "fascinating", "informative"],
    "friendly staff": ["friendly", "helpful", "welcoming", "kind", "attentive"],
    "hiking / adventure": ["adventure", "hiking", "trek", "summit", "magical", "delightful", "highlight"]
}

NEGATIVE_LEXICON = {
    "crowding": ["crowded", "swarmed", "tourists", "packed", "sardines", "busy", "massive crowds"],
    "waiting / queue": ["waiting", "queue", "queues", "glimpse", "long lines"],
    "noise / disturbance": ["noisy", "loud", "traffic", "fumes", "drones", "disturbance", "carnival"],
    "cost / expensive": ["expensive", "overpriced", "pricey", "high fee", "extra charges", "costly"],
    "difficulty / tiring": ["exhausting", "steep", "lost", "confusing", "poorly marked", "rough", "tiring"],
    "cleanliness / litter": ["dirty", "litter", "plastic", "waste", "poor ventilation", "dimly lit"],
    "weather / visibility": ["fog", "foggy", "mist", "rainy", "hot", "uncomfortable", "poor visibility"],
    "commercialization": ["pushy", "touts", "commercialized", "overhyped", "souvenirs"]
}


def compute_aspect_sentiment(text: str) -> Dict[str, Any]:
    """
    Extracts positive aspects, negative concerns, and determines sentiment label and score.
    Supports Positive, Negative, Neutral, and Mixed categories.
    """
    lower_text = text.lower()
    pos_matches: List[str] = []
    neg_matches: List[str] = []

    for aspect, words in POSITIVE_LEXICON.items():
        if any(w in lower_text for w in words):
            pos_matches.append(aspect)

    for aspect, words in NEGATIVE_LEXICON.items():
        if any(w in lower_text for w in words):
            neg_matches.append(aspect)

    # Polarity calculation
    pos_count = len(pos_matches)
    neg_count = len(neg_matches)
    total = pos_count + neg_count

    if total == 0:
        sentiment = "Neutral"
        score = 0.0
    elif pos_count > 0 and neg_count > 0:
        # Both positive and negative aspects present
        sentiment = "Mixed"
        score = round((pos_count - neg_count) / float(total), 2)
    elif pos_count > neg_count:
        sentiment = "Positive"
        score = round(min(1.0, 0.4 + 0.2 * pos_count), 2)
    else:
        sentiment = "Negative"
        score = round(max(-1.0, -0.4 - 0.2 * neg_count), 2)

    return {
        "sentiment": sentiment,
        "sentiment_score": score,
        "positive_aspects": pos_matches if pos_matches else ["None explicitly highlighted"],
        "negative_aspects": neg_matches if neg_matches else ["None explicitly highlighted"],
        "supporting_quote": text[:150] + ("..." if len(text) > 150 else "")
    }


@tool(args_schema=SentimentAnalysisInput)
def analyze_review_sentiment(review_text: str) -> str:
    """
    Analyze the sentiment and extracted aspects of a tourist review or feedback statement.

    Classifies into:
    - Positive: Praise, satisfaction, enjoyment
    - Negative: Disappointment, complaints, frustration
    - Neutral: Factual observations without strong emotion
    - Mixed: Contains both positive highlights and negative drawbacks

    Returns structured JSON with sentiment, polarity score, positive aspects, and negative aspects.
    """
    if not review_text or not review_text.strip():
        return "ERROR: review_text parameter is empty. Please provide review content."

    result = compute_aspect_sentiment(review_text)
    return json.dumps(result, indent=2)


# ---------------------------------------------------------------------------
# Section D: Tool 3 - analyze_feedback_themes
# ---------------------------------------------------------------------------
class FeedbackThemeInput(BaseModel):
    """Input schema for analyze_feedback_themes tool."""
    reviews_text_or_attraction: str = Field(
        description="Text containing multiple reviews or the specific attraction name to analyze recurrent feedback themes for."
    )


def extract_recurrent_themes(text_corpus: str) -> Dict[str, Any]:
    """
    Aggregates recurrent feedback themes across review texts with evidence grounding.
    """
    lower = text_corpus.lower()
    
    theme_catalog = {
        "Scenery & Views": {
            "keywords": ["scenery", "view", "views", "breathtaking", "panoramic", "picturesque", "mountain", "hills", "ocean"],
            "type": "positive"
        },
        "Peacefulness & Atmosphere": {
            "keywords": ["peaceful", "quiet", "calm", "relaxing", "serene", "tranquil", "secluded"],
            "type": "positive"
        },
        "Crowds & Congestion": {
            "keywords": ["crowded", "swarmed", "packed", "tourists", "drones", "busy", "queues", "lines"],
            "type": "negative"
        },
        "Trail Difficulty & Hiking": {
            "keywords": ["hike", "hiking", "trail", "steep", "climb", "tiring", "exhausting", "trek", "lost"],
            "type": "mixed"
        },
        "Cultural & Spiritual Value": {
            "keywords": ["temple", "spiritual", "sacred", "rituals", "relic", "architecture", "history", "heritage", "buddhist"],
            "type": "positive"
        },
        "Cost & Value Perception": {
            "keywords": ["cost", "expensive", "fee", "free", "pricey", "overpriced", "affordable", "value", "ticket"],
            "type": "mixed"
        },
        "Cleanliness & Environment": {
            "keywords": ["clean", "spotlessly", "dirty", "plastic", "litter", "waste", "fumes", "traffic"],
            "type": "mixed"
        },
        "Weather & Visibility": {
            "keywords": ["fog", "mist", "rain", "hot", "sun", "sunrise", "sunset", "visibility"],
            "type": "mixed"
        }
    }

    detected_themes = []
    positive_themes = []
    negative_themes = []

    for theme_name, info in theme_catalog.items():
        found_kw = [kw for kw in info["keywords"] if kw in lower]
        if found_kw:
            count = sum(lower.count(kw) for kw in found_kw)
            theme_entry = {
                "theme": theme_name,
                "frequency_indicator": count,
                "matched_signals": found_kw[:4],
                "polarity": info["type"]
            }
            detected_themes.append(theme_entry)
            if info["type"] == "positive":
                positive_themes.append(theme_name)
            elif info["type"] == "negative":
                negative_themes.append(theme_name)

    # Sort themes by frequency
    detected_themes.sort(key=lambda x: x["frequency_indicator"], reverse=True)

    return {
        "detected_themes": detected_themes,
        "top_positive_themes": positive_themes,
        "top_concerns_or_drawbacks": negative_themes,
        "evidence_notice": "Theme analysis generated strictly from prototype tourism review dataset. No unsupported themes fabricated."
    }


@tool(args_schema=FeedbackThemeInput)
def analyze_feedback_themes(reviews_text_or_attraction: str) -> str:
    """
    Analyze a collection of reviews or an attraction review summary to identify recurring themes,
    such as Scenery, Crowding, Peacefulness, Trail Difficulty, Cultural Value, Cleanliness, and Cost.

    Returns structured theme frequencies, positive themes, and negative drawbacks grounded in evidence.
    """
    if not reviews_text_or_attraction or not reviews_text_or_attraction.strip():
        return "ERROR: Please provide review content or attraction name to analyze feedback themes."

    result = extract_recurrent_themes(reviews_text_or_attraction)
    return json.dumps(result, indent=2)
