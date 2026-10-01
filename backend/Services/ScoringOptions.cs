namespace tourism_management_app.Api.Services
{
    public class ScoringOptions
    {
        public const string Section = "RecommendationScoring";

        public double InterestWeight { get; set; } = 0.30;
        public double RatingWeight { get; set; } = 0.25;
        public double BudgetWeight { get; set; } = 0.15;
        public double DistanceWeight { get; set; } = 0.15;
        public double PopularityWeight { get; set; } = 0.10;
        public double HistoryAffinityWeight { get; set; } = 0.05;

        public double BayesianPriorCount { get; set; } = 10;
        public double BayesianGlobalMean { get; set; } = 3.5;

        public int PopularCacheMinutes { get; set; } = 5;
        public int InsightsCacheMinutes { get; set; } = 5;
    }
}
