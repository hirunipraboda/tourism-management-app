using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nova.Api.DTOs.Reviews;
using Nova.Api.Entities;
using Nova.Api.Services;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);
    private bool IsAdmin() => User.IsInRole("Admin");

    /// <summary>Get all reviews, optionally filtered by destination.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ReviewResponseDto>), 200)]
    public async Task<IActionResult> GetReviews([FromQuery] string? destinationId)
    {
        var reviews = await _reviewService.GetReviewsAsync(destinationId);
        return Ok(reviews);
    }

    /// <summary>Get a single review by ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ReviewResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetReview(string id)
    {
        var review = await _reviewService.GetReviewByIdAsync(id);
        return review is null ? NotFound() : Ok(review);
    }

    /// <summary>Create a new review (authenticated users only).</summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(ReviewResponseDto), 201)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var review = await _reviewService.CreateReviewAsync(userId, dto);
        return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
    }

    /// <summary>Update an existing review (owner only).</summary>
    [HttpPut("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(ReviewResponseDto), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateReview(string id, [FromBody] UpdateReviewDto dto)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var review = await _reviewService.UpdateReviewAsync(id, userId, dto);
        return review is null ? NotFound() : Ok(review);
    }

    /// <summary>Delete a review (owner or admin).</summary>
    [HttpDelete("{id}")]
    [Authorize]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteReview(string id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var deleted = await _reviewService.DeleteReviewAsync(id, userId, IsAdmin());
        return deleted ? NoContent() : NotFound();
    }

    /// <summary>Vote a review as helpful.</summary>
    [HttpPost("{id}/helpful")]
    [Authorize]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> VoteHelpful(string id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var success = await _reviewService.VoteHelpfulAsync(id, userId);
        return success ? NoContent() : Conflict(new { message = "Already voted." });
    }

    /// <summary>Remove a helpful vote.</summary>
    [HttpDelete("{id}/helpful")]
    [Authorize]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UnvoteHelpful(string id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var success = await _reviewService.UnvoteHelpfulAsync(id, userId);
        return success ? NoContent() : NotFound();
    }

    /// <summary>Update review status (Admin only).</summary>
    [HttpPatch("{id}/status")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(ReviewResponseDto), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateStatus(string id, [FromQuery] ReviewStatus status)
    {
        var review = await _reviewService.UpdateStatusAsync(id, status);
        return review is null ? NotFound() : Ok(review);
    }
}
