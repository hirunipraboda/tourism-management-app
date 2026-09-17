using Microsoft.AspNetCore.Mvc;
using Nova.Api.Agents;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/trip-planner")]
public class TripPlannerController : ControllerBase
{
    private readonly ITripPlannerOrchestrator _orchestrator;

    public TripPlannerController(ITripPlannerOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    [HttpPost("plan")]
    public async Task<IActionResult> GeneratePlan([FromBody] TripPlanningRequest request)
    {
        var result = await _orchestrator.GeneratePlanAsync(request);
        return Ok(new
        {
            success = true,
            data = result
        });
    }

    [HttpPost("regenerate-day")]
    public async Task<IActionResult> RegenerateDay([FromBody] RegenerateDayRequest request)
    {
        var result = await _orchestrator.RegenerateSingleDayAsync(request.DayNumber, request.Location, request.TripDetails);
        return Ok(new
        {
            success = true,
            data = result
        });
    }

    [HttpPost("replace-activity")]
    public async Task<IActionResult> ReplaceActivity([FromBody] ReplaceActivityRequest request)
    {
        var result = await _orchestrator.ReplaceSingleActivityAsync(request.ActivityId, request.CurrentTitle, request.Location);
        return Ok(new
        {
            success = true,
            data = result
        });
    }
}

public class RegenerateDayRequest
{
    public int DayNumber { get; set; }
    public string Location { get; set; } = string.Empty;
    public TripPlanningRequest TripDetails { get; set; } = new();
}

public class ReplaceActivityRequest
{
    public string ActivityId { get; set; } = string.Empty;
    public string CurrentTitle { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
}
