using Nova.Api.DTOs.Recommendations;

namespace Nova.Api.Services;

public interface IAiAgentClient
{
    Task<RecommendationResponseDto?> GetRecommendationsAsync(RecommendationFilterRequestDto request);
}
