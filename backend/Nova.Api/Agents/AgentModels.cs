namespace Nova.Api.Agents;

public class TripPlanningRequest
{
    public string? Destination { get; set; }
    public List<string> Destinations { get; set; } = [];
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public int Travelers { get; set; } = 2;
    public PlanBudget Budget { get; set; } = new();
    public List<string> Interests { get; set; } = [];
    public List<string> TravelStyle { get; set; } = [];
    public List<string> Activities { get; set; } = [];
    public string? TransportPreference { get; set; }
    public string? AccommodationPreference { get; set; }
}

public class PlanBudget
{
    public double Amount { get; set; } = 600.0;
    public string Currency { get; set; } = "USD";
}

public class DestinationResearchRequest
{
    public List<string> TargetDestinations { get; set; } = [];
    public List<string> Interests { get; set; } = [];
    public List<string> TravelStyle { get; set; } = [];
}

public class DestinationResearchInfo
{
    public string Name { get; set; } = string.Empty;
    public List<string> TopAttractions { get; set; } = [];
    public string BestTimeToVisit { get; set; } = string.Empty;
    public string Highlights { get; set; } = string.Empty;
}

public class DestinationResearchResult
{
    public List<DestinationResearchInfo> DestinationsInfo { get; set; } = [];
}

public class RouteOptimizationRequest
{
    public List<string> Destinations { get; set; } = [];
    public int DurationDays { get; set; } = 1;
}

public class RouteOptimizationResult
{
    public List<string> OrderedDestinations { get; set; } = [];
    public double EstimatedTotalTravelDistanceKm { get; set; } = 0;
    public string RecommendedTransport { get; set; } = string.Empty;
}

public class ItineraryValidationRequest
{
    public List<ItineraryDayItem> Days { get; set; } = [];
    public double BudgetAmount { get; set; }
}

public class TripWarning
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Type { get; set; } = "info";
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class TripRecommendation
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Category { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class ItineraryValidationResult
{
    public bool IsValid { get; set; }
    public double Score { get; set; }
    public List<TripWarning> Warnings { get; set; } = [];
}

public class ItineraryActivityItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Time { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public double EstimatedCost { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = "Activity";
    public string? TravelTimeToNext { get; set; }
}

public class ItineraryDayItem
{
    public int Day { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<ItineraryActivityItem> Activities { get; set; } = [];
    public double EstimatedCost { get; set; }
}

public class BudgetBreakdown
{
    public double Accommodation { get; set; }
    public double Transportation { get; set; }
    public double Activities { get; set; }
    public double Food { get; set; }
    public double Other { get; set; }
    public double Total { get; set; }
    public double Remaining { get; set; }
    public string Currency { get; set; } = "USD";
}

public class TripSummary
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Duration { get; set; }
    public List<string> Destinations { get; set; } = [];
    public int Travelers { get; set; }
    public string TransportPreference { get; set; } = "AI Recommended";
    public string AccommodationPreference { get; set; } = "3 Star";
}

public class TripPlanResult
{
    public TripSummary Trip { get; set; } = new();
    public List<ItineraryDayItem> Days { get; set; } = [];
    public BudgetBreakdown Budget { get; set; } = new();
    public List<TripWarning> Warnings { get; set; } = [];
    public List<TripRecommendation> Recommendations { get; set; } = [];
    public Dictionary<string, object> Metadata { get; set; } = [];
}
