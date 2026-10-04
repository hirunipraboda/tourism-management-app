namespace Nova.Api.DTOs.Guides;

public record CreateGuideRequest(
    string Name,
    string Email,
    string? Phone,
    string? Bio,
    List<string>? Languages,
    List<string>? Specialties,
    int? YearsExperience,
    string? AvatarUrl
);

public record UpdateGuideRequest(
    string Name,
    string Email,
    string? Phone,
    string? Bio,
    List<string>? Languages,
    List<string>? Specialties,
    int? YearsExperience,
    string? AvatarUrl
);

public record VerifyGuideRequest(string VerificationStatus);

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
    int GuideId,
    string PackageName,
    string Description,
    string Destination,
    int DurationDays,
    decimal Price,
    int MaxGroupSize,
    string? ImageUrl = null
);

public record UpdateTourPackageRequest(
    string PackageName,
    string Description,
    string Destination,
    int DurationDays,
    decimal Price,
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
    int TourPackageId,
    int GuideId,
    DateTime ScheduledDate,
    int NumberOfTourists,
    decimal TotalCost,
    string? Notes
);

public record UpdateTourOperationRequest(
    int TourPackageId,
    int GuideId,
    DateTime ScheduledDate,
    int NumberOfTourists,
    decimal TotalCost,
    string? Notes
);

public record UpdateTourOperationStatusRequest(string Status);

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
    int GuideId,
    DateOnly AvailableDate,
    TimeOnly StartTime,
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
