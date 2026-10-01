using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using tourism_management_app.Api.DTOs;
using tourism_management_app.Api.Services;
using System.Security.Claims;

namespace tourism_management_app.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // Helper to get TouristId from token (assuming mocked/basic auth for now)
        private int GetCurrentTouristId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : 1; // Default to 1 if not auth'd for testing
        }

        [HttpGet]
        public async Task<IActionResult> GetAllReviews(
            [FromQuery] string? entityType,
            [FromQuery] int? minRating,
            [FromQuery] string? search)
        {
            var reviews = await _reviewService.GetAllReviewsAsync(entityType, minRating, search);
            return Ok(reviews);
        }

        [HttpGet("my-reviews")]
        [Authorize]
        public async Task<IActionResult> GetMyReviews()
        {
            var touristId = GetCurrentTouristId();
            var reviews = await _reviewService.GetAllReviewsAsync(null, null, null);
            // Filter to only current tourist's reviews
            var mine = reviews.Where(r => r.TouristId == touristId);
            return Ok(mine);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] ReviewCreateDto reviewDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var touristId = GetCurrentTouristId();
            try
            {
                var created = await _reviewService.CreateReviewAsync(touristId, reviewDto);
                return CreatedAtAction(nameof(GetReview), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReview(int id)
        {
            var review = await _reviewService.GetReviewByIdAsync(id);
            if (review == null) return NotFound();
            return Ok(review);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] ReviewUpdateDto reviewDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var touristId = GetCurrentTouristId();
            var updated = await _reviewService.UpdateReviewAsync(id, touristId, reviewDto);
            
            if (updated == null) return NotFound("Review not found or you are not authorized to edit it.");
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var touristId = GetCurrentTouristId();
            var success = await _reviewService.DeleteReviewAsync(id, touristId);
            
            if (!success) return NotFound(new { message = "Review not found or you are not authorized to delete it." });
            return NoContent();
        }

        [HttpPost("{id}/helpful")]
        public async Task<IActionResult> ToggleHelpful(int id)
        {
            var result = await _reviewService.ToggleHelpfulAsync(id, GetCurrentTouristId());
            if (result == null) return NotFound(new { message = "Review not found" });
            return Ok(new { helpfulCount = result.Value.HelpfulCount, isHelpfulByUser = result.Value.IsHelpfulByUser });
        }

        [HttpPost("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] ReviewStatusUpdateDto dto)
        {
            var updated = await _reviewService.UpdateReviewStatusAsync(id, dto.Status, dto.OperatorNotes);
            if (updated == null) return NotFound(new { message = "Review not found" });
            return Ok(updated);
        }

        [HttpPost("{id}/reply")]
        public async Task<IActionResult> ReplyToReview(int id, [FromBody] ReviewReplyDto dto)
        {
            var updated = await _reviewService.UpdateReviewStatusAsync(id, null, dto.Reply);
            if (updated == null) return NotFound(new { message = "Review not found" });
            return Ok(updated);
        }

        [HttpGet("destination/{id}")]
        public async Task<IActionResult> GetDestinationReviews(int id)
        {
            return Ok(await _reviewService.GetReviewsByEntityAsync("Destination", id));
        }

        [HttpGet("attraction/{id}")]
        public async Task<IActionResult> GetAttractionReviews(int id)
        {
            return Ok(await _reviewService.GetReviewsByEntityAsync("Attraction", id));
        }

        [HttpGet("tour-package/{id}")]
        public async Task<IActionResult> GetTourPackageReviews(int id)
        {
            return Ok(await _reviewService.GetReviewsByEntityAsync("TourPackage", id));
        }

        [HttpGet("attraction/{id}/summary")]
        public async Task<IActionResult> GetAttractionSummary(int id)
        {
            return Ok(await _reviewService.GetEntityReviewSummaryAsync("Attraction", id));
        }

        [HttpGet("analytics")]
        [Authorize(Roles = "Admin,Operator")] // Only admins/operators
        public async Task<IActionResult> GetAnalytics()
        {
            return Ok(await _reviewService.GetAnalyticsAsync());
        }
    }
}
