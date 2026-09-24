using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nova.Api.Entities;

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed
}

public enum PromoDiscountType
{
    Percentage,
    FixedAmount
}

public enum TransportServiceStatus
{
    Active,
    Inactive,
    Delayed,
    Cancelled
}

public enum PackageStatus
{
    Active,
    Inactive
}

public enum PurchaseStatus
{
    Active,
    Expired,
    Depleted
}

public enum ChatSessionStatus
{
    Active,
    Closed
}

public enum ReviewStatus
{
    Published,
    Flagged,
    Hidden
}

public enum PaymentStatus
{
    Pending,
    Successful,
    Failed,
    Refunded
}

public enum AttractionStatus
{
    Active,
    Inactive
}

[Table("bookings")]
public class Booking
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string? TripId { get; set; }
    [ForeignKey(nameof(TripId))]
    public Trip? Trip { get; set; }

    public string ServiceType { get; set; } = "Trip"; // Trip, Package, Transport, AI_Guide
    public string ServiceName { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public decimal Amount { get; set; } = 0.0m;
    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    public DateTime BookingDate { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[Table("promo_codes")]
public class PromoCode
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Code { get; set; } = string.Empty;
    public PromoDiscountType DiscountType { get; set; } = PromoDiscountType.Percentage;
    public decimal DiscountValue { get; set; } = 10.0m; // 10% or $10.00
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime EndDate { get; set; } = DateTime.UtcNow.AddMonths(3);
    public int UsageLimit { get; set; } = 500;
    public int TimesUsed { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public string Description { get; set; } = string.Empty;
    public string Partner { get; set; } = "TourLink";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<PromoCodeUsage> Usages { get; set; } = [];
}

[Table("promo_code_usages")]
public class PromoCodeUsage
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string PromoCodeId { get; set; } = string.Empty;
    [ForeignKey(nameof(PromoCodeId))]
    public PromoCode? PromoCode { get; set; }

    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string? TripId { get; set; }
    public decimal DiscountApplied { get; set; } = 0.0m;
    public DateTime UsedAt { get; set; } = DateTime.UtcNow;
}

[Table("bus_routes")]
public class BusRoute
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string BusNumber { get; set; } = string.Empty; // e.g. "01", "EX 1-1"
    public string RouteName { get; set; } = string.Empty; // e.g. "Colombo - Kandy AC Express"
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string DepartureTime { get; set; } = "06:00 AM";
    public string ArrivalTime { get; set; } = "09:30 AM";
    public string OperatingDays { get; set; } = "Daily";
    public decimal Fare { get; set; } = 450.0m;
    public TransportServiceStatus Status { get; set; } = TransportServiceStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("train_schedules")]
public class TrainSchedule
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string TrainNumber { get; set; } = string.Empty; // e.g. "1005"
    public string TrainName { get; set; } = string.Empty; // e.g. "Podi Menike"
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string DepartureTime { get; set; } = "05:55 AM";
    public string ArrivalTime { get; set; } = "09:15 AM";
    public string TrainType { get; set; } = "Intercity Express"; // Intercity Express, Express, Night Mail, Observation Saloon
    public string OperatingDays { get; set; } = "Daily";
    public decimal Fare { get; set; } = 600.0m;
    public TransportServiceStatus Status { get; set; } = TransportServiceStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("chatbot_packages")]
public class ChatbotPackage
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Name { get; set; } = string.Empty; // e.g. "Basic Explorer", "Pro Companion", "Unlimited Wanderer"
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; } = 0.0m;
    public int QuestionLimit { get; set; } = 50; // -1 for unlimited
    public int DurationDays { get; set; } = 30;
    public PackageStatus Status { get; set; } = PackageStatus.Active;
    public bool IncludesPhotoQueries { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<ChatbotPackagePurchase> Purchases { get; set; } = [];
}

[Table("chatbot_package_purchases")]
public class ChatbotPackagePurchase
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string PackageId { get; set; } = string.Empty;
    [ForeignKey(nameof(PackageId))]
    public ChatbotPackage? Package { get; set; }

    public decimal Price { get; set; } = 0.0m;
    public int RemainingQueries { get; set; } = 50;
    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
    public DateTime ExpiryDate { get; set; } = DateTime.UtcNow.AddDays(30);
    public PurchaseStatus Status { get; set; } = PurchaseStatus.Active;
}

[Table("ai_chat_sessions")]
public class AIChatSession
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string? PackageId { get; set; }
    [ForeignKey(nameof(PackageId))]
    public ChatbotPackage? Package { get; set; }

    public string Topic { get; set; } = "General Travel";
    public int QueryCount { get; set; } = 0;
    public ChatSessionStatus Status { get; set; } = ChatSessionStatus.Active;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;
}

[Table("ai_photo_queries")]
public class AIPhotoQuery
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string DestinationName { get; set; } = string.Empty;
    public string Category { get; set; } = "Attraction";
    public bool IsSuccess { get; set; } = true;
    public int LatencyMs { get; set; } = 420;
    public string? ErrorMessage { get; set; }
    public DateTime QueryDate { get; set; } = DateTime.UtcNow;
}

[Table("reviews")]
public class Review
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string DestinationId { get; set; } = string.Empty;
    [ForeignKey(nameof(DestinationId))]
    public Destination? Destination { get; set; }

    public int Rating { get; set; } = 5; // 1 to 5
    public string Comment { get; set; } = string.Empty;
    public string SentimentLabel { get; set; } = "Positive"; // Positive, Neutral, Negative
    public double SentimentScore { get; set; } = 0.92;
    public ReviewStatus Status { get; set; } = ReviewStatus.Published;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
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
    public string Location { get; set; } = string.Empty;
    public string OpeningTime { get; set; } = "08:00 AM";
    public string ClosingTime { get; set; } = "06:00 PM";
    public string EstimatedDuration { get; set; } = "2 Hours";
    public decimal EstimatedCost { get; set; } = 0.0m;
    public string ImageUrl { get; set; } = string.Empty;
    public AttractionStatus Status { get; set; } = AttractionStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("chatbot_payments")]
public class ChatbotPayment
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string PurchaseId { get; set; } = string.Empty;
    [ForeignKey(nameof(PurchaseId))]
    public ChatbotPackagePurchase? Purchase { get; set; }

    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string PackageName { get; set; } = string.Empty;
    public decimal Amount { get; set; } = 0.0m;
    public string PaymentMethod { get; set; } = "Card (Visa)";
    public string MaskedCardNumber { get; set; } = "**** **** **** 4242";
    public string TransactionReference { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; } = PaymentStatus.Successful;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("promo_payments")]
public class PromoPayment
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string? PromoCodeId { get; set; }
    [ForeignKey(nameof(PromoCodeId))]
    public PromoCode? PromoCodeEntity { get; set; }

    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public string PromoCode { get; set; } = string.Empty;
    public decimal AmountPaid { get; set; } = 0.0m;
    public string PaymentMethod { get; set; } = "Card / Online";
    public string MaskedCardNumber { get; set; } = "**** **** **** 8821";
    public string TransactionReference { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; } = PaymentStatus.Successful;
    public string PromoCodeStatus { get; set; } = "Active"; // Active, Redeemed, Expired
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("system_activities")]
public class SystemActivity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string ActivityType { get; set; } = "Trip"; // Trip, Payment, Chatbot, Transport, Review, User, System
    public string Description { get; set; } = string.Empty;
    public string ActorName { get; set; } = "System";
    public string ActorRole { get; set; } = "Tourist"; // Tourist, Admin, System
    public string Severity { get; set; } = "Info"; // Info, Warning, Error
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
