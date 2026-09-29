using System.ComponentModel.DataAnnotations;
using Nova.Api.Entities;

namespace Nova.Api.DTOs.Trips;

public class CreateTripRequest
{
    public string? TripName { get; set; }

    [Required(ErrorMessage = "Destination is required.")]
    public string Destination { get; set; } = string.Empty;

    public string? DestinationId { get; set; }

    [Required(ErrorMessage = "Start date is required.")]
    public DateTime StartDate { get; set; }

    [Required(ErrorMessage = "End date is required.")]
    public DateTime EndDate { get; set; }

    [Range(1, 100, ErrorMessage = "Number of travelers must be greater than zero.")]
    public int NumberOfTravelers { get; set; } = 1;

    [Range(0.01, 1000000.00, ErrorMessage = "Budget must be greater than zero.")]
    public decimal Budget { get; set; }

    public List<string> Interests { get; set; } = [];

    public string TripStyle { get; set; } = "standard";

    public string CreatedSource { get; set; } = "USER";
}

public class UpdateTripRequest
{
    public string? TripName { get; set; }
    public string? Destination { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? NumberOfTravelers { get; set; }
    public decimal? Budget { get; set; }
    public List<string>? Interests { get; set; }
    public string? TripStyle { get; set; }
    public TripStatus? Status { get; set; }
    public string? CreatedSource { get; set; }
}

public class TripResponse
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? TripName { get; set; }
    public string Destination { get; set; } = string.Empty;
    public string? DestinationId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DurationDays => Math.Max(1, (int)Math.Ceiling((EndDate - StartDate).TotalDays));
    public int NumberOfTravelers { get; set; }
    public decimal Budget { get; set; }
    public List<string> Interests { get; set; } = [];
    public string TripStyle { get; set; } = "standard";
    public string Status { get; set; } = string.Empty;
    public string CalculatedStatus { get; set; } = string.Empty;
    public string TimelineLabel { get; set; } = string.Empty;
    public string CreatedSource { get; set; } = "USER";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int ItinerariesCount { get; set; }
    public List<ItineraryResponseDto> Itineraries { get; set; } = [];
    public List<BookingSummaryDto> Bookings { get; set; } = [];
}

public class ItineraryResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string TripId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft";
    public double FeasibilityScore { get; set; }
    public decimal TotalEstimatedCost { get; set; }
    public string CreatedSource { get; set; } = "AI";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ItineraryDayResponseDto> Days { get; set; } = [];
}

public class ItineraryDayResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string ItineraryId { get; set; } = string.Empty;
    public int DayNumber { get; set; }
    public DateTime Date { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = "Upcoming";
    public List<ItineraryItemResponseDto> Items { get; set; } = [];
}

public class ItineraryItemResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string ItineraryDayId { get; set; } = string.Empty;
    public int SequenceOrder { get; set; }
    public string ActivityName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal EstimatedCost { get; set; }
    public int TravelTimeMinutes { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Upcoming";
}

public class BookingSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? TripId { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime BookingDate { get; set; }
}

public class TripFilterParameters
{
    public string? Status { get; set; }
    public string? Destination { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

