using tourism_management_app.Api.DTOs;

namespace tourism_management_app.Api.Services
{
    public interface IReviewService
    {
        Task<ReviewResponseDto> CreateReviewAsync(int touristId, ReviewCreateDto reviewDto);
        Task<ReviewResponseDto?> GetReviewByIdAsync(int id);
        Task<ReviewResponseDto?> UpdateReviewAsync(int id, int touristId, ReviewUpdateDto reviewDto);
        Task<bool> DeleteReviewAsync(int id, int touristId);
        Task<(int HelpfulCount, bool IsHelpfulByUser)?> ToggleHelpfulAsync(int id, int touristId);
        
        Task<IEnumerable<ReviewResponseDto>> GetAllReviewsAsync(string? entityType, int? minRating, string? search);
        Task<IEnumerable<ReviewResponseDto>> GetReviewsByEntityAsync(string entityType, int entityId);
        Task<ReviewSummaryDto> GetEntityReviewSummaryAsync(string entityType, int entityId);
        
        Task<AnalyticsDto> GetAnalyticsAsync();
        Task<ReviewResponseDto?> UpdateReviewStatusAsync(int id, string? status, string? operatorNotes);
    }
}
