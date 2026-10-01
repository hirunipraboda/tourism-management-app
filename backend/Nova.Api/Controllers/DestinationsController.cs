using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.Entities;

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
    public async Task<IActionResult> GetDestinations([FromQuery] string? search)
    {
        try
        {
            var query = _db.Destinations.Include(d => d.Activities).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(d => EF.Functions.ILike(d.Name, $"%{search.Trim()}%") || EF.Functions.ILike(d.Description, $"%{search.Trim()}%"));
            }

            var destinations = await query.ToListAsync();
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
            var destination = await _db.Destinations.Include(d => d.Activities).FirstOrDefaultAsync(d => d.Id == id || d.Slug == id);
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
