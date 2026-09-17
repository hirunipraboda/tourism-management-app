using System.ComponentModel.DataAnnotations;

namespace Nova.Api.DTOs.AgenticAI;

public class GenerateItineraryRequest
{
    public string? Destination { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? Travelers { get; set; }
    public decimal? TotalBudget { get; set; }
    public List<string>? Interests { get; set; }
    public string? PreferredTripStyle { get; set; } // relaxed, active, luxury, budget
    public int MaxDailyTravelHours { get; set; } = 3;
    public int MaxActivitiesPerDay { get; set; } = 4;
    public int PreferredActivityDurationMinutes { get; set; } = 120;
    public bool EnforceOpeningHours { get; set; } = true;
}

public class StructuredObjectiveDto
{
    public string TripId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int Travelers { get; set; }
    public int DurationDays { get; set; } = 1;
    public decimal Budget { get; set; }
    public string TripStyle { get; set; } = "standard";
    public List<string> Interests { get; set; } = [];
    public Dictionary<string, object> Preferences { get; set; } = [];
    public Dictionary<string, object> Constraints { get; set; } = [];
}

public class ValidationErrorDto
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Field { get; set; }
}

public class ValidationResultResponse
{
    public bool IsValid { get; set; }
    public double FeasibilityScore { get; set; } = 100.0;
    public List<ValidationErrorDto> Errors { get; set; } = [];
    public List<string> Advisories { get; set; } = [];
}

public class WorkflowAuditLogResponse
{
    public string Id { get; set; } = string.Empty;
    public string WorkflowId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Actor { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
}

public class WorkflowStatusResponse
{
    public string WorkflowId { get; set; } = string.Empty;
    public string TripId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CurrentStep { get; set; } = string.Empty;
    public string? GeneratedItineraryId { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<WorkflowAuditLogResponse> Logs { get; set; } = [];
}

public class GenerateItineraryResponse
{
    public string WorkflowId { get; set; } = string.Empty;
    public string TripId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CurrentStep { get; set; } = string.Empty;
    public string? ItineraryId { get; set; }
    public ValidationResultResponse ValidationResult { get; set; } = new();
    public string Message { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
