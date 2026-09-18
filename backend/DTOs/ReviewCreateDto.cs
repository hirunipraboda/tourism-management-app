using System.ComponentModel.DataAnnotations;

namespace tourism_management_app.Api.DTOs
{
    public class ReviewCreateDto
    {
        [Required]
        public int EntityId { get; set; }

        [Required]
        public string EntityType { get; set; } = string.Empty;

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;
    }
}
