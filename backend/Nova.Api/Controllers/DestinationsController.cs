using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs;
using Nova.Api.Models;

namespace Nova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DestinationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DestinationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DestinationReadDto>>> GetDestinations()
        {
            var destinations = await _context.Destinations
                .Include(d => d.Attractions)
                .Select(d => ToReadDto(d))
                .ToListAsync();

            return Ok(destinations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DestinationReadDto>> GetDestination(Guid id)
        {
            var destination = await _context.Destinations
                .Include(d => d.Attractions)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (destination == null)
                return NotFound();

            return Ok(ToReadDto(destination));
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<DestinationReadDto>>> SearchDestinations([FromQuery] string query)
        {
            var destinations = await _context.Destinations
                .Include(d => d.Attractions)
                .Where(d => d.Name.Contains(query) || d.City.Contains(query) || d.Country.Contains(query))
                .Select(d => ToReadDto(d))
                .ToListAsync();

            return Ok(destinations);
        }

        [HttpPost]
        public async Task<ActionResult<DestinationReadDto>> CreateDestination(DestinationCreateDto dto)
        {
            var destination = new Destination
            {
                Name = dto.Name,
                Country = dto.Country,
                City = dto.City,
                Description = dto.Description
            };

            _context.Destinations.Add(destination);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDestination), new { id = destination.Id }, ToReadDto(destination));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDestination(Guid id, DestinationUpdateDto dto)
        {
            var destination = await _context.Destinations.FindAsync(id);
            if (destination == null)
                return NotFound();

            destination.Name = dto.Name;
            destination.Country = dto.Country;
            destination.City = dto.City;
            destination.Description = dto.Description;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDestination(Guid id)
        {
            var destination = await _context.Destinations.FindAsync(id);
            if (destination == null)
                return NotFound();

            _context.Destinations.Remove(destination);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static DestinationReadDto ToReadDto(Destination d) => new()
        {
            Id = d.Id,
            Name = d.Name,
            Country = d.Country,
            City = d.City,
            Description = d.Description,
            CreatedAt = d.CreatedAt,
            Attractions = d.Attractions?.Select(a => new AttractionReadDto
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
            }).ToList()
        };
    }
}