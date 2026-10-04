"""
==============================================================================
TourLink Smart Tourism Platform - Travel Logistics & Availability Agent
Tool Module: Transport Tools & Services (transport_tools.py)
==============================================================================
Lecture Alignment:
- Lecture 05: LLM, Tool calling, Tools, Structured inputs/outputs
- Lecture 06: RAG, Document processing, Embeddings, FAISS Vector Store,
              Retriever as a Tool, Grounded generation
- Lecture 07: Specialized agent, Think -> Act -> Observe loop, Clean abstraction

Responsibility:
- Retrieve verified factual transport records from the FAISS vector store
- Support public transit queries: bus numbers, train routes, schedules, stations
- Clean service abstraction (TransportService) to allow future live transit APIs
- Return safe error messages and unverified live status without hallucination
==============================================================================
"""

import os
import sys
import json
import uuid
from typing import List, Optional, Dict, Any

# Windows DLL Application Control policy compatibility fallback
try:
    import uuid_utils
except ImportError:
    import types
    u = types.ModuleType("uuid_utils")
    u.UUID = uuid.UUID
    uc = types.ModuleType("uuid_utils.compat")
    uc.uuid7 = uuid.uuid4
    sys.modules["uuid_utils"] = u
    sys.modules["uuid_utils.compat"] = uc

try:
    from sklearn.metrics.cluster import _expected_mutual_info_fast
except ImportError:
    import types
    m = types.ModuleType("sklearn.metrics.cluster._expected_mutual_info_fast")
    m.expected_mutual_information = lambda *a, **k: 0
    sys.modules["sklearn.metrics.cluster._expected_mutual_info_fast"] = m

from pydantic import BaseModel, Field

from langchain_core.documents import Document
from langchain_core.tools import tool
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter


# ---------------------------------------------------------------------------
# Pydantic Schemas for Tool Inputs
# ---------------------------------------------------------------------------
class LogisticsSearchInput(BaseModel):
    """Input schema for the search_logistics_information tool."""
    query: str = Field(
        description="Search query describing origin, destination, transport type, route, or schedule "
                    "(e.g. 'train options from Kandy to Ella', 'bus from Colombo to Galle'). Must not be empty."
    )


class TransportScheduleInput(BaseModel):
    """Input schema for the search_transport_schedule tool."""
    origin: str = Field(description="Origin city or station (e.g. 'Colombo', 'Kandy')")
    destination: str = Field(description="Destination city or station (e.g. 'Kandy', 'Ella', 'Galle')")
    transport_type: Optional[str] = Field(
        default=None,
        description="Optional transport mode filter: 'Train', 'Bus', 'Expressway Bus'"
    )


# ---------------------------------------------------------------------------
# Default Sample Logistics Knowledge Base Path
# ---------------------------------------------------------------------------
DEFAULT_LOGISTICS_DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "logistics",
    "routes.json"
)


# ---------------------------------------------------------------------------
# Service Abstraction (Live Data Design Pattern)
# ---------------------------------------------------------------------------
class TransportService:
    """
    Abstract Service Interface for Transport Logistics.
    Decouples the agent from concrete data sources.
    In prototype phase, queries local verified FAISS/JSON store.
    Can be replaced in production by live railway/bus APIs without changing agent code.
    """

    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or DEFAULT_LOGISTICS_DATA_PATH
        self._routes_cache: Optional[List[Dict[str, Any]]] = None

    def _load_raw_data(self) -> List[Dict[str, Any]]:
        if self._routes_cache is None:
            if not os.path.exists(self.data_path):
                raise FileNotFoundError(f"Logistics routes file not found at: {self.data_path}")
            with open(self.data_path, "r", encoding="utf-8") as f:
                self._routes_cache = json.load(f)
        return self._routes_cache

    def get_transport_options(self, origin: str, destination: str, transport_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Filter transport options by origin and destination."""
        routes = self._load_raw_data()
        orig_clean = origin.strip().lower()
        dest_clean = destination.strip().lower()
        type_clean = transport_type.strip().lower() if transport_type else None

        matched = []
        for r in routes:
            r_orig = r.get("origin", "").lower()
            r_dest = r.get("destination", "").lower()
            r_type = r.get("transport_type", "").lower()

            if (orig_clean in r_orig or r_orig in orig_clean) and (dest_clean in r_dest or r_dest in dest_clean):
                if not type_clean or type_clean in r_type or r_type in type_clean:
                    matched.append(r)
        return matched

    def get_schedule(self, origin: str, destination: str, transport_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve schedule specifics for matched routes."""
        return self.get_transport_options(origin, destination, transport_type)


# ---------------------------------------------------------------------------
# Document Loading & RAG Vector Store
# ---------------------------------------------------------------------------
def load_logistics_documents(data_path: Optional[str] = None) -> List[Document]:
    """
    Load travel logistics records and convert them into LangChain Document objects.
    Enriches page_content with practical transit details and metadata for retrieval.
    """
    path = data_path or DEFAULT_LOGISTICS_DATA_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Logistics knowledge base not found at: {path}")

    with open(path, "r", encoding="utf-8") as f:
        records = json.load(f)

    documents: List[Document] = []
    for item in records:
        content = (
            f"Origin: {item.get('origin', 'Unknown')}\n"
            f"Destination: {item.get('destination', 'Unknown')}\n"
            f"Transport Type: {item.get('transport_type', 'N/A')}\n"
            f"Route Name/Code: {item.get('route', 'N/A')}\n"
            f"Service/Train/Bus Number: {item.get('bus_or_train_number', 'N/A')}\n"
            f"Service Name: {item.get('service_name', 'N/A')}\n"
            f"Operator: {item.get('service_operator', 'N/A')}\n"
            f"Departure Station/Location: {item.get('departure_location', 'N/A')}\n"
            f"Arrival Station/Location: {item.get('arrival_location', 'N/A')}\n"
            f"Schedule Information: {item.get('schedule_info', 'N/A')}\n"
            f"Estimated Journey Duration: {item.get('estimated_duration', 'N/A')}\n"
            f"Approximate Distance: {item.get('estimated_distance_km', 'N/A')} km\n"
            f"Frequency: {item.get('frequency', 'N/A')}\n"
            f"Estimated Cost: {item.get('cost_estimate', 'N/A')}\n"
            f"Availability Status: {item.get('availability_status', 'N/A')}\n"
            f"Timing Feasibility Notes: {item.get('timing_feasibility_notes', 'N/A')}\n"
            f"Important Notes: {item.get('notes', 'N/A')}\n"
            f"Knowledge Base Source: {item.get('source', 'prototype knowledge base')}\n"
            f"Last Updated: {item.get('last_updated', '2026-03-01')}"
        )
        metadata = {
            "origin": item.get("origin", ""),
            "destination": item.get("destination", ""),
            "transport_type": item.get("transport_type", ""),
            "route": item.get("route", ""),
            "bus_or_train_number": item.get("bus_or_train_number", ""),
            "source": item.get("source", "prototype knowledge base")
        }
        documents.append(Document(page_content=content.strip(), metadata=metadata))

    return documents


def build_logistics_vectorstore(
    documents: Optional[List[Document]] = None,
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
) -> FAISS:
    """
    Build a FAISS vector store from logistics documents using HuggingFace embeddings.
    Demonstrates RAG chunking and vector storage from Lecture 06.
    """
    if documents is None:
        documents = load_logistics_documents()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=70,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    chunked_docs = text_splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(model_name=embedding_model_name, show_progress=False)
    vectorstore = FAISS.from_documents(chunked_docs, embeddings)
    return vectorstore


# ---------------------------------------------------------------------------
# Tool Factory Functions
# ---------------------------------------------------------------------------
def create_logistics_search_tool(retriever):
    """
    Factory function to create the search_logistics_information LangChain tool.
    Binds the tool to the given FAISS retriever.
    """
    @tool(args_schema=LogisticsSearchInput)
    def search_logistics_information(query: str) -> str:
        """
        Search the prototype tourism logistics knowledge base for factual transport options,
        public transit routes, bus numbers, train routes, schedules, journey durations,
        and availability between Sri Lankan destinations.

        Use this tool whenever:
        - Researching transport between cities (e.g. 'Colombo to Kandy', 'Kandy to Ella')
        - Finding public transport routes (train or bus options)
        - Looking up travel durations or route specifics

        Input: A search query string (e.g. 'train options from Kandy to Ella').
        Returns: Factual details from prototype logistics documents, or a clear not-found notice.
        """
        if not query or not query.strip():
            return "ERROR: The search query is empty. Please provide a valid logistics query."

        clean_query = query.strip()
        try:
            results = retriever.invoke(clean_query)
        except Exception as e:
            return f"TOOL_ERROR: The logistics information service encountered an error: {str(e)}"

        if not results:
            return (
                f"NO_INFORMATION_FOUND: No relevant logistics information found for '{clean_query}' "
                f"in the prototype knowledge base. The agent must clearly report that this information is unavailable."
            )

        formatted_results = []
        for i, doc in enumerate(results, start=1):
            formatted_results.append(
                f"--- [Logistics Record {i}] ---\n"
                f"{doc.page_content}\n"
                f"Metadata: {json.dumps(doc.metadata)}"
            )

        return "\n\n".join(formatted_results)

    return search_logistics_information


def create_transport_schedule_tool(service: Optional[TransportService] = None):
    """
    Factory function for the search_transport_schedule tool.
    Directly retrieves structured timetable and frequency records.
    """
    srv = service or TransportService()

    @tool(args_schema=TransportScheduleInput)
    def search_transport_schedule(origin: str, destination: str, transport_type: Optional[str] = None) -> str:
        """
        Retrieve scheduled departure times, service names, and frequencies for trains or buses
        between two locations from the prototype knowledge base.

        Input: origin, destination, and optional transport_type ('Train' or 'Bus').
        Returns: Scheduled departure times and timetable notes.
        """
        if not origin or not origin.strip() or not destination or not destination.strip():
            return "ERROR: Both origin and destination must be provided."

        records = srv.get_schedule(origin, destination, transport_type)
        if not records:
            return (
                f"NO_SCHEDULE_FOUND: No scheduled {transport_type or 'transport'} services found between "
                f"{origin} and {destination} in the prototype knowledge base."
            )

        output_lines = [
            f"Found {len(records)} prototype schedule entry/entries for {origin} to {destination}:",
            "Notice: Sourced from prototype knowledge base; real-time operational departures may vary."
        ]
        for idx, rec in enumerate(records, start=1):
            output_lines.append(
                f"\n[{idx}] {rec.get('transport_type', 'Transport')} - {rec.get('service_name', 'Service')}"
                f"\n  • Route / Code: {rec.get('route', 'N/A')} ({rec.get('bus_or_train_number', 'N/A')})"
                f"\n  • Departure Station: {rec.get('departure_location', 'N/A')}"
                f"\n  • Arrival Station: {rec.get('arrival_location', 'N/A')}"
                f"\n  • Schedule Info: {rec.get('schedule_info', 'N/A')}"
                f"\n  • Frequency: {rec.get('frequency', 'N/A')}"
                f"\n  • Duration: {rec.get('estimated_duration', 'N/A')}"
                f"\n  • Availability Status: {rec.get('availability_status', 'N/A')}"
                f"\n  • Source: {rec.get('source', 'prototype knowledge base')}"
            )

        return "\n".join(output_lines)

    return search_transport_schedule
