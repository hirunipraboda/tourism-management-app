using Nova.Api.DTOs.Reviews;
using Nova.Api.Entities;

namespace Nova.Api.Services;

public interface IReviewService
{
    Task<List<ReviewResponseDto>> GetReviewsAsync(string? destinationId = null);
    Task<ReviewResponseDto?> GetReviewByIdAsync(string id);
    Task<ReviewResponseDto> CreateReviewAsync(string userId, CreateReviewDto dto);
    Task<ReviewResponseDto?> UpdateReviewAsync(string id, string userId, UpdateReviewDto dto);
    Task<bool> DeleteReviewAsync(string id, string userId, bool isAdmin = false);
    Task<bool> VoteHelpfulAsync(string reviewId, string userId);
    Task<bool> UnvoteHelpfulAsync(string reviewId, string userId);
    Task<ReviewResponseDto?> UpdateStatusAsync(string id, ReviewStatus status);
}
