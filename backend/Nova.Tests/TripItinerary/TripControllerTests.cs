using System.Net;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.TripItinerary;

/// <summary>
/// HTTP/API-level tests for TripsController (api/trips) running the REAL controller + service + JWT pipeline
/// against an isolated PostgreSQL database. Tokens are minted exactly like AuthController (role "USER"/"ADMIN").
/// </summary>
public class TripControllerTests
{
    private const string A = PgTestDatabase.UserAId;
    private const string B = PgTestDatabase.UserBId;

    [Fact, Trait("TestCase", "TRP-001")]
    public async Task CreateTrip_ValidData_CreatesAndPersistsTrip_TRP001() // TRP-001
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.PostAsync("/api/trips", TestTokens.UserA, Fixtures.ValidTripBody("Kandy"));

        Assert.Equal(HttpStatusCode.Created, res.Status);
        Assert.True(res.Success);
        Assert.Equal("Kandy", res.Data.GetProperty("destination").GetString());
        Assert.Equal(A, res.Data.GetProperty("userId").GetString()); // authenticated user owns the trip
        Assert.Equal(2, res.Data.GetProperty("numberOfTravelers").GetInt32());
        Assert.Equal(1200.50m, res.Data.GetProperty("budget").GetDecimal());

        await using var db = host.Db.CreateContext();
        var saved = await db.Trips.AsNoTracking().SingleAsync(t => t.Id == res.DataString("id"));
        Assert.Equal(A, saved.UserId);
        Assert.Equal(TripStatus.Draft, saved.Status);
        Assert.Equal(Fixtures.Start, saved.StartDate.ToUniversalTime());
        Assert.Equal(Fixtures.End, saved.EndDate.ToUniversalTime());
        Assert.Equal(1200.50m, saved.Budget);
    }

    [Fact, Trait("TestCase", "TRP-002")]
    public async Task CreateTrip_MissingDestination_ReturnsValidationError_NothingPersisted_TRP002() // TRP-002
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.PostAsync("/api/trips", TestTokens.UserA, new
        {
            startDate = Fixtures.Start, endDate = Fixtures.End, numberOfTravelers = 2, budget = 500m
        });

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
        Assert.False(res.Success);
        Assert.Contains("Destination is required", res.Raw); // ValidationProblemDetails emitted by [ApiController]

        await using var db = host.Db.CreateContext();
        Assert.Equal(0, await db.Trips.CountAsync());
    }

    [Fact, Trait("TestCase", "TRP-003")]
    public async Task CreateTrip_MissingStartDate_ReturnsValidationError_NothingPersisted_TRP003() // TRP-003
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.PostAsync("/api/trips", TestTokens.UserA, new
        {
            destination = "Kandy", endDate = Fixtures.End, numberOfTravelers = 2, budget = 500m
        });

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
        Assert.False(res.Success);

        await using var db = host.Db.CreateContext();
        Assert.Equal(0, await db.Trips.CountAsync());
    }

    [Fact, Trait("TestCase", "TRP-004")]
    public async Task CreateTrip_MissingEndDate_ReturnsValidationError_NothingPersisted_TRP004() // TRP-004
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.PostAsync("/api/trips", TestTokens.UserA, new
        {
            destination = "Kandy", startDate = Fixtures.Start, numberOfTravelers = 2, budget = 500m
        });

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
        Assert.False(res.Success);

        await using var db = host.Db.CreateContext();
        Assert.Equal(0, await db.Trips.CountAsync());
    }

    [Fact, Trait("TestCase", "TRP-005")]
    public async Task CreateTrip_EndDateBeforeStartDate_IsRejected_TRP005() // TRP-005
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.PostAsync("/api/trips", TestTokens.UserA, new
        {
            destination = "Kandy", startDate = Fixtures.End, endDate = Fixtures.Start, numberOfTravelers = 2, budget = 500m
        });

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
        Assert.Contains("start date cannot be after end date", res.Message, StringComparison.OrdinalIgnoreCase);

        await using var db = host.Db.CreateContext();
        Assert.Equal(0, await db.Trips.CountAsync());
    }

    [Fact, Trait("TestCase", "TRP-006")]
    public async Task GetTrip_ExistingId_ReturnsCorrectTrip_TRP006() // TRP-006
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId, otherId;
        await using (var db = host.Db.CreateContext())
        {
            tripId = (await Fixtures.SeedTripAsync(db, A, "Ella")).Id;
            otherId = (await Fixtures.SeedTripAsync(db, A, "Galle")).Id;
        }

        var res = await host.GetAsync($"/api/trips/{tripId}", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.Equal(tripId, res.DataString("id"));
        Assert.NotEqual(otherId, res.DataString("id"));
        Assert.Equal("Ella Trip", res.Data.GetProperty("tripName").GetString());
        Assert.Equal(A, res.Data.GetProperty("userId").GetString());
    }

    [Fact, Trait("TestCase", "TRP-007")]
    public async Task GetTrip_NonExistingId_ReturnsNotFound_TRP007() // TRP-007
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.GetAsync("/api/trips/T9999", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
        Assert.False(res.Success);
        Assert.Equal("Trip not found.", res.Message);
    }

    [Fact, Trait("TestCase", "TRP-008")]
    public async Task GetTrips_ForAuthenticatedUser_ReturnsOnlyOwnTrips_TRP008() // TRP-008
    {
        await using var host = await NovaApiHost.StartAsync();
        await using (var db = host.Db.CreateContext())
        {
            await Fixtures.SeedTripAsync(db, A, "Kandy");
            await Fixtures.SeedTripAsync(db, A, "Ella");
            await Fixtures.SeedTripAsync(db, B, "Galle");
        }

        var list = await host.GetAsync("/api/trips", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.OK, list.Status);
        var items = list.Data.GetProperty("items").EnumerateArray().ToList();
        Assert.Equal(2, items.Count);
        Assert.All(items, t => Assert.Equal(A, t.GetProperty("userId").GetString()));
        Assert.DoesNotContain(items, t => t.GetProperty("destination").GetString() == "Galle");

        var byUser = await host.GetAsync($"/api/trips/user/{A}", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.OK, byUser.Status);
        var own = byUser.Data.EnumerateArray().ToList();
        Assert.Equal(2, own.Count);
        Assert.All(own, t => Assert.Equal(A, t.GetProperty("userId").GetString()));
    }

    [Fact, Trait("TestCase", "TRP-008")]
    public async Task GetTripsByUser_AnotherUsersId_IsDenied_TRP008() // TRP-008 (authorization probe of GET api/trips/user/{userId})
    {
        await using var host = await NovaApiHost.StartAsync();
        await using (var db = host.Db.CreateContext())
        {
            await Fixtures.SeedTripAsync(db, B, "Galle");
        }

        // User A asks for user B's trips
        var res = await host.GetAsync($"/api/trips/user/{B}", TestTokens.UserA);

        Assert.Contains(res.Status, new[] { HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden, HttpStatusCode.NotFound });
        Assert.DoesNotContain("Galle", res.Raw);
    }

    [Fact, Trait("TestCase", "TRP-009")]
    public async Task UpdateTrip_ValidFields_UpdatesAndPersists_TRP009() // TRP-009
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId;
        await using (var db = host.Db.CreateContext()) tripId = (await Fixtures.SeedTripAsync(db, A)).Id;

        var res = await host.PutAsync($"/api/trips/{tripId}", TestTokens.UserA, new
        {
            tripName = "Renamed Trip", numberOfTravelers = 4, budget = 2500m, tripStyle = "luxury"
        });

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.Equal("Renamed Trip", res.Data.GetProperty("tripName").GetString());
        Assert.Equal(4, res.Data.GetProperty("numberOfTravelers").GetInt32());

        await using var verify = host.Db.CreateContext();
        var saved = await verify.Trips.AsNoTracking().SingleAsync(t => t.Id == tripId);
        Assert.Equal("Renamed Trip", saved.TripName);
        Assert.Equal(4, saved.NumberOfTravelers);
        Assert.Equal(2500m, saved.Budget);
        Assert.Equal("luxury", saved.TripStyle);
        Assert.Equal(A, saved.UserId);
    }

    [Fact, Trait("TestCase", "TRP-010")]
    public async Task DeleteTrip_ExistingTrip_DeletesTripAndCascadesChildren_TRP010() // TRP-010
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId, itinId;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, A);
            tripId = seed.trip.Id; itinId = seed.itinerary.Id;
        }

        var res = await host.DeleteAsync($"/api/trips/{tripId}", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        await using var verify = host.Db.CreateContext();
        Assert.False(await verify.Trips.AnyAsync(t => t.Id == tripId));
        // DbContext configures Trip -> Itinerary -> Day -> Item as cascade delete
        Assert.False(await verify.Itineraries.AnyAsync(i => i.Id == itinId));
        Assert.Equal(0, await verify.ItineraryDays.CountAsync());
        Assert.Equal(0, await verify.ItineraryItems.CountAsync());
        // follow-up read is a 404
        Assert.Equal(HttpStatusCode.NotFound, (await host.GetAsync($"/api/trips/{tripId}", TestTokens.UserA)).Status);
    }

    [Fact, Trait("TestCase", "TRP-011")]
    public async Task GetTrip_CrossUserAccess_IsDenied_TRP011() // TRP-011
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId;
        await using (var db = host.Db.CreateContext()) tripId = (await Fixtures.SeedTripAsync(db, B, "SecretPlace")).Id;

        var res = await host.GetAsync($"/api/trips/{tripId}", TestTokens.UserA);

        // TripsController.GetTripById maps every service failure (incl. "not authorized") to 404 NotFound.
        Assert.Equal(HttpStatusCode.NotFound, res.Status);
        Assert.False(res.Success);
        Assert.DoesNotContain("SecretPlace", res.Raw);
    }

    [Fact, Trait("TestCase", "TRP-012")]
    public async Task UpdateTrip_CrossUserAccess_IsDenied_OtherUsersTripUnchanged_TRP012() // TRP-012
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId;
        await using (var db = host.Db.CreateContext()) tripId = (await Fixtures.SeedTripAsync(db, B, "Galle")).Id;

        var res = await host.PutAsync($"/api/trips/{tripId}", TestTokens.UserA, new { tripName = "HACKED", budget = 1m + 1m });

        // TripsController.UpdateTrip returns 403 when the service message contains "authorized"
        Assert.Equal(HttpStatusCode.Forbidden, res.Status);
        await using var verify = host.Db.CreateContext();
        var trip = await verify.Trips.AsNoTracking().SingleAsync(t => t.Id == tripId);
        Assert.Equal("Galle Trip", trip.TripName);
        Assert.Equal(900m, trip.Budget);
        Assert.Equal(B, trip.UserId);
    }

    [Fact, Trait("TestCase", "TRP-012")]
    public async Task DeleteTrip_CrossUserAccess_IsDenied_TripStillExists_TRP012() // TRP-012 (delete variant)
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId;
        await using (var db = host.Db.CreateContext()) tripId = (await Fixtures.SeedTripAsync(db, B)).Id;

        var res = await host.DeleteAsync($"/api/trips/{tripId}", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.Forbidden, res.Status);
        await using var verify = host.Db.CreateContext();
        Assert.True(await verify.Trips.AnyAsync(t => t.Id == tripId));
    }
}
