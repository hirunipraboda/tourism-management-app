using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nova.Api.Entities;

// ────────────────────────────────────────────────────────────────────────────
// Guide & Tour Operations Entities
// Merged from: tourism-management-app-Guide-and-Tour-Operations
// ────────────────────────────────────────────────────────────────────────────

public enum GuideVerificationStatus { Pending, Verified, Rejected }

public enum TourOperationStatus { Scheduled, CheckedIn, InProgress, Completed, NoShow, Cancelled }

[Table("guides")]
public class Guide
{
    [Key]
    public int Id { get; set; }

    [Column("provider_id")]
    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Bio { get; set; }
    public List<string>? Languages { get; set; }
    public List<string>? Specialties { get; set; }
    public int? YearsExperience { get; set; }
    public GuideVerificationStatus VerificationStatus { get; set; } = GuideVerificationStatus.Pending;
    public decimal RatingAvg { get; set; }
    public int RatingCount { get; set; }
    public int ToursCompleted { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ── Guide booking system extensions ────────────────────────────────────
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    /// <summary>Guide consent to show age on the public directory.</summary>
    public bool ShowAgePublicly { get; set; }
    public string? Qualifications { get; set; }
    [Column(TypeName = "numeric(12,2)")] public decimal HourlyRate { get; set; }
    [Column(TypeName = "numeric(12,2)")] public decimal HalfDayRate { get; set; }
    [Column(TypeName = "numeric(12,2)")] public decimal FullDayRate { get; set; }
    public bool AcceptingBookings { get; set; } = true;
    public bool IsArchived { get; set; }
    public DateTime? ArchivedAt { get; set; }
    /// <summary>Bank / payout instructions. Administrator-only; never exposed publicly.</summary>
    public string? PayoutAccountNote { get; set; }

    public ICollection<TourPackage> TourPackages { get; set; } = new List<TourPackage>();
    public ICollection<GuideAvailability> Availabilities { get; set; } = new List<GuideAvailability>();
    public ICollection<TourOperation> TourOperations { get; set; } = new List<TourOperation>();
    public ICollection<GuideDestination> CoveredDestinations { get; set; } = new List<GuideDestination>();
    public ICollection<GuideWorkingHours> WorkingHours { get; set; } = new List<GuideWorkingHours>();
    public ICollection<GuideBlockedDate> BlockedDates { get; set; } = new List<GuideBlockedDate>();
}

[Table("tour_packages")]
public class TourPackage
{
    [Key]
    public int TourPackageId { get; set; }

    public int GuideId { get; set; }
    [ForeignKey(nameof(GuideId))]
    public Guide? Guide { get; set; }

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

    public ICollection<TourOperation> TourOperations { get; set; } = new List<TourOperation>();
}

[Table("tour_operations")]
public class TourOperation
{
    [Key]
    public int TourOperationId { get; set; }

    public int TourPackageId { get; set; }
    [ForeignKey(nameof(TourPackageId))]
    public TourPackage? TourPackage { get; set; }

    public int GuideId { get; set; }
    [ForeignKey(nameof(GuideId))]
    public Guide? Guide { get; set; }

    [Required]
    public DateTime ScheduledDate { get; set; }

    public int NumberOfTourists { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalCost { get; set; }

    public TourOperationStatus Status { get; set; } = TourOperationStatus.Scheduled;

    [MaxLength(500)]
    public string Notes { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("guide_availabilities")]
public class GuideAvailability
{
    [Key]
    public int AvailabilityId { get; set; }

    public int GuideId { get; set; }
    [ForeignKey(nameof(GuideId))]
    public Guide? Guide { get; set; }

    [Required]
    public DateOnly AvailableDate { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public bool IsBooked { get; set; } = false;
}
