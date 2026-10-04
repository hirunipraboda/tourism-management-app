using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SmartTourism.API.Domain.Entities.Enums;

namespace SmartTourism.API.Domain.Entities
{
    public class TourOperation
    {
        [Key]
        public int TourOperationId { get; set; }

        [ForeignKey("TourPackage")]
        public int TourPackageId { get; set; }

        [ForeignKey("Guide")]
        public int GuideId { get; set; }

        [Required]
        public DateTime ScheduledDate { get; set; }

        public int NumberOfTourists { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalCost { get; set; }

        public TourOperationStatus Status { get; set; } = TourOperationStatus.Scheduled;

        [MaxLength(500)]
        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public TourPackage TourPackage { get; set; } = null!;
        public Guide Guide { get; set; } = null!;
    }
}
