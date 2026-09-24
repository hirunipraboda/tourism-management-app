using System.ComponentModel.DataAnnotations;

namespace Nova.Api.DTOs.Transport;

public class PublicTransportSearchRequest
{
    [Required(ErrorMessage = "Origin is required.")]
    public string Origin { get; set; } = string.Empty;

    [Required(ErrorMessage = "Destination is required.")]
    public string Destination { get; set; } = string.Empty;

    [Required(ErrorMessage = "Travel date is required.")]
    public DateTime? Date { get; set; }

    public string? PreferredDepartureTime { get; set; }

    [Range(1, 100, ErrorMessage = "Number of travelers must be greater than zero.")]
    public int NumberOfTravelers { get; set; } = 1;

    public string TransportType { get; set; } = "PUBLIC_TRANSPORT";

    public string? TripId { get; set; }
    public string? ItineraryItemId { get; set; }
}

public class TransportOptionDto
{
    public string Id { get; set; } = string.Empty;
    public string TransportType { get; set; } = "BUS"; // BUS, TRAIN
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string TravelDate { get; set; } = string.Empty;
    public string DepartureTime { get; set; } = string.Empty;
    public string ArrivalTime { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }

    // Bus-specific
    public string? RouteNumber { get; set; }
    public string? RouteName { get; set; }
    public string? Direction { get; set; }
    public List<string> IntermediateStops { get; set; } = [];

    // Train-specific
    public string? TrainName { get; set; }
    public string? TrainNumber { get; set; }
    public string? DepartureStation { get; set; }
    public string? ArrivalStation { get; set; }
    public string? TrainType { get; set; }

    // Common
    public decimal? EstimatedFare { get; set; }
    public string Source { get; set; } = "Google";
    public DateTime RetrievedAt { get; set; }
    public bool IsSelected { get; set; }
}

public class PublicTransportResponse
{
    public string TransportType { get; set; } = "PUBLIC_TRANSPORT";
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string TravelDate { get; set; } = string.Empty;
    public List<TransportOptionDto> Buses { get; set; } = [];
    public List<TransportOptionDto> Trains { get; set; } = [];
    public int TotalOptions => Buses.Count + Trains.Count;
}

public class BusTransportResponse
{
    public string TransportType { get; set; } = "BUS";
    public List<TransportOptionDto> Options { get; set; } = [];
}

public class TrainTransportResponse
{
    public string TransportType { get; set; } = "TRAIN";
    public List<TransportOptionDto> Options { get; set; } = [];
}

public class SelectTransportRequest
{
    public string? TransportOptionId { get; set; }
    public string? TransportType { get; set; }
    public string? Origin { get; set; }
    public string? Destination { get; set; }
    public DateTime? TravelDate { get; set; }
    public string? DepartureTime { get; set; }
    public string? ArrivalTime { get; set; }
    public int? DurationMinutes { get; set; }
    public string? RouteNumber { get; set; }
    public string? RouteName { get; set; }
    public string? Direction { get; set; }
    public List<string>? IntermediateStops { get; set; }
    public string? TrainName { get; set; }
    public string? TrainNumber { get; set; }
    public string? DepartureStation { get; set; }
    public string? ArrivalStation { get; set; }
    public string? TrainType { get; set; }
    public decimal? EstimatedFare { get; set; }
    public string? Source { get; set; }
}

public class SelectedTransportResponse
{
    public string ItineraryItemId { get; set; } = string.Empty;
    public string? TripId { get; set; }
    public TransportOptionDto TransportOption { get; set; } = new();
    public DateTime SelectedAt { get; set; } = DateTime.UtcNow;
}
