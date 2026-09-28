using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartTourism.API.DTOs;
using SmartTourism.API.Domain.Entities;
using SmartTourism.API.Domain.Entities.Infrastructure;

namespace SmartTourism.API.Controllers;

[ApiController]
[Route("api/v1/tour-packages")]
public class TourPackagesController : ControllerBase
{
    private readonly AppDbContext _db;

    public TourPackagesController(AppDbContext db)
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
    [HttpGet("{id}")]
    public async Task<ActionResult<TourPackageResponse>> GetById(int id)
    {
        var tp = await _db.TourPackages.Include(t => t.Guide).FirstOrDefaultAsync(t => t.TourPackageId == id);
        if (tp is null) return NotFound();
        return Ok(ToResponse(tp));
    }

    // GET /api/v1/guides/{guideId}/packages  — per-guide listing
    [HttpGet("/api/v1/guides/{guideId}/packages")]
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

        // Reload with Guide nav property for the response
        await _db.Entry(tp).Reference(t => t.Guide).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = tp.TourPackageId }, ToResponse(tp));
    }

    // PUT /api/v1/tour-packages/{id}
    [HttpPut("{id}")]
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
        {
            tp.ImageUrl = request.ImageUrl;
        }

        await _db.SaveChangesAsync();
        return Ok(ToResponse(tp));
    }

    // DELETE /api/v1/tour-packages/{id}  — soft delete (sets IsActive = false)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var tp = await _db.TourPackages.FindAsync(id);
        if (tp is null) return NotFound();

        tp.IsActive = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
