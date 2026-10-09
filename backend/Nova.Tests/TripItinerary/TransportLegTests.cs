using System.Net;
using Microsoft.EntityFrameworkCore;
using Nova.Api.DTOs.Transport;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.TripItinerary;

/// <summary>
/// Tests for transport legs attached to itinerary items (ITN-009, ITN-010)
/// via ItineraryItemsController:
/// - POST /api/itinerary-items/{id}/transport
/// - GET /api/itinerary-items/{id}/transport
/// - DELETE /api/itinerary-items/{id}/transport
/// </summary>
public class TransportLegTests
{
    private const string TouristA = PgTestDatabase.UserAId;

    [Fact, Trait("TestCase", "ITN-009")]
    public async Task AttachTransportLeg_ValidRequest_AttachesTransportToItem_ITN009() // ITN-009
    {
        await using var host = await NovaApiHost.StartAsync();
        string itemId, tripId;
        DateTime itemDate;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA);
            itemId = seed.item.Id;
            tripId = seed.trip.Id;
            itemDate = seed.day.Date;
        }

        var selectReq = new SelectTransportRequest
        {
            TransportType = "BUS",
            Origin = "Colombo Fort",
            Destination = "Kandy Goods Shed",
            TravelDate = itemDate,
            DepartureTime = "06:00",
            ArrivalTime = "08:30",
            DurationMinutes = 150,
            RouteNumber = "EX01",
            RouteName = "Colombo - Kandy Express Highway",
            EstimatedFare = 450.0m
        };

        var res = await host.PostAsync($"/api/itinerary-items/{itemId}/transport", TestTokens.UserA, selectReq);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.NotNull(res.Data);
        Assert.Equal(itemId, res.Data.GetProperty("itineraryItemId").GetString());
        var opt = res.Data.GetProperty("transportOption");
        Assert.Equal("BUS", opt.GetProperty("transportType").GetString());
        Assert.Equal("Colombo Fort", opt.GetProperty("origin").GetString());
        Assert.Equal("Kandy Goods Shed", opt.GetProperty("destination").GetString());
        Assert.Equal(150, opt.GetProperty("durationMinutes").GetInt32());

        // Verify retrieval via GET endpoint
        var getRes = await host.GetAsync($"/api/itinerary-items/{itemId}/transport", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.OK, getRes.Status);
        Assert.True(getRes.Success);
        Assert.Equal("BUS", getRes.Data.GetProperty("transportOption").GetProperty("transportType").GetString());
    }

    [Fact, Trait("TestCase", "ITN-010")]
    public async Task RemoveTransportLeg_AttachedTransport_RemovesTransportSuccessfully_ITN010() // ITN-010
    {
        await using var host = await NovaApiHost.StartAsync();
        string itemId;
        DateTime itemDate;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA);
            itemId = seed.item.Id;
            itemDate = seed.day.Date;
        }

        // 1. Attach transport
        var selectReq = new SelectTransportRequest
        {
            TransportType = "TRAIN",
            Origin = "Kandy Railway Station",
            Destination = "Ella Railway Station",
            TravelDate = itemDate,
            DepartureTime = "07:00",
            ArrivalTime = "08:45",
            DurationMinutes = 105,
            TrainName = "Udarata Menike Express",
            EstimatedFare = 600.0m
        };
        var attachRes = await host.PostAsync($"/api/itinerary-items/{itemId}/transport", TestTokens.UserA, selectReq);
        Assert.Equal(HttpStatusCode.OK, attachRes.Status);

        // 2. Remove transport
        var delRes = await host.DeleteAsync($"/api/itinerary-items/{itemId}/transport", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.OK, delRes.Status);
        Assert.True(delRes.Success);

        // 3. Verify subsequent GET returns failure (no transport selected)
        var getRes = await host.GetAsync($"/api/itinerary-items/{itemId}/transport", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.BadRequest, getRes.Status);
        Assert.False(getRes.Success);
        Assert.Contains(getRes.Json.GetProperty("errors").EnumerateArray(), e => e.GetString() == "NO_TRANSPORT_SELECTED");
    }
}
