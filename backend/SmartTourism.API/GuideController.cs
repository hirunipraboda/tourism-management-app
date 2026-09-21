using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartTourism.API.DTOs;
using SmartTourism.API.Domain.Entities;
using SmartTourism.API.Domain.Entities.Enums;
using SmartTourism.API.Domain.Entities.Infrastructure;

namespace SmartTourism.API.Controllers;

[ApiController]
[Route("api/v1/guides")]
public class GuideController : ControllerBase
{
    private readonly AppDbContext _db;

    public GuideController(AppDbContext db)
    {
        _db = db;
    }

    // Computes "Available" vs "Assigned" from active TourOperations — not a stored field
    private async Task<string> GetStatus(Guid guideId)
    {
        var hasActiveOperation = await _db.TourOperations.AnyAsync(o =>
            o.GuideId == guideId &&
            (o.Status == TourOperationStatus.Scheduled ||
             o.Status == TourOperationStatus.CheckedIn ||
             o.Status == TourOperationStatus.InProgress));

        return hasActiveOperation ? "Assigned" : "Available";
    }

    private async Task<GuideResponse> ToResponse(Guide g)
    {
        var status = await GetStatus(g.Id);
        return new GuideResponse(g.Id, g.Name, g.Email, g.Phone, g.Languages, g.Specialties,
            g.RatingAvg, g.ToursCompleted, status, g.AvatarUrl);
    }

    // POST /api/v1/guides
    [HttpPost]
    public async Task<ActionResult<GuideResponse>> Create(CreateGuideRequest request)
    {
        var guide = new Guide
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Bio = request.Bio,
            Languages = request.Languages,
            Specialties = request.Specialties,
            YearsExperience = request.YearsExperience,
            AvatarUrl = request.AvatarUrl,
            VerificationStatus = GuideVerificationStatus.Pending,
            RatingAvg = 0,
            RatingCount = 0,
            ToursCompleted = 0,
            IsActive = true
        };

        _db.Guides.Add(guide);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = guide.Id }, await ToResponse(guide));
    }

    // GET /api/v1/guides?language=&specialty=&minRating=&isActive=&page=&pageSize=
    [HttpGet]
    public async Task<ActionResult<List<GuideResponse>>> GetAll(
        [FromQuery] string? language,
        [FromQuery] string? specialty,
        [FromQuery] decimal? minRating,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Guides.AsQueryable();

        if (!string.IsNullOrEmpty(language))
            query = query.Where(g => g.Languages != null && g.Languages.Contains(language));

        if (!string.IsNullOrEmpty(specialty))
            query = query.Where(g => g.Specialties != null && g.Specialties.Contains(specialty));

        if (minRating.HasValue)
            query = query.Where(g => g.RatingAvg >= minRating.Value);

        if (isActive.HasValue)
            query = query.Where(g => g.IsActive == isActive.Value);

        var guides = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var responses = new List<GuideResponse>();
        foreach (var g in guides)
            responses.Add(await ToResponse(g));

        return Ok(responses);
    }

    // GET /api/v1/guides/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<GuideResponse>> GetById(Guid id)
    {
        var guide = await _db.Guides.FindAsync(id);
        if (guide is null) return NotFound();

        return Ok(await ToResponse(guide));
    }

    // PUT /api/v1/guides/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<GuideResponse>> Update(Guid id, UpdateGuideRequest request)
    {
        var guide = await _db.Guides.FindAsync(id);
        if (guide is null) return NotFound();

        guide.Name = request.Name;
        guide.Email = request.Email;
        guide.Phone = request.Phone;
        guide.Bio = request.Bio;
        guide.Languages = request.Languages;
        guide.Specialties = request.Specialties;
        guide.YearsExperience = request.YearsExperience;
        guide.AvatarUrl = request.AvatarUrl;

        await _db.SaveChangesAsync();
        return Ok(await ToResponse(guide));
    }

    // PATCH /api/v1/guides/{id}/verification
    [HttpPatch("{id}/verification")]
    public async Task<ActionResult<GuideResponse>> UpdateVerification(Guid id, VerifyGuideRequest request)
    {
        var guide = await _db.Guides.FindAsync(id);
        if (guide is null) return NotFound();

        if (!Enum.TryParse<GuideVerificationStatus>(request.VerificationStatus, out var status))
            return BadRequest("VerificationStatus must be 'Pending', 'Verified', or 'Rejected'.");

        guide.VerificationStatus = status;
        await _db.SaveChangesAsync();
        return Ok(await ToResponse(guide));
    }

    // DELETE /api/v1/guides/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var guide = await _db.Guides.FindAsync(id);
        if (guide is null) return NotFound();

        guide.IsActive = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
