"""
==============================================================================
TourLink Smart Tourism Platform - Destination Research Agent
Tool: Tourism Search Tool (search_tourism_information)
==============================================================================
Lecture Alignment:
- Lecture 05: Tool calling, Structured tool inputs/outputs, Agent loop
- Lecture 06: RAG, Document processing, Embeddings, FAISS Vector Store,
              Retriever as a Tool, Grounded generation

Responsibility:
- Retrieve verified factual tourism information from the FAISS vector store
- Filter/format attraction records (destination, category, description,
  location, duration, cost, opening hours, nearby attractions, activities)
- Return safe error messages and "not found" indicators without hallucinating
==============================================================================
"""

import os
import json
from typing import List, Optional
from pydantic import BaseModel, Field

from langchain_core.documents import Document
from langchain_core.tools import tool
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter


# ---------------------------------------------------------------------------
# Pydantic Schema for Tool Input
# ---------------------------------------------------------------------------
class TourismSearchInput(BaseModel):
    """Input schema for the search_tourism_information tool."""
    query: str = Field(
        description="Search query describing destination, attraction, category, or experience (e.g. 'cultural attractions in Kandy', 'nature in Ella'). Must not be empty."
    )


# ---------------------------------------------------------------------------
# Default Sample Knowledge Base Path
# ---------------------------------------------------------------------------
DEFAULT_DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "tourism",
    "destinations.json"
)


def load_tourism_documents(data_path: Optional[str] = None) -> List[Document]:
    """
    Load tourism records from a JSON file and convert them into LangChain Document objects.
    Each document contains clear factual fields in page_content and structured metadata.
    """
    path = data_path or DEFAULT_DATA_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Tourism knowledge base not found at: {path}")

    with open(path, "r", encoding="utf-8") as f:
        records = json.load(f)

    documents: List[Document] = []
    for item in records:
        content = (
            f"Destination: {item.get('destination', 'Unknown')}\n"
            f"Attraction Name: {item.get('name', 'Unknown')}\n"
            f"Category: {item.get('category', 'General')}\n"
            f"Description: {item.get('description', 'N/A')}\n"
            f"Location: {item.get('location', 'N/A')}\n"
            f"Estimated Visit Duration: {item.get('estimated_duration_hours', 'N/A')}\n"
            f"Estimated Cost: {item.get('estimated_cost', 'N/A')}\n"
            f"Opening Hours: {item.get('opening_hours', 'N/A')}\n"
            f"Nearby Attractions: {', '.join(item.get('nearby_attractions', []))}\n"
            f"Activities: {', '.join(item.get('activities', []))}\n"
        )
        metadata = {
            "destination": item.get("destination", ""),
            "name": item.get("name", ""),
            "category": item.get("category", "")
        }
        documents.append(Document(page_content=content.strip(), metadata=metadata))

    return documents


def build_tourism_vectorstore(
    documents: Optional[List[Document]] = None,
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
) -> FAISS:
    """
    Build a FAISS vector store from tourism documents using HuggingFace sentence-transformers.
    Demonstrates RAG chunking and vector storage from Lecture 06.
    """
    if documents is None:
        documents = load_tourism_documents()

    # Document Chunking (RecursiveCharacterTextSplitter)
    # Even though sample documents are concise, chunking is good practice
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=50
    )
    chunked_docs = text_splitter.split_documents(documents)

    # Initialize HuggingFace embeddings
    embeddings = HuggingFaceEmbeddings(model_name=embedding_model_name, show_progress=False)

    # Build FAISS vector store
    vectorstore = FAISS.from_documents(chunked_docs, embeddings)
    return vectorstore


def create_tourism_search_tool(retriever):
    """
    Factory function to create the search_tourism_information LangChain tool.
    Binds the tool to the given FAISS retriever.
    """
    @tool(args_schema=TourismSearchInput)
    def search_tourism_information(query: str) -> str:
        """
        Search the verified tourism knowledge base for factual information about destinations,
        attractions, categories, visit durations, costs, opening hours, and activities in Sri Lanka.

        Use this tool whenever:
        - Researching a destination (e.g. Kandy, Ella, Galle, Sigiriya, Colombo)
        - Finding attractions by category (e.g. cultural, nature, adventure, heritage)
        - Looking up opening hours, entrance fees, or visit durations

        Do NOT use this tool for:
        - Route planning, itinerary scheduling, weather checks, or personalized recommendation scores.

        Input: A search query string (e.g. 'cultural attractions in Kandy').
        Returns: Formatted factual details of matching attractions, or a clear message if unavailable.
        """
        # Step 1: Input validation
        if not query or not query.strip():
            return "ERROR: The search query is empty. Please provide a valid destination or attraction query."

        clean_query = query.strip()

        # Step 2: Retrieve relevant documents
        try:
            results = retriever.invoke(clean_query)
        except Exception as e:
            return f"TOOL_ERROR: The tourism information service encountered an error: {str(e)}"

        # Step 3: Check if results were found
        if not results:
            return (
                f"NO_INFORMATION_FOUND: No verified tourism information found for '{clean_query}'. "
                f"The agent must clearly report that this information is unavailable in the knowledge base."
            )

        # Step 4: Format and ground retrieved documents
        formatted_results = []
        for i, doc in enumerate(results, start=1):
            formatted_results.append(
                f"--- [Result {i}] ---\n"
                f"{doc.page_content}\n"
                f"Metadata: {json.dumps(doc.metadata)}"
            )

        return "\n\n".join(formatted_results)

    return search_tourism_information
