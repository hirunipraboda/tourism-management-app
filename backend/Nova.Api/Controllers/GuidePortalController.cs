using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Guides;
using Nova.Api.Services;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/v1/guide-portal")]
[Authorize(Policy = "GuideOrAdmin")]
public class GuidePortalController : ControllerBase
{
    private readonly IGuideBookingService _guideBookingService;

    public GuidePortalController(IGuideBookingService guideBookingService)
    {
        _guideBookingService = guideBookingService;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ??
               User.FindFirstValue("sub") ??
               "";
    }

    private async Task<GuideProfileDetailDto?> ResolveCurrentGuideAsync()
    {
        var userId = GetCurrentUserId();
        return await _guideBookingService.GetGuideForUserAsync(userId);
    }

    // GET /api/v1/guide-portal/me
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<GuideProfileDetailDto>>> GetMyProfile()
    {
        var guide = await ResolveCurrentGuideAsync();
        if (guide is null)
        {
            return NotFound(ApiResponse<GuideProfileDetailDto>.Fail("No guide profile linked to this account."));
        }
        return Ok(ApiResponse<GuideProfileDetailDto>.Ok(guide));
    }

    // GET /api/v1/guide-portal/dashboard
    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<GuideDashboardMetrics>>> GetDashboard()
    {
        var guide = await ResolveCurrentGuideAsync();
        if (guide is null)
        {
            return NotFound(ApiResponse<GuideDashboardMetrics>.Fail("No guide profile linked to this account."));
        }

        var metrics = await _guideBookingService.GetGuideDashboardMetricsAsync(guide.Id);
        return Ok(ApiResponse<GuideDashboardMetrics>.Ok(metrics));
    }

    // GET /api/v1/guide-portal/bookings
    [HttpGet("bookings")]
    public async Task<ActionResult<ApiResponse<List<GuideBookingResponse>>>> GetBookings([FromQuery] string? status)
    {
        var guide = await ResolveCurrentGuideAsync();
        if (guide is null)
        {
            return NotFound(ApiResponse<List<GuideBookingResponse>>.Fail("No guide profile linked to this account."));
        }

        var bookings = await _guideBookingService.GetGuideBookingsAsync(guide.Id, status);
        return Ok(ApiResponse<List<GuideBookingResponse>>.Ok(bookings));
    }

    // POST /api/v1/guide-portal/bookings/{id}/respond
    [HttpPost("bookings/{id}/respond")]
    public async Task<ActionResult<ApiResponse<GuideBookingResponse>>> RespondToBooking(string id, [FromBody] RespondBookingRequest request)
    {
        var guide = await ResolveCurrentGuideAsync();
        if (guide is null)
        {
            return NotFound(ApiResponse<GuideBookingResponse>.Fail("No guide profile linked to this account."));
        }

        try
        {
            var booking = await _guideBookingService.RespondToBookingAsync(id, guide.Id, request.Accept, request.Reason);
            return Ok(ApiResponse<GuideBookingResponse>.Ok(booking, request.Accept ? "Booking accepted." : "Booking declined."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<GuideBookingResponse>.Fail(ex.Message));
        }
    }

    // PUT /api/v1/guide-portal/profile
    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<GuideProfileDetailDto>>> UpdateProfile([FromBody] UpdateGuideBioRequest request)
    {
        var guide = await ResolveCurrentGuideAsync();
        if (guide is null)
        {
            return NotFound(ApiResponse<GuideProfileDetailDto>.Fail("No guide profile linked to this account."));
        }

        try
        {
            var updated = await _guideBookingService.UpdateGuideProfileAsync(guide.Id, request);
            return Ok(ApiResponse<GuideProfileDetailDto>.Ok(updated, "Profile updated successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<GuideProfileDetailDto>.Fail(ex.Message));
        }
    }

    // PUT /api/v1/guide-portal/working-hours
    [HttpPut("working-hours")]
    public async Task<ActionResult<ApiResponse<bool>>> SetWorkingHours([FromBody] SetWorkingHoursRequest request)
    {
        var guide = await ResolveCurrentGuideAsync();
        if (guide is null)
        {
            return NotFound(ApiResponse<bool>.Fail("No guide profile linked to this account."));
        }

        await _guideBookingService.SetWorkingHoursAsync(guide.Id, request);
        return Ok(ApiResponse<bool>.Ok(true, "Working hours updated successfully."));
    }

    // POST /api/v1/guide-portal/blocked-dates
    [HttpPost("blocked-dates")]
    public async Task<ActionResult<ApiResponse<BlockedDateDto>>> AddBlockedDate([FromBody] AddBlockedDateRequest request)
    {
        var guide = await ResolveCurrentGuideAsync();
        if (guide is null)
        {
            return NotFound(ApiResponse<BlockedDateDto>.Fail("No guide profile linked to this account."));
        }

        try
        {
            var blockedDate = await _guideBookingService.AddBlockedDateAsync(guide.Id, request);
            return Ok(ApiResponse<BlockedDateDto>.Ok(blockedDate, "Dates blocked successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<BlockedDateDto>.Fail(ex.Message));
        }
    }

    // DELETE /api/v1/guide-portal/blocked-dates/{blockedDateId}
    [HttpDelete("blocked-dates/{blockedDateId:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveBlockedDate(int blockedDateId)
    {
        var guide = await ResolveCurrentGuideAsync();
        if (guide is null)
        {
            return NotFound(ApiResponse<bool>.Fail("No guide profile linked to this account."));
        }

        await _guideBookingService.RemoveBlockedDateAsync(guide.Id, blockedDateId);
        return Ok(ApiResponse<bool>.Ok(true, "Blocked date removed successfully."));
    }
}
