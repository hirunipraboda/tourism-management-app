using System.Net;
using System.Text;
using System.Text.Json;
using Nova.Api.DTOs.Recommendations;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.Reviews;

public class RecommendationsControllerTests
{
    private static RecommendationFilterRequestDto ValidRequest(string? destination = null, params string[] interests) => new()
    {
        Destination = destination,
        Interests = interests.Length > 0 ? interests.ToList() : new List<string> { "Culture", "History" },
        MinRating = 4.0,
        MaxBudget = 100m,
        TravelStyle = "balanced"
    };

    [Fact, Trait("TestCase", "API-REC-001")]
    public async Task GetSmartMatch_ValidPreferences_ReturnsRecommendations()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.PostAsync("/api/recommendations/smart-match", null, ValidRequest());

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Json.GetProperty("success").GetBoolean());
        var data = res.Json.GetProperty("data");
        var recs = data.GetProperty("recommendations");
        Assert.True(recs.GetArrayLength() > 0);
        Assert.False(string.IsNullOrWhiteSpace(data.GetProperty("analysisSummary").GetString()));
    }

    [Fact, Trait("TestCase", "API-REC-002")]
    public async Task GetSmartMatch_MissingRequiredInput_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();

        // null body
        var content = new StringContent("null", Encoding.UTF8, "application/json");
        var response = await host.Client.PostAsync("/api/recommendations/smart-match", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact, Trait("TestCase", "API-REC-003")]
    public async Task GetSmartMatch_InvalidInputValues_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Invalid negative min rating
        var invalidReq = new
        {
            interests = new[] { "Culture" },
            minRating = -2.5
        };

        var res = await host.PostAsync("/api/recommendations/smart-match", null, invalidReq);
        Assert.Equal(HttpStatusCode.BadRequest, res.Status);

        // Invalid min rating > 5
        var highReq = new
        {
            interests = new[] { "Culture" },
            minRating = 7.5
        };

        var highRes = await host.PostAsync("/api/recommendations/smart-match", null, highReq);
        Assert.Equal(HttpStatusCode.BadRequest, highRes.Status);
    }

    [Fact, Trait("TestCase", "API-REC-004")]
    public async Task GetSmartMatch_ValidDestinationAndInterests_ReturnsRelevantRecommendations()
    {
        await using var host = await NovaApiHost.StartAsync();

        var req = ValidRequest("Kandy", "Culture");
        var res = await host.PostAsync("/api/recommendations/smart-match", null, req);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        var recs = res.Json.GetProperty("data").GetProperty("recommendations");
        Assert.True(recs.GetArrayLength() > 0);

        var first = recs[0];
        Assert.False(string.IsNullOrWhiteSpace(first.GetProperty("name").GetString()));
        Assert.True(first.GetProperty("suitabilityScore").GetInt32() >= 70);
    }

    [Fact, Trait("TestCase", "API-REC-005")]
    public async Task GetSmartMatch_NoSuitableResults_HandlesGracefullyWithoutCrashing()
    {
        await using var host = await NovaApiHost.StartAsync();

        // High filter rating 5.0 where few or none exist
        var filterReq = new RecommendationFilterRequestDto
        {
            Interests = new List<string> { "NonExistentExtraterrestrialActivity" },
            MinRating = 5.0
        };

        var res = await host.PostAsync("/api/recommendations/smart-match", null, filterReq);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Json.GetProperty("success").GetBoolean());
        var data = res.Json.GetProperty("data");
        Assert.NotNull(data);
    }

    [Fact, Trait("TestCase", "API-REC-006")]
    public async Task GetRecommendations_QueryEndpoint_ReturnsListSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.GetAsync("/api/recommendations?interests=Culture,Nature&minRating=4.5");

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Json.GetProperty("success").GetBoolean());
        var data = res.Json.GetProperty("data");
        var recs = data.GetProperty("recommendations");
        Assert.True(recs.GetArrayLength() > 0);
    }

    [Fact, Trait("TestCase", "API-REC-007")]
    public async Task GetRecommendations_AuthenticatedUser_ReturnsRecommendations()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.GetAsync("/api/recommendations?interests=Wildlife", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Json.GetProperty("success").GetBoolean());
        var data = res.Json.GetProperty("data");
        var recs = data.GetProperty("recommendations");
        Assert.True(recs.GetArrayLength() > 0);
    }

    [Fact, Trait("TestCase", "API-REC-008")]
    public async Task GetRecommendations_EmptyMatches_HandledCorrectly()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.GetAsync("/api/recommendations?minRating=5.0&search=NonExistentPlace");

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Json.GetProperty("success").GetBoolean());
        var recs = res.Json.GetProperty("data").GetProperty("recommendations");
        Assert.Equal(JsonValueKind.Array, recs.ValueKind);
    }

    [Fact, Trait("TestCase", "API-REC-009")]
    public async Task GetSmartMatch_MalformedJson_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();

        var content = new StringContent("{ malformed_json::: ", Encoding.UTF8, "application/json");
        var response = await host.Client.PostAsync("/api/recommendations/smart-match", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact, Trait("TestCase", "API-REC-010")]
    public async Task GetSmartMatch_ServiceFallback_GracefullyRespondsWith200()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Request that exercises fallback path when AI agent is not running
        var req = new RecommendationFilterRequestDto
        {
            Interests = new List<string> { "History", "Beaches" },
            MinRating = 4.5
        };

        var res = await host.PostAsync("/api/recommendations/smart-match", null, req);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Json.GetProperty("success").GetBoolean());
        var data = res.Json.GetProperty("data");
        Assert.Equal("PASSED", data.GetProperty("validationStatus").GetString());
        var recs = data.GetProperty("recommendations");
        Assert.True(recs.GetArrayLength() > 0);
    }
}
