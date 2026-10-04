using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Reviews;
using Nova.Api.Entities;

namespace Nova.Api.Services;

// ─────────────────────────────────────────────────────────────────────────────
// Review Service Interface
// ─────────────────────────────────────────────────────────────────────────────

public interface IReviewService
{
    Task<ReviewResponseDto> CreateReviewAsync(string userId, ReviewCreateDto dto);
    Task<ReviewResponseDto?> GetReviewByIdAsync(string id);
    Task<ReviewResponseDto?> UpdateReviewAsync(string id, string userId, ReviewUpdateDto dto);
    Task<bool> DeleteReviewAsync(string id, string userId);
    Task<(int HelpfulCount, bool IsHelpfulByUser)?> ToggleHelpfulAsync(string id, string userId);

    Task<IEnumerable<ReviewResponseDto>> GetAllReviewsAsync(string? entityType, int? minRating, string? search);
    Task<IEnumerable<ReviewResponseDto>> GetReviewsByDestinationAsync(string destinationId);
    Task<ReviewSummaryDto> GetReviewSummaryByDestinationAsync(string destinationId);

    Task<AnalyticsDto> GetAnalyticsAsync();
    Task<ReviewResponseDto?> UpdateReviewStatusAsync(string id, string? status, string? operatorNotes);
}

// ─────────────────────────────────────────────────────────────────────────────
// Review Service Implementation
// ─────────────────────────────────────────────────────────────────────────────

public class ReviewService : IReviewService
{
    private readonly NovaDbContext _db;

    public ReviewService(NovaDbContext db)
    {
        _db = db;
    }

    private async Task<ReviewResponseDto> MapToDto(Review review)
    {
        var user = await _db.Users.FindAsync(review.UserId);
        var helpfulCount = await _db.ReviewHelpfulVotes.CountAsync(v => v.ReviewId == review.Id);

        return new ReviewResponseDto
        {
            Id = int.TryParse(review.Id, out var intId) ? intId : 0,
            TouristId = review.UserId,
            TouristName = user?.Name ?? "Anonymous",
            EntityId = 0,
            EntityType = "Destination",
            EntityName = review.DestinationId ?? string.Empty,
            Rating = review.Rating,
            Title = string.Empty,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt,
            Status = review.Status.ToString(),
            HelpfulCount = helpfulCount,
            IsHelpfulByUser = false
        };
    }

    public async Task<ReviewResponseDto> CreateReviewAsync(string userId, ReviewCreateDto dto)
    {
        var review = new Review
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            DestinationId = dto.EntityId > 0 ? dto.EntityId.ToString() : null,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();
        return await MapToDto(review);
    }

    public async Task<ReviewResponseDto?> GetReviewByIdAsync(string id)
    {
        var review = await _db.Reviews.FindAsync(id);
        return review is null ? null : await MapToDto(review);
    }

    public async Task<ReviewResponseDto?> UpdateReviewAsync(string id, string userId, ReviewUpdateDto dto)
    {
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
        if (review is null) return null;

        review.Rating = dto.Rating;
        review.Comment = dto.Comment;
        review.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return await MapToDto(review);
    }

    public async Task<bool> DeleteReviewAsync(string id, string userId)
    {
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
        if (review is null) return false;

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<(int HelpfulCount, bool IsHelpfulByUser)?> ToggleHelpfulAsync(string id, string userId)
    {
        var review = await _db.Reviews.FindAsync(id);
        if (review is null) return null;

        var vote = await _db.ReviewHelpfulVotes
            .FirstOrDefaultAsync(v => v.ReviewId == id && v.TouristId == userId);

        bool isHelpfulByUser;
        if (vote is null)
        {
            _db.ReviewHelpfulVotes.Add(new ReviewHelpfulVote { ReviewId = id, TouristId = userId });
            isHelpfulByUser = true;
        }
        else
        {
            _db.ReviewHelpfulVotes.Remove(vote);
            isHelpfulByUser = false;
        }

        await _db.SaveChangesAsync();
        var helpfulCount = await _db.ReviewHelpfulVotes.CountAsync(v => v.ReviewId == id);
        return (helpfulCount, isHelpfulByUser);
    }

    public async Task<IEnumerable<ReviewResponseDto>> GetAllReviewsAsync(string? entityType, int? minRating, string? search)
    {
        var query = _db.Reviews.AsQueryable();

        if (minRating.HasValue)
            query = query.Where(r => r.Rating >= minRating.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(r => r.Comment.Contains(search));

        var reviews = await query.OrderByDescending(r => r.CreatedAt).Take(100).ToListAsync();

        var result = new List<ReviewResponseDto>();
        foreach (var r in reviews)
            result.Add(await MapToDto(r));
        return result;
    }

    public async Task<IEnumerable<ReviewResponseDto>> GetReviewsByDestinationAsync(string destinationId)
    {
        var reviews = await _db.Reviews
            .Where(r => r.DestinationId == destinationId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var result = new List<ReviewResponseDto>();
        foreach (var r in reviews)
            result.Add(await MapToDto(r));
        return result;
    }

    public async Task<ReviewSummaryDto> GetReviewSummaryByDestinationAsync(string destinationId)
    {
        var reviews = await _db.Reviews
            .Where(r => r.DestinationId == destinationId)
            .ToListAsync();

        var distribution = new Dictionary<int, int>();
        for (int i = 1; i <= 5; i++)
            distribution[i] = reviews.Count(r => r.Rating == i);

        return new ReviewSummaryDto
        {
            TotalReviews = reviews.Count,
            AverageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0,
            RatingDistribution = distribution
        };
    }

    public async Task<AnalyticsDto> GetAnalyticsAsync()
    {
        var reviews = await _db.Reviews.ToListAsync();
        var total = reviews.Count;
        var avgRating = total > 0 ? reviews.Average(r => r.Rating) : 0;
        var positiveCount = reviews.Count(r => r.Rating >= 4);

        return new AnalyticsDto
        {
            TotalReviews = total,
            AverageRating = avgRating,
            FlaggedCount = reviews.Count(r => r.Status == ReviewStatus.Flagged),
            PendingCount = 0,
            PositivePercentage = total > 0 ? Math.Round((double)positiveCount / total * 100, 1) : 0
        };
    }

    public async Task<ReviewResponseDto?> UpdateReviewStatusAsync(string id, string? status, string? operatorNotes)
    {
        var review = await _db.Reviews.FindAsync(id);
        if (review is null) return null;

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ReviewStatus>(status, out var parsed))
            review.Status = parsed;

        review.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return await MapToDto(review);
    }
}
