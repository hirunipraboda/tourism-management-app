using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Transport;
using Nova.Api.Entities;
using Nova.Api.Services;
using Xunit;

namespace Nova.Tests;

public class MockGoogleTransportService : IGoogleTransportService
{
    public List<TransportOptionDto> ReturnsOptions { get; set; } = [];
    public Exception? ThrowsException { get; set; }

    public Task<List<TransportOptionDto>> GetTransitDirectionsAsync(
        string origin, 
        string destination, 
        DateTime travelDate, 
        string? preferredDepartureTime = null, 
        string? transitMode = null)
    {
        if (ThrowsException != null)
        {
            throw ThrowsException;
        }

        var filtered = ReturnsOptions.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(transitMode))
        {
            filtered = filtered.Where(o => o.TransportType.Equals(transitMode, StringComparison.OrdinalIgnoreCase));
        }

        return Task.FromResult(filtered.ToList());
    }
}

public class TransportServiceTests
{
    private static NovaDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<NovaDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new NovaDbContext(options);
    }

    private static (NovaDbContext db, string touristId, string otherTouristId, string tripId, string dayId, string itemId) SeedTripAndItinerary(NovaDbContext db, DateTime travelDate)
    {
        var touristId = "tourist-001";
        var otherTouristId = "tourist-999";

        var tourist = new User
        {
            Id = touristId,
            Email = "tourist@nova.com",
            Name = "Tourist One",
            Role = UserRole.Tourist
        };

        var otherTourist = new User
        {
            Id = otherTouristId,
            Email = "other@nova.com",
            Name = "Tourist Other",
            Role = UserRole.Tourist
        };

        var trip = new Trip
        {
            Id = "trip-101",
            UserId = touristId,
            Destination = "Kandy",
            StartDate = travelDate,
            EndDate = travelDate.AddDays(3),
            NumberOfTravelers = 2,
            Budget = 500.0m
        };

        var itinerary = new Itinerary
        {
            Id = "itin-201",
            TripId = trip.Id,
            Title = "Kandy Cultural Tour"
        };

        var day = new ItineraryDay
        {
            Id = "day-301",
            ItineraryId = itinerary.Id,
            DayNumber = 1,
            Date = travelDate,
            Title = "Arrival & Temple Visit",
            Location = "Kandy"
        };

        var item = new ItineraryItem
        {
            Id = "item-401",
            ItineraryDayId = day.Id,
            ActivityName = "Temple of the Tooth Visit",
            Location = "Kandy",
            StartTime = new TimeSpan(11, 0, 0), // 11:00 AM
            EndTime = new TimeSpan(13, 0, 0),   // 01:00 PM
            DurationMinutes = 120,
            EstimatedCost = 10.0m,
            SequenceOrder = 1
        };

        day.Items.Add(item);
        itinerary.Days.Add(day);
        trip.Itineraries.Add(itinerary);

        db.Users.AddRange(tourist, otherTourist);
        db.Trips.Add(trip);
        db.Itineraries.Add(itinerary);
        db.ItineraryDays.Add(day);
        db.ItineraryItems.Add(item);
        db.SaveChanges();

        return (db, touristId, otherTouristId, trip.Id, day.Id, item.Id);
    }

    private static List<TransportOptionDto> GetSampleMockOptions(DateTime date)
    {
        var dateStr = date.ToString("yyyy-MM-dd");
        return
        [
            new TransportOptionDto
            {
                Id = Guid.NewGuid().ToString(),
                TransportType = "BUS",
                Origin = "Colombo Fort",
                Destination = "Kandy",
                TravelDate = dateStr,
                DepartureTime = "07:00",
                ArrivalTime = "10:15",
                DurationMinutes = 195,
                RouteNumber = "1",
                RouteName = "Colombo - Kandy",
                EstimatedFare = 500.0m,
                Source = "Google",
                RetrievedAt = DateTime.UtcNow
            },
            new TransportOptionDto
            {
                Id = Guid.NewGuid().ToString(),
                TransportType = "TRAIN",
                Origin = "Colombo Fort",
                Destination = "Kandy",
                TravelDate = dateStr,
                DepartureTime = "07:00",
                ArrivalTime = "09:35",
                DurationMinutes = 155,
                TrainName = "Intercity Express",
                TrainNumber = "1015",
                DepartureStation = "Colombo Fort",
                ArrivalStation = "Kandy",
                EstimatedFare = 1200.0m,
                Source = "Google",
                RetrievedAt = DateTime.UtcNow
            }
        ];
    }

    // 1. Public transport search
    [Fact]
    public async Task SearchPublicTransport_ValidRequest_ReturnsBothBusAndTrainOptions()
    {
        var db = CreateInMemoryDb();
        var mockGoogle = new MockGoogleTransportService
        {
            ReturnsOptions = GetSampleMockOptions(DateTime.UtcNow.Date.AddDays(7))
        };
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var request = new PublicTransportSearchRequest
        {
            Origin = "Colombo Fort",
            Destination = "Kandy",
            Date = DateTime.UtcNow.Date.AddDays(7),
            PreferredDepartureTime = "07:00",
            NumberOfTravelers = 2
        };

        var response = await service.SearchPublicTransportAsync(request);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Single(response.Data.Buses);
        Assert.Single(response.Data.Trains);
        Assert.Equal(2, response.Data.TotalOptions);
        Assert.Equal("1", response.Data.Buses[0].RouteNumber);
        Assert.Equal("Intercity Express", response.Data.Trains[0].TrainName);
    }

    // 2. Bus search
    [Fact]
    public async Task SearchBuses_ValidRequest_ReturnsOnlyBusOptions()
    {
        var db = CreateInMemoryDb();
        var mockGoogle = new MockGoogleTransportService
        {
            ReturnsOptions = GetSampleMockOptions(DateTime.UtcNow.Date.AddDays(5))
        };
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var request = new PublicTransportSearchRequest
        {
            Origin = "Colombo Fort",
            Destination = "Kandy",
            Date = DateTime.UtcNow.Date.AddDays(5),
            TransportType = "BUS"
        };

        var response = await service.SearchBusesAsync(request);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal("BUS", response.Data.TransportType);
        Assert.All(response.Data.Options, opt => Assert.Equal("BUS", opt.TransportType));
    }

    // 3. Train search
    [Fact]
    public async Task SearchTrains_ValidRequest_ReturnsOnlyTrainOptions()
    {
        var db = CreateInMemoryDb();
        var mockGoogle = new MockGoogleTransportService
        {
            ReturnsOptions = GetSampleMockOptions(DateTime.UtcNow.Date.AddDays(5))
        };
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var request = new PublicTransportSearchRequest
        {
            Origin = "Colombo Fort",
            Destination = "Kandy",
            Date = DateTime.UtcNow.Date.AddDays(5),
            TransportType = "TRAIN"
        };

        var response = await service.SearchTrainsAsync(request);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal("TRAIN", response.Data.TransportType);
        Assert.All(response.Data.Options, opt => Assert.Equal("TRAIN", opt.TransportType));
    }

    // 4. Invalid origin
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task SearchPublicTransport_InvalidOrigin_ReturnsError(string invalidOrigin)
    {
        var db = CreateInMemoryDb();
        var mockGoogle = new MockGoogleTransportService();
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var request = new PublicTransportSearchRequest
        {
            Origin = invalidOrigin,
            Destination = "Kandy",
            Date = DateTime.UtcNow.Date.AddDays(2),
            NumberOfTravelers = 1
        };

        var response = await service.SearchPublicTransportAsync(request);

        Assert.False(response.Success);
        Assert.Contains(response.Errors ?? [], e => e.Contains("ORIGIN_REQUIRED") || e.Contains("Origin is required"));
    }

    // 5. Invalid destination
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task SearchPublicTransport_InvalidDestination_ReturnsError(string invalidDestination)
    {
        var db = CreateInMemoryDb();
        var mockGoogle = new MockGoogleTransportService();
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var request = new PublicTransportSearchRequest
        {
            Origin = "Colombo Fort",
            Destination = invalidDestination,
            Date = DateTime.UtcNow.Date.AddDays(2),
            NumberOfTravelers = 1
        };

        var response = await service.SearchPublicTransportAsync(request);

        Assert.False(response.Success);
        Assert.Contains(response.Errors ?? [], e => e.Contains("DESTINATION_REQUIRED") || e.Contains("Destination is required"));
    }

    // 6. Invalid origin and destination identical
    [Fact]
    public async Task SearchPublicTransport_IdenticalOriginAndDestination_ReturnsError()
    {
        var db = CreateInMemoryDb();
        var mockGoogle = new MockGoogleTransportService();
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var request = new PublicTransportSearchRequest
        {
            Origin = "Colombo Fort",
            Destination = "Colombo Fort",
            Date = DateTime.UtcNow.Date.AddDays(2),
            NumberOfTravelers = 1
        };

        var response = await service.SearchPublicTransportAsync(request);

        Assert.False(response.Success);
        Assert.Contains(response.Errors ?? [], e => e.Contains("IDENTICAL_ORIGIN_DESTINATION"));
    }

    // 7. Invalid date
    [Fact]
    public async Task SearchPublicTransport_InvalidDate_ReturnsError()
    {
        var db = CreateInMemoryDb();
        var mockGoogle = new MockGoogleTransportService();
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var request = new PublicTransportSearchRequest
        {
            Origin = "Colombo Fort",
            Destination = "Kandy",
            Date = null,
            NumberOfTravelers = 1
        };

        var response = await service.SearchPublicTransportAsync(request);

        Assert.False(response.Success);
        Assert.Contains(response.Errors ?? [], e => e.Contains("INVALID_DATE"));
    }

    // 8. Invalid traveler count
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task SearchPublicTransport_InvalidTravelerCount_ReturnsError(int count)
    {
        var db = CreateInMemoryDb();
        var mockGoogle = new MockGoogleTransportService();
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var request = new PublicTransportSearchRequest
        {
            Origin = "Colombo Fort",
            Destination = "Kandy",
            Date = DateTime.UtcNow.Date.AddDays(2),
            NumberOfTravelers = count
        };

        var response = await service.SearchPublicTransportAsync(request);

        Assert.False(response.Success);
        Assert.Contains(response.Errors ?? [], e => e.Contains("INVALID_TRAVELER_COUNT"));
    }

    // 9. No transport results
    [Fact]
    public async Task SearchPublicTransport_NoResults_ReturnsEmptyArraysGracefully()
    {
        var db = CreateInMemoryDb();
        var mockGoogle = new MockGoogleTransportService
        {
            ReturnsOptions = []
        };
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var request = new PublicTransportSearchRequest
        {
            Origin = "Remote Jungle Point",
            Destination = "Isolated Peak",
            Date = DateTime.UtcNow.Date.AddDays(3),
            NumberOfTravelers = 1
        };

        var response = await service.SearchPublicTransportAsync(request);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Empty(response.Data.Buses);
        Assert.Empty(response.Data.Trains);
        Assert.Equal(0, response.Data.TotalOptions);
    }

    // 10. Google API failure
    [Fact]
    public async Task SearchPublicTransport_GoogleApiFailure_ReturnsStructuredUnavailableError()
    {
        var db = CreateInMemoryDb();
        var mockGoogle = new MockGoogleTransportService
        {
            ThrowsException = new TransportServiceException("TRANSPORT_SERVICE_UNAVAILABLE", "External transit API rate limited.")
        };
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var request = new PublicTransportSearchRequest
        {
            Origin = "Colombo Fort",
            Destination = "Kandy",
            Date = DateTime.UtcNow.Date.AddDays(3),
            NumberOfTravelers = 1
        };

        var response = await service.SearchPublicTransportAsync(request);

        Assert.False(response.Success);
        Assert.Contains(response.Errors ?? [], e => e.Contains("TRANSPORT_SERVICE_UNAVAILABLE"));
    }

    // 11. Unauthorized itinerary access
    [Fact]
    public async Task SelectTransport_UnauthorizedUser_ReturnsUnauthorizedError()
    {
        var travelDate = DateTime.UtcNow.Date.AddDays(5);
        var db = CreateInMemoryDb();
        var (_, _, otherTouristId, _, _, itemId) = SeedTripAndItinerary(db, travelDate);

        var mockGoogle = new MockGoogleTransportService();
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var selectRequest = new SelectTransportRequest
        {
            TransportType = "BUS",
            Origin = "Colombo Fort",
            Destination = "Kandy",
            TravelDate = travelDate,
            DepartureTime = "07:00",
            ArrivalTime = "10:15",
            DurationMinutes = 195,
            RouteNumber = "1"
        };

        var response = await service.SelectTransportForItineraryItemAsync(itemId, otherTouristId, UserRole.Tourist.ToString(), selectRequest);

        Assert.False(response.Success);
        Assert.Contains(response.Errors ?? [], e => e.Contains("UNAUTHORIZED_ACCESS"));
    }

    // 12. Valid transport selection
    [Fact]
    public async Task SelectTransport_ValidRequest_AttachesTransportAndPersists()
    {
        var travelDate = DateTime.UtcNow.Date.AddDays(5);
        var db = CreateInMemoryDb();
        var (_, touristId, _, _, _, itemId) = SeedTripAndItinerary(db, travelDate);

        var mockGoogle = new MockGoogleTransportService();
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var selectRequest = new SelectTransportRequest
        {
            TransportType = "TRAIN",
            Origin = "Colombo Fort",
            Destination = "Kandy",
            TravelDate = travelDate,
            DepartureTime = "07:00",
            ArrivalTime = "09:35",
            DurationMinutes = 155,
            TrainName = "Intercity Express",
            TrainNumber = "1015",
            DepartureStation = "Colombo Fort",
            ArrivalStation = "Kandy",
            EstimatedFare = 1200.0m
        };

        var response = await service.SelectTransportForItineraryItemAsync(itemId, touristId, UserRole.Tourist.ToString(), selectRequest);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal("TRAIN", response.Data.TransportOption.TransportType);
        Assert.Equal("Intercity Express", response.Data.TransportOption.TrainName);

        // Verify in database
        var updatedItem = await db.ItineraryItems.Include(i => i.SelectedTransport).FirstOrDefaultAsync(i => i.Id == itemId);
        Assert.NotNull(updatedItem?.SelectedTransport);
        Assert.Equal("TRAIN", updatedItem.SelectedTransport.TransportType);
        Assert.Equal(155, updatedItem.TravelTimeMinutes);
    }

    // 13. Removing transport
    [Fact]
    public async Task RemoveSelectedTransport_AttachedTransport_RemovesAndResetsTravelTime()
    {
        var travelDate = DateTime.UtcNow.Date.AddDays(5);
        var db = CreateInMemoryDb();
        var (_, touristId, _, _, _, itemId) = SeedTripAndItinerary(db, travelDate);

        var mockGoogle = new MockGoogleTransportService();
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        // Attach first
        await service.SelectTransportForItineraryItemAsync(itemId, touristId, UserRole.Tourist.ToString(), new SelectTransportRequest
        {
            TransportType = "BUS",
            Origin = "Colombo Fort",
            Destination = "Kandy",
            TravelDate = travelDate,
            DepartureTime = "07:00",
            ArrivalTime = "10:15",
            DurationMinutes = 195
        });

        // Now remove
        var removeResult = await service.RemoveSelectedTransportAsync(itemId, touristId, UserRole.Tourist.ToString());
        Assert.True(removeResult.Success);

        // Verify removed in DB
        var updatedItem = await db.ItineraryItems.Include(i => i.SelectedTransport).FirstOrDefaultAsync(i => i.Id == itemId);
        Assert.Null(updatedItem?.SelectedTransport);
        Assert.Equal(0, updatedItem?.TravelTimeMinutes);
    }

    // 14. Transport date mismatch
    [Fact]
    public async Task SelectTransport_DateMismatch_ReturnsValidationError()
    {
        var travelDate = DateTime.UtcNow.Date.AddDays(5);
        var mismatchedDate = travelDate.AddDays(2); // different day!
        var db = CreateInMemoryDb();
        var (_, touristId, _, _, _, itemId) = SeedTripAndItinerary(db, travelDate);

        var mockGoogle = new MockGoogleTransportService();
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var selectRequest = new SelectTransportRequest
        {
            TransportType = "BUS",
            Origin = "Colombo Fort",
            Destination = "Kandy",
            TravelDate = mismatchedDate,
            DepartureTime = "07:00",
            ArrivalTime = "10:15",
            DurationMinutes = 195
        };

        var response = await service.SelectTransportForItineraryItemAsync(itemId, touristId, UserRole.Tourist.ToString(), selectRequest);

        Assert.False(response.Success);
        Assert.Contains(response.Errors ?? [], e => e.Contains("TRANSPORT_DATE_MISMATCH"));
    }

    // 15. Transport causing itinerary conflict (Arrival after activity starts)
    [Fact]
    public async Task SelectTransport_ArrivalAfterActivityStarts_ReturnsFeasibilityConflict()
    {
        var travelDate = DateTime.UtcNow.Date.AddDays(5);
        var db = CreateInMemoryDb();
        var (_, touristId, _, _, _, itemId) = SeedTripAndItinerary(db, travelDate);

        // Activity starts at 11:00 AM (seeded in SeedTripAndItinerary)
        // Transport arrives at 11:45 AM -> conflict!
        var mockGoogle = new MockGoogleTransportService();
        var service = new TransportService(db, mockGoogle, NullLogger<TransportService>.Instance);

        var selectRequest = new SelectTransportRequest
        {
            TransportType = "BUS",
            Origin = "Colombo Fort",
            Destination = "Kandy",
            TravelDate = travelDate,
            DepartureTime = "08:30",
            ArrivalTime = "11:45", // After 11:00 AM start time!
            DurationMinutes = 195
        };

        var response = await service.SelectTransportForItineraryItemAsync(itemId, touristId, UserRole.Tourist.ToString(), selectRequest);

        Assert.False(response.Success);
        Assert.Contains(response.Errors ?? [], e => e.Contains("TRANSPORT_ARRIVAL_AFTER_ACTIVITY"));
    }

    // 16. Itinerary validation engine detects transport conflicts
    [Fact]
    public void ItineraryValidationService_WithTransportConflicts_FlagsErrors()
    {
        var date = DateTime.UtcNow.Date.AddDays(10);
        var validator = new ItineraryValidationService();

        var trip = new Trip
        {
            Id = "trip-test",
            Destination = "Kandy",
            StartDate = date,
            EndDate = date.AddDays(2),
            NumberOfTravelers = 1,
            Budget = 1000.0m
        };

        var day = new ItineraryDay
        {
            Id = "day-1",
            Date = date,
            DayNumber = 1
        };

        var act1 = new ItineraryItem
        {
            Id = "act-1",
            ActivityName = "Morning City Walk",
            StartTime = new TimeSpan(8, 0, 0),
            EndTime = new TimeSpan(10, 0, 0),
            SequenceOrder = 1
        };

        var act2 = new ItineraryItem
        {
            Id = "act-2",
            ActivityName = "Temple Visit",
            StartTime = new TimeSpan(12, 0, 0),
            EndTime = new TimeSpan(14, 0, 0),
            SequenceOrder = 2,
            SelectedTransport = new TransportOption
            {
                TransportType = "BUS",
                TravelDate = date,
                DepartureTime = "09:30", // Departure is BEFORE act1 ends at 10:00!
                ArrivalTime = "12:30",   // Arrival is AFTER act2 starts at 12:00!
                DurationMinutes = 180
            }
        };

        day.Items.Add(act1);
        day.Items.Add(act2);

        var result = validator.Validate(trip, [day]);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.Code == "TRANSPORT_DEPARTURE_BEFORE_PREVIOUS");
        Assert.Contains(result.Errors, e => e.Code == "TRANSPORT_ARRIVAL_AFTER_ACTIVITY");
    }
}
