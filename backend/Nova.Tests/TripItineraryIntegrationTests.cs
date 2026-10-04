using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Itineraries;
using Nova.Api.DTOs.Trips;
using Nova.Api.Entities;
using Nova.Api.Services;
using Xunit;

namespace Nova.Tests;

public class TripItineraryIntegrationTests
{
    [Fact]
    public async Task CompleteFlow_User_Trip_Itinerary_Days_Items_Verification()
    {
        // 1. Initialize DB with U001
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var user = new User
        {
            Id = "U001",
            Name = "Hiruni Praboda",
            Email = "hiruni@example.com",
            PasswordHash = "hashed",
            Role = UserRole.Tourist
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var tripService = new TripService(db);
        var itineraryService = new ItineraryService(db);

        // 2. Create Trip for U001
        var createTripReq = new CreateTripRequest
        {
            TripName = "Ella Explorer Adventure",
            Destination = "Ella, Badulla",
            StartDate = DateTime.UtcNow.AddDays(7),
            EndDate = DateTime.UtcNow.AddDays(10),
            NumberOfTravelers = 3,
            Budget = 750.0m,
            TripStyle = "Moderate",
            Interests = ["Nature", "Hiking", "Photography"]
        };

        var tripResult = await tripService.CreateTripAsync("U001", createTripReq);
        Assert.True(tripResult.Success);
        Assert.NotNull(tripResult.Data);
        Assert.StartsWith("T", tripResult.Data.Id); // T001
        Assert.Equal("U001", tripResult.Data.UserId);
        Assert.Equal("Ella Explorer Adventure", tripResult.Data.TripName);

        var tripId = tripResult.Data.Id;

        // 3. Create Itinerary with Days and Activities
        var createItineraryReq = new CreateItineraryRequest
        {
            Title = "Ella 3-Day Scenic Itinerary",
            Days =
            [
                new CreateItineraryDayRequest
                {
                    DayNumber = 1,
                    Date = DateTime.UtcNow.AddDays(7),
                    Location = "Ella",
                    Title = "Day 1: Ella Iconic Landmarks",
                    Items =
                    [
                        new CreateItineraryItemRequest
                        {
                            SequenceOrder = 1,
                            ActivityName = "Nine Arch Bridge Morning Walk",
                            Location = "Demodara",
                            StartTime = "08:30",
                            EndTime = "11:00",
                            DurationMinutes = 150,
                            EstimatedCost = 0.0m,
                            TravelTimeMinutes = 20,
                            Notes = "Watch the blue train cross the bridge"
                        },
                        new CreateItineraryItemRequest
                        {
                            SequenceOrder = 2,
                            ActivityName = "Little Adam's Peak Trek",
                            Location = "Passara Road, Ella",
                            StartTime = "11:30",
                            EndTime = "14:00",
                            DurationMinutes = 150,
                            EstimatedCost = 15.0m,
                            TravelTimeMinutes = 25,
                            Notes = "Panoramic view of Ella Gap"
                        },
                        new CreateItineraryItemRequest
                        {
                            SequenceOrder = 3,
                            ActivityName = "Ravana Waterfall & Pool",
                            Location = "Ella-Wellawaya Road",
                            StartTime = "15:00",
                            EndTime = "17:30",
                            DurationMinutes = 150,
                            EstimatedCost = 5.0m,
                            TravelTimeMinutes = 30,
                            Notes = "Spectacular tiered cascades"
                        }
                    ]
                }
            ]
        };

        var itinResult = await itineraryService.CreateItineraryAsync(tripId, "U001", "Tourist", createItineraryReq);
        Assert.True(itinResult.Success);
        Assert.NotNull(itinResult.Data);
        Assert.StartsWith("I", itinResult.Data.Id); // I001
        Assert.Equal(tripId, itinResult.Data.TripId);
        Assert.Single(itinResult.Data.Days);

        var day = itinResult.Data.Days[0];
        Assert.Equal(3, day.Items.Count);

        // 4. Verify distinct activity start/end times (Not hardcoded!)
        var item1 = day.Items[0];
        var item2 = day.Items[1];
        var item3 = day.Items[2];

        Assert.Equal("08:30", item1.StartTime);
        Assert.Equal("11:00", item1.EndTime);

        Assert.Equal("11:30", item2.StartTime);
        Assert.Equal("14:00", item2.EndTime);

        Assert.Equal("15:00", item3.StartTime);
        Assert.Equal("17:30", item3.EndTime);

        // 5. Verify User Trips Retrieval (GET /api/trips/user/U001)
        var userTrips = await tripService.GetTripsByUserIdAsync("U001");
        Assert.True(userTrips.Success);
        Assert.NotNull(userTrips.Data);
        Assert.NotEmpty(userTrips.Data);

        var retrievedTrip = userTrips.Data.FirstOrDefault(t => t.Id == tripId);
        Assert.NotNull(retrievedTrip);
        Assert.NotEmpty(retrievedTrip.Itineraries);
        Assert.Equal("Ella 3-Day Scenic Itinerary", retrievedTrip.Itineraries[0].Title);

        // 6. Verify User Approval Status Transitions (Draft -> Approved -> Published)
        var itinId = itinResult.Data.Id;
        var approveResult = await itineraryService.UpdateItineraryStatusAsync(itinId, "Approved");
        Assert.True(approveResult.Success);
        Assert.Equal("Approved", approveResult.Data!.Status);
    }
}
