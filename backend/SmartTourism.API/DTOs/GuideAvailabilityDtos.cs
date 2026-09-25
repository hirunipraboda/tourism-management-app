namespace SmartTourism.API.DTOs;

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
