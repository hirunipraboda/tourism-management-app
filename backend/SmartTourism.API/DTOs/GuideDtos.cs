namespace SmartTourism.API.DTOs;

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
    Guid Id,
    string Name,
    string Email,
    string? Phone,
    List<string>? Languages,
    List<string>? Specialties,
    decimal Rating,
    int ToursCompleted,
    string Status,
    string? AvatarUrl
);
