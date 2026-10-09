using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Guides;
using Nova.Api.Entities;

namespace Nova.Api.Controllers;

// ─────────────────────────────────────────────────────────────────────────────
// Tour Packages Controller
// ─────────────────────────────────────────────────────────────────────────────

[ApiController]
[Route("api/v1/tour-packages")]
public class TourPackagesController : ControllerBase
{
    private readonly NovaDbContext _db;

    public TourPackagesController(NovaDbContext db)
    {
        _db = db;
    }

    private static TourPackageResponse ToResponse(TourPackage tp) =>
        new(tp.TourPackageId, tp.GuideId, tp.Guide?.Name ?? "", tp.PackageName,
            tp.Description, tp.Destination, tp.DurationDays, tp.Price,
            tp.MaxGroupSize, tp.IsActive, tp.CreatedAt, tp.ImageUrl);

    // GET /api/v1/tour-packages
    [HttpGet]
    public async Task<ActionResult<List<TourPackageResponse>>> GetAll(
        [FromQuery] int? guideId,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.TourPackages.Include(tp => tp.Guide).AsQueryable();

        if (guideId.HasValue)
            query = query.Where(tp => tp.GuideId == guideId.Value);
        if (isActive.HasValue)
            query = query.Where(tp => tp.IsActive == isActive.Value);

        var packages = await query
            .OrderByDescending(tp => tp.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(packages.Select(ToResponse).ToList());
    }

    // GET /api/v1/tour-packages/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TourPackageResponse>> GetById(int id)
    {
        var tp = await _db.TourPackages.Include(t => t.Guide).FirstOrDefaultAsync(t => t.TourPackageId == id);
        if (tp is null) return NotFound();
        return Ok(ToResponse(tp));
    }

    // GET /api/v1/guides/{guideId}/packages — per-guide listing
    [HttpGet("/api/v1/guides/{guideId:int}/packages")]
    public async Task<ActionResult<List<TourPackageResponse>>> GetByGuide(int guideId)
    {
        var packages = await _db.TourPackages
            .Include(tp => tp.Guide)
            .Where(tp => tp.GuideId == guideId)
            .OrderByDescending(tp => tp.CreatedAt)
            .ToListAsync();
        return Ok(packages.Select(ToResponse).ToList());
    }

    // POST /api/v1/tour-packages
    [HttpPost]
    [Authorize(Policy = "OperatorOrAdmin")]
    public async Task<ActionResult<TourPackageResponse>> Create(CreateTourPackageRequest request)
    {
        var guide = await _db.Guides.FindAsync(request.GuideId);
        if (guide is null) return BadRequest("Guide not found.");

        var tp = new TourPackage
        {
            GuideId = request.GuideId,
            PackageName = request.PackageName,
            Description = request.Description,
            Destination = request.Destination,
            DurationDays = request.DurationDays,
            Price = request.Price,
            MaxGroupSize = request.MaxGroupSize,
            ImageUrl = request.ImageUrl ?? string.Empty,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.TourPackages.Add(tp);
        await _db.SaveChangesAsync();

        await _db.Entry(tp).Reference(t => t.Guide).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = tp.TourPackageId }, ToResponse(tp));
    }

    // PUT /api/v1/tour-packages/{id}
    [HttpPut("{id:int}")]
    [Authorize(Policy = "OperatorOrAdmin")]
    public async Task<ActionResult<TourPackageResponse>> Update(int id, UpdateTourPackageRequest request)
    {
        var tp = await _db.TourPackages.Include(t => t.Guide).FirstOrDefaultAsync(t => t.TourPackageId == id);
        if (tp is null) return NotFound();

        tp.PackageName = request.PackageName;
        tp.Description = request.Description;
        tp.Destination = request.Destination;
        tp.DurationDays = request.DurationDays;
        tp.Price = request.Price;
        tp.MaxGroupSize = request.MaxGroupSize;
        tp.IsActive = request.IsActive;
        if (request.ImageUrl != null)
            tp.ImageUrl = request.ImageUrl;

        await _db.SaveChangesAsync();
        return Ok(ToResponse(tp));
    }

    // DELETE /api/v1/tour-packages/{id} — soft delete (sets IsActive = false)
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "OperatorOrAdmin")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var tp = await _db.TourPackages.FindAsync(id);
        if (tp is null) return NotFound();

        tp.IsActive = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tour Operations Controller
// ─────────────────────────────────────────────────────────────────────────────

[ApiController]
[Route("api/v1/tour-operations")]
public class TourOperationsController : ControllerBase
{
    private readonly NovaDbContext _db;

    public TourOperationsController(NovaDbContext db)
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

        var list = await query.OrderByDescending(to => to.ScheduledDate).ToListAsync();
        return Ok(list.Select(ToResponse).ToList());
    }

    // GET /api/v1/tour-operations/{id}
    [HttpGet("{id:int}")]
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
    [Authorize(Policy = "OperatorOrAdmin")]
    public async Task<ActionResult<TourOperationResponse>> Create(CreateTourOperationRequest request)
    {
        if (request.ScheduledDate == default)
            return BadRequest("ScheduledDate cannot be empty.");

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
    [HttpPatch("{id:int}/status")]
    [Authorize(Policy = "OperatorOrAdmin")]
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

    // PUT /api/v1/tour-operations/{id}
    [HttpPut("{id:int}")]
    [Authorize(Policy = "OperatorOrAdmin")]
    public async Task<ActionResult<TourOperationResponse>> Update(int id, UpdateTourOperationRequest request)
    {
        if (request.ScheduledDate == default)
            return BadRequest("ScheduledDate cannot be empty.");

        var op = await _db.TourOperations
            .Include(to => to.TourPackage)
            .Include(to => to.Guide)
            .FirstOrDefaultAsync(to => to.TourOperationId == id);

        if (op is null) return NotFound();

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

        await _db.Entry(op).Reference(o => o.Guide).LoadAsync();
        await _db.Entry(op).Reference(o => o.TourPackage).LoadAsync();

        return Ok(ToResponse(op));
    }

    // DELETE /api/v1/tour-operations/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "OperatorOrAdmin")]
    public async Task<IActionResult> Delete(int id)
    {
        var op = await _db.TourOperations.FindAsync(id);
        if (op is null) return NotFound();

        _db.TourOperations.Remove(op);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
