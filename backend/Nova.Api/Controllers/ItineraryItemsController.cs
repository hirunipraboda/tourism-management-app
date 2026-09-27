using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Itineraries;
using Nova.Api.DTOs.Transport;
using Nova.Api.Entities;
using Nova.Api.Services;

namespace Nova.Api.Controllers;

[ApiController]
[Authorize]
public class ItineraryItemsController : ControllerBase
{
    private readonly IItineraryService _itineraryService;
    private readonly ITransportService _transportService;

    public ItineraryItemsController(IItineraryService itineraryService, ITransportService transportService)
    {
        _itineraryService = itineraryService;
        _transportService = transportService;
    }

    [HttpPost("api/itinerary-days/{dayId}/items")]
    [ProducesResponseType(typeof(ApiResponse<ItineraryItemResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddItem(string dayId, [FromBody] CreateItineraryItemRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _itineraryService.AddItineraryItemAsync(dayId, userId, userRole, request);
        if (!result.Success) return BadRequest(result);

        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPut("api/itinerary-items/{id}")]
    [ProducesResponseType(typeof(ApiResponse<ItineraryItemResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateItem(string id, [FromBody] UpdateItineraryItemRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _itineraryService.UpdateItineraryItemAsync(id, userId, userRole, request);
        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("api/itinerary-items/{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteItem(string id)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _itineraryService.DeleteItineraryItemAsync(id, userId, userRole);
        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Select and attach transport (Bus, Train, or PickMe) to a specific itinerary item.
    /// </summary>
    [HttpPost("api/itinerary-items/{id}/transport")]
    [ProducesResponseType(typeof(ApiResponse<SelectedTransportResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<SelectedTransportResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SelectTransport(string id, [FromBody] DTOs.Transport.SelectTransportRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _transportService.SelectTransportForItineraryItemAsync(id, userId, userRole, request);
        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Retrieve the selected transport attached to a specific itinerary item.
    /// </summary>
    [HttpGet("api/itinerary-items/{id}/transport")]
    [ProducesResponseType(typeof(ApiResponse<SelectedTransportResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<SelectedTransportResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<SelectedTransportResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSelectedTransport(string id)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _transportService.GetSelectedTransportAsync(id, userId, userRole);
        if (!result.Success)
        {
            if (result.Errors?.Contains("ITEM_NOT_FOUND") == true) return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Remove the selected transport attached to a specific itinerary item.
    /// </summary>
    [HttpDelete("api/itinerary-items/{id}/transport")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteTransport(string id)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _transportService.RemoveSelectedTransportAsync(id, userId, userRole);
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
