using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Guides;
using Nova.Api.Services;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/v1/guide-bookings")]
public class GuideBookingsController : ControllerBase
{
    private readonly IGuideBookingService _guideBookingService;

    public GuideBookingsController(IGuideBookingService guideBookingService)
    {
        _guideBookingService = guideBookingService;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ??
               User.FindFirstValue("sub") ??
               "anonymous_customer";
    }

    private bool IsAdmin()
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
        return role.Equals("Admin", StringComparison.OrdinalIgnoreCase);
    }

    // GET /api/v1/guide-bookings/browse
    // Also available via /api/v1/guides/search-browse
    [HttpGet("browse")]
    public async Task<ActionResult<ApiResponse<List<GuideProfileDetailDto>>>> BrowseGuides(
        [FromQuery] string? destinationId,
        [FromQuery] DateOnly? travelDate,
        [FromQuery] string? language,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? specialty)
    {
        var guides = await _guideBookingService.GetActiveGuidesAsync(destinationId, travelDate, language, maxPrice, specialty);
        return Ok(ApiResponse<List<GuideProfileDetailDto>>.Ok(guides, $"Found {guides.Count} available guides."));
    }

    // GET /api/v1/guide-bookings/guides/{guideId}
    [HttpGet("guides/{guideId:int}")]
    public async Task<ActionResult<ApiResponse<GuideProfileDetailDto>>> GetGuideProfile(int guideId)
    {
        var guide = await _guideBookingService.GetGuideProfileAsync(guideId);
        if (guide is null)
        {
            return NotFound(ApiResponse<GuideProfileDetailDto>.Fail("Guide not found or inactive."));
        }
        return Ok(ApiResponse<GuideProfileDetailDto>.Ok(guide));
    }

    // POST /api/v1/guide-bookings/quote
    [HttpPost("quote")]
    public async Task<ActionResult<ApiResponse<BookingQuoteResponse>>> CalculateQuote([FromBody] CalculateQuoteRequest request)
    {
        if (request.EndDate < request.StartDate)
        {
            return BadRequest(ApiResponse<BookingQuoteResponse>.Fail("EndDate must be on or after StartDate."));
        }

        try
        {
            var quote = await _guideBookingService.CalculateQuoteAsync(request);
            return Ok(ApiResponse<BookingQuoteResponse>.Ok(quote));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<BookingQuoteResponse>.Fail(ex.Message));
        }
    }

    // POST /api/v1/guide-bookings
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ApiResponse<GuideBookingResponse>>> CreateBooking([FromBody] CreateGuideBookingRequest request)
    {
        var userId = GetCurrentUserId();
        try
        {
            var booking = await _guideBookingService.CreateBookingAsync(userId, request);
            return CreatedAtAction(nameof(GetBookingById), new { id = booking.Id }, ApiResponse<GuideBookingResponse>.Ok(booking, "Booking created successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<GuideBookingResponse>.Fail(ex.Message));
        }
    }

    // POST /api/v1/guide-bookings/{id}/pay
    [HttpPost("{id}/pay")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<PaymentInitiationResponse>>> PayBooking(string id, [FromBody] InitiateGuidePaymentRequest request)
    {
        var userId = GetCurrentUserId();
        try
        {
            var paymentResult = await _guideBookingService.InitiatePaymentAsync(id, userId, request);
            return Ok(ApiResponse<PaymentInitiationResponse>.Ok(paymentResult, "Payment processed successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<PaymentInitiationResponse>.Fail(ex.Message));
        }
    }

    // GET /api/v1/guide-bookings/my-bookings
    [HttpGet("my-bookings")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<List<GuideBookingResponse>>>> GetMyBookings()
    {
        var userId = GetCurrentUserId();
        var bookings = await _guideBookingService.GetCustomerBookingsAsync(userId);
        return Ok(ApiResponse<List<GuideBookingResponse>>.Ok(bookings));
    }

    // GET /api/v1/guide-bookings/{id}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<GuideBookingResponse>>> GetBookingById(string id)
    {
        var userId = GetCurrentUserId();
        var booking = await _guideBookingService.GetBookingDetailsAsync(id, userId, IsAdmin());
        if (booking is null)
        {
            return NotFound(ApiResponse<GuideBookingResponse>.Fail("Booking not found or access denied."));
        }
        return Ok(ApiResponse<GuideBookingResponse>.Ok(booking));
    }

    // POST /api/v1/guide-bookings/{id}/cancel
    [HttpPost("{id}/cancel")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<GuideBookingResponse>>> CancelBooking(string id, [FromBody] CancelGuideBookingRequest? request)
    {
        var userId = GetCurrentUserId();
        try
        {
            var booking = await _guideBookingService.CancelBookingAsync(id, userId, IsAdmin(), request?.Reason);
            return Ok(ApiResponse<GuideBookingResponse>.Ok(booking, "Booking cancelled successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<GuideBookingResponse>.Fail(ex.Message));
        }
    }
}
