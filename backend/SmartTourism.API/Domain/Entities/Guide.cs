using System.ComponentModel.DataAnnotations.Schema;
using SmartTourism.API.Domain.Entities.Enums;

namespace SmartTourism.API.Domain.Entities;

public class Guide
{
    public int Id { get; set; }
    [Column("ProviderId")]
    public Guid UserId { get; set; }          // ← CHANGED from ProviderId
    public User User { get; set; } = null!;   // ← ADDED navigation property
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

    public ICollection<TourPackage> TourPackages { get; set; } = new List<TourPackage>();
    public ICollection<GuideAvailability> Availabilities { get; set; } = new List<GuideAvailability>();
    public ICollection<TourOperation> TourOperations { get; set; } = new List<TourOperation>();
}
