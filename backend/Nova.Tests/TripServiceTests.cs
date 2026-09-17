using Nova.Api.DTOs.Trips;
using Nova.Api.Entities;
using Nova.Api.Services;
using Xunit;

namespace Nova.Tests;

public class TripServiceTests
{
    private readonly string _touristId = "11111111-1111-1111-1111-111111111111";
    private readonly string _otherTouristId = "22222222-2222-2222-2222-222222222222";
    private readonly string _operatorId = "33333333-3333-3333-3333-333333333333";

    [Fact]
    public async Task CreateTrip_ValidRequest_ReturnsSuccessAndPersistsTrip()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new TripService(db);

        var request = new CreateTripRequest
        {
            Destination = "Sigiriya",
            StartDate = DateTime.UtcNow.AddDays(5),
            EndDate = DateTime.UtcNow.AddDays(10),
            NumberOfTravelers = 2,
            Budget = 1500,
            Interests = new List<string> { "History", "Nature" },
            TripStyle = "Adventure"
        };

        var result = await service.CreateTripAsync(_touristId, request);

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Sigiriya", result.Data.Destination);
        Assert.Equal(TripStatus.Draft.ToString(), result.Data.Status);
        Assert.Equal(1500, result.Data.Budget);
        Assert.Equal(2, result.Data.NumberOfTravelers);

        var savedTrip = db.Trips.FirstOrDefault(t => t.Id == result.Data.Id);
        Assert.NotNull(savedTrip);
        Assert.Equal(_touristId, savedTrip.UserId);
    }

    [Fact]
    public async Task CreateTrip_StartDateAfterEndDate_ReturnsFailure()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new TripService(db);

        var request = new CreateTripRequest
        {
            Destination = "Kandy",
            StartDate = DateTime.UtcNow.AddDays(10),
            EndDate = DateTime.UtcNow.AddDays(5),
            NumberOfTravelers = 1,
            Budget = 1000
        };

        var result = await service.CreateTripAsync(_touristId, request);

        Assert.False(result.Success);
        Assert.Contains("start date cannot be after end date", result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateTrip_ZeroOrNegativeBudget_ReturnsFailure()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new TripService(db);

        var request = new CreateTripRequest
        {
            Destination = "Galle",
            StartDate = DateTime.UtcNow.AddDays(1),
            EndDate = DateTime.UtcNow.AddDays(3),
            NumberOfTravelers = 1,
            Budget = 0
        };

        var result = await service.CreateTripAsync(_touristId, request);

        Assert.False(result.Success);
        Assert.Contains("Budget must be greater than zero", result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateTrip_ZeroTravelers_ReturnsFailure()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new TripService(db);

        var request = new CreateTripRequest
        {
            Destination = "Ella",
            StartDate = DateTime.UtcNow.AddDays(1),
            EndDate = DateTime.UtcNow.AddDays(3),
            NumberOfTravelers = 0,
            Budget = 500
        };

        var result = await service.CreateTripAsync(_touristId, request);

        Assert.False(result.Success);
        Assert.Contains("Number of travelers must be greater than zero", result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetTrips_TouristRole_OnlyReturnsOwnTrips()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new TripService(db);

        // Seed trip for tourist 1
        db.Trips.Add(new Trip
        {
            UserId = _touristId,
            Destination = "Sigiriya",
            StartDate = DateTime.UtcNow.AddDays(1),
            EndDate = DateTime.UtcNow.AddDays(3),
            NumberOfTravelers = 2,
            Budget = 1000,
            Status = TripStatus.Draft
        });

        // Seed trip for tourist 2
        db.Trips.Add(new Trip
        {
            UserId = _otherTouristId,
            Destination = "Kandy",
            StartDate = DateTime.UtcNow.AddDays(2),
            EndDate = DateTime.UtcNow.AddDays(4),
            NumberOfTravelers = 1,
            Budget = 600,
            Status = TripStatus.Draft
        });
        await db.SaveChangesAsync();

        var result = await service.GetTripsAsync(_touristId, UserRole.Tourist.ToString(), new TripFilterParameters());

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Single(result.Data.Items);
        Assert.Equal("Sigiriya", result.Data.Items[0].Destination);
    }

    [Fact]
    public async Task GetTrips_TourismOperatorRole_CanSeeAllTrips()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new TripService(db);

        db.Trips.AddRange(
            new Trip
            {
                UserId = _touristId,
                Destination = "Sigiriya",
                StartDate = DateTime.UtcNow.AddDays(1),
                EndDate = DateTime.UtcNow.AddDays(3),
                NumberOfTravelers = 2,
                Budget = 1000,
                Status = TripStatus.Draft
            },
            new Trip
            {
                UserId = _otherTouristId,
                Destination = "Kandy",
                StartDate = DateTime.UtcNow.AddDays(2),
                EndDate = DateTime.UtcNow.AddDays(4),
                NumberOfTravelers = 1,
                Budget = 600,
                Status = TripStatus.Draft
            }
        );
        await db.SaveChangesAsync();

        var result = await service.GetTripsAsync(_operatorId, UserRole.TourismOperator.ToString(), new TripFilterParameters());

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(2, result.Data.Items.Count);
    }

    [Fact]
    public async Task GetTripById_TouristAccessingOtherUsersTrip_ReturnsForbidden()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new TripService(db);

        var trip = new Trip
        {
            UserId = _otherTouristId,
            Destination = "Nuwara Eliya",
            StartDate = DateTime.UtcNow.AddDays(1),
            EndDate = DateTime.UtcNow.AddDays(3),
            NumberOfTravelers = 1,
            Budget = 800,
            Status = TripStatus.Draft
        };
        db.Trips.Add(trip);
        await db.SaveChangesAsync();

        var result = await service.GetTripByIdAsync(trip.Id.ToString(), _touristId, UserRole.Tourist.ToString());

        Assert.False(result.Success);
        Assert.Contains("not authorized", result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task FilterTrips_ByDestinationAndStatus_ReturnsMatching()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new TripService(db);

        db.Trips.AddRange(
            new Trip
            {
                UserId = _touristId,
                Destination = "Sigiriya",
                StartDate = DateTime.UtcNow.AddDays(1),
                EndDate = DateTime.UtcNow.AddDays(3),
                NumberOfTravelers = 2,
                Budget = 1000,
                Status = TripStatus.Draft
            },
            new Trip
            {
                UserId = _touristId,
                Destination = "Sigiriya",
                StartDate = DateTime.UtcNow.AddDays(5),
                EndDate = DateTime.UtcNow.AddDays(7),
                NumberOfTravelers = 2,
                Budget = 1200,
                Status = TripStatus.Confirmed
            },
            new Trip
            {
                UserId = _touristId,
                Destination = "Galle",
                StartDate = DateTime.UtcNow.AddDays(10),
                EndDate = DateTime.UtcNow.AddDays(12),
                NumberOfTravelers = 1,
                Budget = 800,
                Status = TripStatus.Draft
            }
        );
        await db.SaveChangesAsync();

        var filter = new TripFilterParameters
        {
            Destination = "Sigiriya",
            Status = TripStatus.Confirmed.ToString()
        };

        var result = await service.GetTripsAsync(_touristId, UserRole.Tourist.ToString(), filter);

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Single(result.Data.Items);
        Assert.Equal(TripStatus.Confirmed.ToString(), result.Data.Items[0].Status);
    }
}
