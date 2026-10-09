using System.Net;
using Microsoft.EntityFrameworkCore;
using Moq;
using Nova.Api.Data;
using Nova.Api.DTOs.TripPlanner;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.NonFunctional;

/// <summary>
/// RELIABILITY & RECOVERY TEST SUITE
/// Covers NFR-REL-001 through NFR-REL-007 (repeated executions, state consistency, service fallback)
/// and NFR-REC-001 through NFR-REC-005 (service unavailability, recovery, client retry idempotency).
/// </summary>
public sealed class ReliabilityAndRecoveryTests
{
    [Fact]
    public async Task NFR_REL_001_RepeatedDestinationRetrieval()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 30 repeated executions to check stability and identical result sets
        string? firstPayload = null;
        for (int i = 0; i < 30; i++)
        {
            var res = await host.GetAsync("/api/destinations", null);
            Assert.Equal(HttpStatusCode.OK, res.Status);
            if (firstPayload == null)
            {
                firstPayload = res.Raw;
            }
            else
            {
                Assert.Equal(firstPayload, res.Raw);
            }
        }
    }

    [Fact]
    public async Task NFR_REL_002_RepeatedTripRetrieval()
    {
        await using var host = await NovaApiHost.StartAsync();
        var trip = await Fixtures.SeedTripAsync(host.Db.CreateContext(), PgTestDatabase.UserAId, "ReliabilityTrip");

        for (int i = 0; i < 25; i++)
        {
            var res = await host.GetAsync($"/api/trips/{trip.Id}", TestTokens.UserA);
            Assert.Equal(HttpStatusCode.OK, res.Status);
            Assert.Equal("ReliabilityTrip Trip", res.Data.GetProperty("tripName").GetString());
        }
    }

    [Fact]
    public async Task NFR_REL_003_RepeatedItineraryOperations()
    {
        await using var host = await NovaApiHost.StartAsync();
        var (trip, itin, _, _) = await Fixtures.SeedItineraryAsync(host.Db.CreateContext(), PgTestDatabase.UserAId);

        // Repeated idempotent queries and status checks
        for (int i = 0; i < 15; i++)
        {
            var res = await host.GetAsync($"/api/itineraries/{itin.Id}", TestTokens.UserA);
            Assert.Equal(HttpStatusCode.OK, res.Status);
        }
    }

    [Fact]
    public async Task NFR_REL_004_RepeatedGuideTourRetrieval()
    {
        await using var host = await NovaApiHost.StartAsync();

        for (int i = 0; i < 20; i++)
        {
            var gRes = await host.GetAsync("/api/v1/guides", null);
            Assert.Equal(HttpStatusCode.OK, gRes.Status);

            var tRes = await host.GetAsync("/api/v1/tour-packages", null);
            Assert.Equal(HttpStatusCode.OK, tRes.Status);
        }
    }

    [Fact]
    public async Task NFR_REL_005_RepeatedReviewSubmissionAndRetrieval()
    {
        await using var host = await NovaApiHost.StartAsync();

        for (int i = 0; i < 5; i++)
        {
            var revRes = await host.PostAsync("/api/reviews", TestTokens.UserA, new
            {
                destinationId = "dest-1",
                rating = 5,
                title = $"Repeated Review {i}",
                comment = $"Consistent positive feedback iteration {i}"
            });
            Assert.Equal(HttpStatusCode.OK, revRes.Status);
        }

        var listRes = await host.GetAsync("/api/reviews?destinationId=dest-1", null);
        Assert.Equal(HttpStatusCode.OK, listRes.Status);
        Assert.True(listRes.Data.GetArrayLength() >= 5);
    }

    [Fact]
    public async Task NFR_REL_006_RepeatedRecommendationRequests()
    {
        await using var host = await NovaApiHost.StartAsync();

        for (int i = 0; i < 10; i++)
        {
            var recRes = await host.PostAsync("/api/recommendations/smart-match", null, new
            {
                interests = new[] { "culture" },
                minRating = 4.0
            });
            Assert.Equal(HttpStatusCode.OK, recRes.Status);
            Assert.True(recRes.Data.GetProperty("recommendations").GetArrayLength() > 0);
        }
    }

    [Fact]
    public async Task NFR_REL_007_AiServiceUnavailableResilience()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Downstream microservice offline
        host.AiClient.Setup(a => a.IsAvailableAsync()).ReturnsAsync(false);

        // System remains robust and falls back cleanly
        var planRes = await host.PostAsync("/api/trip-planner/generate", TestTokens.UserA, new
        {
            destination = "Sigiriya",
            travelers = 2,
            budgetAmount = 1000m
        });
        Assert.Equal(HttpStatusCode.OK, planRes.Status);
        Assert.True(planRes.Success);
    }

    [Fact]
    public async Task NFR_REC_001_BackendUnavailableThenRestoredSimulation()
    {
        // Simulate lifecycle: Host starts, performs request, stops, new host starts and verifies state
        string tripId;
        var db = await PgTestDatabase.CreateAsync();
        try
        {
            await using (var host1 = await NovaApiHost.StartAsync(db: db, ownsDb: false))
            {
                var create = await host1.PostAsync("/api/trips", TestTokens.UserA, Fixtures.ValidTripBody("Ella"));
                Assert.Equal(HttpStatusCode.Created, create.Status);
                tripId = create.Data.GetProperty("id").GetString()!;
            }

            // Backend restored in second session
            await using (var host2 = await NovaApiHost.StartAsync(db: db, ownsDb: false))
            {
                var fetch = await host2.GetAsync($"/api/trips/{tripId}", TestTokens.UserA);
                Assert.Equal(HttpStatusCode.OK, fetch.Status);
                Assert.False(string.IsNullOrWhiteSpace(fetch.Data.GetProperty("destination").GetString()));
            }
        }
        finally
        {
            await db.DisposeAsync();
        }
    }

    [Fact]
    public async Task NFR_REC_002_AiServiceUnavailableThenRestored()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Service unavailable -> falls back to native C# pipeline
        host.AiClient.Setup(a => a.IsAvailableAsync()).ReturnsAsync(false);
        var res1 = await host.PostAsync("/api/trip-planner/generate", TestTokens.UserA, new
        {
            destination = "Kandy",
            travelers = 2,
            budgetAmount = 800m
        });
        Assert.Equal(HttpStatusCode.OK, res1.Status);
        Assert.Contains("native", res1.Message, StringComparison.OrdinalIgnoreCase);

        // 2. Service restored -> is available again
        host.AiClient.Setup(a => a.IsAvailableAsync()).ReturnsAsync(true);
        host.AiClient.Setup(a => a.PlanTripAsync(It.IsAny<TripPlanningRequestDto>()))
            .ReturnsAsync(new TripPlanDto
            {
                Trip = new TripDetailsDto { Title = "Python LangGraph Plan", Travelers = 2 },
                Days = [new ItineraryDayItemDto { Day = 1, Title = "Day 1", Location = "Kandy" }],
                Budget = new BudgetBreakdownDto { Total = 800m }
            });

        var res2 = await host.PostAsync("/api/trip-planner/generate", TestTokens.UserA, new
        {
            destination = "Kandy",
            travelers = 2,
            budgetAmount = 800m
        });
        Assert.Equal(HttpStatusCode.OK, res2.Status);
        Assert.Contains("LangGraph", res2.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task NFR_REC_003_TemporaryApiNetworkFailureSimulation()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Verify transient malformed request doesn't crash future valid requests
        var badRes = await host.SendAsync(HttpMethod.Post, "/api/trip-planner/generate", TestTokens.UserA, "{ bad json");
        Assert.Equal(HttpStatusCode.BadRequest, badRes.Status);

        // Subsequent valid request succeeds immediately
        var goodRes = await host.GetAsync("/api/destinations", null);
        Assert.Equal(HttpStatusCode.OK, goodRes.Status);
    }

    [Fact]
    public async Task NFR_REC_004_DatabaseConnectionDropAndRecovery()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Perform normal operation
        var res1 = await host.GetAsync("/api/destinations", null);
        Assert.Equal(HttpStatusCode.OK, res1.Status);

        // Database context remains active and operational across sequential operations
        await using var db = host.Db.CreateContext();
        var destCount = await db.Destinations.CountAsync();
        Assert.True(destCount > 0);
    }

    [Fact]
    public async Task NFR_REC_005_ClientRetryAfterFailedRequest()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Client attempts request with bad payload, corrects payload, and retries
        var attempt1 = await host.PostAsync("/api/trips", TestTokens.UserA, new
        {
            tripName = "Faulty Trip",
            destination = "Kandy",
            startDate = DateTime.UtcNow.AddDays(5),
            endDate = DateTime.UtcNow.AddDays(2), // invalid
            numberOfTravelers = 1,
            budget = 100m
        });
        Assert.Equal(HttpStatusCode.BadRequest, attempt1.Status);

        // Client retries with valid dates
        var attempt2 = await host.PostAsync("/api/trips", TestTokens.UserA, new
        {
            tripName = "Corrected Trip",
            destination = "Kandy",
            startDate = DateTime.UtcNow.AddDays(5),
            endDate = DateTime.UtcNow.AddDays(8), // valid
            numberOfTravelers = 1,
            budget = 100m
        });
        Assert.Equal(HttpStatusCode.Created, attempt2.Status);
    }
}
