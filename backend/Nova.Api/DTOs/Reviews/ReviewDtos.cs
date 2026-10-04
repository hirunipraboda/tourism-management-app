using System.ComponentModel.DataAnnotations;

namespace Nova.Api.DTOs.Reviews;

// ── Review CRUD DTOs ──────────────────────────────────────────────────────────

public class ReviewCreateDto
{
    [Required]
    public int EntityId { get; set; }

    public string EntityName { get; set; } = string.Empty;

    [Required]
    public string EntityType { get; set; } = string.Empty; // "Destination", "Attraction", "TourPackage"

    [Required]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
    public int Rating { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Comment { get; set; } = string.Empty;
}

public class ReviewUpdateDto
{
    [Range(1, 5)]
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
}

public class ReviewStatusUpdateDto
{
    public string? Status { get; set; }
    public string? OperatorNotes { get; set; }
}

public class ReviewReplyDto
{
    public string Reply { get; set; } = string.Empty;
}

public class ReviewSummaryDto
{
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public Dictionary<int, int> RatingDistribution { get; set; } = new();
}

public class ReviewResponseDto
{
    public int Id { get; set; }
    public string TouristId { get; set; } = string.Empty;  // string UserId in main system
    public string TouristName { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = "Published";
    public string? OperatorNotes { get; set; }
    public int HelpfulCount { get; set; }
    public bool IsHelpfulByUser { get; set; }
}

// ── Analytics DTO ─────────────────────────────────────────────────────────────

public class AnalyticsDto
{
    public int TotalReviews { get; set; }
    public double AverageRating { get; set; }
    public int FlaggedCount { get; set; }
    public int PendingCount { get; set; }
    public double PositivePercentage { get; set; }
    public List<CategoryRatingSummary> ByCategory { get; set; } = new();
}

public class CategoryRatingSummary
{
    public string Category { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int Count { get; set; }
}
