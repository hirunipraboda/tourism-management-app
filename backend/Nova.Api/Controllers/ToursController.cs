using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Models;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/tours")]
public class ToursController : ControllerBase
{
    private readonly NovaDbContext _db;

    public ToursController(NovaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetTours([FromQuery] string? category)
    {
        var query = _db.Tours.Include(t => t.Itineraries).AsQueryable();
        if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<TourCategory>(category, true, out var cat))
        {
            query = query.Where(t => t.Category == cat);
        }

        var tours = await query.ToListAsync();
        if (tours.Count == 0)
        {
            tours = [
                new()
                {
                    Id = "tour-1",
                    Title = "Cultural Triangle & Highlands Odyssey",
                    Slug = "cultural-triangle-highlands",
                    Code = "LK-CTH-01",
                    Description = "6-Day guided expedition across Sigiriya citadel, Kandy's Sacred Temple, and scenic Ella mountain trains.",
                    DurationDays = 6,
                    Price = 649.0,
                    Category = TourCategory.CULTURAL,
                    Rating = 4.9,
                    ImageUrl = "https://images.unsplash.com/photo-1588598198321-9735fd52455d"
                },
                new()
                {
                    Id = "tour-2",
                    Title = "Southern Coast & Whale Watching Safari",
                    Slug = "southern-coast-safari",
                    Code = "LK-SCS-02",
                    Description = "4-Day coastal retreat exploring Galle Fort, Mirissa blue whales, and Yala national park leopards.",
                    DurationDays = 4,
                    Price = 480.0,
                    Category = TourCategory.WILDLIFE,
                    Rating = 4.8,
                    ImageUrl = "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a"
                }
            ];
        }

        return Ok(new { success = true, data = tours });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTourById(string id)
    {
        var tour = await _db.Tours.Include(t => t.Itineraries).FirstOrDefaultAsync(t => t.Id == id || t.Slug == id);
        if (tour == null) return NotFound(new { success = false, message = "Tour not found" });
        return Ok(new { success = true, data = tour });
    }
}
