using System.ComponentModel.DataAnnotations;

namespace tourism_management_app.Api.DTOs
{
    public class CreateRecommendationDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string DestinationName { get; set; } = "Sri Lanka";

        public string Category { get; set; } = "Nature"; // Culture, History, Nature, Adventure, Wildlife, Beaches, Food

        public string ActivityType { get; set; } = "attraction"; // "attraction" | "tour"

        public string? ImageUrl { get; set; }

        public double EstimatedCostUsd { get; set; } = 0;

        public double Latitude { get; set; } = 7.8731;

        public double Longitude { get; set; } = 80.7718;

        public string Description { get; set; } = string.Empty;

        public string OpeningHours { get; set; } = "Open Daily";

        public string BestTimeToVisit { get; set; } = "Year-round";

        public string Duration { get; set; } = "2 - 4 hours";

        public bool IsFeatured { get; set; } = true;

        public double InitialRating { get; set; } = 5.0;
    }
}
