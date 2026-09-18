namespace tourism_management_app.Api.DTOs
{
    public class ReviewResponseDto
    {
        public int Id { get; set; }
        public int TouristId { get; set; }
        public string TouristName { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
