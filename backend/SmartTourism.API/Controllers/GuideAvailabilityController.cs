using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartTourism.API.DTOs;
using SmartTourism.API.Domain.Entities;
using SmartTourism.API.Domain.Entities.Infrastructure;

namespace SmartTourism.API.Controllers;

[ApiController]
[Route("api/v1/guides/{guideId}/availability")]
public class GuideAvailabilityController : ControllerBase
{
    private readonly AppDbContext _db;

    public GuideAvailabilityController(AppDbContext db)
    {
        _db = db;
    }

    private static AvailabilityResponse ToResponse(GuideAvailability ga) =>
        new(ga.AvailabilityId, ga.GuideId, ga.Guide?.Name ?? "", ga.AvailableDate,
            ga.StartTime, ga.EndTime, ga.IsBooked);

    // GET /api/v1/guides/{guideId}/availability
    [HttpGet]
    public async Task<ActionResult<List<AvailabilityResponse>>> GetByGuide(int guideId)
    {
        var slots = await _db.GuideAvailabilities
            .Include(ga => ga.Guide)
            .Where(ga => ga.GuideId == guideId)
            .OrderBy(ga => ga.AvailableDate)
            .ThenBy(ga => ga.StartTime)
            .ToListAsync();

        return Ok(slots.Select(ToResponse).ToList());
    }

    // POST /api/v1/guides/{guideId}/availability
    [HttpPost]
    public async Task<ActionResult<AvailabilityResponse>> Create(int guideId, CreateAvailabilityRequest request)
    {
        if (guideId != request.GuideId)
            return BadRequest("GuideId mismatch.");

        var guide = await _db.Guides.FindAsync(guideId);
        if (guide is null)
            return NotFound("Guide not found.");

        var slot = new GuideAvailability
        {
            GuideId = guideId,
            AvailableDate = request.AvailableDate,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            IsBooked = false
        };

        _db.GuideAvailabilities.Add(slot);
        await _db.SaveChangesAsync();

        await _db.Entry(slot).Reference(s => s.Guide).LoadAsync();
        return CreatedAtAction(nameof(GetByGuide), new { guideId }, ToResponse(slot));
    }

    // DELETE /api/v1/guides/{guideId}/availability/{availabilityId}
    [HttpDelete("{availabilityId}")]
    public async Task<IActionResult> Delete(int guideId, int availabilityId)
    {
        var slot = await _db.GuideAvailabilities
            .FirstOrDefaultAsync(ga => ga.GuideId == guideId && ga.AvailabilityId == availabilityId);

        if (slot is null)
            return NotFound();

        _db.GuideAvailabilities.Remove(slot);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
