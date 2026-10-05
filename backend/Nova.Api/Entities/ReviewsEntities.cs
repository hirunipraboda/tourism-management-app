using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nova.Api.Entities;

// ────────────────────────────────────────────────────────────────────────────
// Reviews & Recommendations Enhanced Entities
// ────────────────────────────────────────────────────────────────────

[Table("reviews")]
public class Review
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string? DestinationId { get; set; }
    [ForeignKey(nameof(DestinationId))]
    public Destination? Destination { get; set; }

    public string Comment { get; set; } = string.Empty;
    public int Rating { get; set; } = 5;
    public ReviewStatus Status { get; set; } = ReviewStatus.Approved;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<ReviewHelpfulVote> HelpfulVotes { get; set; } = [];
}

[Table("review_helpful_votes")]
public class ReviewHelpfulVote
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string ReviewId { get; set; } = string.Empty;
    [ForeignKey(nameof(ReviewId))]
    public Review? Review { get; set; }

    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum ReviewStatus
{
    Pending,
    Approved,
    Flagged
}

[Table("recommendation_settings")]
public class RecommendationSettings
{
    [Key]
    public int Id { get; set; } = 1;

    [Range(0, 100)]
    public decimal InterestWeight { get; set; } = 30m;

    [Range(0, 100)]
    public decimal RatingWeight { get; set; } = 25m;

    [Range(0, 100)]
    public decimal BudgetWeight { get; set; } = 15m;

    [Range(0, 100)]
    public decimal DistanceWeight { get; set; } = 15m;

    [Range(0, 100)]
    public decimal PopularityWeight { get; set; } = 10m;

    [Range(0, 100)]
    public decimal HistoryWeight { get; set; } = 5m;

    [Range(0, 100)]
    public int MinReviewCountToRank { get; set; } = 0;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    public string UpdatedBy { get; set; } = "System";

    /// <summary>Calculates the sum of all 6 weights.</summary>
    [NotMapped]
    public decimal TotalWeight =>
        InterestWeight + RatingWeight + BudgetWeight + DistanceWeight + PopularityWeight + HistoryWeight;
}
