using tourism_management_app.Api.DTOs;

namespace tourism_management_app.Api.Services
{
    public interface IRecommendationService
    {
        // ── Core Recommendation Endpoints ──────────────────────────────────────
        Task<IEnumerable<PersonalizedRecommendationDto>> GetPopularRecommendationsAsync(int limit = 10);
        Task<IEnumerable<PersonalizedRecommendationDto>> GetPersonalizedRecommendationsAsync(PersonalizedQueryParams queryParams, int touristId);
        Task<InsightsDto> GetInsightsAsync();
        Task<SuitabilityDto> GetSuitabilityAsync(int attractionId, PersonalizedQueryParams queryParams, int touristId);

        // ── Agent Tool Backends (called directly — no HTTP self-calls) ─────────
        Task<IEnumerable<PersonalizedRecommendationDto>> SearchAttractionsAsync(PersonalizedQueryParams queryParams);
        Task<IEnumerable<PersonalizedRecommendationDto>> GetPopularAttractionsForAgentAsync();
        Task<InsightsDto> GetReviewInsightsAsync(int? attractionId = null);
        Task<SuitabilityDto?> GetSuitabilityForAgentAsync(int attractionId, PersonalizedQueryParams queryParams, int touristId);
        Task<IEnumerable<UserHistoryItem>> GetUserReviewHistoryAsync(int touristId);

        // ── Utility ───────────────────────────────────────────────────────────
        Task<bool> AttractionExistsAsync(int attractionId);

        // ── Admin Management ───────────────────────────────────────────────────
        Task<PersonalizedRecommendationDto> CreateRecommendationAsync(CreateRecommendationDto dto);
    }

    public record UserHistoryItem(int AttractionId, string Name, string Category, int Rating, DateTime ReviewedAt);
}
