using System.ComponentModel.DataAnnotations;

namespace tourism_management_app.Api.Models
{
    public class Review
    {
        public int Id { get; set; }

        public int TouristId { get; set; }
        public Tourist? Tourist { get; set; }

        public int EntityId { get; set; }
        public string EntityType { get; set; } = string.Empty; // "Destination", "Attraction", "TourPackage"

        [Range(1, 5)]
        public int Rating { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        public int HelpfulCount { get; set; }
        public string Status { get; set; } = "Published"; // "Published", "Pending", "Flagged", "Archived"
        public string? OperatorNotes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
