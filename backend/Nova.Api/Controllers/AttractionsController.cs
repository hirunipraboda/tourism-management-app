using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs;
using Nova.Api.Models;

namespace Nova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttractionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttractionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttractionReadDto>>> GetAttractions()
        {
            var attractions = await _context.Attractions
                .Select(a => ToReadDto(a))
                .ToListAsync();

            return Ok(attractions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AttractionReadDto>> GetAttraction(Guid id)
        {
            var attraction = await _context.Attractions.FindAsync(id);
            if (attraction == null)
                return NotFound();

            return Ok(ToReadDto(attraction));
        }

        [HttpGet("nearby")]
        public async Task<ActionResult<IEnumerable<AttractionReadDto>>> GetNearbyAttractions(
            [FromQuery] double lat, [FromQuery] double lng, [FromQuery] double radiusKm = 5)
        {
            double latDelta = radiusKm / 111.0;
            double lngDelta = radiusKm / (111.0 * Math.Cos(lat * Math.PI / 180));

            var attractions = await _context.Attractions
                .Where(a => a.Latitude != null && a.Longitude != null
                    && a.Latitude >= lat - latDelta && a.Latitude <= lat + latDelta
                    && a.Longitude >= lng - lngDelta && a.Longitude <= lng + lngDelta)
                .Select(a => ToReadDto(a))
                .ToListAsync();

            return Ok(attractions);
        }

        [HttpPost]
        public async Task<ActionResult<AttractionReadDto>> CreateAttraction(AttractionCreateDto dto)
        {
            var destinationExists = await _context.Destinations.AnyAsync(d => d.Id == dto.DestinationId);
            if (!destinationExists)
                return BadRequest("DestinationId does not exist.");

            var attraction = new Attraction
            {
                DestinationId = dto.DestinationId,
                Name = dto.Name,
                Category = dto.Category,
                OpeningHours = dto.OpeningHours,
                EntryFee = dto.EntryFee,
                VisitDurationMinutes = dto.VisitDurationMinutes,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                IsAccessible = dto.IsAccessible
            };

            _context.Attractions.Add(attraction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAttraction), new { id = attraction.Id }, ToReadDto(attraction));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAttraction(Guid id, AttractionUpdateDto dto)
        {
            var attraction = await _context.Attractions.FindAsync(id);
            if (attraction == null)
                return NotFound();

            attraction.Name = dto.Name;
            attraction.Category = dto.Category;
            attraction.OpeningHours = dto.OpeningHours;
            attraction.EntryFee = dto.EntryFee;
            attraction.VisitDurationMinutes = dto.VisitDurationMinutes;
            attraction.Latitude = dto.Latitude;
            attraction.Longitude = dto.Longitude;
            attraction.IsAccessible = dto.IsAccessible;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAttraction(Guid id)
        {
            var attraction = await _context.Attractions.FindAsync(id);
            if (attraction == null)
                return NotFound();

            _context.Attractions.Remove(attraction);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static AttractionReadDto ToReadDto(Attraction a) => new()
        {
            Id = a.Id,
            DestinationId = a.DestinationId,
            Name = a.Name,
            Category = a.Category,
            OpeningHours = a.OpeningHours,
            EntryFee = a.EntryFee,
            VisitDurationMinutes = a.VisitDurationMinutes,
            Latitude = a.Latitude,
            Longitude = a.Longitude,
            IsAccessible = a.IsAccessible,
            CreatedAt = a.CreatedAt
        };
    }
}