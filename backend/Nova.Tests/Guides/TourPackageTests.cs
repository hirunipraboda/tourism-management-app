using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.Guides;

public class TourPackageTests
{
    private static async Task<int> SeedGuideAsync(NovaDbContext db, string name = "Tour Guide", string? email = null)
    {
        var mail = email ?? ("pkg_" + Guid.NewGuid().ToString("N")[..6] + "@example.test");
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

    private static object ValidPackageBody(int guideId, string name = "Sigiriya Heritage Tour") => new
    {
        guideId,
        packageName = name,
        description = "Full-day historical tour of Sigiriya rock fortress and surroundings.",
        destination = "Sigiriya",
        durationDays = 2,
        price = 150.00m,
        maxGroupSize = 8,
        imageUrl = "https://example.com/sigiriya.jpg"
    };

    [Fact, Trait("TestCase", "API-TPK-001")]
    public async Task CreateTourPackage_ValidInfo_CreatesSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
        }

        var res = await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, ValidPackageBody(guideId));

        Assert.Equal(HttpStatusCode.Created, res.Status);
        var pkgId = res.Json.GetProperty("tourPackageId").GetInt32();
        Assert.True(pkgId > 0);
        Assert.Equal("Sigiriya Heritage Tour", res.Json.GetProperty("packageName").GetString());
        Assert.Equal("Sigiriya", res.Json.GetProperty("destination").GetString());
        Assert.Equal(150.00m, res.Json.GetProperty("price").GetDecimal());
        Assert.True(res.Json.GetProperty("isActive").GetBoolean());
    }

    [Fact, Trait("TestCase", "API-TPK-002")]
    public async Task CreateTourPackage_MissingRequiredInfo_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
        }

        var invalidBody = new
        {
            guideId,
            description = "Missing packageName and destination",
            price = 100m
        };

        var res = await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, invalidBody);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-TPK-003")]
    public async Task CreateTourPackage_InvalidValues_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
        }

        var invalidBody = new
        {
            guideId,
            packageName = "Negative Price Tour",
            description = "Invalid negative price",
            destination = "Galle",
            durationDays = 0,
            price = -50.0m,
            maxGroupSize = -2
        };

        var res = await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, invalidBody);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-TPK-004")]
    public async Task GetAllTourPackages_ReturnsAvailablePackages()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
        }

        await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, ValidPackageBody(guideId, "Package 1"));
        await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, ValidPackageBody(guideId, "Package 2"));

        var res = await host.GetAsync("/api/v1/tour-packages");

        Assert.Equal(HttpStatusCode.OK, res.Status);
        var array = res.Json;
        Assert.Equal(JsonValueKind.Array, array.ValueKind);
        Assert.True(array.GetArrayLength() >= 2);
    }

    [Fact, Trait("TestCase", "API-TPK-005")]
    public async Task GetTourPackageById_ValidId_ReturnsCorrectPackage()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
        }

        var createRes = await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, ValidPackageBody(guideId, "Unique Tour"));
        var pkgId = createRes.Json.GetProperty("tourPackageId").GetInt32();

        var res = await host.GetAsync($"/api/v1/tour-packages/{pkgId}");

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.Equal("Unique Tour", res.Json.GetProperty("packageName").GetString());
        Assert.Equal("Sigiriya", res.Json.GetProperty("destination").GetString());
    }

    [Fact, Trait("TestCase", "API-TPK-006")]
    public async Task GetTourPackageById_NonExistingId_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.GetAsync("/api/v1/tour-packages/999999");

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }

    [Fact, Trait("TestCase", "API-TPK-007")]
    public async Task GetTourPackagesByGuide_ReturnsPackagesForThatGuideOnly()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideA;
        int guideB;
        await using (var db = host.Db.CreateContext())
        {
            guideA = await SeedGuideAsync(db, "Guide A", "ga@example.test");
            guideB = await SeedGuideAsync(db, "Guide B", "gb@example.test");
        }

        await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, ValidPackageBody(guideA, "Guide A Package"));
        await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, ValidPackageBody(guideB, "Guide B Package"));

        var res = await host.GetAsync($"/api/v1/guides/{guideA}/packages");

        Assert.Equal(HttpStatusCode.OK, res.Status);
        var array = res.Json;
        Assert.Single(array.EnumerateArray());
        Assert.Equal("Guide A Package", array[0].GetProperty("packageName").GetString());
        Assert.Equal(guideA, array[0].GetProperty("guideId").GetInt32());
    }

    [Fact, Trait("TestCase", "API-TPK-008")]
    public async Task UpdateTourPackage_ExistingPackage_UpdatesSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
        }

        var createRes = await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, ValidPackageBody(guideId));
        var pkgId = createRes.Json.GetProperty("tourPackageId").GetInt32();

        var updateBody = new
        {
            packageName = "Updated Package Name",
            description = "Updated description with new activities.",
            destination = "Dambulla",
            durationDays = 3,
            price = 220.00m,
            maxGroupSize = 12,
            isActive = true,
            imageUrl = "https://example.com/dambulla.jpg"
        };

        var res = await host.PutAsync($"/api/v1/tour-packages/{pkgId}", TestTokens.OperatorRoleClaim, updateBody);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.Equal("Updated Package Name", res.Json.GetProperty("packageName").GetString());
        Assert.Equal("Dambulla", res.Json.GetProperty("destination").GetString());
        Assert.Equal(220.00m, res.Json.GetProperty("price").GetDecimal());

        await using var verifyDb = host.Db.CreateContext();
        var saved = await verifyDb.TourPackages.FindAsync(pkgId);
        Assert.Equal("Updated Package Name", saved!.PackageName);
        Assert.Equal(3, saved.DurationDays);
    }

    [Fact, Trait("TestCase", "API-TPK-009")]
    public async Task UpdateTourPackage_InvalidInformation_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
        }

        var createRes = await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, ValidPackageBody(guideId));
        var pkgId = createRes.Json.GetProperty("tourPackageId").GetInt32();

        var invalidUpdate = new
        {
            packageName = "",
            destination = "",
            price = -100m,
            durationDays = -1
        };

        var res = await host.PutAsync($"/api/v1/tour-packages/{pkgId}", TestTokens.OperatorRoleClaim, invalidUpdate);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-TPK-010")]
    public async Task UpdateTourPackage_NonExistingPackage_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();

        var updateBody = new
        {
            packageName = "Non Existing",
            description = "Some description",
            destination = "Colombo",
            durationDays = 1,
            price = 50m,
            maxGroupSize = 5,
            isActive = true
        };

        var res = await host.PutAsync("/api/v1/tour-packages/999999", TestTokens.OperatorRoleClaim, updateBody);

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }

    [Fact, Trait("TestCase", "API-TPK-011")]
    public async Task DeleteTourPackage_ExistingPackage_DeactivatesPackage()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        await using (var db = host.Db.CreateContext())
        {
            guideId = await SeedGuideAsync(db);
        }

        var createRes = await host.PostAsync("/api/v1/tour-packages", TestTokens.OperatorRoleClaim, ValidPackageBody(guideId));
        var pkgId = createRes.Json.GetProperty("tourPackageId").GetInt32();

        var res = await host.DeleteAsync($"/api/v1/tour-packages/{pkgId}", TestTokens.OperatorRoleClaim);

        Assert.Equal(HttpStatusCode.NoContent, res.Status);

        await using var verifyDb = host.Db.CreateContext();
        var pkg = await verifyDb.TourPackages.FindAsync(pkgId);
        Assert.NotNull(pkg);
        Assert.False(pkg.IsActive);
    }

    [Fact, Trait("TestCase", "API-TPK-012")]
    public async Task DeleteTourPackage_NonExistingPackage_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.DeleteAsync("/api/v1/tour-packages/999999", TestTokens.OperatorRoleClaim);

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }
}
