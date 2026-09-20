using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nova.Api.Models
{
    public class Attraction
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid DestinationId { get; set; }

        [ForeignKey(nameof(DestinationId))]
        public Destination? Destination { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        public string? OpeningHours { get; set; }

        public decimal? EntryFee { get; set; }

        public int? VisitDurationMinutes { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public bool IsAccessible { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}