using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.Guides;

public class GuideAvailabilityTests
{
    private static async Task<int> SeedGuideAsync(NovaDbContext db, string name = "Guide Avail", string? email = null)
    {
        var mail = email ?? ("avail_" + Guid.NewGuid().ToString("N")[..6] + "@example.test");
        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Email = mail,
            Name = name,
            Role = UserRole.TourismOperator,
            PasswordHash = "hash"
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var guide = new Guide
        {
            UserId = user.Id,
            Name = name,
            Email = mail,
            VerificationStatus = GuideVerificationStatus.Verified,
            IsActive = true
        };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();
        return guide.Id;
    }

    [Fact, Trait("TestCase", "API-AVL-001")]
    public async Task GetAvailability_ExistingGuide_ReturnsSlots()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
            db.GuideAvailabilities.Add(new GuideAvailability
            {
                GuideId = guideId,
                AvailableDate = new DateOnly(2026, 11, 1),
                StartTime = new TimeOnly(9, 0),
                EndTime = new TimeOnly(17, 0),
                IsBooked = false
            });
            await db.SaveChangesAsync();
        }

        var res = await host.GetAsync($"/api/v1/guides/{guideId}/availability");

        Assert.Equal(HttpStatusCode.OK, res.Status);
        var slots = res.Json;
        Assert.Single(slots.EnumerateArray());
        Assert.Equal(guideId, slots[0].GetProperty("guideId").GetInt32());
        Assert.Equal("2026-11-01", slots[0].GetProperty("availableDate").GetString());
    }

    [Fact, Trait("TestCase", "API-AVL-002")]
    public async Task CreateAvailability_ValidSlot_ReturnsCreated()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
        }

        var slotPayload = new
        {
            guideId,
            availableDate = "2026-11-05",
            startTime = "08:30:00",
            endTime = "16:30:00"
        };

        var res = await host.PostAsync($"/api/v1/guides/{guideId}/availability", TestTokens.OperatorRoleClaim, slotPayload);

        Assert.Equal(HttpStatusCode.Created, res.Status);
        var slotId = res.Json.GetProperty("availabilityId").GetInt32();
        Assert.True(slotId > 0);
        Assert.Equal(guideId, res.Json.GetProperty("guideId").GetInt32());
        Assert.False(res.Json.GetProperty("isBooked").GetBoolean());

        await using var dbCtx = host.Db.CreateContext();
        var savedSlot = await dbCtx.GuideAvailabilities.FindAsync(slotId);
        Assert.NotNull(savedSlot);
        Assert.Equal(new DateOnly(2026, 11, 5), savedSlot.AvailableDate);
    }

    [Fact, Trait("TestCase", "API-AVL-003")]
    public async Task CreateAvailability_MissingRequiredData_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
        }

        var invalidPayload = new
        {
            guideId
            // missing availableDate, startTime, endTime
        };

        var res = await host.PostAsync($"/api/v1/guides/{guideId}/availability", TestTokens.OperatorRoleClaim, invalidPayload);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-AVL-004")]
    public async Task CreateAvailability_InvalidDateTimeValues_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
        }

        // EndTime precedes StartTime
        var invertedTimesPayload = new
        {
            guideId,
            availableDate = "2026-11-05",
            startTime = "17:00:00",
            endTime = "09:00:00"
        };

        var res = await host.PostAsync($"/api/v1/guides/{guideId}/availability", TestTokens.OperatorRoleClaim, invertedTimesPayload);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-AVL-005")]
    public async Task CreateAvailability_NonExistingGuide_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();

        var slotPayload = new
        {
            guideId = 999999,
            availableDate = "2026-11-05",
            startTime = "08:30:00",
            endTime = "16:30:00"
        };

        var res = await host.PostAsync("/api/v1/guides/999999/availability", TestTokens.OperatorRoleClaim, slotPayload);

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }

    [Fact, Trait("TestCase", "API-AVL-006")]
    public async Task DeleteAvailability_ExistingSlot_DeletesSlot()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        int slotId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
            var slot = new GuideAvailability
            {
                GuideId = guideId,
                AvailableDate = new DateOnly(2026, 11, 10),
                StartTime = new TimeOnly(9, 0),
                EndTime = new TimeOnly(17, 0),
                IsBooked = false
            };
            db.GuideAvailabilities.Add(slot);
            await db.SaveChangesAsync();
            slotId = slot.AvailabilityId;
        }

        var res = await host.DeleteAsync($"/api/v1/guides/{guideId}/availability/{slotId}", TestTokens.OperatorRoleClaim);

        Assert.Equal(HttpStatusCode.NoContent, res.Status);

        await using var verifyDb = host.Db.CreateContext();
        var deletedSlot = await verifyDb.GuideAvailabilities.FindAsync(slotId);
        Assert.Null(deletedSlot);
    }

    [Fact, Trait("TestCase", "API-AVL-007")]
    public async Task DeleteAvailability_NonExistingSlot_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
        }

        var res = await host.DeleteAsync($"/api/v1/guides/{guideId}/availability/999999", TestTokens.OperatorRoleClaim);

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }

    [Fact, Trait("TestCase", "API-AVL-008")]
    public async Task GetAvailability_NonExistingGuide_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.GetAsync("/api/v1/guides/999999/availability");

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }
}
