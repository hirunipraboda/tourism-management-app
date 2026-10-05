using System.Text;
using System.Text.Json;
using Nova.Api.DTOs.Recommendations;

namespace Nova.Api.Services;

public class AiAgentClient : IAiAgentClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AiAgentClient> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    public AiAgentClient(HttpClient httpClient, ILogger<AiAgentClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<RecommendationResponseDto?> GetRecommendationsAsync(RecommendationFilterRequestDto request)
    {
        try
        {
            var json = JsonSerializer.Serialize(request, JsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/api/recommendations", content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<RecommendationResponseDto>(responseBody, JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to call AI agent recommendations endpoint.");
            return null;
        }
    }
}
