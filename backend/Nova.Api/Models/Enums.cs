namespace Nova.Api.Models;

public enum Role
{
    USER,
    ADMIN
}

public enum UserStatus
{
    ACTIVE,
    INACTIVE,
    PENDING
}

public enum Province
{
    CENTRAL,
    SOUTHERN,
    WESTERN,
    NORTHERN,
    EASTERN,
    NORTH_CENTRAL,
    NORTH_WESTERN,
    SABARAGAMUWA,
    UVA
}

public enum DestinationCategory
{
    BEACH,
    WILDLIFE,
    HERITAGE,
    ADVENTURE,
    NATURE,
    CULTURE,
    RELIGIOUS,
    HILL_COUNTRY,
    CITY
}

public enum TourCategory
{
    CULTURAL,
    WILDLIFE,
    ADVENTURE,
    HERITAGE,
    BEACH,
    NATURE,
    HILL_COUNTRY
}

public enum TripStatus
{
    DRAFT,
    PLANNED,
    COMPLETED,
    CANCELLED
}

public enum TravelOption
{
    PUBLIC,
    PRIVATE,
    NONE
}

public enum BookingStatus
{
    PENDING,
    CONFIRMED,
    CANCELLED,
    COMPLETED
}

public enum PaymentStatus
{
    PAID,
    PENDING,
    REFUNDED
}
