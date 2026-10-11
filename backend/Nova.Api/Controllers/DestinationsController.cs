using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.Entities;

namespace Nova.Api.Controllers;

public class DestinationUpsertDto
{
    public string? Name { get; set; }
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? Province { get; set; }
    public string? District { get; set; }
    public string? ImageUrl { get; set; }
    public string? Category { get; set; }
    public double? Rating { get; set; } = 4.8;
    public double? EntryFee { get; set; } = 0.0;
    public string? OpeningTime { get; set; }
    public string? ClosingTime { get; set; }
    public string? BestTimeToVisit { get; set; }
    public bool? IsActive { get; set; } = true;
    public List<string>? TopAttractions { get; set; }
}

[ApiController]
[Route("api/destinations")]
[Route("api/admin/destinations")]
public class DestinationsController : ControllerBase
{
    private readonly NovaDbContext _db;

    public DestinationsController(NovaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetDestinations([FromQuery] string? search)
    {
        try
        {
            var query = _db.Destinations.Include(d => d.Attractions).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                query = query.Where(d => EF.Functions.ILike(d.Name, $"%{s}%") || EF.Functions.ILike(d.Description, $"%{s}%"));
            }

            var destinations = await query.OrderByDescending(d => d.CreatedAt).ToListAsync();
            if (destinations.Count > 0)
            {
                return Ok(ApiResponse<List<Destination>>.Ok(destinations));
            }
        }
        catch
        {
            // Fallback to default destinations
        }

        var list = GetDefaultDestinations();
        if (!string.IsNullOrWhiteSpace(search))
        {
            list = list.Where(d => d.Name.Contains(search, StringComparison.OrdinalIgnoreCase) || d.Description.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return Ok(ApiResponse<List<Destination>>.Ok(list));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDestinationById(string id)
    {
        try
        {
            var destination = await _db.Destinations.Include(d => d.Attractions).FirstOrDefaultAsync(d => d.Id == id || d.Slug == id);
            if (destination != null) return Ok(ApiResponse<Destination>.Ok(destination));
        }
        catch
        {
            // Fallback
        }

        var fallback = GetDefaultDestinations().FirstOrDefault(d => d.Id == id || d.Slug == id);
        if (fallback != null) return Ok(ApiResponse<Destination>.Ok(fallback));

        return NotFound(ApiResponse<Destination>.Fail("Destination not found."));
    }

    [HttpPost]
    public async Task<IActionResult> CreateDestination([FromBody] DestinationUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(ApiResponse<Destination>.Fail("Destination name is required."));
        }

        var destId = $"dest-{Guid.NewGuid():N}"[..18];
        var baseSlug = !string.IsNullOrWhiteSpace(dto.Slug)
            ? dto.Slug.Trim().ToLowerInvariant()
            : dto.Name.Trim().ToLowerInvariant().Replace(" ", "-").Replace("'", "");
        
        // Ensure slug is unique
        var slug = baseSlug;
        var slugExists = await _db.Destinations.AnyAsync(d => d.Slug == slug);
        if (slugExists)
        {
            slug = $"{baseSlug}-{Guid.NewGuid():N}"[..Math.Min(baseSlug.Length + 9, 60)];
        }

        var destination = new Destination
        {
            Id = destId,
            Name = dto.Name.Trim(),
            Slug = slug,
            Description = dto.Description?.Trim() ?? $"Explore the sights and culture of {dto.Name.Trim()}.",
            Location = !string.IsNullOrWhiteSpace(dto.Location) ? dto.Location.Trim() : dto.Name.Trim(),
            Province = !string.IsNullOrWhiteSpace(dto.Province) ? dto.Province.Trim() : "Western Province",
            District = dto.District?.Trim(),
            ImageUrl = !string.IsNullOrWhiteSpace(dto.ImageUrl) ? dto.ImageUrl.Trim() : "https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=800&q=80",
            Category = !string.IsNullOrWhiteSpace(dto.Category) ? dto.Category.Trim() : "Cultural",
            Rating = dto.Rating ?? 4.8,
            ReviewCount = 0,
            EntryFee = dto.EntryFee ?? 0.0,
            OpeningTime = dto.OpeningTime ?? "08:00 AM",
            ClosingTime = dto.ClosingTime ?? "06:00 PM",
            BestTimeToVisit = dto.BestTimeToVisit ?? "Year-round",
            IsActive = dto.IsActive ?? true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (dto.TopAttractions != null && dto.TopAttractions.Count > 0)
        {
            foreach (var attrName in dto.TopAttractions.Where(a => !string.IsNullOrWhiteSpace(a)))
            {
                destination.Attractions.Add(new Attraction
                {
                    Id = $"attr-{Guid.NewGuid():N}"[..18],
                    DestinationId = destId,
                    Name = attrName.Trim(),
                    Description = $"Historic landmark and scenic highlight in {destination.Name}.",
                    Location = destination.Location,
                    Category = destination.Category ?? "Sightseeing",
                    EntryFee = destination.EntryFee ?? 0.0,
                    OpeningTime = destination.OpeningTime,
                    ClosingTime = destination.ClosingTime,
                    DurationHours = 2.0,
                    Rating = destination.Rating ?? 4.8,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        _db.Destinations.Add(destination);
        await _db.SaveChangesAsync();

        return Created($"/api/destinations/{destination.Id}", ApiResponse<Destination>.Ok(destination));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDestination(string id, [FromBody] DestinationUpsertDto dto)
    {
        var dest = await _db.Destinations.Include(d => d.Attractions).FirstOrDefaultAsync(d => d.Id == id || d.Slug == id);
        if (dest == null)
        {
            return NotFound(ApiResponse<Destination>.Fail("Destination not found."));
        }

        if (!string.IsNullOrWhiteSpace(dto.Name)) dest.Name = dto.Name.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Description)) dest.Description = dto.Description.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Location)) dest.Location = dto.Location.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Province)) dest.Province = dto.Province.Trim();
        if (!string.IsNullOrWhiteSpace(dto.District)) dest.District = dto.District.Trim();
        if (!string.IsNullOrWhiteSpace(dto.ImageUrl)) dest.ImageUrl = dto.ImageUrl.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Category)) dest.Category = dto.Category.Trim();
        if (dto.Rating.HasValue) dest.Rating = dto.Rating.Value;
        if (dto.EntryFee.HasValue) dest.EntryFee = dto.EntryFee.Value;
        if (!string.IsNullOrWhiteSpace(dto.OpeningTime)) dest.OpeningTime = dto.OpeningTime.Trim();
        if (!string.IsNullOrWhiteSpace(dto.ClosingTime)) dest.ClosingTime = dto.ClosingTime.Trim();
        if (!string.IsNullOrWhiteSpace(dto.BestTimeToVisit)) dest.BestTimeToVisit = dto.BestTimeToVisit.Trim();
        if (dto.IsActive.HasValue) dest.IsActive = dto.IsActive.Value;

        if (dto.TopAttractions != null && dto.TopAttractions.Count > 0)
        {
            var existingNames = new HashSet<string>(dest.Attractions.Select(a => a.Name.ToLowerInvariant()));
            foreach (var attrName in dto.TopAttractions.Where(a => !string.IsNullOrWhiteSpace(a)))
            {
                if (!existingNames.Contains(attrName.Trim().ToLowerInvariant()))
                {
                    dest.Attractions.Add(new Attraction
                    {
                        Id = $"attr-{Guid.NewGuid():N}"[..18],
                        DestinationId = dest.Id,
                        Name = attrName.Trim(),
                        Description = $"Highlight in {dest.Name}.",
                        Location = dest.Location,
                        Category = dest.Category ?? "Sightseeing",
                        EntryFee = dest.EntryFee ?? 0.0,
                        OpeningTime = dest.OpeningTime,
                        ClosingTime = dest.ClosingTime,
                        DurationHours = 2.0,
                        Rating = dest.Rating ?? 4.8,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        dest.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<Destination>.Ok(dest));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDestination(string id)
    {
        var dest = await _db.Destinations.Include(d => d.Attractions).FirstOrDefaultAsync(d => d.Id == id || d.Slug == id);
        if (dest == null)
        {
            return NotFound(ApiResponse<bool>.Fail("Destination not found."));
        }

        if (dest.Attractions.Count > 0)
        {
            _db.Attractions.RemoveRange(dest.Attractions);
        }

        _db.Destinations.Remove(dest);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true, "Destination deleted successfully."));
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ToggleStatus(string id)
    {
        var dest = await _db.Destinations.FirstOrDefaultAsync(d => d.Id == id || d.Slug == id);
        if (dest == null)
        {
            return NotFound(ApiResponse<Destination>.Fail("Destination not found."));
        }

        dest.IsActive = !dest.IsActive;
        dest.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<Destination>.Ok(dest));
    }

    private static List<Destination> GetDefaultDestinations()
    {
        return [
            new()
            {
                Id = "dest-1",
                Name = "Sigiriya Ancient Rock Fortress",
                Slug = "sigiriya-rock-fortress",
                Description = "A towering monolithic rock column crowned by the 5th-century royal palace ruins of King Kasyapa.",
                Location = "Matale District",
                Province = "Central",
                ImageUrl = "https://images.unsplash.com/photo-1588598198321-9735fd52455d",
                Rating = 4.9,
                Activities = [
                    new() { Id = "act-1", Name = "Sigiriya Rock Citadel Fortress Climb", Description = "5th-century painted maidens.", CostPerPerson = 30.0m, DurationMinutes = 180 },
                    new() { Id = "act-2", Name = "Pidurangala Rock Sunset Viewpoint", Description = "Ancient panoramic viewpoint.", CostPerPerson = 5.0m, DurationMinutes = 120 }
                ]
            },
            new()
            {
                Id = "dest-2",
                Name = "Ella Mountain Gap & Bridges",
                Slug = "ella-gap",
                Description = "Picturesque mountain town renowned for the Nine Arches colonial bridge and tea plantation trails.",
                Location = "Badulla District",
                Province = "Uva",
                ImageUrl = "https://images.unsplash.com/photo-1546708973-b339540b5162",
                Rating = 4.8,
                Activities = [
                    new() { Id = "act-3", Name = "Demodara Nine Arches Viaduct Bridge", Description = "Colonial rail bridge.", CostPerPerson = 0.0m, DurationMinutes = 120 },
                    new() { Id = "act-4", Name = "Little Adam's Peak Mountain Trek", Description = "Gentle panoramic hike.", CostPerPerson = 0.0m, DurationMinutes = 150 }
                ]
            },
            new()
            {
                Id = "dest-3",
                Name = "Kandy Sacred City",
                Slug = "kandy-sacred-city",
                Description = "UNESCO World Heritage cultural capital in the hills housing the sacred tooth relic.",
                Location = "Kandy District",
                Province = "Central",
                ImageUrl = "https://images.unsplash.com/photo-1546708973-b339540b5162",
                Rating = 4.8,
                Activities = [
                    new() { Id = "act-5", Name = "Temple of the Sacred Tooth Relic", Description = "Historic shrine.", CostPerPerson = 10.0m, DurationMinutes = 120 }
                ]
            }
        ];
    }
}
