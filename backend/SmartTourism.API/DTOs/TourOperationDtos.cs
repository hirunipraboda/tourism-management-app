namespace SmartTourism.API.DTOs;

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

public record UpdateTourOperationStatusRequest(
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

