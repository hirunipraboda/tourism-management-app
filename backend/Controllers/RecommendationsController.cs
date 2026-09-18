using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using tourism_management_app.Api.Services;
using System.Security.Claims;

namespace tourism_management_app.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;

        public RecommendationsController(IRecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }

        private int GetCurrentTouristId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : 1; 
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopular()
        {
            var popular = await _recommendationService.GetPopularRecommendationsAsync();
            return Ok(popular);
        }

        [HttpGet("personalized")]
        [Authorize]
        public async Task<IActionResult> GetPersonalized()
        {
            var touristId = GetCurrentTouristId();
            var personalized = await _recommendationService.GetPersonalizedRecommendationsAsync(touristId);
            return Ok(personalized);
        }

        [HttpGet("suitability/{attractionId}")]
        [Authorize]
        public async Task<IActionResult> GetSuitabilityScore(int attractionId)
        {
            var touristId = GetCurrentTouristId();
            var score = await _recommendationService.GetSuitabilityScoreAsync(touristId, attractionId);
            return Ok(new { AttractionId = attractionId, TouristId = touristId, SuitabilityScore = score });
        }
    }
}
