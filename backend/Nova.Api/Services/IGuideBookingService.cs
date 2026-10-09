using Nova.Api.DTOs.Guides;
using Nova.Api.Entities;

namespace Nova.Api.Services;

public interface IGuideBookingService
{
    // Public / Customer
    Task<List<GuideProfileDetailDto>> GetActiveGuidesAsync(string? destinationId, DateOnly? travelDate, string? language, decimal? maxPrice, string? specialty);
    Task<GuideProfileDetailDto?> GetGuideProfileAsync(int guideId);
    Task<BookingQuoteResponse> CalculateQuoteAsync(CalculateQuoteRequest request);
    Task<GuideBookingResponse> CreateBookingAsync(string customerUserId, CreateGuideBookingRequest request);
    Task<PaymentInitiationResponse> InitiatePaymentAsync(string bookingId, string customerUserId, InitiateGuidePaymentRequest request);
    Task<GuideBookingResponse?> GetBookingDetailsAsync(string bookingId, string userId, bool isAdmin);
    Task<List<GuideBookingResponse>> GetCustomerBookingsAsync(string customerUserId);
    Task<GuideBookingResponse> CancelBookingAsync(string bookingId, string userId, bool isAdmin, string? reason);

    // Dedicated Guide Portal
    Task<GuideProfileDetailDto?> GetGuideForUserAsync(string guideUserId, string? guideEmail = null);
    Task<GuideDashboardMetrics> GetGuideDashboardMetricsAsync(int guideId);
    Task<List<GuideBookingResponse>> GetGuideBookingsAsync(int guideId, string? statusFilter);
    Task<GuideBookingResponse> RespondToBookingAsync(string bookingId, int guideId, bool accept, string? reason);
    Task<GuideProfileDetailDto> UpdateGuideProfileAsync(int guideId, UpdateGuideBioRequest request);
    Task SetWorkingHoursAsync(int guideId, SetWorkingHoursRequest request);
    Task<BlockedDateDto> AddBlockedDateAsync(int guideId, AddBlockedDateRequest request);
    Task RemoveBlockedDateAsync(int guideId, int blockedDateId);

    // Admin Console
    Task<AdminGuideStatsResponse> GetAdminStatsAsync();
    Task<List<GuideProfileDetailDto>> GetAllGuidesAdminAsync(string? search, string? language, string? status, int page, int pageSize);
    Task<GuideProfileDetailDto> CreateGuideAdminAsync(CreateGuideRequest request);
    Task<GuideProfileDetailDto> UpdateGuideAdminAsync(int guideId, UpdateGuideRequest request);
    Task<bool> SetGuideActiveStatusAsync(int guideId, bool isActive);
    Task<bool> ArchiveGuideAsync(int guideId);
    Task<List<GuideBookingResponse>> GetBookingLogsAdminAsync(string? status, string? paymentStatus, int? guideId, string? customerId, DateOnly? fromDate, DateOnly? toDate);
    Task<GuidePayoutSummaryDto> ProcessPayoutAsync(string bookingId, ProcessPayoutRequest request, string adminUserId);
}
