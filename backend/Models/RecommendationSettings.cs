using System;
using System.ComponentModel.DataAnnotations;

namespace tourism_management_app.Api.Models
{
    /// <summary>
    /// Single-row configuration table storing the active recommendation scoring weights
    /// and ranking thresholds for the tourist recommendation engine.
    /// All 6 weights are percentages (0-100) and must sum to exactly 100.
    /// </summary>
    public class RecommendationSettings
    {
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
        public decimal CalculateTotalWeight() =>
            InterestWeight + RatingWeight + BudgetWeight + DistanceWeight + PopularityWeight + HistoryWeight;
    }
}
