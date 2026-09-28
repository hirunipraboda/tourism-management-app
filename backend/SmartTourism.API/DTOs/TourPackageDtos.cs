namespace SmartTourism.API.DTOs;

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
