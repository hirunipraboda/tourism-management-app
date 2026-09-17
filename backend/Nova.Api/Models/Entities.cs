using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nova.Api.Models;

[Table("users")]
public class User
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.USER;
    public string? ProfileImage { get; set; }
    public string? Phone { get; set; }
    public string? Bio { get; set; }
    public string? Location { get; set; }
    public string? Department { get; set; }
    public UserStatus Status { get; set; } = UserStatus.ACTIVE;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<Trip> Trips { get; set; } = [];
    public List<Booking> Bookings { get; set; } = [];
    public List<Review> Reviews { get; set; } = [];
}

[Table("destinations")]
public class Destination
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public Province Province { get; set; } = Province.CENTRAL;
    public string? District { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public DestinationCategory Category { get; set; } = DestinationCategory.HERITAGE;
    public double Rating { get; set; } = 4.5;
    public int ReviewCount { get; set; } = 0;
    public double EntryFee { get; set; } = 0.0;
    public string? OpeningTime { get; set; }
    public string? ClosingTime { get; set; }
    public string? BestTimeToVisit { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<Attraction> Attractions { get; set; } = [];
    public List<TourDestination> Tours { get; set; } = [];
    public List<TripDestination> Trips { get; set; } = [];
    public List<Review> Reviews { get; set; } = [];
}

[Table("attractions")]
public class Attraction
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string DestinationId { get; set; } = string.Empty;
    [ForeignKey(nameof(DestinationId))]
    public Destination? Destination { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? Category { get; set; }
    public double EntryFee { get; set; } = 0.0;
    public string? OpeningTime { get; set; }
    public string? ClosingTime { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double DurationHours { get; set; } = 2.0;
    public double PricePerPerson { get; set; } = 0.0;
    public double Rating { get; set; } = 4.5;
    public int ReviewsCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[Table("tours")]
public class Tour
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationDays { get; set; } = 1;
    public double Price { get; set; }
    public string Currency { get; set; } = "USD";
    public string? ImageUrl { get; set; }
    public int MaxGroupSize { get; set; } = 10;
    public TourCategory Category { get; set; } = TourCategory.CULTURAL;
    public double Rating { get; set; } = 4.8;
    public bool IsActive { get; set; } = true;
    public string? CreatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<TourDestination> Destinations { get; set; } = [];
    public List<TourItinerary> Itineraries { get; set; } = [];
    public List<Booking> Bookings { get; set; } = [];
    public List<Review> Reviews { get; set; } = [];
}

[Table("tour_destinations")]
public class TourDestination
{
    public string TourId { get; set; } = string.Empty;
    [ForeignKey(nameof(TourId))]
    public Tour? Tour { get; set; }

    public string DestinationId { get; set; } = string.Empty;
    [ForeignKey(nameof(DestinationId))]
    public Destination? Destination { get; set; }

    public int Order { get; set; } = 0;
}

[Table("tour_itineraries")]
public class TourItinerary
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TourId { get; set; } = string.Empty;
    [ForeignKey(nameof(TourId))]
    public Tour? Tour { get; set; }
    public int DayNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Activities { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[Table("trips")]
public class Trip
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int NumberOfTravelers { get; set; } = 1;
    public double Budget { get; set; } = 0.0;
    public bool TransportRequired { get; set; } = false;
    public TripStatus Status { get; set; } = TripStatus.PLANNED;
    public double AiScore { get; set; } = 85.0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<TripDestination> Destinations { get; set; } = [];
    public List<TripItinerary> Itineraries { get; set; } = [];
    public List<Booking> Bookings { get; set; } = [];
}

[Table("trip_destinations")]
public class TripDestination
{
    public string TripId { get; set; } = string.Empty;
    [ForeignKey(nameof(TripId))]
    public Trip? Trip { get; set; }

    public string DestinationId { get; set; } = string.Empty;
    [ForeignKey(nameof(DestinationId))]
    public Destination? Destination { get; set; }
}

[Table("trip_itineraries")]
public class TripItinerary
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TripId { get; set; } = string.Empty;
    [ForeignKey(nameof(TripId))]
    public Trip? Trip { get; set; }

    public string? DestinationId { get; set; }
    public DateTime? Date { get; set; }
    public int DayNumber { get; set; } = 1;
    public string? TimeSlot { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Activities { get; set; }
    public string? Notes { get; set; }
    public string? Type { get; set; }
    public double Cost { get; set; } = 0.0;
    public string? Duration { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[Table("bookings")]
public class Booking
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BookingRef { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string? TourId { get; set; }
    [ForeignKey(nameof(TourId))]
    public Tour? Tour { get; set; }

    public string? TripId { get; set; }
    [ForeignKey(nameof(TripId))]
    public Trip? Trip { get; set; }

    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public int NumberOfParticipants { get; set; } = 1;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public TravelOption TravelOption { get; set; } = TravelOption.NONE;
    public bool TransportRequired { get; set; } = false;
    public double TotalPrice { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.PENDING;
    public BookingStatus Status { get; set; } = BookingStatus.PENDING;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[Table("reviews")]
public class Review
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string? DestinationId { get; set; }
    [ForeignKey(nameof(DestinationId))]
    public Destination? Destination { get; set; }

    public string? TourId { get; set; }
    [ForeignKey(nameof(TourId))]
    public Tour? Tour { get; set; }

    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[Table("transport_partners")]
public class TransportPartner
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Logo { get; set; }
    public string WebsiteUrl { get; set; } = string.Empty;
    public string? AppUrl { get; set; }
    public double Discount { get; set; } = 10.0;
    public string DiscountDescription { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
