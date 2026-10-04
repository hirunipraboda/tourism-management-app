"""
==============================================================================
TourLink Smart Tourism Platform - Travel Logistics & Availability Agent
Tool Module: Availability & Timing Feasibility Tools (availability_tools.py)
==============================================================================
Lecture Alignment:
- Lecture 05: Tool calling, Guardrails against fabrication
- Lecture 07: Specialized agent, Safety bounds, Clean service abstraction

Responsibility:
- Handle availability-related inquiries for transit modes
- Distinguish between known prototype schedules, live data, and unverified data
- Search attraction opening/closing hours for timing feasibility analysis
- Clean service abstraction (AvailabilityService) for future live booking APIs
- Explicit booking boundary: never claim booking transactions were executed
==============================================================================
"""

import os
import json
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from langchain_core.tools import tool
from tools.transport_tools import DEFAULT_LOGISTICS_DATA_PATH


# ---------------------------------------------------------------------------
# Pydantic Schemas for Availability Tools
# ---------------------------------------------------------------------------
class TransportAvailabilityInput(BaseModel):
    """Input schema for checking transport availability."""
    origin: str = Field(description="Origin location (e.g. 'Kandy', 'Colombo')")
    destination: str = Field(description="Destination location (e.g. 'Ella', 'Galle')")
    transport_type: Optional[str] = Field(
        default=None,
        description="Optional transport mode, e.g. 'Train' or 'Bus'"
    )
    travel_date: Optional[str] = Field(
        default=None,
        description="Optional travel date or timeframe (e.g. 'tomorrow morning', '2026-03-25')"
    )


class AttractionHoursInput(BaseModel):
    """Input schema for checking attraction opening hours for timing feasibility."""
    attraction_name: str = Field(description="Name of the tourist attraction (e.g. 'Temple of the Tooth')")
    destination: Optional[str] = Field(
        default=None,
        description="Optional destination city (e.g. 'Kandy')"
    )


# ---------------------------------------------------------------------------
# Availability Service Abstraction
# ---------------------------------------------------------------------------
class AvailabilityService:
    """
    Abstract Service Interface for Availability and Feasibility Inquiries.
    Decouples prototype static checks from future live reservation systems.
    """

    def __init__(
        self,
        logistics_data_path: Optional[str] = None,
        tourism_data_path: Optional[str] = None
    ):
        self.logistics_data_path = logistics_data_path or DEFAULT_LOGISTICS_DATA_PATH
        self.tourism_data_path = tourism_data_path or os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "data",
            "tourism",
            "destinations.json"
        )
        self._routes_cache: Optional[List[Dict[str, Any]]] = None
        self._attractions_cache: Optional[List[Dict[str, Any]]] = None

    def _get_routes(self) -> List[Dict[str, Any]]:
        if self._routes_cache is None:
            if not os.path.exists(self.logistics_data_path):
                raise FileNotFoundError(f"Routes data not found: {self.logistics_data_path}")
            with open(self.logistics_data_path, "r", encoding="utf-8") as f:
                self._routes_cache = json.load(f)
        return self._routes_cache

    def _get_attractions(self) -> List[Dict[str, Any]]:
        if self._attractions_cache is None:
            if os.path.exists(self.tourism_data_path):
                with open(self.tourism_data_path, "r", encoding="utf-8") as f:
                    self._attractions_cache = json.load(f)
            else:
                self._attractions_cache = []
        return self._attractions_cache

    def check_availability(
        self,
        origin: str,
        destination: str,
        transport_type: Optional[str] = None,
        travel_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluate availability status from prototype data and identify what is verified vs unverified.
        """
        routes = self._get_routes()
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

        return {
            "matched_records": matched,
            "has_date_query": bool(travel_date and travel_date.strip()),
            "travel_date": travel_date,
            "is_live_connected": False  # Prototype flag
        }

    def check_attraction_timing(
        self,
        attraction_name: str,
        destination: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Find attraction opening hours for timing feasibility."""
        attractions = self._get_attractions()
        query_att = attraction_name.strip().lower()
        query_dest = destination.strip().lower() if destination else None

        matches = []
        for att in attractions:
            att_name = att.get("name", "").lower()
            att_dest = att.get("destination", "").lower()

            if query_att in att_name or att_name in query_att:
                if not query_dest or query_dest in att_dest or att_dest in query_dest:
                    matches.append(att)
        return matches


# ---------------------------------------------------------------------------
# Availability Tool Factory
# ---------------------------------------------------------------------------
def create_availability_tools(service: Optional[AvailabilityService] = None):
    """
    Factory function to create check_transport_availability and search_attraction_hours tools.
    """
    srv = service or AvailabilityService()

    @tool(args_schema=TransportAvailabilityInput)
    def check_transport_availability(
        origin: str,
        destination: str,
        transport_type: Optional[str] = None,
        travel_date: Optional[str] = None
    ) -> str:
        """
        Check transport availability between two locations.
        Reports scheduled service availability based on the prototype knowledge base.

        CRITICAL GUARDRAIL:
        - If the user asks for real-time, live, or date-specific availability (e.g. 'tomorrow morning'),
          the tool reports scheduled prototype service patterns and explicitly warns that LIVE
          seat availability cannot be verified because live external APIs are not currently connected.
        - Booking functionality is not connected; reservations cannot be executed.
        """
        if not origin or not origin.strip() or not destination or not destination.strip():
            return "ERROR: Both origin and destination are required to check availability."

        res = srv.check_availability(origin, destination, transport_type, travel_date)
        records = res["matched_records"]

        if not records:
            return (
                f"NO_AVAILABILITY_DATA: No transport availability data exists for routes from '{origin}' "
                f"to '{destination}' in the prototype knowledge base."
            )

        output_lines = [
            f"Availability status for {origin} to {destination} ({transport_type or 'All Modes'}):",
            "Data Source: Prototype knowledge base (Static schedule patterns)."
        ]

        # Explicit live-data guardrail
        if res["has_date_query"]:
            output_lines.append(
                f"\n⚠️ LIVE DATA LIMITATION: Real-time operational availability for specific dates/times "
                f"('{travel_date}') cannot be verified through this prototype. "
                f"Live reservation APIs are not connected. Do NOT confirm live seat availability."
            )

        output_lines.append("\nVerified Prototype Service Patterns:")
        for idx, rec in enumerate(records, start=1):
            output_lines.append(
                f"[{idx}] {rec.get('transport_type')} - {rec.get('service_name')}"
                f"\n  • Regular Status: {rec.get('availability_status')}"
                f"\n  • Typical Schedule: {rec.get('schedule_info')}"
                f"\n  • Booking Guidance: {rec.get('notes')}"
                f"\n  • Source: {rec.get('source')}"
            )

        output_lines.append(
            "\nNote: Booking is NOT currently supported. The system cannot reserve tickets."
        )

        return "\n".join(output_lines)

    @tool(args_schema=AttractionHoursInput)
    def search_attraction_hours(attraction_name: str, destination: Optional[str] = None) -> str:
        """
        Retrieve opening and closing hours for a tourist attraction to evaluate
        timing feasibility in travel logistics (e.g. checking if an attraction is open
        after travel from another city).

        Input: attraction_name and optional destination city.
        Returns: Verified opening hours, visit duration, and timing feasibility notes.
        """
        if not attraction_name or not attraction_name.strip():
            return "ERROR: Attraction name must be provided."

        matches = srv.check_attraction_timing(attraction_name, destination)
        if not matches:
            return (
                f"NO_TIMING_DATA: No opening hours found for '{attraction_name}' in the verified tourism dataset. "
                f"The agent must state that opening hours could not be verified."
            )

        output_lines = [f"Timing feasibility records for '{attraction_name}':"]
        for idx, item in enumerate(matches, start=1):
            output_lines.append(
                f"\n[{idx}] {item.get('name')} ({item.get('destination')})"
                f"\n  • Opening Hours: {item.get('opening_hours')}"
                f"\n  • Estimated Visit Duration: {item.get('estimated_duration_hours')}"
                f"\n  • Location: {item.get('location')}"
                f"\n  • Estimated Cost: {item.get('estimated_cost')}"
                f"\n  • Source: Verified tourism knowledge base"
            )

        return "\n".join(output_lines)

    return check_transport_availability, search_attraction_hours
