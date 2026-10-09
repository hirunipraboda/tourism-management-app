using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Guides;
using Nova.Api.Services;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/v1/admin/guides")]
[Authorize(Policy = "AdminOnly")]
public class AdminGuidesController : ControllerBase
{
    private readonly IGuideBookingService _guideBookingService;

    public AdminGuidesController(IGuideBookingService guideBookingService)
    {
        _guideBookingService = guideBookingService;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ??
               User.FindFirstValue("sub") ??
               "admin_console";
    }

    // GET /api/v1/admin/guides/stats
    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<AdminGuideStatsResponse>>> GetStats()
    {
        var stats = await _guideBookingService.GetAdminStatsAsync();
        return Ok(ApiResponse<AdminGuideStatsResponse>.Ok(stats));
    }

    // GET /api/v1/admin/guides
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<GuideProfileDetailDto>>>> GetAllGuides(
        [FromQuery] string? search,
        [FromQuery] string? language,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var guides = await _guideBookingService.GetAllGuidesAdminAsync(search, language, status, page, pageSize);
        return Ok(ApiResponse<List<GuideProfileDetailDto>>.Ok(guides));
    }

    // POST /api/v1/admin/guides
    [HttpPost]
    public async Task<ActionResult<ApiResponse<GuideProfileDetailDto>>> CreateGuide([FromBody] CreateGuideRequest request)
    {
        try
        {
            var guide = await _guideBookingService.CreateGuideAdminAsync(request);
            return Ok(ApiResponse<GuideProfileDetailDto>.Ok(guide, "Guide created successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<GuideProfileDetailDto>.Fail(ex.Message));
        }
    }

    // PUT /api/v1/admin/guides/{id:int}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<GuideProfileDetailDto>>> UpdateGuide(int id, [FromBody] UpdateGuideRequest request)
    {
        try
        {
            var guide = await _guideBookingService.UpdateGuideAdminAsync(id, request);
            return Ok(ApiResponse<GuideProfileDetailDto>.Ok(guide, "Guide updated successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<GuideProfileDetailDto>.Fail(ex.Message));
        }
    }

    // PATCH /api/v1/admin/guides/{id:int}/status
    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> SetStatus(int id, [FromBody] SetGuideStatusRequest request)
    {
        var success = await _guideBookingService.SetGuideActiveStatusAsync(id, request.IsActive);
        if (!success)
        {
            return NotFound(ApiResponse<bool>.Fail("Guide not found."));
        }
        return Ok(ApiResponse<bool>.Ok(true, request.IsActive ? "Guide activated." : "Guide deactivated."));
    }

    // DELETE /api/v1/admin/guides/{id:int}/archive
    [HttpDelete("{id:int}/archive")]
    public async Task<ActionResult<ApiResponse<bool>>> ArchiveGuide(int id)
    {
        var success = await _guideBookingService.ArchiveGuideAsync(id);
        if (!success)
        {
            return NotFound(ApiResponse<bool>.Fail("Guide not found."));
        }
        return Ok(ApiResponse<bool>.Ok(true, "Guide archived successfully."));
    }

    // GET /api/v1/admin/guide-bookings/logs
    [HttpGet("/api/v1/admin/guide-bookings/logs")]
    public async Task<ActionResult<ApiResponse<List<GuideBookingResponse>>>> GetBookingLogs(
        [FromQuery] string? status,
        [FromQuery] string? paymentStatus,
        [FromQuery] int? guideId,
        [FromQuery] string? customerId,
        [FromQuery] DateOnly? fromDate,
        [FromQuery] DateOnly? toDate)
    {
        var bookings = await _guideBookingService.GetBookingLogsAdminAsync(status, paymentStatus, guideId, customerId, fromDate, toDate);
        return Ok(ApiResponse<List<GuideBookingResponse>>.Ok(bookings));
    }

    // POST /api/v1/admin/guide-bookings/{id}/payout
    [HttpPost("/api/v1/admin/guide-bookings/{id}/payout")]
    public async Task<ActionResult<ApiResponse<GuidePayoutSummaryDto>>> ProcessPayout(string id, [FromBody] ProcessPayoutRequest request)
    {
        var adminId = GetCurrentUserId();
        try
        {
            var payout = await _guideBookingService.ProcessPayoutAsync(id, request, adminId);
            return Ok(ApiResponse<GuidePayoutSummaryDto>.Ok(payout, "Payout processed successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<GuidePayoutSummaryDto>.Fail(ex.Message));
        }
    }
}

public class SetGuideStatusRequest
{
    public bool IsActive { get; set; }
}
