namespace tourism_management_app.Api.DTOs
{
    public class AnalyticsDto
    {
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
        public double CustomerSatisfactionPercentage { get; set; }
        
        public IEnumerable<object> PopularAttractions { get; set; } = new List<object>();
        public IEnumerable<object> LowRatedAttractions { get; set; } = new List<object>();
        public IEnumerable<ReviewResponseDto> RecentReviews { get; set; } = new List<ReviewResponseDto>();
    }
}
