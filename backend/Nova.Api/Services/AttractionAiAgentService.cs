using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Nova.Api.DTOs;

namespace Nova.Api.Services
{
    public class AttractionAiAgentService : IAttractionAiAgentService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AttractionAiAgentService> _logger;
        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        public AttractionAiAgentService(HttpClient httpClient, ILogger<AttractionAiAgentService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<AttractionAiStateDto?> CurateAttractionsAsync(CurateAttractionsRequestDto request)
        {
            try
            {
                var payload = new
                {
                    thread_id = request.ThreadId,
                    destination_id = request.DestinationId.ToString(),
                    destination_name = request.DestinationName,
                    preferences = new
                    {
                        user_budget = request.Preferences.UserBudget,
                        max_duration_hours = request.Preferences.MaxDurationHours,
                        categories = request.Preferences.Categories,
                        require_accessible = request.Preferences.RequireAccessible,
                        notes = request.Preferences.Notes ?? ""
                    }
                };

                var response = await _httpClient.PostAsJsonAsync("/api/v1/attractions/curate", payload);
                response.EnsureSuccessStatusCode();

                return await response.Content.ReadFromJsonAsync<AttractionAiStateDto>(JsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to invoke Python LangGraph AI Service for attraction curation.");
                throw;
            }
        }

        public async Task<AttractionAiStateDto?> SubmitHumanApprovalAsync(HumanApprovalRequestDto request)
        {
            try
            {
                var payload = new
                {
                    thread_id = request.ThreadId,
                    decision = request.Decision,
                    feedback = request.Feedback
                };

                var response = await _httpClient.PostAsJsonAsync("/api/v1/attractions/approve", payload);
                response.EnsureSuccessStatusCode();

                return await response.Content.ReadFromJsonAsync<AttractionAiStateDto>(JsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to submit human approval to Python LangGraph AI Service.");
                throw;
            }
        }

        public async Task<AttractionAiStateDto?> GetStateStatusAsync(string threadId)
        {
            try
            {
                return await _httpClient.GetFromJsonAsync<AttractionAiStateDto>($"/api/v1/attractions/status/{threadId}", JsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch state status for thread {ThreadId} from Python AI Service.", threadId);
                return null;
            }
        }
    }
}
