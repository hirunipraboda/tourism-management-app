using System.ComponentModel.DataAnnotations;
using Nova.Api.Entities;

namespace Nova.Api.DTOs.Guides;

public record GuideProfileDetailDto(
    int Id,
    string UserId,
    string Name,
    string Email,
    string? Phone,
    string? Bio,
    List<string>? Languages,
    List<string>? Specialties,
    int? YearsExperience,
    int? Age,
    string? Gender,
    bool ShowAgePublicly,
    string? Qualifications,
    decimal HourlyRate,
    decimal HalfDayRate,
    decimal FullDayRate,
    decimal RatingAvg,
    int RatingCount,
    int ToursCompleted,
    string? AvatarUrl,
    string VerificationStatus,
    bool IsActive,
    bool AcceptingBookings,
    bool IsArchived,
    List<CoveredDestinationDto> CoveredDestinations,
    List<WorkingHourDto> WorkingHours,
    List<BlockedDateDto> BlockedDates,
    DateTime CreatedAt
);

public record CoveredDestinationDto(string DestinationId, string DestinationName);

public record WorkingHourDto(int DayOfWeek, string DayName, string StartTime, string EndTime);

public record BlockedDateDto(int Id, DateOnly StartDate, DateOnly EndDate, string? Reason);

public record CalculateQuoteRequest(
    [Range(1, int.MaxValue)] int GuideId,
    [Required] DateOnly StartDate,
    [Required] DateOnly EndDate,
    TimeOnly? StartTime,
    TimeOnly? EndTime,
    int Travelers = 1,
    List<string>? DestinationIds = null
);

public record BookingQuoteResponse(
    int GuideId,
    string GuideName,
    int BillableDays,
    decimal DailyRate,
    decimal Subtotal,
    decimal ServiceFee,
    decimal TotalAmount,
    decimal GuideEarnings,
    decimal PlatformCommission,
    string Currency,
    bool IsAvailable,
    string? AvailabilityMessage
);

public record CreateGuideBookingRequest(
    [Range(1, int.MaxValue)] int GuideId,
    [Required] DateOnly StartDate,
    [Required] DateOnly EndDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    [Range(1, 100)] int Travelers,
    [Required] List<string> DestinationIds,
    string? PickupLocation,
    string? PreferredLanguage,
    string? SpecialRequests,
    string? ContactName,
    string? ContactEmail,
    string? ContactPhone,
    string? IdempotencyKey
);

public record GuideBookingResponse(
    string Id,
    int GuideId,
    string GuideName,
    string? GuideAvatarUrl,
    string? GuidePhone,
    string? GuideEmail,
    string CustomerId,
    string CustomerName,
    string CustomerEmail,
    string? CustomerPhone,
    DateOnly StartDate,
    DateOnly EndDate,
    string StartTime,
    string EndTime,
    int Travelers,
    string? PickupLocation,
    string? PreferredLanguage,
    string? SpecialRequests,
    string Status,
    decimal Subtotal,
    decimal ServiceFee,
    decimal TotalAmount,
    decimal CommissionAmount,
    decimal GuideNetAmount,
    string Currency,
    int BillableDays,
    List<CoveredDestinationDto> Destinations,
    DateTime CreatedAt,
    DateTime? ConfirmedAt,
    DateTime? CompletedAt,
    DateTime? CancelledAt,
    string? CancellationReason,
    string? CancelledBy,
    string RefundStatus,
    decimal RefundAmount,
    GuidePaymentSummaryDto? Payment,
    GuidePayoutSummaryDto? Payout
);

public record GuidePaymentSummaryDto(
    string Id,
    string Provider,
    string? TransactionReference,
    string? PaymentMethod,
    decimal Amount,
    string Currency,
    string Status,
    DateTime? PaidAt
);

public record GuidePayoutSummaryDto(
    string Id,
    decimal GrossAmount,
    decimal CommissionAmount,
    decimal NetAmount,
    string Currency,
    string Status,
    string? PayoutReference,
    string? PayoutMethod,
    DateTime? PaidAt
);

public record InitiateGuidePaymentRequest(
    string? PaymentMethod, // "Card (Visa)", "Card (Mastercard)", "Online Banking"
    string? CardHolderName,
    string? MaskedCardNumber
);

public record PaymentInitiationResponse(
    string BookingId,
    string PaymentId,
    decimal Amount,
    string Currency,
    string Status,
    string TransactionReference,
    string? CheckoutUrl
);

public record ProcessPayoutRequest(
    [Required] string PayoutReference,
    [Required] string PayoutMethod,
    string? Notes
);

public record GuideDashboardMetrics(
    int UpcomingBookings,
    int PendingApprovalBookings,
    int TodayBookings,
    int CompletedBookings,
    decimal PendingEarnings,
    decimal TotalEarnings,
    decimal CompletedPayouts,
    decimal RatingAvg,
    int RatingCount
);

public record AdminGuideStatsResponse(
    int TotalGuides,
    int ActiveGuides,
    int InactiveGuides,
    int AvailableGuides,
    int TotalBookings,
    int UpcomingBookings,
    int CompletedBookings,
    int CancelledBookings,
    decimal TotalRevenue,
    decimal PendingCustomerPayments,
    decimal CompletedCustomerPayments,
    decimal GuideEarningsAccrued,
    decimal GuidePayoutsPending,
    decimal GuidePayoutsCompleted
);

public record SetWorkingHoursRequest(
    List<WorkingHourInput> WorkingHours
);

public record WorkingHourInput(
    int DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime
);

public record AddBlockedDateRequest(
    [Required] DateOnly StartDate,
    [Required] DateOnly EndDate,
    string? Reason
);

public record UpdateGuideBioRequest(
    string? Bio,
    string? Phone,
    List<string>? Languages,
    List<string>? Specialties,
    string? AvatarUrl,
    decimal? HourlyRate,
    decimal? HalfDayRate,
    decimal? FullDayRate,
    bool? AcceptingBookings,
    List<string>? CoveredDestinationIds,
    string? PayoutAccountNote
);

public record RespondBookingRequest(
    bool Accept,
    string? Reason
);

public record CancelGuideBookingRequest(
    string? Reason
);
