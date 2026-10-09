using Microsoft.EntityFrameworkCore;
using Nova.Api.DTOs.Trips;
using Nova.Api.Entities;
using Nova.Api.Services;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.TripItinerary;

/// <summary>
/// Service-level (unit/integration) tests for <see cref="TripService"/> against an isolated PostgreSQL database.
/// The service receives (userId, userRole) from the controller; "Tourist" is the role string the service gates on.
/// </summary>
public class TripServiceTests
{
    private const string A = PgTestDatabase.UserAId;
    private const string B = PgTestDatabase.UserBId;
    private const string Tourist = "Tourist";

    private static CreateTripRequest Valid(string dest = "Kandy") => new()
    {
        Destination = dest, StartDate = Fixtures.Start, EndDate = Fixtures.End,
        NumberOfTravelers = 2, Budget = 750m, Interests = ["Culture"]
    };

    [Fact, Trait("TestCase", "TRP-001")]
    public async Task CreateTrip_ValidData_CreatesAndPersistsTrip_TRP001() // TRP-001
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var result = await new TripService(db).CreateTripAsync(A, Valid());

        Assert.True(result.Success);
        Assert.Equal(A, result.Data!.UserId);
        await using var verify = pg.CreateContext();
        var saved = await verify.Trips.AsNoTracking().SingleAsync(t => t.Id == result.Data.Id);
        Assert.Equal(A, saved.UserId);
        Assert.Equal(750m, saved.Budget);
        Assert.Equal(TripStatus.Draft, saved.Status);
    }

    [Fact, Trait("TestCase", "TRP-003")]
    public async Task CreateTrip_MissingStartDate_IsRejected_NothingPersisted_TRP003() // TRP-003
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var req = Valid(); req.StartDate = default; // "missing" for a non-nullable DateTime == default(DateTime)

        var result = await new TripService(db).CreateTripAsync(A, req);

        Assert.False(result.Success);
        await using var verify = pg.CreateContext();
        Assert.Equal(0, await verify.Trips.CountAsync());
    }

    [Fact, Trait("TestCase", "TRP-004")]
    public async Task CreateTrip_MissingEndDate_IsRejected_NothingPersisted_TRP004() // TRP-004
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var req = Valid(); req.EndDate = default;

        var result = await new TripService(db).CreateTripAsync(A, req);

        Assert.False(result.Success);
        await using var verify = pg.CreateContext();
        Assert.Equal(0, await verify.Trips.CountAsync());
    }

    [Fact, Trait("TestCase", "TRP-005")]
    public async Task CreateTrip_EndDateBeforeStartDate_IsRejected_TRP005() // TRP-005
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var req = Valid(); req.StartDate = Fixtures.End; req.EndDate = Fixtures.Start;

        var result = await new TripService(db).CreateTripAsync(A, req);

        Assert.False(result.Success);
        Assert.Contains("start date cannot be after end date", result.Message, StringComparison.OrdinalIgnoreCase);
        await using var verify = pg.CreateContext();
        Assert.Equal(0, await verify.Trips.CountAsync());
    }

    [Fact, Trait("TestCase", "TRP-006")]
    public async Task GetTripById_ExistingTrip_ReturnsCorrectTrip_TRP006() // TRP-006
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var t1 = await Fixtures.SeedTripAsync(db, A, "Ella");
        await Fixtures.SeedTripAsync(db, A, "Galle");

        var result = await new TripService(db).GetTripByIdAsync(t1.Id, A, Tourist);

        Assert.True(result.Success);
        Assert.Equal(t1.Id, result.Data!.Id);
        Assert.Equal(A, result.Data.UserId);
    }

    [Fact, Trait("TestCase", "TRP-007")]
    public async Task GetTripById_NonExistingTrip_ReturnsNotFoundFailure_TRP007() // TRP-007
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var result = await new TripService(db).GetTripByIdAsync("T9999", A, Tourist);

        Assert.False(result.Success);
        Assert.Equal("Trip not found.", result.Message);
    }

    [Fact, Trait("TestCase", "TRP-008")]
    public async Task GetTripsByUserId_TwoUsersWithTrips_ReturnsOnlyRequestedUsersTrips_TRP008() // TRP-008
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        await Fixtures.SeedTripAsync(db, A, "Kandy");
        await Fixtures.SeedTripAsync(db, B, "Galle");
        var svc = new TripService(db);

        var byUser = await svc.GetTripsByUserIdAsync(A);
        var paged = await svc.GetTripsAsync(A, Tourist, new TripFilterParameters());

        Assert.Single(byUser.Data!);
        Assert.All(byUser.Data!, t => Assert.Equal(A, t.UserId));
        Assert.Single(paged.Data!.Items);
        Assert.All(paged.Data.Items, t => Assert.Equal(A, t.UserId));
    }

    [Fact, Trait("TestCase", "TRP-009")]
    public async Task UpdateTrip_ValidFields_UpdatesAndPersists_TRP009() // TRP-009
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var trip = await Fixtures.SeedTripAsync(db, A);

        var result = await new TripService(db).UpdateTripAsync(trip.Id, A, Tourist,
            new UpdateTripRequest { TripName = "Updated", Budget = 1500m, NumberOfTravelers = 3 });

        Assert.True(result.Success);
        await using var verify = pg.CreateContext();
        var saved = await verify.Trips.AsNoTracking().SingleAsync(t => t.Id == trip.Id);
        Assert.Equal("Updated", saved.TripName);
        Assert.Equal(1500m, saved.Budget);
        Assert.Equal(3, saved.NumberOfTravelers);
    }

    [Fact, Trait("TestCase", "TRP-010")]
    public async Task DeleteTrip_Owner_DeletesTripAndChildren_TRP010() // TRP-010
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var seed = await Fixtures.SeedItineraryAsync(db, A);

        var result = await new TripService(db).DeleteTripAsync(seed.trip.Id, A, Tourist);

        Assert.True(result.Success);
        await using var verify = pg.CreateContext();
        Assert.False(await verify.Trips.AnyAsync());
        Assert.False(await verify.Itineraries.AnyAsync());
        Assert.False(await verify.ItineraryDays.AnyAsync());
        Assert.False(await verify.ItineraryItems.AnyAsync());
    }

    [Fact, Trait("TestCase", "TRP-011")]
    public async Task GetTripById_CrossUser_IsDenied_TRP011() // TRP-011
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var trip = await Fixtures.SeedTripAsync(db, B);

        var result = await new TripService(db).GetTripByIdAsync(trip.Id, A, Tourist);

        Assert.False(result.Success);
        Assert.Contains("not authorized", result.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Null(result.Data);
    }

    [Fact, Trait("TestCase", "TRP-012")]
    public async Task UpdateTrip_CrossUser_IsDenied_OtherUsersTripUnchanged_TRP012() // TRP-012
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var trip = await Fixtures.SeedTripAsync(db, B);

        var result = await new TripService(db).UpdateTripAsync(trip.Id, A, Tourist, new UpdateTripRequest { TripName = "HACKED" });

        Assert.False(result.Success);
        Assert.Contains("not authorized", result.Message, StringComparison.OrdinalIgnoreCase);
        await using var verify = pg.CreateContext();
        Assert.Equal("Kandy Trip", (await verify.Trips.AsNoTracking().SingleAsync(t => t.Id == trip.Id)).TripName);
    }
}
