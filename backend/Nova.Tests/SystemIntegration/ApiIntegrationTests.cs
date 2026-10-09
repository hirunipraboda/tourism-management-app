using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Guides;
using Nova.Api.DTOs.Itineraries;
using Nova.Api.DTOs.Recommendations;
using Nova.Api.DTOs.TripPlanner;
using Nova.Api.DTOs.Trips;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.SystemIntegration;

/// <summary>
/// API INTEGRATION TEST SUITE
/// Covers API-INT-001 through API-INT-010 verifying cross-API data flow,
/// relational consistency, and security boundaries.
/// </summary>
public sealed class ApiIntegrationTests
{
    [Fact]
    public async Task API_INT_001_Authentication_To_ProtectedApi()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Calling protected endpoint without token -> 401 Unauthorized
        var unauthRes = await host.GetAsync("/api/auth/me", null);
        Assert.Equal(HttpStatusCode.Unauthorized, unauthRes.Status);

        // 2. Calling with valid token -> 200 OK and user data returned
        var authRes = await host.GetAsync("/api/auth/me", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.OK, authRes.Status);
        Assert.Equal(PgTestDatabase.UserAId, authRes.Json.GetProperty("user").GetProperty("id").GetString());
    }

    [Fact]
    public async Task API_INT_002_DestinationApi_To_TripApi()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Retrieve destination from Destinations API
        var destRes = await host.GetAsync("/api/destinations/dest-1", null);
        Assert.Equal(HttpStatusCode.OK, destRes.Status);
        var destName = destRes.Data.GetProperty("name").GetString()!;

        // 2. Pass destination data to Trip creation API
        var tripRes = await host.PostAsync("/api/trips", TestTokens.UserA, Fixtures.ValidTripBody(destName));
        Assert.Equal(HttpStatusCode.Created, tripRes.Status);
        var tripId = tripRes.Data.GetProperty("id").GetString()!;

        // 3. Trip API persists the exact destination name
        var retrievedTrip = await host.GetAsync($"/api/trips/{tripId}", TestTokens.UserA);
        Assert.Equal(destName, retrievedTrip.Data.GetProperty("destination").GetString());
    }

    [Fact]
    public async Task API_INT_003_TripApi_To_ItineraryApi()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Create parent trip
        var tripRes = await host.PostAsync("/api/trips", TestTokens.UserA, Fixtures.ValidTripBody("Galle"));
        var tripId = tripRes.Data.GetProperty("id").GetString()!;

        // 2. Attach itinerary via Itinerary API
        var itinRes = await host.PostAsync($"/api/trips/{tripId}/itineraries", TestTokens.UserA, new
        {
            title = "Galle Ramparts Tour",
            feasibilityScore = 98.0
        });
        Assert.Equal(HttpStatusCode.Created, itinRes.Status);
        var itinId = itinRes.Data.GetProperty("id").GetString()!;

        // 3. Verify parent-child relationship via Trip endpoint
        var getTripRes = await host.GetAsync($"/api/trips/{tripId}", TestTokens.UserA);
        var itins = getTripRes.Data.GetProperty("itineraries");
        Assert.Contains(itins.EnumerateArray(), i => i.GetProperty("id").GetString() == itinId);
    }

    [Fact]
    public async Task API_INT_004_TripApi_To_AiPlanningService()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Generate plan through AI planner API
        var planReq = new
        {
            tripName = "AI Integrated Trip",
            destination = "Kandy",
            destinations = new[] { "Kandy" },
            startDate = DateTime.UtcNow.AddDays(7).ToString("yyyy-MM-dd"),
            endDate = DateTime.UtcNow.AddDays(9).ToString("yyyy-MM-dd"),
            travelers = 2,
            budgetAmount = 900m
        };
        var genRes = await host.PostAsync("/api/trip-planner/generate", TestTokens.UserA, planReq);
        Assert.Equal(HttpStatusCode.OK, genRes.Status);

        // 2. Save directly through save endpoint
        var saveRes = await host.PostAsync("/api/trip-planner/save", TestTokens.UserA, new
        {
            plan = genRes.Data,
            requestInput = planReq
        });
        Assert.Equal(HttpStatusCode.Created, saveRes.Status);
        var tripId = saveRes.Data.GetProperty("tripId").GetString()!;

        // 3. Verify Trip API serves the saved AI itinerary
        var tripRes = await host.GetAsync($"/api/trips/{tripId}", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.OK, tripRes.Status);
        Assert.Equal("AI", tripRes.Data.GetProperty("createdSource").GetString());
    }

    [Fact]
    public async Task API_INT_005_GuideApi_To_AvailabilityApi()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Create a Guide via Guide API
        var guideRes = await host.PostAsync("/api/v1/guides", TestTokens.OperatorRoleClaim, new
        {
            name = "Priyantha Perera",
            email = $"priyantha.{Guid.NewGuid():N}@example.test",
            phone = "+94779876543",
            languages = new[] { "English", "French" },
            specialties = new[] { "Wildlife", "Birding" },
            yearsExperience = 5
        });
        Assert.Equal(HttpStatusCode.Created, guideRes.Status);
        var guideId = guideRes.Json.GetProperty("id").GetInt32();

        // 2. Add availability slot to that guide
        var slotRes = await host.PostAsync($"/api/v1/guides/{guideId}/availability", TestTokens.OperatorRoleClaim, new
        {
            guideId,
            availableDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)).ToString("yyyy-MM-dd"),
            startTime = "09:00:00",
            endTime = "17:00:00"
        });
        Assert.Equal(HttpStatusCode.Created, slotRes.Status);

        // 3. Query availability for guide
        var queryRes = await host.GetAsync($"/api/v1/guides/{guideId}/availability", null);
        Assert.Equal(HttpStatusCode.OK, queryRes.Status);
        Assert.True(queryRes.Json.GetArrayLength() > 0);
    }

    [Fact]
    public async Task API_INT_006_TourPackageApi_To_TourOperationApi()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            var guide = new Guide
            {
                UserId = PgTestDatabase.OperatorId,
                Name = "Nishan Silva",
                Email = $"nishan.{Guid.NewGuid():N}@example.test",
                Languages = ["English"],
                Specialties = ["Trekking"],
                YearsExperience = 4,
                IsActive = true
            };
            db.Guides.Add(guide);
            await db.SaveChangesAsync();
            guideId = guide.Id;
        }

        // 1. Create Tour Package
        var pkgRes = await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, new
        {
            guideId,
            packageName = "Knuckles Mountain Ridge Trek",
            description = "Highland trek through cloud forest",
            destination = "Matale",
            durationDays = 2,
            price = 220.0m,
            maxGroupSize = 6
        });
        Assert.Equal(HttpStatusCode.Created, pkgRes.Status);
        var pkgId = pkgRes.Json.GetProperty("tourPackageId").GetInt32();

        // 2. Schedule Tour Operation linking to that package
        var opRes = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, new
        {
            tourPackageId = pkgId,
            guideId,
            scheduledDate = DateTime.UtcNow.Date.AddDays(10),
            numberOfTourists = 4,
            totalCost = 300.0m
        });
        Assert.Equal(HttpStatusCode.Created, opRes.Status);
        Assert.Equal("Knuckles Mountain Ridge Trek", opRes.Json.GetProperty("packageName").GetString());
    }

    [Fact]
    public async Task API_INT_007_ReviewApi_To_RecommendationApi()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Submit positive review
        var revRes = await host.PostAsync("/api/reviews", TestTokens.UserA, new
        {
            destinationId = "dest-4",
            rating = 5,
            title = "Historic Galle Ramparts",
            comment = "Captivating maritime colonial architecture and panoramic ocean sunset viewpoints."
        });
        Assert.Equal(HttpStatusCode.OK, revRes.Status);

        // 2. Query recommendations with matching interest
        var recRes = await host.PostAsync("/api/recommendations/smart-match", null, new
        {
            interests = new[] { "culture", "heritage" },
            minRating = 4.0
        });
        Assert.Equal(HttpStatusCode.OK, recRes.Status);
        Assert.True(recRes.Data.GetProperty("recommendations").GetArrayLength() > 0);
    }

    [Fact]
    public async Task API_INT_008_AiService_To_BackendIntegration()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Verify TripPlannerController correctly handles AI agent contracts
        var req = new
        {
            destination = "Yala",
            travelers = 3,
            budgetAmount = 1200m,
            interests = new[] { "safari", "wildlife" }
        };
        var genRes = await host.PostAsync("/api/trip-planner/generate", TestTokens.UserA, req);
        Assert.Equal(HttpStatusCode.OK, genRes.Status);

        // Verify schema conforms to TripPlanDto contract
        Assert.True(genRes.Data.TryGetProperty("days", out var days));
        Assert.True(genRes.Data.TryGetProperty("budget", out var budget));
        Assert.True(genRes.Data.TryGetProperty("metadata", out var meta));
        Assert.True(days.GetArrayLength() > 0);
    }

    [Fact]
    public async Task API_INT_009_InvalidDataPropagation_Guard()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Invalid guide ID on TourPackage creation -> 400 Bad Request
        var badPkgRes = await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, new
        {
            guideId = 999999, // non-existing guide
            packageName = "Ghost Guide Tour",
            description = "Should fail",
            destination = "Nowhere",
            durationDays = 2,
            price = 100m,
            maxGroupSize = 5
        });
        Assert.Equal(HttpStatusCode.BadRequest, badPkgRes.Status);

        // 2. Invalid guide ID on Availability query -> 404 Not Found
        var badAvailRes = await host.GetAsync("/api/v1/guides/999999/availability", null);
        Assert.Equal(HttpStatusCode.NotFound, badAvailRes.Status);
    }

    [Fact]
    public async Task API_INT_010_AuthorizationAcrossRelatedApis()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Regular Tourist cannot create Tour Package -> 403 Forbidden
        var touristPkg = await host.PostAsync("/api/v1/tour-packages", TestTokens.UserA, new
        {
            guideId = 1,
            packageName = "Unauthorized Package",
            description = "Desc",
            destination = "Kandy",
            durationDays = 1,
            price = 50m,
            maxGroupSize = 2
        });
        Assert.Equal(HttpStatusCode.Forbidden, touristPkg.Status);

        // 2. Regular Tourist cannot create Guide Availability -> 403 Forbidden
        var touristSlot = await host.PostAsync("/api/v1/guides/1/availability", TestTokens.UserA, new
        {
            guideId = 1,
            availableDate = DateTime.UtcNow.Date.AddDays(1),
            startTime = new TimeSpan(9, 0, 0),
            endTime = new TimeSpan(12, 0, 0)
        });
        Assert.Equal(HttpStatusCode.Forbidden, touristSlot.Status);

        // 3. Regular Tourist cannot approve an itinerary -> 403 Forbidden
        var touristApprove = await host.PostAsync("/api/itineraries/some-id/approve", TestTokens.UserA, new
        {
            comments = "Approve"
        });
        Assert.Equal(HttpStatusCode.Forbidden, touristApprove.Status);
    }
}
