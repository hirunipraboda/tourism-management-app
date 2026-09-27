using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nova.Api.Entities;

[Table("users")]
public class User
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Tourist;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<Trip> Trips { get; set; } = [];
}

[Table("destinations")]
public class Destination
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public double Rating { get; set; } = 4.5;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Activity> Activities { get; set; } = [];
}

[Table("activities")]
public class Activity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string DestinationId { get; set; } = string.Empty;
    [ForeignKey(nameof(DestinationId))]
    public Destination? Destination { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "culture"; // culture, nature, wildlife, adventure, beach
    public decimal CostPerPerson { get; set; } = 0.0m;
    public int DurationMinutes { get; set; } = 120;
    public TimeSpan OpeningTime { get; set; } = new TimeSpan(8, 0, 0);
    public TimeSpan ClosingTime { get; set; } = new TimeSpan(18, 0, 0);
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ImageUrl { get; set; }
}

[Table("trips")]
public class Trip
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string Destination { get; set; } = string.Empty;
    public string? DestinationId { get; set; }
    [ForeignKey(nameof(DestinationId))]
    public Destination? DestinationEntity { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int NumberOfTravelers { get; set; } = 1;
    public decimal Budget { get; set; } = 0.0m;
    public List<string> Interests { get; set; } = [];
    public string TripStyle { get; set; } = "standard"; // relaxed, active, luxury, budget, standard
    public TripStatus Status { get; set; } = TripStatus.Draft;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<Itinerary> Itineraries { get; set; } = [];
    public List<ItineraryGenerationWorkflow> Workflows { get; set; } = [];
    public List<TransportOption> TransportOptions { get; set; } = [];
}

[Table("itineraries")]
public class Itinerary
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string TripId { get; set; } = string.Empty;
    [ForeignKey(nameof(TripId))]
    public Trip? Trip { get; set; }

    public string Title { get; set; } = string.Empty;
    public ItineraryStatus Status { get; set; } = ItineraryStatus.Draft;
    public decimal TotalEstimatedCost { get; set; } = 0.0m;
    public double FeasibilityScore { get; set; } = 95.0;

    public string? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovalComments { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<ItineraryDay> Days { get; set; } = [];
    public List<ItineraryApproval> Approvals { get; set; } = [];
}

[Table("itinerary_days")]
public class ItineraryDay
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string ItineraryId { get; set; } = string.Empty;
    [ForeignKey(nameof(ItineraryId))]
    public Itinerary? Itinerary { get; set; }

    public DateTime Date { get; set; }
    public int DayNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;

    public List<ItineraryItem> Items { get; set; } = [];
}

[Table("itinerary_items")]
public class ItineraryItem
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string ItineraryDayId { get; set; } = string.Empty;
    [ForeignKey(nameof(ItineraryDayId))]
    public ItineraryDay? ItineraryDay { get; set; }

    public string? ActivityId { get; set; }
    [ForeignKey(nameof(ActivityId))]
    public Activity? Activity { get; set; }

    public string ActivityName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int DurationMinutes { get; set; }
    public decimal EstimatedCost { get; set; } = 0.0m;
    public int TravelTimeMinutes { get; set; } = 0;
    public string? Notes { get; set; }
    public int SequenceOrder { get; set; } = 1;

    public TransportOption? SelectedTransport { get; set; }
}

[Table("itinerary_generation_workflows")]
public class ItineraryGenerationWorkflow
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string TripId { get; set; } = string.Empty;
    [ForeignKey(nameof(TripId))]
    public Trip? Trip { get; set; }

    public WorkflowStatus Status { get; set; } = WorkflowStatus.Pending;
    public string CurrentStep { get; set; } = "Initialized";
    public string ConstraintsJson { get; set; } = "{}";
    public string? ErrorMessage { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<WorkflowAuditLog> AuditLogs { get; set; } = [];
}

[Table("workflow_audit_logs")]
public class WorkflowAuditLog
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string WorkflowId { get; set; } = string.Empty;
    [ForeignKey(nameof(WorkflowId))]
    public ItineraryGenerationWorkflow? Workflow { get; set; }

    public string Action { get; set; } = string.Empty;
    public string Actor { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty; // JSON structured metadata
}

[Table("itinerary_approvals")]
public class ItineraryApproval
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string ItineraryId { get; set; } = string.Empty;
    [ForeignKey(nameof(ItineraryId))]
    public Itinerary? Itinerary { get; set; }

    public string ApprovedByUserId { get; set; } = string.Empty;
    public ApprovalAction Action { get; set; } = ApprovalAction.Approved;
    public ItineraryStatus PreviousStatus { get; set; }
    public ItineraryStatus NewStatus { get; set; }
    public string Comments { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

[Table("transport_options")]
public class TransportOption
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string? TripId { get; set; }
    [ForeignKey(nameof(TripId))]
    public Trip? Trip { get; set; }

    public string? ItineraryItemId { get; set; }
    [ForeignKey(nameof(ItineraryItemId))]
    public ItineraryItem? ItineraryItem { get; set; }

    public string TransportType { get; set; } = "BUS"; // BUS, TRAIN, PICKME, PUBLIC_TRANSPORT

    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime TravelDate { get; set; }
    public string DepartureTime { get; set; } = string.Empty;
    public string ArrivalTime { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }

    // Bus-specific fields
    public string? RouteNumber { get; set; }
    public string? RouteName { get; set; }
    public string? Direction { get; set; }
    public List<string> IntermediateStops { get; set; } = [];

    // Train-specific fields
    public string? TrainName { get; set; }
    public string? TrainNumber { get; set; }
    public string? DepartureStation { get; set; }
    public string? ArrivalStation { get; set; }
    public string? TrainType { get; set; }

    // Common fare, source, metadata
    public decimal? EstimatedFare { get; set; }
    public string Source { get; set; } = "Google";
    public DateTime RetrievedAt { get; set; } = DateTime.UtcNow;
    public bool IsSelected { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
