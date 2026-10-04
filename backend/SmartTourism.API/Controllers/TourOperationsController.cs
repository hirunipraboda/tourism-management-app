using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartTourism.API.DTOs;
using SmartTourism.API.Domain.Entities;
using SmartTourism.API.Domain.Entities.Enums;
using SmartTourism.API.Domain.Entities.Infrastructure;

namespace SmartTourism.API.Controllers;

[ApiController]
[Route("api/v1/tour-operations")]
public class TourOperationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TourOperationsController(AppDbContext db)
    {
        _db = db;
    }

    private static TourOperationResponse ToResponse(TourOperation op) =>
        new(op.TourOperationId, op.TourPackageId, op.TourPackage?.PackageName ?? "",
            op.GuideId, op.Guide?.Name ?? "", op.ScheduledDate, op.NumberOfTourists,
            op.TotalCost, op.Status.ToString(), op.Notes, op.CreatedAt);

    // GET /api/v1/tour-operations
    [HttpGet]
    public async Task<ActionResult<List<TourOperationResponse>>> GetAll(
        [FromQuery] int? guideId,
        [FromQuery] int? packageId,
        [FromQuery] string? status)
    {
        var query = _db.TourOperations
            .Include(to => to.TourPackage)
            .Include(to => to.Guide)
            .AsQueryable();

        if (guideId.HasValue)
            query = query.Where(to => to.GuideId == guideId.Value);
        if (packageId.HasValue)
            query = query.Where(to => to.TourPackageId == packageId.Value);
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<TourOperationStatus>(status, true, out var parsedStatus))
            query = query.Where(to => to.Status == parsedStatus);

        var list = await query
            .OrderByDescending(to => to.ScheduledDate)
            .ToListAsync();

        return Ok(list.Select(ToResponse).ToList());
    }

    // GET /api/v1/tour-operations/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TourOperationResponse>> GetById(int id)
    {
        var op = await _db.TourOperations
            .Include(to => to.TourPackage)
            .Include(to => to.Guide)
            .FirstOrDefaultAsync(to => to.TourOperationId == id);

        if (op is null) return NotFound();
        return Ok(ToResponse(op));
    }

    // POST /api/v1/tour-operations
    [HttpPost]
    public async Task<ActionResult<TourOperationResponse>> Create(CreateTourOperationRequest request)
    {
        var guide = await _db.Guides.FindAsync(request.GuideId);
        if (guide is null) return BadRequest("Guide not found.");

        var package = await _db.TourPackages.FindAsync(request.TourPackageId);
        if (package is null) return BadRequest("Tour Package not found.");

        var op = new TourOperation
        {
            TourPackageId = request.TourPackageId,
            GuideId = request.GuideId,
            ScheduledDate = request.ScheduledDate,
            NumberOfTourists = request.NumberOfTourists,
            TotalCost = request.TotalCost,
            Notes = request.Notes ?? string.Empty,
            Status = TourOperationStatus.Scheduled,
            CreatedAt = DateTime.UtcNow
        };

        _db.TourOperations.Add(op);
        await _db.SaveChangesAsync();

        await _db.Entry(op).Reference(o => o.Guide).LoadAsync();
        await _db.Entry(op).Reference(o => o.TourPackage).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = op.TourOperationId }, ToResponse(op));
    }

    // PATCH /api/v1/tour-operations/{id}/status
    [HttpPatch("{id}/status")]
    public async Task<ActionResult<TourOperationResponse>> UpdateStatus(int id, UpdateTourOperationStatusRequest request)
    {
        var op = await _db.TourOperations
            .Include(to => to.TourPackage)
            .Include(to => to.Guide)
            .FirstOrDefaultAsync(to => to.TourOperationId == id);

        if (op is null) return NotFound();

        if (!Enum.TryParse<TourOperationStatus>(request.Status, true, out var newStatus))
            return BadRequest($"Invalid status '{request.Status}'. Allowed: Scheduled, CheckedIn, InProgress, Completed, NoShow, Cancelled.");

        op.Status = newStatus;
        await _db.SaveChangesAsync();

        return Ok(ToResponse(op));
    }

    // PUT /api/v1/tour-operations/{id}  — full edit of tour details
    [HttpPut("{id}")]
    public async Task<ActionResult<TourOperationResponse>> Update(int id, UpdateTourOperationRequest request)
    {
        var op = await _db.TourOperations
            .Include(to => to.TourPackage)
            .Include(to => to.Guide)
            .FirstOrDefaultAsync(to => to.TourOperationId == id);

        if (op is null) return NotFound();

        // Validate the new guide and package exist
        var guide = await _db.Guides.FindAsync(request.GuideId);
        if (guide is null) return BadRequest("Guide not found.");

        var package = await _db.TourPackages.FindAsync(request.TourPackageId);
        if (package is null) return BadRequest("Tour Package not found.");

        op.TourPackageId    = request.TourPackageId;
        op.GuideId          = request.GuideId;
        op.ScheduledDate    = request.ScheduledDate;
        op.NumberOfTourists = request.NumberOfTourists;
        op.TotalCost        = request.TotalCost;
        op.Notes            = request.Notes ?? string.Empty;

        await _db.SaveChangesAsync();

        // Reload nav properties so response has updated names
        await _db.Entry(op).Reference(o => o.Guide).LoadAsync();
        await _db.Entry(op).Reference(o => o.TourPackage).LoadAsync();

        return Ok(ToResponse(op));
    }

    // DELETE /api/v1/tour-operations/{id}  — hard delete
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var op = await _db.TourOperations.FindAsync(id);
        if (op is null) return NotFound();

        _db.TourOperations.Remove(op);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
