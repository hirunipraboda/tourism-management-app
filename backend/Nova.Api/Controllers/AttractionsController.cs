using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs;
using Nova.Api.Models;
using Nova.Api.Services;

namespace Nova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttractionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAttractionAiAgentService _aiAgentService;

        public AttractionsController(AppDbContext context, IAttractionAiAgentService aiAgentService)
        {
            _context = context;
            _aiAgentService = aiAgentService;
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

        // ===================================================================
        // Python LangGraph AI Service Integration Endpoints
        // ===================================================================

        [HttpPost("ai/curate")]
        public async Task<ActionResult<AttractionAiStateDto>> CurateAttractions([FromBody] CurateAttractionsRequestDto request)
        {
            var destination = await _context.Destinations.FindAsync(request.DestinationId);
            if (destination != null && string.IsNullOrWhiteSpace(request.DestinationName))
            {
                request.DestinationName = destination.Name;
            }

            var result = await _aiAgentService.CurateAttractionsAsync(request);
            if (result == null)
                return StatusCode(500, "Failed to execute AI attraction curation.");

            return Ok(result);
        }

        [HttpPost("ai/approve")]
        public async Task<ActionResult<AttractionAiStateDto>> SubmitHumanApproval([FromBody] HumanApprovalRequestDto request)
        {
            var result = await _aiAgentService.SubmitHumanApprovalAsync(request);
            if (result == null)
                return StatusCode(500, "Failed to submit human approval to AI service.");

            return Ok(result);
        }

        [HttpGet("ai/status/{threadId}")]
        public async Task<ActionResult<AttractionAiStateDto>> GetAiStateStatus(string threadId)
        {
            var result = await _aiAgentService.GetStateStatusAsync(threadId);
            if (result == null)
                return NotFound($"AI thread '{threadId}' not found.");

            return Ok(result);
        }

        [HttpPost("ai/save-approved/{threadId}")]
        public async Task<ActionResult<IEnumerable<AttractionReadDto>>> SaveApprovedAttractions(string threadId)
        {
            var state = await _aiAgentService.GetStateStatusAsync(threadId);
            if (state == null)
                return NotFound($"AI thread '{threadId}' not found.");

            if (!string.Equals(state.Status, "APPROVED", StringComparison.OrdinalIgnoreCase))
                return BadRequest($"Thread is in status '{state.Status}'. Only 'APPROVED' plans can be saved.");

            if (!Guid.TryParse(state.DestinationId, out Guid destinationId))
                return BadRequest("Invalid Destination ID in AI state.");

            var destinationExists = await _context.Destinations.AnyAsync(d => d.Id == destinationId);
            if (!destinationExists)
                return BadRequest("Associated Destination does not exist in database.");

            var createdAttractions = new List<AttractionReadDto>();
            foreach (var item in state.CuratedPlan)
            {
                var attraction = new Attraction
                {
                    DestinationId = destinationId,
                    Name = item.Name,
                    Category = item.Category,
                    OpeningHours = item.OpeningHours,
                    EntryFee = item.EntryFee,
                    VisitDurationMinutes = item.VisitDurationMinutes,
                    Latitude = item.Latitude,
                    Longitude = item.Longitude,
                    IsAccessible = item.IsAccessible
                };

                _context.Attractions.Add(attraction);
                await _context.SaveChangesAsync();
                createdAttractions.Add(ToReadDto(attraction));
            }

            return Ok(createdAttractions);
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