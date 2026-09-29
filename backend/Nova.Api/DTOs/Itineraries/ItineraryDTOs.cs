using System.ComponentModel.DataAnnotations;
using Nova.Api.Entities;

namespace Nova.Api.DTOs.Itineraries;

public class CreateItineraryRequest
{
    public string Title { get; set; } = "Custom Itinerary";
    public List<CreateItineraryDayRequest> Days { get; set; } = [];
}

public class CreateItineraryDayRequest
{
    [Required]
    public DateTime Date { get; set; }
    public int DayNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public List<CreateItineraryItemRequest> Items { get; set; } = [];
}

public class CreateItineraryItemRequest
{
    public string? ActivityId { get; set; }
    [Required]
    public string ActivityName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string StartTime { get; set; } = "09:00";
    public string EndTime { get; set; } = "11:00";
    public int DurationMinutes { get; set; } = 120;
    public decimal EstimatedCost { get; set; } = 0.0m;
    public int TravelTimeMinutes { get; set; } = 0;
    public string? Notes { get; set; }
    public int SequenceOrder { get; set; } = 1;
}

public class UpdateItineraryItemRequest
{
    public string? ActivityName { get; set; }
    public string? Location { get; set; }
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public int? DurationMinutes { get; set; }
    public decimal? EstimatedCost { get; set; }
    public int? TravelTimeMinutes { get; set; }
    public string? Notes { get; set; }
    public int? SequenceOrder { get; set; }
}

public class ItineraryItemResponse
{
    public string Id { get; set; } = string.Empty;
    public string? ActivityId { get; set; }
    public string ActivityName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal EstimatedCost { get; set; }
    public int TravelTimeMinutes { get; set; }
    public string? Notes { get; set; }
    public int SequenceOrder { get; set; }
}

public class ItineraryDayResponse
{
    public string Id { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int DayNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal DayCost => Items.Sum(i => i.EstimatedCost);
    public int TotalTravelMinutes => Items.Sum(i => i.TravelTimeMinutes);
    public List<ItineraryItemResponse> Items { get; set; } = [];
}

public class ItineraryResponse
{
    public string Id { get; set; } = string.Empty;
    public string TripId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalEstimatedCost { get; set; }
    public double FeasibilityScore { get; set; }
    public string? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovalComments { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ItineraryDayResponse> Days { get; set; } = [];
}

public class ApprovalRequest
{
    public string Comments { get; set; } = string.Empty;
}

public class ApprovalResponse
{
    public string ItineraryId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
