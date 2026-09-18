namespace tourism_management_app.Api.DTOs
{
    public class ReviewSummaryDto
    {
        public int EntityId { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new();
    }
}
