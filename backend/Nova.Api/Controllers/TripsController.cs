using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Trips;
using Nova.Api.Entities;
using Nova.Api.Services;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/trips")]
[Authorize]
public class TripsController : ControllerBase
{
    private readonly ITripService _tripService;

    public TripsController(ITripService tripService)
    {
        _tripService = tripService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TripResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<TripResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTrip([FromBody] CreateTripRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<TripResponse>.Fail("Validation failed", errors));
        }

        var userId = GetCurrentUserId();
        var result = await _tripService.CreateTripAsync(userId, request);

        if (!result.Success) return BadRequest(result);

        return CreatedAtAction(nameof(GetTripById), new { id = result.Data!.Id }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<TripResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTrips([FromQuery] TripFilterParameters filter)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _tripService.GetTripsAsync(userId, userRole, filter);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<TripResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<TripResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTripById(string id)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _tripService.GetTripByIdAsync(id, userId, userRole);
        if (!result.Success) return NotFound(result);

        return Ok(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<TripResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<TripResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<TripResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTrip(string id, [FromBody] UpdateTripRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _tripService.UpdateTripAsync(id, userId, userRole, request);
        if (!result.Success)
        {
            if (result.Message?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true)
                return NotFound(result);
            if (result.Message?.Contains("authorized", StringComparison.OrdinalIgnoreCase) == true)
                return StatusCode(StatusCodes.Status403Forbidden, result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTrip(string id)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _tripService.DeleteTripAsync(id, userId, userRole);
        if (!result.Success)
        {
            if (result.Message?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true)
                return NotFound(result);
            if (result.Message?.Contains("authorized", StringComparison.OrdinalIgnoreCase) == true)
                return StatusCode(StatusCodes.Status403Forbidden, result);
            return BadRequest(result);
        }

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
