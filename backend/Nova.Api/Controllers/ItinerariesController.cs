using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Itineraries;
using Nova.Api.Entities;
using Nova.Api.Services;

namespace Nova.Api.Controllers;

[ApiController]
[Authorize]
public class ItinerariesController : ControllerBase
{
    private readonly IItineraryService _itineraryService;
    private readonly IApprovalService _approvalService;

    public ItinerariesController(IItineraryService itineraryService, IApprovalService approvalService)
    {
        _itineraryService = itineraryService;
        _approvalService = approvalService;
    }

    [HttpPost("api/trips/{tripId}/itineraries")]
    [ProducesResponseType(typeof(ApiResponse<ItineraryResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateItinerary(string tripId, [FromBody] CreateItineraryRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _itineraryService.CreateItineraryAsync(tripId, userId, userRole, request);
        if (!result.Success) return BadRequest(result);

        return CreatedAtAction(nameof(GetItineraryById), new { id = result.Data!.Id }, result);
    }

    [HttpGet("api/trips/{tripId}/itinerary")]
    [ProducesResponseType(typeof(ApiResponse<ItineraryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetItineraryByTripId(string tripId)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _itineraryService.GetItineraryByTripIdAsync(tripId, userId, userRole);
        if (!result.Success) return NotFound(result);

        return Ok(result);
    }

    [HttpGet("api/itineraries/{id}")]
    [ProducesResponseType(typeof(ApiResponse<ItineraryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetItineraryById(string id)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _itineraryService.GetItineraryByIdAsync(id, userId, userRole);
        if (!result.Success) return NotFound(result);

        return Ok(result);
    }

    [HttpDelete("api/itineraries/{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteItinerary(string id)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _itineraryService.DeleteItineraryAsync(id, userId, userRole);
        if (!result.Success) return NotFound(result);

        return Ok(result);
    }

    [HttpPost("api/itineraries/{id}/days")]
    [ProducesResponseType(typeof(ApiResponse<ItineraryDayResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddDay(string id, [FromBody] CreateItineraryDayRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _itineraryService.AddItineraryDayAsync(id, userId, userRole, request);
        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("api/itineraries/{id}/days")]
    [ProducesResponseType(typeof(ApiResponse<List<ItineraryDayResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDays(string id)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _itineraryService.GetItineraryDaysAsync(id, userId, userRole);
        if (!result.Success) return NotFound(result);

        return Ok(result);
    }

    // Human Approval Endpoints (Tour Operator / Admin)
    [HttpPost("api/itineraries/{id}/approve")]
    [Authorize(Roles = "TourismOperator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<ApprovalResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ApprovalResponse>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ApproveItinerary(string id, [FromBody] ApprovalRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _approvalService.ApproveItineraryAsync(id, userId, userRole, request.Comments);
        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("api/itineraries/{id}/reject")]
    [Authorize(Roles = "TourismOperator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<ApprovalResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RejectItinerary(string id, [FromBody] ApprovalRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _approvalService.RejectItineraryAsync(id, userId, userRole, request.Comments);
        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("api/itineraries/{id}/request-revision")]
    [Authorize(Roles = "TourismOperator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<ApprovalResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RequestRevision(string id, [FromBody] ApprovalRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _approvalService.RequestRevisionAsync(id, userId, userRole, request.Comments);
        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ??
               User.FindFirstValue("sub") ??
               "u-demo-user";
    }

    private string GetCurrentUserRole()
    {
        return User.FindFirstValue(ClaimTypes.Role) ?? UserRole.Tourist.ToString();
    }
}
