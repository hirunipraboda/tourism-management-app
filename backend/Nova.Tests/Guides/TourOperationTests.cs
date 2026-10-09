using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.Guides;

public class TourOperationTests
{
    private static async Task<(int guideId, int packageId)> SeedGuideAndPackageAsync(NovaDbContext db)
    {
        var mail = "opguide@" + Guid.NewGuid().ToString("N")[..6] + ".test";
        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Email = mail,
            Name = "Operation Guide",
            Role = UserRole.TourismOperator,
            PasswordHash = "hash"
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var guide = new Guide
        {
            UserId = user.Id,
            Name = "Operation Guide",
            Email = mail,
            VerificationStatus = GuideVerificationStatus.Verified,
            IsActive = true
        };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var package = new TourPackage
        {
            GuideId = guide.Id,
            PackageName = "Ella Mountain Trek",
            Description = "Hiking tour through Ella Rock and Nine Arch Bridge.",
            Destination = "Ella",
            DurationDays = 3,
            Price = 250m,
            MaxGroupSize = 10,
            IsActive = true
        };
        db.TourPackages.Add(package);
        await db.SaveChangesAsync();

        return (guide.Id, package.TourPackageId);
    }

    private static object ValidOperationBody(int guideId, int packageId) => new
    {
        tourPackageId = packageId,
        guideId,
        scheduledDate = "2026-11-20T08:00:00Z",
        numberOfTourists = 4,
        totalCost = 1000.00m,
        notes = "VIP group request with vegetarian lunch."
    };

    [Fact, Trait("TestCase", "API-TOP-001")]
    public async Task CreateTourOperation_ValidInformation_CreatesSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId, packageId;
        await using (var db = host.Db.CreateContext())
        {
            (guideId, packageId) = await SeedGuideAndPackageAsync(db);
        }

        var res = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, ValidOperationBody(guideId, packageId));

        Assert.Equal(HttpStatusCode.Created, res.Status);
        var opId = res.Json.GetProperty("tourOperationId").GetInt32();
        Assert.True(opId > 0);
        Assert.Equal(packageId, res.Json.GetProperty("tourPackageId").GetInt32());
        Assert.Equal(guideId, res.Json.GetProperty("guideId").GetInt32());
        Assert.Equal("Scheduled", res.Json.GetProperty("status").GetString());
        Assert.Equal(4, res.Json.GetProperty("numberOfTourists").GetInt32());
    }

    [Fact, Trait("TestCase", "API-TOP-002")]
    public async Task CreateTourOperation_MissingRequiredFields_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId, packageId;
        await using (var db = host.Db.CreateContext())
        {
            (guideId, packageId) = await SeedGuideAndPackageAsync(db);
        }

        var invalidBody = new
        {
            tourPackageId = packageId,
            guideId
            // missing scheduledDate, numberOfTourists, totalCost
        };

        var res = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, invalidBody);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-TOP-003")]
    public async Task CreateTourOperation_InvalidInformation_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId, packageId;
        await using (var db = host.Db.CreateContext())
        {
            (guideId, packageId) = await SeedGuideAndPackageAsync(db);
        }

        var invalidBody = new
        {
            tourPackageId = packageId,
            guideId,
            scheduledDate = "2026-11-20T08:00:00Z",
            numberOfTourists = 0, // must be >= 1
            totalCost = -200.00m // must be >= 0
        };

        var res = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, invalidBody);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-TOP-004")]
    public async Task GetAllTourOperations_ReturnsListSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId, packageId;
        await using (var db = host.Db.CreateContext())
        {
            (guideId, packageId) = await SeedGuideAndPackageAsync(db);
        }

        await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, ValidOperationBody(guideId, packageId));

        var res = await host.GetAsync("/api/v1/tour-operations");

        Assert.Equal(HttpStatusCode.OK, res.Status);
        var array = res.Json;
        Assert.Equal(JsonValueKind.Array, array.ValueKind);
        Assert.True(array.GetArrayLength() >= 1);
    }

    [Fact, Trait("TestCase", "API-TOP-005")]
    public async Task GetTourOperationById_ValidId_ReturnsCorrectDetails()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId, packageId;
        await using (var db = host.Db.CreateContext())
        {
            (guideId, packageId) = await SeedGuideAndPackageAsync(db);
        }

        var createRes = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, ValidOperationBody(guideId, packageId));
        var opId = createRes.Json.GetProperty("tourOperationId").GetInt32();

        var res = await host.GetAsync($"/api/v1/tour-operations/{opId}");

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.Equal(opId, res.Json.GetProperty("tourOperationId").GetInt32());
        Assert.Equal("Ella Mountain Trek", res.Json.GetProperty("packageName").GetString());
    }

    [Fact, Trait("TestCase", "API-TOP-006")]
    public async Task GetTourOperationById_NonExistingId_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.GetAsync("/api/v1/tour-operations/999999");

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }

    [Fact, Trait("TestCase", "API-TOP-007")]
    public async Task UpdateTourOperation_ValidInformation_UpdatesSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId, packageId;
        await using (var db = host.Db.CreateContext())
        {
            (guideId, packageId) = await SeedGuideAndPackageAsync(db);
        }

        var createRes = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, ValidOperationBody(guideId, packageId));
        var opId = createRes.Json.GetProperty("tourOperationId").GetInt32();

        var updateBody = new
        {
            tourPackageId = packageId,
            guideId,
            scheduledDate = "2026-11-25T09:00:00Z",
            numberOfTourists = 6,
            totalCost = 1500.00m,
            notes = "Updated notes: Added photography stops."
        };

        var res = await host.PutAsync($"/api/v1/tour-operations/{opId}", TestTokens.OperatorRoleClaim, updateBody);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.Equal(6, res.Json.GetProperty("numberOfTourists").GetInt32());
        Assert.Equal(1500.00m, res.Json.GetProperty("totalCost").GetDecimal());
        Assert.Equal("Updated notes: Added photography stops.", res.Json.GetProperty("notes").GetString());
    }

    [Fact, Trait("TestCase", "API-TOP-008")]
    public async Task UpdateTourOperation_InvalidInformation_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId, packageId;
        await using (var db = host.Db.CreateContext())
        {
            (guideId, packageId) = await SeedGuideAndPackageAsync(db);
        }

        var createRes = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, ValidOperationBody(guideId, packageId));
        var opId = createRes.Json.GetProperty("tourOperationId").GetInt32();

        var invalidBody = new
        {
            tourPackageId = packageId,
            guideId,
            scheduledDate = "2026-11-25T09:00:00Z",
            numberOfTourists = -3,
            totalCost = -50m
        };

        var res = await host.PutAsync($"/api/v1/tour-operations/{opId}", TestTokens.OperatorRoleClaim, invalidBody);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-TOP-009")]
    public async Task DeleteTourOperation_ExistingOperation_DeletesSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId, packageId;
        await using (var db = host.Db.CreateContext())
        {
            (guideId, packageId) = await SeedGuideAndPackageAsync(db);
        }

        var createRes = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, ValidOperationBody(guideId, packageId));
        var opId = createRes.Json.GetProperty("tourOperationId").GetInt32();

        var res = await host.DeleteAsync($"/api/v1/tour-operations/{opId}", TestTokens.OperatorRoleClaim);

        Assert.Equal(HttpStatusCode.NoContent, res.Status);

        await using var verifyDb = host.Db.CreateContext();
        var deleted = await verifyDb.TourOperations.FindAsync(opId);
        Assert.Null(deleted);
    }

    [Fact, Trait("TestCase", "API-TOP-010")]
    public async Task UpdateOperationStatus_ValidStatus_UpdatesStatusSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId, packageId;
        await using (var db = host.Db.CreateContext())
        {
            (guideId, packageId) = await SeedGuideAndPackageAsync(db);
        }

        var createRes = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, ValidOperationBody(guideId, packageId));
        var opId = createRes.Json.GetProperty("tourOperationId").GetInt32();

        var res = await host.PatchAsync($"/api/v1/tour-operations/{opId}/status", TestTokens.OperatorRoleClaim, new { status = "CheckedIn" });

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.Equal("CheckedIn", res.Json.GetProperty("status").GetString());

        await using var verifyDb = host.Db.CreateContext();
        var op = await verifyDb.TourOperations.FindAsync(opId);
        Assert.Equal(TourOperationStatus.CheckedIn, op!.Status);
    }

    [Fact, Trait("TestCase", "API-TOP-011")]
    public async Task UpdateOperationStatus_InvalidStatus_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId, packageId;
        await using (var db = host.Db.CreateContext())
        {
            (guideId, packageId) = await SeedGuideAndPackageAsync(db);
        }

        var createRes = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, ValidOperationBody(guideId, packageId));
        var opId = createRes.Json.GetProperty("tourOperationId").GetInt32();

        var res = await host.PatchAsync($"/api/v1/tour-operations/{opId}/status", TestTokens.OperatorRoleClaim, new { status = "UnknownInvalidStatus" });

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-TOP-012")]
    public async Task UpdateOperationStatus_NonExistingOperation_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.PatchAsync("/api/v1/tour-operations/999999/status", TestTokens.OperatorRoleClaim, new { status = "Completed" });

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }
}
