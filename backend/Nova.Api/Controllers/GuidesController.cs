using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Guides;
using Nova.Api.Entities;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/v1/guides")]
public class GuidesController : ControllerBase
{
    private readonly NovaDbContext _db;

    public GuidesController(NovaDbContext db)
    {
        _db = db;
    }

    // Computes "Available" vs "Assigned" from active TourOperations — not a stored field
    private async Task<string> GetGuideStatus(int guideId)
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
        var status = await GetGuideStatus(g.Id);
        return new GuideResponse(
            g.Id, g.Name, g.Email, g.Phone, g.Languages, g.Specialties,
            g.RatingAvg, g.ToursCompleted, status, g.AvatarUrl,
            g.VerificationStatus.ToString()
        );
    }

    // POST /api/v1/guides
    [HttpPost]
    [Authorize(Policy = "OperatorOrAdmin")]
    public async Task<ActionResult<GuideResponse>> Create(CreateGuideRequest request)
    {
        // Reuse an existing account if this email is already registered
        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        User user;
        if (existingUser != null)
        {
            user = existingUser;
        }
        else
        {
            user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                Email = request.Email,
                Role = UserRole.TourismOperator,
                PasswordHash = Guid.NewGuid().ToString(), // Placeholder until auth flow
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Users.Add(user);
        }

        var guide = new Guide
        {
            UserId = user.Id,
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
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
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
    [HttpGet("{id:int}")]
    public async Task<ActionResult<GuideResponse>> GetById(int id)
    {
        var guide = await _db.Guides.FindAsync(id);
        if (guide is null) return NotFound();

        return Ok(await ToResponse(guide));
    }

    // PUT /api/v1/guides/{id}
    [HttpPut("{id:int}")]
    [Authorize(Policy = "OperatorOrAdmin")]
    public async Task<ActionResult<GuideResponse>> Update(int id, UpdateGuideRequest request)
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
        guide.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(await ToResponse(guide));
    }

    // PATCH or PUT /api/v1/guides/{id}/verification
    [HttpPatch("{id:int}/verification")]
    [HttpPut("{id:int}/verification")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<GuideResponse>> UpdateVerification(int id, VerifyGuideRequest request)
    {
        var guide = await _db.Guides.FindAsync(id);
        if (guide is null) return NotFound();

        if (!Enum.TryParse<GuideVerificationStatus>(request.VerificationStatus, out var status))
            return BadRequest("VerificationStatus must be 'Pending', 'Verified', or 'Rejected'.");

        guide.VerificationStatus = status;
        guide.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(await ToResponse(guide));
    }

    // DELETE /api/v1/guides/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var guide = await _db.Guides.FindAsync(id);
        if (guide is null) return NotFound();

        guide.IsActive = false;
        guide.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Guide Availability Controller
// ─────────────────────────────────────────────────────────────────────────────

[ApiController]
[Route("api/v1/guides/{guideId:int}/availability")]
public class GuideAvailabilityController : ControllerBase
{
    private readonly NovaDbContext _db;

    public GuideAvailabilityController(NovaDbContext db)
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
        var guide = await _db.Guides.FindAsync(guideId);
        if (guide is null)
            return NotFound("Guide not found.");

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
    [Authorize(Policy = "OperatorOrAdmin")]
    public async Task<ActionResult<AvailabilityResponse>> Create(int guideId, CreateAvailabilityRequest request)
    {
        if (request.GuideId != 0 && guideId != request.GuideId)
            return BadRequest("GuideId mismatch.");

        if (request.AvailableDate == default)
            return BadRequest("Valid AvailableDate is required.");

        if (request.EndTime <= request.StartTime)
            return BadRequest("EndTime must be after StartTime.");

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
    [HttpDelete("{availabilityId:int}")]
    [HttpDelete("/api/v1/guides/availability/{availabilityId:int}")]
    [Authorize(Policy = "OperatorOrAdmin")]
    public async Task<IActionResult> Delete(int guideId, int availabilityId)
    {
        var slot = await _db.GuideAvailabilities
            .FirstOrDefaultAsync(ga => (guideId == 0 || ga.GuideId == guideId) && ga.AvailabilityId == availabilityId);

        if (slot is null)
            return NotFound();

        _db.GuideAvailabilities.Remove(slot);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
