namespace tourism_management_app.Api.DTOs
{
    public class RecommendationDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "Attraction", "TourPackage"
        public double SuitabilityScore { get; set; }
    }
}
