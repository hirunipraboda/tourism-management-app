namespace tourism_management_app.Api.DTOs
{
    /// <summary>Rich recommendation result returned by /personalized, /popular, and the agent.</summary>
    public class PersonalizedRecommendationDto
    {
        public int AttractionId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string ActivityType { get; set; } = "attraction";
        public string ImageUrl { get; set; } = string.Empty;
        public string Location { get; set; } = "Sri Lanka";
        public double AvgRating { get; set; }
        public int ReviewCount { get; set; }
        public double EstimatedCost { get; set; }
        public double DistanceKm { get; set; }

        /// <summary>Estimated cost in Sri Lankan Rupees (LKR).</summary>
        public int EstimatedCostLKR { get; set; }

        /// <summary>Estimated cost in USD.</summary>
        public double EstimatedCostUSD { get; set; }

        /// <summary>Interest match percentage (0-100).</summary>
        public double InterestMatchPercent { get; set; }

        /// <summary>Rating match percentage (0-100).</summary>
        public double RatingMatchPercent { get; set; }

        /// <summary>0-100 composite match score.</summary>
        public double MatchScore { get; set; }

        /// <summary>Short human-readable reasons this attraction was recommended.</summary>
        public List<string> MatchReasons { get; set; } = new();

        // Per-criterion scores (0-100) for the suitability breakdown
        public double InterestScore { get; set; }
        public double RatingScore { get; set; }
        public double BudgetScore { get; set; }
        public double DistanceScore { get; set; }
        public double PopularityScore { get; set; }
        public double HistoryAffinityScore { get; set; }

        public string Description { get; set; } = string.Empty;
        public string OpeningHours { get; set; } = "Open Daily";
        public string BestTimeToVisit { get; set; } = "Year-round";
        public string Duration { get; set; } = "2 - 4 hours";

        // Legacy compat fields expected by existing frontend mapper
        public int Id => AttractionId;
        public string Type => ActivityType;
        public double Rating => AvgRating;
        public double SuitabilityScore => MatchScore;
        public double PreferenceMatch => InterestScore;
        public double HistoricalRating => RatingScore;
        public double BudgetMatch => BudgetScore;
        public double LocationMatch => DistanceScore;
        public string Explanation => MatchReasons.FirstOrDefault() ?? "Recommended for you.";
    }
}
