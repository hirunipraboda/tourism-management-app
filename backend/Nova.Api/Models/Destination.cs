using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Nova.Api.Models
{
    public class Destination
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Country { get; set; } = "Sri Lanka";

        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(100)]
        public string? Category { get; set; } = "Cultural";

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsAccessible { get; set; } = true;

        public bool IsAvailable { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Attraction> Attractions { get; set; } = new List<Attraction>();
    }
}