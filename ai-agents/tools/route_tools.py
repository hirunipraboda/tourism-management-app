"""
==============================================================================
TourLink Smart Tourism Platform - Travel Logistics & Availability Agent
Tool Module: Route Tools & Logistics Services (route_tools.py)
==============================================================================
Lecture Alignment:
- Lecture 05: Structured tool inputs/outputs, Tool schemas
- Lecture 07: Specialized agent, Clean service abstraction

Responsibility:
- Provide route summaries, transit modes, distance, and duration between locations
- Future-proofed with RouteService abstraction (can connect to Google Maps / OSRM)
- Distinguish prototype distance/duration estimates from live dynamic routing
==============================================================================
"""

import os
import json
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from langchain_core.tools import tool
from tools.transport_tools import DEFAULT_LOGISTICS_DATA_PATH


# ---------------------------------------------------------------------------
# Pydantic Schema for Route Tool
# ---------------------------------------------------------------------------
class RouteSearchInput(BaseModel):
    """Input schema for the search_transport_routes tool."""
    origin: str = Field(description="Origin city or location (e.g. 'Colombo', 'Kandy')")
    destination: str = Field(description="Destination city or location (e.g. 'Kandy', 'Ella', 'Galle')")


# ---------------------------------------------------------------------------
# Route Service Abstraction
# ---------------------------------------------------------------------------
class RouteService:
    """
    Abstract Route & Distance Service.
    Decouples route calculation logic from the agent.
    In prototype phase, extracts stored distances and estimated durations.
    Can be seamlessly swapped with Google Maps Directions API or OSRM in production.
    """

    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or DEFAULT_LOGISTICS_DATA_PATH
        self._routes_cache: Optional[List[Dict[str, Any]]] = None

    def _load_data(self) -> List[Dict[str, Any]]:
        if self._routes_cache is None:
            if not os.path.exists(self.data_path):
                raise FileNotFoundError(f"Routes file not found at: {self.data_path}")
            with open(self.data_path, "r", encoding="utf-8") as f:
                self._routes_cache = json.load(f)
        return self._routes_cache

    def find_routes(self, origin: str, destination: str) -> List[Dict[str, Any]]:
        """Return available route configurations between origin and destination."""
        routes = self._load_data()
        orig_clean = origin.strip().lower()
        dest_clean = destination.strip().lower()

        matches = []
        for r in routes:
            r_orig = r.get("origin", "").lower()
            r_dest = r.get("destination", "").lower()
            if (orig_clean in r_orig or r_orig in orig_clean) and (dest_clean in r_dest or r_dest in dest_clean):
                matches.append(r)
        return matches


# ---------------------------------------------------------------------------
# Route Tool Factory
# ---------------------------------------------------------------------------
def create_route_search_tool(service: Optional[RouteService] = None):
    """
    Factory function to create the search_transport_routes LangChain tool.
    """
    srv = service or RouteService()

    @tool(args_schema=RouteSearchInput)
    def search_transport_routes(origin: str, destination: str) -> str:
        """
        Search for practical transit routes, distances, and duration comparisons
        between two Sri Lankan locations across different modes (Train, Bus, Highway).

        Input: origin and destination names.
        Returns: Route summaries, distances, and durations from prototype knowledge base.
        """
        if not origin or not origin.strip() or not destination or not destination.strip():
            return "ERROR: Both origin and destination must be non-empty strings."

        records = srv.find_routes(origin, destination)
        if not records:
            return (
                f"NO_ROUTE_FOUND: No practical transit routes between '{origin}' and '{destination}' "
                f"were found in the prototype logistics knowledge base. The agent must clearly report this limitation."
            )

        summary_lines = [
            f"Found {len(records)} route option(s) connecting {origin} and {destination}:",
            "Notice: Sourced from prototype knowledge base; traffic and operational conditions may alter travel times."
        ]
        for idx, rec in enumerate(records, start=1):
            summary_lines.append(
                f"\nOption {idx}: [{rec.get('transport_type')}] {rec.get('route')}"
                f"\n  • Mode: {rec.get('transport_type')}"
                f"\n  • Identifier: {rec.get('bus_or_train_number')}"
                f"\n  • Approx Distance: {rec.get('estimated_distance_km')} km"
                f"\n  • Approx Travel Duration: {rec.get('estimated_duration')}"
                f"\n  • Departure Point: {rec.get('departure_location')}"
                f"\n  • Arrival Point: {rec.get('arrival_location')}"
                f"\n  • Timing Notes: {rec.get('timing_feasibility_notes')}"
                f"\n  • Source: {rec.get('source', 'prototype knowledge base')}"
            )

        return "\n".join(summary_lines)

    return search_transport_routes
