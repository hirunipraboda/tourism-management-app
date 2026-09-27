using System;
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

        public string? Description { get; set; }

        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(100)]
        public string? OpeningHours { get; set; }

        public decimal? EntryFee { get; set; } = 0.0m;

        public int? VisitDurationMinutes { get; set; } = 60;

        public bool IsAccessible { get; set; } = true;

        public bool IsAvailable { get; set; } = true;

        public string? ImageUrl { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}