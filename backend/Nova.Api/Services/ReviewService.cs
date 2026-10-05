using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Reviews;
using Nova.Api.Entities;

namespace Nova.Api.Services;

public class ReviewService : IReviewService
{
    private readonly NovaDbContext _db;

    public ReviewService(NovaDbContext db)
    {
        _db = db;
    }

    public async Task<List<ReviewResponseDto>> GetReviewsAsync(string? destinationId = null)
    {
        var query = _db.Reviews
            .Include(r => r.User)
            .Include(r => r.HelpfulVotes)
            .AsQueryable();

        if (!string.IsNullOrEmpty(destinationId))
            query = query.Where(r => r.DestinationId == destinationId);

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => MapToDto(r, null)).ToList();
    }

    public async Task<ReviewResponseDto?> GetReviewByIdAsync(string id)
    {
        var review = await _db.Reviews
            .Include(r => r.User)
            .Include(r => r.HelpfulVotes)
            .FirstOrDefaultAsync(r => r.Id == id);

        return review is null ? null : MapToDto(review, null);
    }

    public async Task<ReviewResponseDto> CreateReviewAsync(string userId, CreateReviewDto dto)
    {
        var review = new Review
        {
            UserId = userId,
            DestinationId = dto.DestinationId,
            Comment = dto.Comment,
            Rating = Math.Clamp(dto.Rating, 1, 5),
            Status = ReviewStatus.Approved
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        await _db.Entry(review).Reference(r => r.User).LoadAsync();

        return MapToDto(review, userId);
    }

    public async Task<ReviewResponseDto?> UpdateReviewAsync(string id, string userId, UpdateReviewDto dto)
    {
        var review = await _db.Reviews
            .Include(r => r.User)
            .Include(r => r.HelpfulVotes)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (review is null) return null;

        if (dto.Comment is not null) review.Comment = dto.Comment;
        if (dto.Rating.HasValue) review.Rating = Math.Clamp(dto.Rating.Value, 1, 5);
        review.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return MapToDto(review, userId);
    }

    public async Task<bool> DeleteReviewAsync(string id, string userId, bool isAdmin = false)
    {
        var review = isAdmin
            ? await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id)
            : await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (review is null) return false;

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> VoteHelpfulAsync(string reviewId, string userId)
    {
        var exists = await _db.ReviewHelpfulVotes
            .AnyAsync(v => v.ReviewId == reviewId && v.UserId == userId);

        if (exists) return false;

        _db.ReviewHelpfulVotes.Add(new ReviewHelpfulVote
        {
            ReviewId = reviewId,
            UserId = userId
        });

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnvoteHelpfulAsync(string reviewId, string userId)
    {
        var vote = await _db.ReviewHelpfulVotes
            .FirstOrDefaultAsync(v => v.ReviewId == reviewId && v.UserId == userId);

        if (vote is null) return false;

        _db.ReviewHelpfulVotes.Remove(vote);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<ReviewResponseDto?> UpdateStatusAsync(string id, ReviewStatus status)
    {
        var review = await _db.Reviews
            .Include(r => r.User)
            .Include(r => r.HelpfulVotes)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review is null) return null;

        review.Status = status;
        review.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return MapToDto(review, null);
    }

    private static ReviewResponseDto MapToDto(Review review, string? currentUserId)
    {
        return new ReviewResponseDto
        {
            Id = review.Id,
            UserId = review.UserId,
            UserName = review.User?.Name,
            DestinationId = review.DestinationId,
            Comment = review.Comment,
            Rating = review.Rating,
            Status = review.Status.ToString(),
            HelpfulVotesCount = review.HelpfulVotes.Count,
            HasVoted = currentUserId != null && review.HelpfulVotes.Any(v => v.UserId == currentUserId),
            CreatedAt = review.CreatedAt,
            UpdatedAt = review.UpdatedAt
        };
    }
}
