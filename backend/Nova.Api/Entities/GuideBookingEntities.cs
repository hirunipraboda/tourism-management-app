using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nova.Api.Entities;

// ────────────────────────────────────────────────────────────────────────────
// Guide Booking, Payment, Payout & Notification entities.
// Extends the existing Guide / GuideAvailability model (GuideEntities.cs).
// All timestamps are UTC. Booking dates/times are stored as Sri Lanka local
// wall-clock values (UTC+05:30, no DST) because they describe a tour on the ground.
// ────────────────────────────────────────────────────────────────────────────

public enum GuideBookingStatus
{
    PendingPayment,
    PendingGuideApproval,
    Confirmed,
    Completed,
    Cancelled,
    Rejected,
    Expired
}

public enum GuidePaymentStatus { Initiated, Succeeded, Failed, Cancelled, Expired, Refunded }

public enum GuideRefundStatus { None, NotEligible, Pending, Completed, Failed }

public enum GuidePayoutStatus { Pending, Paid, Voided }

/// <summary>Guide ↔ destination coverage (many-to-many).</summary>
[Table("guide_destinations")]
public class GuideDestination
{
    public int GuideId { get; set; }
    [ForeignKey(nameof(GuideId))]
    public Guide? Guide { get; set; }

    public string DestinationId { get; set; } = string.Empty;
    [ForeignKey(nameof(DestinationId))]
    public Destination? Destination { get; set; }
}

/// <summary>Recurring weekly working window. DayOfWeek follows System.DayOfWeek (0 = Sunday).</summary>
[Table("guide_working_hours")]
public class GuideWorkingHours
{
    [Key]
    public int Id { get; set; }

    public int GuideId { get; set; }
    [ForeignKey(nameof(GuideId))]
    public Guide? Guide { get; set; }

    public int DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}

/// <summary>Leave / blocked date range (inclusive).</summary>
[Table("guide_blocked_dates")]
public class GuideBlockedDate
{
    [Key]
    public int Id { get; set; }

    public int GuideId { get; set; }
    [ForeignKey(nameof(GuideId))]
    public Guide? Guide { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }

    [MaxLength(200)]
    public string? Reason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("guide_bookings")]
public class GuideBooking
{
    /// <summary>Human readable booking reference, e.g. GB-7K2M9QXA. Also the primary key.</summary>
    [Key]
    [MaxLength(20)]
    public string Id { get; set; } = string.Empty;

    public int GuideId { get; set; }
    [ForeignKey(nameof(GuideId))]
    public Guide? Guide { get; set; }

    public string CustomerId { get; set; } = string.Empty;
    [ForeignKey(nameof(CustomerId))]
    public User? Customer { get; set; }

    // Snapshot of customer contact details at booking time.
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    /// <summary>Daily start/end window (Sri Lanka local time) applied to every date in the range.</summary>
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }

    public int Travelers { get; set; } = 1;
    public string? PickupLocation { get; set; }
    public string? PreferredLanguage { get; set; }
    public string? SpecialRequests { get; set; }

    public GuideBookingStatus Status { get; set; } = GuideBookingStatus.PendingPayment;

    [Column(TypeName = "numeric(12,2)")] public decimal Subtotal { get; set; }
    [Column(TypeName = "numeric(12,2)")] public decimal ServiceFee { get; set; }
    [Column(TypeName = "numeric(12,2)")] public decimal TotalAmount { get; set; }
    [Column(TypeName = "numeric(12,2)")] public decimal CommissionAmount { get; set; }
    [Column(TypeName = "numeric(12,2)")] public decimal GuideNetAmount { get; set; }
    [MaxLength(3)] public string Currency { get; set; } = "USD";
    public int BillableDays { get; set; }
    public string? PricingBreakdown { get; set; }

    public DateTime? HoldExpiresAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? GuideDecisionAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancelledBy { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime? ReminderSentAt { get; set; }

    public GuideRefundStatus RefundStatus { get; set; } = GuideRefundStatus.None;
    [Column(TypeName = "numeric(12,2)")] public decimal RefundAmount { get; set; }

    [MaxLength(100)] public string? IdempotencyKey { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<GuideBookingDestination> Destinations { get; set; } = [];
    public List<GuidePayment> Payments { get; set; } = [];
    public GuidePayout? Payout { get; set; }
}

[Table("guide_booking_destinations")]
public class GuideBookingDestination
{
    public string BookingId { get; set; } = string.Empty;
    [ForeignKey(nameof(BookingId))]
    public GuideBooking? Booking { get; set; }

    public string DestinationId { get; set; } = string.Empty;
    [ForeignKey(nameof(DestinationId))]
    public Destination? Destination { get; set; }

    public string DestinationName { get; set; } = string.Empty;
}

/// <summary>Customer payment attempt for a guide booking (money in from the customer).</summary>
[Table("guide_payments")]
public class GuidePayment
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string BookingId { get; set; } = string.Empty;
    [ForeignKey(nameof(BookingId))]
    public GuideBooking? Booking { get; set; }

    [MaxLength(30)] public string Provider { get; set; } = "Stripe";
    public string? ProviderSessionId { get; set; }
    public string? ProviderPaymentIntentId { get; set; }
    /// <summary>Gateway transaction / receipt reference shown to customer and admin.</summary>
    public string? TransactionReference { get; set; }
    public string? PaymentMethod { get; set; }
    public string? CheckoutUrl { get; set; }

    [Column(TypeName = "numeric(12,2)")] public decimal Amount { get; set; }
    [MaxLength(3)] public string Currency { get; set; } = "USD";
    public GuidePaymentStatus Status { get; set; } = GuidePaymentStatus.Initiated;
    public string? FailureReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public DateTime? RefundedAt { get; set; }
    public string? RefundReference { get; set; }
    [Column(TypeName = "numeric(12,2)")] public decimal RefundedAmount { get; set; }
}

/// <summary>
/// Guide earnings record (money out to the guide). Completely separate from the customer payment:
/// it can only be marked Paid by an administrator with a payout transaction reference.
/// </summary>
[Table("guide_payouts")]
public class GuidePayout
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string BookingId { get; set; } = string.Empty;
    [ForeignKey(nameof(BookingId))]
    public GuideBooking? Booking { get; set; }

    public int GuideId { get; set; }
    [ForeignKey(nameof(GuideId))]
    public Guide? Guide { get; set; }

    [Column(TypeName = "numeric(12,2)")] public decimal GrossAmount { get; set; }
    [Column(TypeName = "numeric(12,2)")] public decimal CommissionAmount { get; set; }
    [Column(TypeName = "numeric(12,2)")] public decimal NetAmount { get; set; }
    [MaxLength(3)] public string Currency { get; set; } = "USD";

    public GuidePayoutStatus Status { get; set; } = GuidePayoutStatus.Pending;
    public string? PayoutReference { get; set; }
    public string? PayoutMethod { get; set; }
    public string? ProcessedByUserId { get; set; }
    public string? Notes { get; set; }
    public DateTime? PaidAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>Immutable audit trail for every booking / payment / payout state change.</summary>
[Table("guide_booking_events")]
public class GuideBookingEvent
{
    [Key]
    public long Id { get; set; }
    public string? BookingId { get; set; }
    public int? GuideId { get; set; }
    public string? ActorId { get; set; }
    public string ActorRole { get; set; } = "System";
    public string EventType { get; set; } = string.Empty;
    public string? Details { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>Idempotency ledger for verified payment-gateway events.</summary>
[Table("payment_webhook_events")]
public class PaymentWebhookEvent
{
    [Key]
    public long Id { get; set; }
    [MaxLength(30)] public string Provider { get; set; } = string.Empty;
    public string ProviderEventId { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
}

[Table("notifications")]
public class Notification
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [MaxLength(50)] public string Type { get; set; } = string.Empty;
    [MaxLength(200)] public string Title { get; set; } = string.Empty;
    [MaxLength(1000)] public string Message { get; set; } = string.Empty;
    public string? RelatedBookingId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
