using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Models;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/destinations")]
public class DestinationsController : ControllerBase
{
    private readonly NovaDbContext _db;

    public DestinationsController(NovaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetDestinations([FromQuery] string? search, [FromQuery] string? category)
    {
        var query = _db.Destinations.Include(d => d.Attractions).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(d => d.Name.Contains(search) || d.Description.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<DestinationCategory>(category, true, out var cat))
        {
            query = query.Where(d => d.Category == cat);
        }

        var destinations = await query.ToListAsync();

        // If database is empty, return seed default destinations for immediate out-of-the-box operation
        if (destinations.Count == 0)
        {
            destinations = GetDefaultDestinations();
        }

        return Ok(new { success = true, data = destinations });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDestinationById(string id)
    {
        var destination = await _db.Destinations.Include(d => d.Attractions).FirstOrDefaultAsync(d => d.Id == id || d.Slug == id);
        if (destination == null)
        {
            var fallback = GetDefaultDestinations().FirstOrDefault(d => d.Id == id || d.Slug == id);
            if (fallback != null) return Ok(new { success = true, data = fallback });
            return NotFound(new { success = false, message = "Destination not found" });
        }

        return Ok(new { success = true, data = destination });
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
                Province = Province.CENTRAL,
                ImageUrl = "https://images.unsplash.com/photo-1588598198321-9735fd52455d",
                Category = DestinationCategory.HERITAGE,
                Rating = 4.9,
                ReviewCount = 1420,
                EntryFee = 30.0,
                Attractions = [
                    new() { Id = "att-1", Name = "Sigiriya Frescoes", Description = "5th-century painted maidens.", EntryFee = 0 },
                    new() { Id = "att-2", Name = "Mirror Wall", Description = "Ancient polished graffiti wall.", EntryFee = 0 }
                ]
            },
            new()
            {
                Id = "dest-2",
                Name = "Ella Mountain Gap & Bridges",
                Slug = "ella-gap",
                Description = "Picturesque mountain town renowned for the Nine Arches colonial bridge and tea plantation trails.",
                Location = "Badulla District",
                Province = Province.UVA,
                ImageUrl = "https://images.unsplash.com/photo-1546708973-b339540b5162",
                Category = DestinationCategory.NATURE,
                Rating = 4.8,
                ReviewCount = 980,
                EntryFee = 0.0,
                Attractions = [
                    new() { Id = "att-3", Name = "Nine Arches Bridge", Description = "Colonial rail bridge.", EntryFee = 0 },
                    new() { Id = "att-4", Name = "Little Adam's Peak", Description = "Gentle panoramic hike.", EntryFee = 0 }
                ]
            },
            new()
            {
                Id = "dest-3",
                Name = "Galle Dutch Fort",
                Slug = "galle-fort",
                Description = "Living UNESCO coastal citadel preserving 17th-century European architecture on the Indian Ocean.",
                Location = "Galle",
                Province = Province.SOUTHERN,
                ImageUrl = "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
                Category = DestinationCategory.HERITAGE,
                Rating = 4.8,
                ReviewCount = 1100,
                EntryFee = 0.0
            }
        ];
    }
}
