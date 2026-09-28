namespace Nova.Api.DTOs.TripPlanner;

public class TripBudgetInputDto
{
    public decimal Amount { get; set; } = 600.0m;
    public string Currency { get; set; } = "USD";
    public string? Category { get; set; } = "Moderate";
}

public class TripPlanningRequestDto
{
    public string Destination { get; set; } = string.Empty;
    public List<string>? Destinations { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public int Travelers { get; set; } = 2;
    public int? Adults { get; set; } = 2;
    public int? Children { get; set; } = 0;
    public TripBudgetInputDto? Budget { get; set; }
    public List<string>? TravelStyle { get; set; }
    public List<string>? Activities { get; set; }
    public string? AccommodationPreference { get; set; } = "3 Star";
    public string? TransportPreference { get; set; } = "Public Transport (Trains & Buses)";
    public string? SpecialRequirements { get; set; }
}

public class ItineraryActivityItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int DurationMinutes { get; set; } = 120;
    public decimal EstimatedCost { get; set; } = 0.0m;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = "Attraction";
    public string? TravelTimeToNext { get; set; }
    public string? Notes { get; set; }
    public string? ImageUrl { get; set; }
}

public class ItineraryDayItemDto
{
    public int Day { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<ItineraryActivityItemDto> Activities { get; set; } = [];
    public decimal EstimatedCost { get; set; } = 0.0m;
}

public class BudgetBreakdownDto
{
    public decimal Accommodation { get; set; }
    public decimal Transportation { get; set; }
    public decimal Activities { get; set; }
    public decimal Food { get; set; }
    public decimal Other { get; set; }
    public decimal Total { get; set; }
    public decimal Remaining { get; set; }
    public string Currency { get; set; } = "USD";
}

public class TripWarningDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = "general";
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class TripRecommendationDto
{
    public string Id { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class TripMetadataDto
{
    public string GeneratedAt { get; set; } = string.Empty;
    public string Agent { get; set; } = string.Empty;
    public double AiScore { get; set; } = 95.0;
}

public class TripDetailsDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Duration { get; set; }
    public List<string> Destinations { get; set; } = [];
    public int Travelers { get; set; }
    public string TransportPreference { get; set; } = string.Empty;
    public string AccommodationPreference { get; set; } = string.Empty;
}

public class TripPlanDto
{
    public TripDetailsDto Trip { get; set; } = new();
    public List<ItineraryDayItemDto> Days { get; set; } = [];
    public BudgetBreakdownDto Budget { get; set; } = new();
    public List<TripWarningDto> Warnings { get; set; } = [];
    public List<TripRecommendationDto> Recommendations { get; set; } = [];
    public TripMetadataDto Metadata { get; set; } = new();
}

public class SaveTripPlanRequestDto
{
    public TripPlanDto Plan { get; set; } = new();
    public TripPlanningRequestDto? RequestInput { get; set; }
}

public class RegenerateDayRequestDto
{
    public int DayNumber { get; set; }
    public string Location { get; set; } = string.Empty;
    public TripPlanningRequestDto? RequestInput { get; set; }
}

public class RegenerateActivityRequestDto
{
    public string ActivityId { get; set; } = string.Empty;
    public string CurrentTitle { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
}
