using System.ComponentModel.DataAnnotations;

namespace tourism_management_app.Api.DTOs
{
    public class ReviewCreateDto
    {
        [Required]
        public int EntityId { get; set; }

        public string EntityName { get; set; } = string.Empty;

        [Required]
        public string EntityType { get; set; } = string.Empty;

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Comment { get; set; } = string.Empty;
    }
}
