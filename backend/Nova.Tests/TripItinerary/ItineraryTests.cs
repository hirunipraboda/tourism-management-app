using System.Net;
using Microsoft.EntityFrameworkCore;
using Nova.Api.DTOs.Itineraries;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.TripItinerary;

/// <summary>
/// Tests for ItinerariesController (api/trips/{tripId}/itineraries, api/itineraries/{id})
/// covering ITN-001 to ITN-005 and ITN-011 to ITN-015.
/// </summary>
public class ItineraryTests
{
    private const string TouristA = PgTestDatabase.UserAId;
    private const string TouristB = PgTestDatabase.UserBId;

    [Fact, Trait("TestCase", "ITN-001")]
    public async Task CreateItinerary_ExistingTrip_CreatesLinkedItinerary_ITN001() // ITN-001
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId;
        await using (var db = host.Db.CreateContext()) tripId = (await Fixtures.SeedTripAsync(db, TouristA, "Kandy")).Id;

        var request = new CreateItineraryRequest
        {
            Title = "Kandy Cultural Tour",
            Days =
            [
                new CreateItineraryDayRequest
                {
                    DayNumber = 1,
                    Date = Fixtures.Start,
                    Location = "Kandy",
                    Title = "Day 1: Sacred City",
                    Items =
                    [
                        new CreateItineraryItemRequest
                        {
                            ActivityName = "Temple of the Tooth Relic",
                            Location = "Kandy",
                            StartTime = "09:00",
                            EndTime = "11:30",
                            DurationMinutes = 150,
                            EstimatedCost = 15.0m,
                            SequenceOrder = 1
                        }
                    ]
                }
            ]
        };

        var res = await host.PostAsync($"/api/trips/{tripId}/itineraries", TestTokens.UserA, request);

        Assert.Equal(HttpStatusCode.Created, res.Status);
        Assert.True(res.Success);
        Assert.NotNull(res.Data);
        Assert.Equal(tripId, res.Data.GetProperty("tripId").GetString());
        Assert.Equal("Kandy Cultural Tour", res.Data.GetProperty("title").GetString());

        var days = res.Data.GetProperty("days").EnumerateArray().ToList();
        Assert.Single(days);
        Assert.Single(days[0].GetProperty("items").EnumerateArray());

        // Verify database persistence
        await using var verify = host.Db.CreateContext();
        var itinId = res.DataString("id");
        var saved = await verify.Itineraries.Include(i => i.Days).ThenInclude(d => d.Items).FirstOrDefaultAsync(i => i.Id == itinId);
        Assert.NotNull(saved);
        Assert.Equal(tripId, saved.TripId);
        Assert.Single(saved.Days);
        Assert.Single(saved.Days[0].Items);
    }

    [Fact, Trait("TestCase", "ITN-002")]
    public async Task GetItineraryForTrip_ExistingTrip_ReturnsCorrectItinerary_ITN002() // ITN-002
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId, itinId;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA);
            tripId = seed.trip.Id;
            itinId = seed.itinerary.Id;
        }

        var res = await host.GetAsync($"/api/trips/{tripId}/itinerary", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.Equal(itinId, res.DataString("id"));
        Assert.Equal(tripId, res.DataString("tripId"));
    }

    [Fact, Trait("TestCase", "ITN-003")]
    public async Task GetItineraryById_ExistingId_ReturnsCorrectItinerary_ITN003() // ITN-003
    {
        await using var host = await NovaApiHost.StartAsync();
        string itinId;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA);
            itinId = seed.itinerary.Id;
        }

        var res = await host.GetAsync($"/api/itineraries/{itinId}", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.Equal(itinId, res.DataString("id"));
        Assert.Equal("Seed Itinerary", res.Data.GetProperty("title").GetString());
    }

    [Fact, Trait("TestCase", "ITN-004")]
    public async Task AddItineraryDay_ValidRequest_CreatesDayUnderCorrectItinerary_ITN004() // ITN-004
    {
        await using var host = await NovaApiHost.StartAsync();
        string itinId;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA);
            itinId = seed.itinerary.Id;
        }

        var dayReq = new CreateItineraryDayRequest
        {
            DayNumber = 2,
            Date = Fixtures.Start.AddDays(1),
            Location = "Peradeniya",
            Title = "Day 2: Botanical Gardens",
            Items =
            [
                new CreateItineraryItemRequest
                {
                    ActivityName = "Royal Botanical Gardens",
                    Location = "Peradeniya",
                    StartTime = "09:30",
                    EndTime = "12:00",
                    DurationMinutes = 150,
                    EstimatedCost = 10.0m,
                    SequenceOrder = 1
                }
            ]
        };

        var res = await host.PostAsync($"/api/itineraries/{itinId}/days", TestTokens.UserA, dayReq);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.NotNull(res.Data);
        Assert.Equal(2, res.Data.GetProperty("dayNumber").GetInt32());
        Assert.Equal("Royal Botanical Gardens", res.Data.GetProperty("items")[0].GetProperty("activityName").GetString());

        await using var verify = host.Db.CreateContext();
        var days = await verify.ItineraryDays.Where(d => d.ItineraryId == itinId).ToListAsync();
        Assert.Equal(2, days.Count);
    }

    [Fact, Trait("TestCase", "ITN-005")]
    public async Task AddItineraryDay_NonExistingItinerary_ReturnsNotFoundOrError_ITN005() // ITN-005
    {
        await using var host = await NovaApiHost.StartAsync();

        var dayReq = new CreateItineraryDayRequest
        {
            DayNumber = 1,
            Date = Fixtures.Start,
            Location = "Unknown",
            Title = "Orphan Day"
        };

        var res = await host.PostAsync("/api/itineraries/I9999/days", TestTokens.UserA, dayReq);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
        Assert.False(res.Success);
        Assert.Contains("Itinerary not found", res.Message);
    }

    [Fact, Trait("TestCase", "ITN-011")]
    public async Task ChangeItineraryStatus_AllowedStatus_StatusChangesSuccessfully_ITN011() // ITN-011
    {
        await using var host = await NovaApiHost.StartAsync();
        string itinId;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA, ItineraryStatus.Draft);
            itinId = seed.itinerary.Id;
        }

        var updateReq = new UpdateItineraryStatusRequest { Status = "Approved" };
        var res = await host.PutAsync($"/api/itineraries/{itinId}/status", TestTokens.UserA, updateReq);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.Equal("Approved", res.Data.GetProperty("status").GetString());

        await using var verify = host.Db.CreateContext();
        var updated = await verify.Itineraries.FindAsync(itinId);
        Assert.Equal(ItineraryStatus.Approved, updated!.Status);
    }

    [Fact, Trait("TestCase", "ITN-012")]
    public async Task ApproveItinerary_AuthorizedOperator_ApprovalSucceedsAndPersists_ITN012() // ITN-012
    {
        await using var host = await NovaApiHost.StartAsync();
        string itinId, tripId;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA, ItineraryStatus.Draft);
            itinId = seed.itinerary.Id;
            tripId = seed.trip.Id;
        }

        var approveReq = new ApprovalRequest { Comments = "Route and feasibility look great." };
        var res = await host.PostAsync($"/api/itineraries/{itinId}/approve", TestTokens.Admin, approveReq);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.Equal("Approved", res.Data.GetProperty("newStatus").GetString());

        await using var verify = host.Db.CreateContext();
        var saved = await verify.Itineraries.FindAsync(itinId);
        Assert.Equal(ItineraryStatus.Approved, saved!.Status);
        Assert.NotNull(saved.ApprovedAt);

        // Check approval record in database
        var approvalRecord = await verify.Approvals.FirstOrDefaultAsync(a => a.ItineraryId == itinId);
        Assert.NotNull(approvalRecord);
        Assert.Equal(ApprovalAction.Approved, approvalRecord.Action);
    }

    [Fact, Trait("TestCase", "ITN-013")]
    public async Task RejectItinerary_AuthorizedOperator_RejectionIsRecorded_ITN013() // ITN-013
    {
        await using var host = await NovaApiHost.StartAsync();
        string itinId;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA, ItineraryStatus.Draft);
            itinId = seed.itinerary.Id;
        }

        var rejectReq = new ApprovalRequest { Comments = "Infeasible schedule due to road closures." };
        var res = await host.PostAsync($"/api/itineraries/{itinId}/reject", TestTokens.Admin, rejectReq);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.Equal("Rejected", res.Data.GetProperty("newStatus").GetString());

        await using var verify = host.Db.CreateContext();
        var saved = await verify.Itineraries.FindAsync(itinId);
        Assert.Equal(ItineraryStatus.Rejected, saved!.Status);

        var approvalRecord = await verify.Approvals.FirstOrDefaultAsync(a => a.ItineraryId == itinId);
        Assert.NotNull(approvalRecord);
        Assert.Equal(ApprovalAction.Rejected, approvalRecord.Action);
        Assert.Equal("Infeasible schedule due to road closures.", approvalRecord.Comments);
    }

    [Fact, Trait("TestCase", "ITN-014")]
    public async Task RequestRevision_AuthorizedOperator_RevisionRequestIsRecorded_ITN014() // ITN-014
    {
        await using var host = await NovaApiHost.StartAsync();
        string itinId;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA, ItineraryStatus.Draft);
            itinId = seed.itinerary.Id;
        }

        var req = new ApprovalRequest { Comments = "Please allocate extra travel time for mountain passes." };
        var res = await host.PostAsync($"/api/itineraries/{itinId}/request-revision", TestTokens.Admin, req);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.Equal("RevisionRequired", res.Data.GetProperty("newStatus").GetString());

        await using var verify = host.Db.CreateContext();
        var saved = await verify.Itineraries.FindAsync(itinId);
        Assert.Equal(ItineraryStatus.RevisionRequired, saved!.Status);

        var record = await verify.Approvals.FirstOrDefaultAsync(a => a.ItineraryId == itinId);
        Assert.NotNull(record);
        Assert.Equal(ApprovalAction.RevisionRequested, record.Action);
    }

    [Fact, Trait("TestCase", "ITN-015")]
    public async Task AttemptUnauthorizedApproval_TouristRole_ApprovalIsDenied_ITN015() // ITN-015
    {
        await using var host = await NovaApiHost.StartAsync();
        string itinId;
        await using (var db = host.Db.CreateContext())
        {
            var seed = await Fixtures.SeedItineraryAsync(db, TouristA, ItineraryStatus.Draft);
            itinId = seed.itinerary.Id;
        }

        // Tourist attempts to call operator approval endpoint
        var req = new ApprovalRequest { Comments = "Self-approving" };
        var res = await host.PostAsync($"/api/itineraries/{itinId}/approve", TestTokens.UserA, req);

        // [Authorize(Roles = "TourismOperator,Admin")] rejects with 403 Forbidden
        Assert.Equal(HttpStatusCode.Forbidden, res.Status);

        await using var verify = host.Db.CreateContext();
        var unchanged = await verify.Itineraries.FindAsync(itinId);
        Assert.Equal(ItineraryStatus.Draft, unchanged!.Status);
        Assert.Equal(0, await verify.Approvals.CountAsync());
    }
}
