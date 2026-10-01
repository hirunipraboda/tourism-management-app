namespace tourism_management_app.Api.DTOs
{
    public class RecommendationDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "Attraction", "TourPackage"
        public double SuitabilityScore { get; set; }
        public string Location { get; set; } = "Sri Lanka";
        public string Category { get; set; } = "Attraction";
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public string Price { get; set; } = "Contact for pricing";
        public string Description { get; set; } = string.Empty;
        public string Explanation { get; set; } = string.Empty;
        public double PreferenceMatch { get; set; }
        public double HistoricalRating { get; set; }
        public double BudgetMatch { get; set; }
        public double LocationMatch { get; set; }
        public double PopularityScore { get; set; }
    }
}
