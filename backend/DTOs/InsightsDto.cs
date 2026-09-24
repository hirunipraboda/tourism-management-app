namespace tourism_management_app.Api.DTOs
{
    public class InsightsDto
    {
        public string TopRecommendedAttraction { get; set; } = string.Empty;
        public string MostPopularCategory { get; set; } = string.Empty;
        public string TrendingDestination { get; set; } = string.Empty;
        public double AverageRecommendationMatch { get; set; }

        public List<ActivityInsightItem> MostPopularActivities { get; set; } = new();
        public List<AttractionInsightItem> HighestRatedAttractions { get; set; } = new();
        public List<CategoryInsightItem> FrequentlySelectedCategories { get; set; } = new();
        public List<SuitabilityScoreItem> AverageSuitabilityScores { get; set; } = new();
    }

    public class ActivityInsightItem
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Category { get; set; } = string.Empty;
    }

    public class AttractionInsightItem
    {
        public string Name { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int Reviews { get; set; }
        public string Badge { get; set; } = string.Empty;
    }

    public class CategoryInsightItem
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class SuitabilityScoreItem
    {
        public string Category { get; set; } = string.Empty;
        public double Score { get; set; }
    }
}
