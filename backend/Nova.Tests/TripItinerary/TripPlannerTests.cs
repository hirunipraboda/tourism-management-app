using System.Net;
using Microsoft.EntityFrameworkCore;
using Moq;
using Nova.Api.DTOs.TripPlanner;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.TripItinerary;

/// <summary>
/// Tests for TripPlannerController (api/trip-planner) covering ATP-001 to ATP-008.
/// Tests run against the real controller, native 4-agent orchestrator, and an isolated PostgreSQL database.
/// </summary>
public class TripPlannerTests
{
    private const string TouristId = PgTestDatabase.UserAId;

    [Fact, Trait("TestCase", "ATP-001")]
    public async Task GenerateTripPlan_ValidInput_ReturnsValidPlan_ATP001() // ATP-001
    {
        await using var host = await NovaApiHost.StartAsync();

        var request = new TripPlanningRequestDto
        {
            TripName = "Highland Explorer",
            Destination = "Kandy",
            Destinations = ["Kandy", "Ella"],
            StartDate = "2031-04-01",
            EndDate = "2031-04-05",
            Travelers = 2,
            Budget = new TripBudgetInputDto { Amount = 800m, Currency = "USD" },
            Activities = ["Culture", "Hiking"],
            AccommodationPreference = "3 Star"
        };

        var res = await host.PostAsync("/api/trip-planner/generate", TestTokens.UserA, request);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.NotNull(res.Data);

        // Verify structure actually used by NOVA
        var trip = res.Data.GetProperty("trip");
        Assert.Equal("Highland Explorer", trip.GetProperty("title").GetString());
        Assert.Equal(2, trip.GetProperty("travelers").GetInt32());

        var days = res.Data.GetProperty("days").EnumerateArray().ToList();
        Assert.True(days.Count >= 2);
        Assert.All(days, d =>
        {
            Assert.True(d.GetProperty("activities").EnumerateArray().Any());
            Assert.False(string.IsNullOrWhiteSpace(d.GetProperty("location").GetString()));
        });

        var budget = res.Data.GetProperty("budget");
        Assert.True(budget.GetProperty("total").GetDecimal() <= 800m);
        Assert.Equal("USD", budget.GetProperty("currency").GetString());

        var metadata = res.Data.GetProperty("metadata");
        Assert.True(metadata.GetProperty("aiScore").GetDouble() > 0);
    }

    [Fact, Trait("TestCase", "ATP-002")]
    public async Task GeneratePlan_IncompleteInput_SaveWithoutDays_ReturnsValidationError_ATP002() // ATP-002
    {
        await using var host = await NovaApiHost.StartAsync();

        // Saving an invalid empty plan payload
        var saveReq = new SaveTripPlanRequestDto
        {
            UserId = TouristId,
            Plan = new TripPlanDto { Days = [] }
        };

        var res = await host.PostAsync("/api/trip-planner/save", TestTokens.UserA, saveReq);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
        Assert.False(res.Success);
        Assert.Contains("Plan must contain days", res.Message);
    }

    [Fact, Trait("TestCase", "ATP-003")]
    public async Task SaveTripPlan_ValidGeneratedPlan_PersistsInDatabase_ATP003() // ATP-003
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Generate plan
        var genReq = new TripPlanningRequestDto
        {
            TripName = "Galle Heritage Tour",
            Destination = "Galle",
            StartDate = "2031-05-10",
            EndDate = "2031-05-12",
            Travelers = 2,
            Budget = new TripBudgetInputDto { Amount = 500m, Currency = "USD" }
        };
        var genRes = await host.PostAsync("/api/trip-planner/generate", TestTokens.UserA, genReq);
        Assert.Equal(HttpStatusCode.OK, genRes.Status);

        // 2. Save plan
        var saveRes = await host.PostAsync("/api/trip-planner/save", TestTokens.UserA, new
        {
            userId = TouristId,
            plan = genRes.Data,
            requestInput = genReq
        });

        Assert.True(saveRes.Status == HttpStatusCode.Created, $"Expected Created but got {saveRes.Status}: {saveRes.Raw}");
        Assert.True(saveRes.Success);
        var tripId = saveRes.Data.GetProperty("tripId").GetString();
        var itineraryId = saveRes.Data.GetProperty("itineraryId").GetString();
        Assert.NotNull(tripId);
        Assert.NotNull(itineraryId);

        // 3. Verify database persistence
        await using var db = host.Db.CreateContext();
        var savedTrip = await db.Trips.Include(t => t.Itineraries)
                                      .ThenInclude(i => i.Days)
                                      .ThenInclude(d => d.Items)
                                      .FirstOrDefaultAsync(t => t.Id == tripId);

        Assert.NotNull(savedTrip);
        Assert.Equal("Galle Heritage Tour", savedTrip.TripName);
        Assert.Equal(TouristId, savedTrip.UserId);
        Assert.Single(savedTrip.Itineraries);
        var itin = savedTrip.Itineraries.First();
        Assert.Equal(itineraryId, itin.Id);
        Assert.True(itin.Days.Count >= 2);
        Assert.True(itin.Days.SelectMany(d => d.Items).Any());
    }

    [Fact, Trait("TestCase", "ATP-004")]
    public async Task RegenerateDay_ValidRequest_RegeneratesTargetedDay_ATP004() // ATP-004
    {
        await using var host = await NovaApiHost.StartAsync();

        var regenReq = new RegenerateDayRequestDto
        {
            DayNumber = 2,
            Location = "Ella"
        };

        var res = await host.PostAsync("/api/trip-planner/regenerate-day", TestTokens.UserA, regenReq);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.NotNull(res.Data);
        Assert.Equal(2, res.Data.GetProperty("day").GetInt32());
        Assert.Equal("Ella", res.Data.GetProperty("location").GetString());
        var activities = res.Data.GetProperty("activities").EnumerateArray().ToList();
        Assert.NotEmpty(activities);
        Assert.All(activities, a => Assert.Contains("Ella", a.GetProperty("location").GetString()));
    }

    [Fact, Trait("TestCase", "ATP-005")]
    public async Task RegenerateActivity_ValidRequest_ReplacesTargetedActivity_ATP005() // ATP-005
    {
        await using var host = await NovaApiHost.StartAsync();

        var regenReq = new RegenerateActivityRequestDto
        {
            ActivityId = "act-1",
            CurrentTitle = "Temple Visit",
            Location = "Kandy"
        };

        var res = await host.PostAsync("/api/trip-planner/regenerate-activity", TestTokens.UserA, regenReq);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.NotNull(res.Data);
        Assert.NotEqual("Temple Visit", res.Data.GetProperty("title").GetString());
        Assert.Contains("Kandy", res.Data.GetProperty("location").GetString());
        Assert.True(res.Data.GetProperty("durationMinutes").GetInt32() > 0);
    }

    [Fact, Trait("TestCase", "ATP-006")]
    public async Task GetTripPlan_ExistingPlanId_ReturnsCorrectPlan_ATP006() // ATP-006
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId;

        // Seed a trip with itinerary in database
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristId);
            tripId = seed.trip.Id;
        }

        var res = await host.GetAsync($"/api/trip-planner/{tripId}", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.Equal(tripId, res.Data.GetProperty("id").GetString());
        Assert.Equal(TouristId, res.Data.GetProperty("userId").GetString());
        var itins = res.Data.GetProperty("itineraries").EnumerateArray().ToList();
        Assert.NotEmpty(itins);
    }

    [Fact, Trait("TestCase", "ATP-007")]
    public async Task DeleteTripPlan_ExistingPlanId_DeletesPlan_ATP007() // ATP-007
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId;

        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristId);
            tripId = seed.trip.Id;
        }

        var res = await host.DeleteAsync($"/api/trip-planner/{tripId}", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);

        // Verify deleted from database
        await using var verify = host.Db.CreateContext();
        Assert.False(await verify.Trips.AnyAsync(t => t.Id == tripId));

        // Subsequent get returns 404
        var getRes = await host.GetAsync($"/api/trip-planner/{tripId}", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.NotFound, getRes.Status);
    }

    [Fact, Trait("TestCase", "ATP-008")]
    public async Task GenerateTripPlan_AiServiceUnavailable_FallsBackToNativeAgentsSafely_ATP008() // ATP-008
    {
        await using var host = await NovaApiHost.StartAsync();

        // Simulate external AI agent microservice failure/unavailability
        host.AiClient.Setup(c => c.IsAvailableAsync()).ReturnsAsync(false);

        var request = new TripPlanningRequestDto
        {
            TripName = "Resilient Plan",
            Destination = "Sigiriya",
            StartDate = "2031-06-01",
            EndDate = "2031-06-03",
            Travelers = 2,
            Budget = new TripBudgetInputDto { Amount = 600m, Currency = "USD" }
        };

        var res = await host.PostAsync("/api/trip-planner/generate", TestTokens.UserA, request);

        // Must succeed via native 4-agent fallback without corrupting state or crashing
        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.NotNull(res.Data);
        var days = res.Data.GetProperty("days").EnumerateArray().ToList();
        Assert.NotEmpty(days);
    }
}
