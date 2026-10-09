using System.Net;
using Microsoft.EntityFrameworkCore;
using Nova.Api.DTOs.Itineraries;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.TripItinerary;

/// <summary>
/// Tests for ItineraryItemsController (api/itinerary-days/{dayId}/items, api/itinerary-items/{id})
/// covering ITN-006, ITN-007, ITN-008.
/// </summary>
public class ItineraryItemTests
{
    private const string TouristA = PgTestDatabase.UserAId;

    [Fact, Trait("TestCase", "ITN-006")]
    public async Task AddItineraryItem_ValidRequest_ItemCreatedUnderCorrectDay_ITN006() // ITN-006
    {
        await using var host = await NovaApiHost.StartAsync();
        string dayId;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA);
            dayId = seed.day.Id;
        }

        var request = new CreateItineraryItemRequest
        {
            ActivityName = "Udawatta Kele Sanctuary Hike",
            Location = "Kandy",
            StartTime = "14:00",
            EndTime = "16:30",
            DurationMinutes = 150,
            EstimatedCost = 8.0m,
            SequenceOrder = 2,
            Notes = "Wear hiking shoes and bring insect repellent"
        };

        var res = await host.PostAsync($"/api/itinerary-days/{dayId}/items", TestTokens.UserA, request);

        Assert.Equal(HttpStatusCode.Created, res.Status);
        Assert.True(res.Success);
        Assert.NotNull(res.Data);
        Assert.Equal("Udawatta Kele Sanctuary Hike", res.Data.GetProperty("activityName").GetString());
        Assert.Equal("Kandy", res.Data.GetProperty("location").GetString());
        Assert.Equal("14:00", res.Data.GetProperty("startTime").GetString());

        await using var verify = host.Db.CreateContext();
        var items = await verify.ItineraryItems.Where(i => i.ItineraryDayId == dayId).ToListAsync();
        Assert.Equal(2, items.Count); // 1 seed item + 1 new item
    }

    [Fact, Trait("TestCase", "ITN-007")]
    public async Task EditItineraryItem_ValidRequest_ItemIsUpdated_ITN007() // ITN-007
    {
        await using var host = await NovaApiHost.StartAsync();
        string itemId;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA);
            itemId = seed.item.Id;
        }

        var updateReq = new UpdateItineraryItemRequest
        {
            ActivityName = "Temple of the Sacred Tooth Relic (VIP Tour)",
            EstimatedCost = 25.0m,
            DurationMinutes = 180,
            Notes = "VIP morning puja access"
        };

        var res = await host.PutAsync($"/api/itinerary-items/{itemId}", TestTokens.UserA, updateReq);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.Equal("Temple of the Sacred Tooth Relic (VIP Tour)", res.Data.GetProperty("activityName").GetString());
        Assert.Equal(25.0m, res.Data.GetProperty("estimatedCost").GetDecimal());

        await using var verify = host.Db.CreateContext();
        var saved = await verify.ItineraryItems.FindAsync(itemId);
        Assert.Equal("Temple of the Sacred Tooth Relic (VIP Tour)", saved!.ActivityName);
        Assert.Equal(25.0m, saved.EstimatedCost);
        Assert.Equal("VIP morning puja access", saved.Notes);
    }

    [Fact, Trait("TestCase", "ITN-008")]
    public async Task DeleteItineraryItem_ExistingItem_ItemIsDeleted_ITN008() // ITN-008
    {
        await using var host = await NovaApiHost.StartAsync();
        string itemId, dayId;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA);
            itemId = seed.item.Id;
            dayId = seed.day.Id;
        }

        var res = await host.DeleteAsync($"/api/itinerary-items/{itemId}", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);

        await using var verify = host.Db.CreateContext();
        Assert.False(await verify.ItineraryItems.AnyAsync(i => i.Id == itemId));
        Assert.Equal(0, await verify.ItineraryItems.Where(i => i.ItineraryDayId == dayId).CountAsync());
    }
}
