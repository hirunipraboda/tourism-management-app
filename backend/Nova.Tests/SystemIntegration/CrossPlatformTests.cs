using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.TripPlanner;
using Nova.Api.DTOs.Trips;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.SystemIntegration;

/// <summary>
/// CROSS-PLATFORM SYSTEM INTEGRATION TEST SUITE
/// Covers PLAT-INT-001 through PLAT-INT-007 verifying API contracts,
/// payload schemas, and serialization consistency across React Web and Flutter Mobile.
/// </summary>
public sealed class CrossPlatformTests
{
    [Fact]
    public async Task PLAT_INT_001_LoginThroughWeb_Contract()
    {
        await using var host = await NovaApiHost.StartAsync();

        // React Web uses email + password payload and expects token + user object
        var webLoginPayload = new
        {
            email = "test-user-a@example.test",
            password = "Password123!"
        };

        // In test host, test user has dummy hash, test against registered user
        var regEmail = $"web.user.{Guid.NewGuid():N}@example.test";
        var regRes = await host.PostAsync("/api/auth/register", null, new
        {
            name = "Web Traveler",
            email = regEmail,
            password = "Password123!",
            confirmPassword = "Password123!"
        });
        Assert.Equal(HttpStatusCode.Created, regRes.Status);

        var loginRes = await host.PostAsync("/api/auth/login", null, new
        {
            email = regEmail,
            password = "Password123!"
        });
        Assert.Equal(HttpStatusCode.OK, loginRes.Status);

        // Contract checks for React Web
        Assert.True(loginRes.Json.TryGetProperty("token", out var token));
        Assert.True(loginRes.Json.TryGetProperty("user", out var user));
        Assert.Equal("USER", user.GetProperty("role").GetString());
        Assert.Equal(regEmail, user.GetProperty("email").GetString());
    }

    [Fact]
    public async Task PLAT_INT_002_LoginThroughMobile_Contract()
    {
        await using var host = await NovaApiHost.StartAsync();

        var mobEmail = $"mobile.user.{Guid.NewGuid():N}@example.test";
        await host.PostAsync("/api/auth/register", null, new
        {
            name = "Mobile Traveler",
            email = mobEmail,
            password = "MobilePassword123!",
            confirmPassword = "MobilePassword123!"
        });

        // Flutter client executes POST /api/auth/login and maps token to Flutter secure storage
        var loginRes = await host.PostAsync("/api/auth/login", null, new
        {
            email = mobEmail,
            password = "MobilePassword123!"
        });
        Assert.Equal(HttpStatusCode.OK, loginRes.Status);

        // Flutter User model requires id, email, name, role
        var user = loginRes.Json.GetProperty("user");
        Assert.True(user.TryGetProperty("id", out _));
        Assert.True(user.TryGetProperty("name", out _));
        Assert.True(user.TryGetProperty("email", out _));
        Assert.True(user.TryGetProperty("role", out _));
    }

    [Fact]
    public async Task PLAT_INT_003_ViewDestination_OnWebAndMobile()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Both React Web (DestinationDetailsPage) and Flutter Mobile (DestinationDetailScreen)
        // consume GET /api/destinations/{id}
        var destRes = await host.GetAsync("/api/destinations/dest-1", null);
        Assert.Equal(HttpStatusCode.OK, destRes.Status);

        var data = destRes.Data;
        Assert.Equal("dest-1", data.GetProperty("id").GetString());
        Assert.True(data.TryGetProperty("name", out _));
        Assert.True(data.TryGetProperty("description", out _));
        Assert.True(data.TryGetProperty("location", out _));
        Assert.True(data.TryGetProperty("attractions", out var attractions) || data.TryGetProperty("activities", out attractions));
        Assert.Equal(JsonValueKind.Array, attractions.ValueKind);
    }

    [Fact]
    public async Task PLAT_INT_004_CreateManageTrip_ThroughSupportedPlatform()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Mobile and Web both send CreateTripRequest to POST /api/trips
        var tripReq = new
        {
            tripName = "Southern Coast Journey",
            destination = "Galle",
            startDate = DateTime.UtcNow.AddDays(10),
            endDate = DateTime.UtcNow.AddDays(14),
            numberOfTravelers = 2,
            budget = 1100.0m,
            interests = new[] { "beach", "history" },
            tripStyle = "Moderate"
        };

        var createRes = await host.PostAsync("/api/trips", TestTokens.UserA, tripReq);
        Assert.Equal(HttpStatusCode.Created, createRes.Status);
        var tripId = createRes.Data.GetProperty("id").GetString()!;

        // Update trip status
        var updateRes = await host.PutAsync($"/api/trips/{tripId}", TestTokens.UserA, new
        {
            tripName = "Southern Coast Journey - Updated",
            destination = "Galle",
            startDate = DateTime.UtcNow.AddDays(10),
            endDate = DateTime.UtcNow.AddDays(14),
            numberOfTravelers = 3,
            budget = 1300.0m,
            status = "Confirmed"
        });
        Assert.Equal(HttpStatusCode.OK, updateRes.Status);
    }

    [Fact]
    public async Task PLAT_INT_005_RetrieveSameServerSideTripData_AcrossPlatforms()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Create trip on server
        var createRes = await host.PostAsync("/api/trips", TestTokens.UserA, Fixtures.ValidTripBody("Kandy"));
        var tripId = createRes.Data.GetProperty("id").GetString()!;

        // 2. Client platform fetches trip
        var fetchRes = await host.GetAsync($"/api/trips/{tripId}", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.OK, fetchRes.Status);

        // Verify all fields mapped in Flutter UserTripDetail and React UserTrip models are present
        var json = fetchRes.Data;
        Assert.Equal(tripId, json.GetProperty("id").GetString());
        Assert.False(string.IsNullOrWhiteSpace(json.GetProperty("destination").GetString()));
        Assert.True(json.TryGetProperty("startDate", out _));
        Assert.True(json.TryGetProperty("endDate", out _));
        Assert.True(json.TryGetProperty("numberOfTravelers", out _));
        Assert.True(json.TryGetProperty("budget", out _));
        Assert.True(json.TryGetProperty("status", out _));
    }

    [Fact]
    public async Task PLAT_INT_006_VerifyReviewDataConsistency_AcrossPlatforms()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Submit review from one client
        var revRes = await host.PostAsync("/api/reviews", TestTokens.UserA, new
        {
            destinationId = "dest-2",
            rating = 5,
            title = "Nine Arches Sunrise",
            comment = "Stunning colonial bridge architecture amid early morning tea hills."
        });
        Assert.Equal(HttpStatusCode.OK, revRes.Status);
        var reviewId = revRes.Data.GetProperty("id").GetString()!;

        // Fetch from another client call
        var listRes = await host.GetAsync("/api/reviews?destinationId=dest-2", null);
        Assert.Equal(HttpStatusCode.OK, listRes.Status);

        var matching = listRes.Data.EnumerateArray().FirstOrDefault(r => r.GetProperty("id").GetString() == reviewId);
        Assert.NotNull(matching.GetProperty("id").GetString());
        Assert.Equal(5, matching.GetProperty("rating").GetInt32());
    }

    [Fact]
    public async Task PLAT_INT_007_VerifyRecommendationConsistency_AcrossSupportedClients()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Both React and Flutter call POST /api/recommendations/smart-match
        var recReq = new
        {
            interests = new[] { "culture" },
            minRating = 4.0
        };

        var res = await host.PostAsync("/api/recommendations/smart-match", null, recReq);
        Assert.Equal(HttpStatusCode.OK, res.Status);

        var recs = res.Data.GetProperty("recommendations");
        Assert.True(recs.GetArrayLength() > 0);

        // Verify contract properties consumed by Flutter and React UI: id, name, location, rating, suitabilityScore
        var first = recs.EnumerateArray().First();
        Assert.True(first.TryGetProperty("id", out _));
        Assert.True(first.TryGetProperty("name", out _));
        Assert.True(first.TryGetProperty("location", out _));
        Assert.True(first.TryGetProperty("rating", out _));
        Assert.True(first.TryGetProperty("suitabilityScore", out _));
    }
}
