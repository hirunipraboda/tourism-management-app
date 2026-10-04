# Tools package
import sys
import types
import uuid

# Windows DLL Application Control policy compatibility fallback
try:
    import uuid_utils
except ImportError:
    u = types.ModuleType("uuid_utils")
    u.UUID = uuid.UUID
    uc = types.ModuleType("uuid_utils.compat")
    uc.uuid7 = uuid.uuid4
    sys.modules["uuid_utils"] = u
    sys.modules["uuid_utils.compat"] = uc

try:
    from sklearn.metrics.cluster import _expected_mutual_info_fast
except ImportError:
    m = types.ModuleType("sklearn.metrics.cluster._expected_mutual_info_fast")
    m.expected_mutual_information = lambda *a, **k: 0
    sys.modules["sklearn.metrics.cluster._expected_mutual_info_fast"] = m

from .tourism_search_tool import (
    TourismSearchInput,
    load_tourism_documents,
    build_tourism_vectorstore,
    create_tourism_search_tool
)
from .transport_tools import (
    LogisticsSearchInput,
    TransportScheduleInput,
    TransportService,
    load_logistics_documents,
    build_logistics_vectorstore,
    create_logistics_search_tool,
    create_transport_schedule_tool
)
from .route_tools import (
    RouteSearchInput,
    RouteService,
    create_route_search_tool
)
from .availability_tools import (
    TransportAvailabilityInput,
    AttractionHoursInput,
    AvailabilityService,
    create_availability_tools
)
from .review_tools import (
    ReviewSearchInput,
    SentimentAnalysisInput,
    ReviewSentimentResult,
    FeedbackThemeInput,
    clean_review_text,
    validate_review_record,
    load_review_documents,
    build_review_vectorstore,
    create_review_search_tool,
    analyze_review_sentiment,
    analyze_feedback_themes
)
from .recommendation_tools import (
    UserPreferences,
    Recommendation,
    RecommendationResult,
    calculate_suitability_score
)
from .planning_tools import (
    TripRequest,
    Activity,
    DayPlan,
    TravelItinerary,
    ValidationResult,
    parse_time_to_minutes,
    parse_time_window,
    validate_time_conflicts,
    validate_travel_time,
    validate_opening_hours,
    validate_budget,
    validate_completeness,
    validate_itinerary,
    delegate_destination_research,
    delegate_recommendation_analysis,
    delegate_logistics_research
)

__all__ = [
    "TourismSearchInput",
    "load_tourism_documents",
    "build_tourism_vectorstore",
    "create_tourism_search_tool",
    "LogisticsSearchInput",
    "TransportScheduleInput",
    "TransportService",
    "load_logistics_documents",
    "build_logistics_vectorstore",
    "create_logistics_search_tool",
    "create_transport_schedule_tool",
    "RouteSearchInput",
    "RouteService",
    "create_route_search_tool",
    "TransportAvailabilityInput",
    "AttractionHoursInput",
    "AvailabilityService",
    "create_availability_tools",
    "ReviewSearchInput",
    "SentimentAnalysisInput",
    "ReviewSentimentResult",
    "FeedbackThemeInput",
    "clean_review_text",
    "validate_review_record",
    "load_review_documents",
    "build_review_vectorstore",
    "create_review_search_tool",
    "analyze_review_sentiment",
    "analyze_feedback_themes",
    "UserPreferences",
    "Recommendation",
    "RecommendationResult",
    "calculate_suitability_score",
    "TripRequest",
    "Activity",
    "DayPlan",
    "TravelItinerary",
    "ValidationResult",
    "parse_time_to_minutes",
    "parse_time_window",
    "validate_time_conflicts",
    "validate_travel_time",
    "validate_opening_hours",
    "validate_budget",
    "validate_completeness",
    "validate_itinerary",
    "delegate_destination_research",
    "delegate_recommendation_analysis",
    "delegate_logistics_research"
]

