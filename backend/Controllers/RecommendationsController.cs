using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using tourism_management_app.Api.DTOs;
using tourism_management_app.Api.Services;
using System.Security.Claims;

namespace tourism_management_app.Api.Controllers
{
    /// <summary>
    /// Smart Recommendations endpoints — personalized scoring, popular, insights, suitability breakdown, and AI agent.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;
        private readonly IAgentService _agentService;
        private readonly ILogger<RecommendationsController> _logger;

        public RecommendationsController(
            IRecommendationService recommendationService,
            IAgentService agentService,
            ILogger<RecommendationsController> logger)
        {
            _recommendationService = recommendationService;
            _agentService = agentService;
            _logger = logger;
        }

        private int GetCurrentTouristId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        // ── GET /api/Recommendations/popular ─────────────────────────────────

        /// <summary>
        /// Returns the top attractions ranked by weighted Bayesian rating × review count.
        /// Cached for 5 minutes (configurable via RecommendationScoring:PopularCacheMinutes).
        /// </summary>
        /// <param name="limit">Max results to return (default 10).</param>
        [HttpGet("popular")]
        [ProducesResponseType(typeof(IEnumerable<PersonalizedRecommendationDto>), 200)]
        public async Task<IActionResult> GetPopular([FromQuery] int limit = 10)
        {
            if (limit < 1 || limit > 50) limit = 10;
            var popular = await _recommendationService.GetPopularRecommendationsAsync(limit);
            return Ok(popular);
        }

        // ── GET /api/Recommendations/insights ────────────────────────────────

        /// <summary>
        /// Returns aggregate review statistics: top attraction, trending destination,
        /// category distribution, highest-rated places, average suitability by theme.
        /// Cached for 5 minutes (configurable via RecommendationScoring:InsightsCacheMinutes).
        /// </summary>
        [HttpGet("insights")]
        [ProducesResponseType(typeof(InsightsDto), 200)]
        public async Task<IActionResult> GetInsights()
        {
            var insights = await _recommendationService.GetInsightsAsync();
            return Ok(insights);
        }

        // ── POST /api/Recommendations ─────────────────────────────────────────

        /// <summary>
        /// Admin adds a new recommendation (curated attraction landmark).
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(PersonalizedRecommendationDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> CreateRecommendation([FromBody] CreateRecommendationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Attraction Name is required." });

            var result = await _recommendationService.CreateRecommendationAsync(dto);
            return StatusCode(201, result);
        }

        // ── GET /api/Recommendations/personalized ─────────────────────────────

        /// <summary>
        /// Returns a personalized, scored list of attractions based on the provided filters
        /// and the authenticated user's review history.
        /// Applies hard filters (budget, distance, min rating, activity type) then scores
        /// each attraction 0-100 using configurable weights.
        /// Falls back to /popular if no results pass the filters.
        /// </summary>
        /// <param name="interests">Comma-separated or repeated interests: Culture, History, Nature, Adventure, Food, Wildlife, Beaches</param>
        /// <param name="maxBudget">Max daily budget in USD (default 100).</param>
        /// <param name="maxDistanceKm">Max distance from base location in km (default 200).</param>
        /// <param name="minRating">Minimum average review rating 0-5 (default 0 = any).</param>
        /// <param name="activityType">Filter: All, attraction, tour (default All).</param>
        /// <param name="userLat">Base latitude for distance calc (default: Colombo 6.9271).</param>
        /// <param name="userLng">Base longitude for distance calc (default: Colombo 79.8612).</param>
        /// <param name="limit">Max results (default 10, max 50).</param>
        [HttpGet("personalized")]
        [ProducesResponseType(typeof(IEnumerable<PersonalizedRecommendationDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetPersonalized(
            [FromQuery] List<string>? interests,
            [FromQuery] double maxBudget = 100,
            [FromQuery] double maxDistanceKm = 200,
            [FromQuery] double minRating = 0,
            [FromQuery] string activityType = "All",
            [FromQuery] double userLat = 6.9271,
            [FromQuery] double userLng = 79.8612,
            [FromQuery] int limit = 10)
        {
            if (maxBudget < 0 || maxDistanceKm < 0 || minRating < 0 || minRating > 5)
                return BadRequest(new { message = "Invalid filter parameters." });
            if (limit < 1 || limit > 50) limit = 10;

            _logger.LogInformation(
                "Personalized recommendations requested: interests=[{Interests}], budget={MaxBudget}, distance={MaxDistanceKm}km, minRating={MinRating}, activityType={ActivityType}, limit={Limit}",
                interests != null ? string.Join(", ", interests) : "none",
                maxBudget,
                maxDistanceKm,
                minRating,
                activityType,
                limit);

            var queryParams = new PersonalizedQueryParams
            {
                Interests = interests,
                MaxBudget = maxBudget,
                MaxDistanceKm = maxDistanceKm,
                MinRating = minRating,
                ActivityType = activityType,
                UserLat = userLat,
                UserLng = userLng,
                Limit = limit
            };

            var touristId = GetCurrentTouristId();
            var personalized = await _recommendationService.GetPersonalizedRecommendationsAsync(queryParams, touristId);
            return Ok(personalized);
        }

        // ── GET /api/Recommendations/suitability/{attractionId} ───────────────

        /// <summary>
        /// Returns a detailed suitability breakdown for a specific attraction vs. the
        /// current user's filter context. Shows per-criterion scores and a verdict.
        /// </summary>
        /// <param name="attractionId">The attraction to analyse.</param>
        [HttpGet("suitability/{attractionId:int}")]
        [ProducesResponseType(typeof(SuitabilityDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetSuitability(
            int attractionId,
            [FromQuery] List<string>? interests,
            [FromQuery] double maxBudget = 100,
            [FromQuery] double maxDistanceKm = 200,
            [FromQuery] double minRating = 0,
            [FromQuery] string activityType = "All",
            [FromQuery] double userLat = 6.9271,
            [FromQuery] double userLng = 79.8612)
        {
            var exists = await _recommendationService.AttractionExistsAsync(attractionId);
            if (!exists) return NotFound(new { message = $"Attraction {attractionId} not found." });

            var queryParams = new PersonalizedQueryParams
            {
                Interests = interests,
                MaxBudget = maxBudget,
                MaxDistanceKm = maxDistanceKm,
                MinRating = minRating,
                ActivityType = activityType,
                UserLat = userLat,
                UserLng = userLng
            };

            var touristId = GetCurrentTouristId();
            var suitability = await _recommendationService.GetSuitabilityAsync(attractionId, queryParams, touristId);
            return Ok(suitability);
        }

        // ── POST /api/Recommendations/agent ──────────────────────────────────

        /// <summary>
        /// AI Travel Recommendation Agent. Accepts a natural-language message and optional
        /// filter context. The agent calls internal tools (search, popular, insights, suitability,
        /// user history) and returns a ranked list of up to 6 real attractions with explanations.
        /// Falls back to /personalized results if the LLM is unavailable.
        /// </summary>
        /// <param name="request">The agent request with user message and optional filters.</param>
        [HttpPost("agent")]
        [ProducesResponseType(typeof(AgentResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(504)]
        public async Task<IActionResult> AskAgent([FromBody] AgentRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { message = "Message is required." });

            var touristId = GetCurrentTouristId();
            var timeoutSeconds = int.TryParse(_logger.GetType().Name, out _) ? 45 : 45; // read from config in real scenario
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(45));

            try
            {
                var response = await _agentService.RunAgentAsync(request, touristId, cts.Token);
                return Ok(response);
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("[Agent] Request timed out for tourist {Id}", touristId);
                return StatusCode(504, new { message = "Agent request timed out. Please try again." });
            }
        }
    }
}
