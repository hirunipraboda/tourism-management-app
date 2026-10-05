using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartTourism.API.Domain.Entities
{
    public class GuideAvailability
    {
        [Key]
        public int AvailabilityId { get; set; }

        [ForeignKey("Guide")]
        public int GuideId { get; set; }

        [Required]
        public DateOnly AvailableDate { get; set; }

        public TimeOnly StartTime { get; set; }

        public TimeOnly EndTime { get; set; }

        public bool IsBooked { get; set; } = false;

        // Navigation property
        public Guide Guide { get; set; } = null!;
    }
}
