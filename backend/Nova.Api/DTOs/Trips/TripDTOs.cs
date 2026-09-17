using System.ComponentModel.DataAnnotations;
using Nova.Api.Entities;

namespace Nova.Api.DTOs.Trips;

public class CreateTripRequest
{
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
}

public class UpdateTripRequest
{
    public string? Destination { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? NumberOfTravelers { get; set; }
    public decimal? Budget { get; set; }
    public List<string>? Interests { get; set; }
    public string? TripStyle { get; set; }
    public TripStatus? Status { get; set; }
}

public class TripResponse
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
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
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int ItinerariesCount { get; set; }
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
