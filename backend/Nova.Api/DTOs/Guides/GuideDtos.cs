using System.ComponentModel.DataAnnotations;

namespace Nova.Api.DTOs.Guides;

public record CreateGuideRequest(
    [Required(ErrorMessage = "Name is required.")]
    string Name,
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email address.")]
    string Email,
    string? Phone,
    string? Bio,
    List<string>? Languages,
    List<string>? Specialties,
    [Range(0, 70, ErrorMessage = "Years of experience must be between 0 and 70.")]
    int? YearsExperience,
    string? AvatarUrl
);

public record UpdateGuideRequest(
    [Required(ErrorMessage = "Name is required.")]
    string Name,
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email address.")]
    string Email,
    string? Phone,
    string? Bio,
    List<string>? Languages,
    List<string>? Specialties,
    [Range(0, 70, ErrorMessage = "Years of experience must be between 0 and 70.")]
    int? YearsExperience,
    string? AvatarUrl
);

public record VerifyGuideRequest(
    [Required(ErrorMessage = "VerificationStatus is required.")]
    string VerificationStatus
);

public record GuideResponse(
    int Id,
    string Name,
    string Email,
    string? Phone,
    List<string>? Languages,
    List<string>? Specialties,
    decimal Rating,
    int ToursCompleted,
    string Status,
    string? AvatarUrl,
    string VerificationStatus
);

public record CreateTourPackageRequest(
    [Range(1, int.MaxValue, ErrorMessage = "GuideId must be a positive integer.")]
    int GuideId,
    [Required(ErrorMessage = "PackageName is required.")]
    string PackageName,
    string Description,
    [Required(ErrorMessage = "Destination is required.")]
    string Destination,
    [Range(1, 365, ErrorMessage = "DurationDays must be at least 1.")]
    int DurationDays,
    [Range(0.01, 1000000.0, ErrorMessage = "Price must be greater than zero.")]
    decimal Price,
    [Range(1, 1000, ErrorMessage = "MaxGroupSize must be at least 1.")]
    int MaxGroupSize,
    string? ImageUrl = null
);

public record UpdateTourPackageRequest(
    [Required(ErrorMessage = "PackageName is required.")]
    string PackageName,
    string Description,
    [Required(ErrorMessage = "Destination is required.")]
    string Destination,
    [Range(1, 365, ErrorMessage = "DurationDays must be at least 1.")]
    int DurationDays,
    [Range(0.01, 1000000.0, ErrorMessage = "Price must be greater than zero.")]
    decimal Price,
    [Range(1, 1000, ErrorMessage = "MaxGroupSize must be at least 1.")]
    int MaxGroupSize,
    bool IsActive,
    string? ImageUrl = null
);

public record TourPackageResponse(
    int TourPackageId,
    int GuideId,
    string GuideName,
    string PackageName,
    string Description,
    string Destination,
    int DurationDays,
    decimal Price,
    int MaxGroupSize,
    bool IsActive,
    DateTime CreatedAt,
    string? ImageUrl = null
);

public record CreateTourOperationRequest(
    [Range(1, int.MaxValue, ErrorMessage = "TourPackageId must be a positive integer.")]
    int TourPackageId,
    [Range(1, int.MaxValue, ErrorMessage = "GuideId must be a positive integer.")]
    int GuideId,
    [Required(ErrorMessage = "ScheduledDate is required.")]
    DateTime ScheduledDate,
    [Range(1, 1000, ErrorMessage = "NumberOfTourists must be at least 1.")]
    int NumberOfTourists,
    [Range(0.0, 10000000.0, ErrorMessage = "TotalCost must be non-negative.")]
    decimal TotalCost,
    string? Notes
);

public record UpdateTourOperationRequest(
    [Range(1, int.MaxValue, ErrorMessage = "TourPackageId must be a positive integer.")]
    int TourPackageId,
    [Range(1, int.MaxValue, ErrorMessage = "GuideId must be a positive integer.")]
    int GuideId,
    [Required(ErrorMessage = "ScheduledDate is required.")]
    DateTime ScheduledDate,
    [Range(1, 1000, ErrorMessage = "NumberOfTourists must be at least 1.")]
    int NumberOfTourists,
    [Range(0.0, 10000000.0, ErrorMessage = "TotalCost must be non-negative.")]
    decimal TotalCost,
    string? Notes
);

public record UpdateTourOperationStatusRequest(
    [Required(ErrorMessage = "Status is required.")]
    string Status
);

public record TourOperationResponse(
    int TourOperationId,
    int TourPackageId,
    string PackageName,
    int GuideId,
    string GuideName,
    DateTime ScheduledDate,
    int NumberOfTourists,
    decimal TotalCost,
    string Status,
    string Notes,
    DateTime CreatedAt
);

public record CreateAvailabilityRequest(
    [Range(1, int.MaxValue, ErrorMessage = "GuideId must be a positive integer.")]
    int GuideId,
    [Required(ErrorMessage = "AvailableDate is required.")]
    DateOnly AvailableDate,
    [Required(ErrorMessage = "StartTime is required.")]
    TimeOnly StartTime,
    [Required(ErrorMessage = "EndTime is required.")]
    TimeOnly EndTime
);

public record AvailabilityResponse(
    int AvailabilityId,
    int GuideId,
    string GuideName,
    DateOnly AvailableDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    bool IsBooked
);
