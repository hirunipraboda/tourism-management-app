using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nova.Api.DTOs.AgenticAI;
using Nova.Api.DTOs.Common;
using Nova.Api.Entities;
using Nova.Api.Services;

namespace Nova.Api.Controllers;

[ApiController]
[Authorize]
public class ItineraryGenerationController : ControllerBase
{
    private readonly IItineraryGenerationService _generationService;

    public ItineraryGenerationController(IItineraryGenerationService generationService)
    {
        _generationService = generationService;
    }

    [HttpPost("api/trips/{tripId}/itinerary/generate")]
    [ProducesResponseType(typeof(ApiResponse<GenerateItineraryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<GenerateItineraryResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateItinerary(string tripId, [FromBody] GenerateItineraryRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _generationService.GenerateItineraryAsync(tripId, userId, userRole, request);
        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("api/trips/{tripId}/itinerary/workflow/{workflowId}")]
    [ProducesResponseType(typeof(ApiResponse<WorkflowStatusResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<WorkflowStatusResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWorkflowStatus(string tripId, string workflowId)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _generationService.GetWorkflowStatusAsync(workflowId, userId, userRole);
        if (!result.Success) return NotFound(result);

        return Ok(result);
    }

    [HttpGet("api/trips/{tripId}/itinerary/workflow/{workflowId}/logs")]
    [ProducesResponseType(typeof(ApiResponse<List<WorkflowAuditLogResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWorkflowLogs(string tripId, string workflowId)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        var result = await _generationService.GetWorkflowLogsAsync(workflowId, userId, userRole);
        if (!result.Success) return NotFound(result);

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
