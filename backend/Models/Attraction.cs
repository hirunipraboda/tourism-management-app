namespace tourism_management_app.Api.Models
{
    public class Attraction
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DestinationId { get; set; }
        public Destination? Destination { get; set; }

        // Enriched fields for recommendations
        public string Category { get; set; } = "Attraction"; // Culture, History, Nature, Adventure, Food, Wildlife, Beaches
        public string ActivityType { get; set; } = "attraction"; // "attraction" | "tour"
        public string ImageUrl { get; set; } = string.Empty;
        public double EstimatedCostUsd { get; set; } = 0;
        public double Latitude { get; set; } = 7.8731;  // default: Sri Lanka center
        public double Longitude { get; set; } = 80.7718;
        public string Description { get; set; } = string.Empty;
        public string OpeningHours { get; set; } = "Open Daily";
        public string BestTimeToVisit { get; set; } = "Year-round";
        public string Duration { get; set; } = "2 - 4 hours";

        // Recommendation Management Flags
        public bool IsFeatured { get; set; } = false;
        public bool IsExcludedFromRecommendations { get; set; } = false;
        public DateTime? FeaturedUntil { get; set; }
    }
}
