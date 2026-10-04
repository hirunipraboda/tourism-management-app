using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nova.Api.Entities;

// ────────────────────────────────────────────────────────────────────────────
// Reviews & Recommendations Enhanced Entities
// Merged from: tourism-management-app-Reviews-and-Recommendation-Management
// ────────────────────────────────────────────────────────────────────────────

[Table("review_helpful_votes")]
public class ReviewHelpfulVote
{
    public string ReviewId { get; set; } = string.Empty;
    [ForeignKey(nameof(ReviewId))]
    public Review? Review { get; set; }

    // Tourist represented by UserId string in main system
    public string TouristId { get; set; } = string.Empty;
    [ForeignKey(nameof(TouristId))]
    public User? Tourist { get; set; }
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

    [Range(0, 1000)]
    public int MinReviewCountToRank { get; set; } = 0;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    public string UpdatedBy { get; set; } = "System";

    /// <summary>Calculates the sum of all 6 weights.</summary>
    [NotMapped]
    public decimal TotalWeight =>
        InterestWeight + RatingWeight + BudgetWeight + DistanceWeight + PopularityWeight + HistoryWeight;
}
