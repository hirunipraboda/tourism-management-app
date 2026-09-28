using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartTourism.API.Domain.Entities
{
    public class TourPackage
    {
        [Key]
        public int TourPackageId { get; set; }

        // FK — the guide who owns this package
        [ForeignKey("Guide")]
        public int GuideId { get; set; }

        [Required]
        [MaxLength(150)]
        public string PackageName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Destination { get; set; } = string.Empty;

        public int DurationDays { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int MaxGroupSize { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(1000)]
        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Guide Guide { get; set; } = null!;
        public ICollection<TourOperation> TourOperations { get; set; } = new List<TourOperation>();
    }
}
