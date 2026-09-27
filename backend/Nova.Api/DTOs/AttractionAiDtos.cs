using System;
using System.Collections.Generic;

namespace Nova.Api.DTOs
{
    public class UserPreferencesDto
    {
        public double UserBudget { get; set; } = 100.0;
        public double MaxDurationHours { get; set; } = 8.0;
        public List<string> Categories { get; set; } = new List<string> { "Cultural", "Historical", "Scenic" };
        public bool RequireAccessible { get; set; } = true;
        public string? Notes { get; set; } = string.Empty;
    }

    public class CurateAttractionsRequestDto
    {
        public string? ThreadId { get; set; }
        public Guid DestinationId { get; set; }
        public string DestinationName { get; set; } = string.Empty;
        public UserPreferencesDto Preferences { get; set; } = new UserPreferencesDto();
    }

    public class HumanApprovalRequestDto
    {
        public string ThreadId { get; set; } = string.Empty;
        public string Decision { get; set; } = "APPROVE"; // APPROVE, REJECT, or REVISE
        public string? Feedback { get; set; }
    }

    public class CuratedAttractionDto
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? OpeningHours { get; set; }
        public decimal? EntryFee { get; set; }
        public int? VisitDurationMinutes { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsAccessible { get; set; } = true;
        public string? Rationale { get; set; }
        public string? ScheduledTime { get; set; }
    }

    public class ValidationResultDto
    {
        public bool IsValid { get; set; }
        public bool BudgetPass { get; set; }
        public bool DurationPass { get; set; }
        public bool AccessibilityPass { get; set; }
        public List<string> CheckedRules { get; set; } = new List<string>();
        public List<string> ErrorMessages { get; set; } = new List<string>();
    }

    public class ReasoningLogEntryDto
    {
        public string Step { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string OutputSummary { get; set; } = string.Empty;
    }

    public class AttractionAiStateDto
    {
        public string ThreadId { get; set; } = string.Empty;
        public string DestinationId { get; set; } = string.Empty;
        public string DestinationName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int IterationCount { get; set; }
        public List<CuratedAttractionDto> CuratedPlan { get; set; } = new List<CuratedAttractionDto>();
        public ValidationResultDto ValidationResult { get; set; } = new ValidationResultDto();
        public List<ReasoningLogEntryDto> ReasoningLog { get; set; } = new List<ReasoningLogEntryDto>();
        public string? HumanDecision { get; set; }
        public string? HumanFeedback { get; set; }
    }
}
