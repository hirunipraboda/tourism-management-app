using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.Guides;

public class GuidesControllerTests
{
    private static object ValidGuideBody(string name = "Sunil Silva", string email = "sunil.silva@example.test") => new
    {
        name,
        email,
        phone = "+94 77 111 2222",
        bio = "Experienced wildlife and cultural guide.",
        languages = new[] { "English", "Sinhala" },
        specialties = new[] { "Wildlife", "Bird Watching" },
        yearsExperience = 10,
        avatarUrl = "https://example.com/avatar.jpg"
    };

    [Fact, Trait("TestCase", "API-GUI-001")]
    public async Task CreateGuide_ValidDetails_ReturnsCreatedAndGuideId()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.PostAsync("/api/v1/guides", TestTokens.OperatorRoleClaim, ValidGuideBody());

        Assert.Equal(HttpStatusCode.Created, res.Status);
        var id = res.Json.GetProperty("id").GetInt32();
        Assert.True(id > 0);
        Assert.Equal("Sunil Silva", res.Json.GetProperty("name").GetString());
        Assert.Equal("Pending", res.Json.GetProperty("verificationStatus").GetString());
        Assert.Equal("Available", res.Json.GetProperty("status").GetString());

        await using var db = host.Db.CreateContext();
        var saved = await db.Guides.FindAsync(id);
        Assert.NotNull(saved);
        Assert.Equal("sunil.silva@example.test", saved.Email);
    }

    [Fact, Trait("TestCase", "API-GUI-002")]
    public async Task CreateGuide_MissingRequiredFields_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();

        var invalidBody = new
        {
            phone = "+94 77 111 2222",
            bio = "Missing name and email"
        };

        var res = await host.PostAsync("/api/v1/guides", TestTokens.OperatorRoleClaim, invalidBody);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-GUI-003")]
    public async Task CreateGuide_InvalidFieldValues_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();

        var invalidBody = new
        {
            name = "Test Guide",
            email = "invalid-not-an-email",
            yearsExperience = -5
        };

        var res = await host.PostAsync("/api/v1/guides", TestTokens.OperatorRoleClaim, invalidBody);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-GUI-004")]
    public async Task GetGuides_ReturnsListSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();

        await host.PostAsync("/api/v1/guides", TestTokens.OperatorRoleClaim, ValidGuideBody("Guide One", "g1@example.test"));
        await host.PostAsync("/api/v1/guides", TestTokens.OperatorRoleClaim, ValidGuideBody("Guide Two", "g2@example.test"));

        var res = await host.GetAsync("/api/v1/guides");

        Assert.Equal(HttpStatusCode.OK, res.Status);
        var array = res.Json;
        Assert.Equal(JsonValueKind.Array, array.ValueKind);
        Assert.True(array.GetArrayLength() >= 2);
    }

    [Fact, Trait("TestCase", "API-GUI-005")]
    public async Task FilterGuides_BySupportedFields_ReturnsMatchingOnly()
    {
        await using var host = await NovaApiHost.StartAsync();

        await using (var db = host.Db.CreateContext())
        {
            var u1 = new User { Id = "user-g1", Email = "hm@example.test", Name = "Heritage Master", Role = UserRole.TourismOperator, PasswordHash = "hash" };
            var u2 = new User { Id = "user-g2", Email = "ss@example.test", Name = "Safari Scout", Role = UserRole.TourismOperator, PasswordHash = "hash" };
            var u3 = new User { Id = "user-g3", Email = "inact@example.test", Name = "Inactive Guide", Role = UserRole.TourismOperator, PasswordHash = "hash" };
            db.Users.AddRange(u1, u2, u3);
            await db.SaveChangesAsync();

            var g1 = new Guide
            {
                UserId = "user-g1",
                Name = "Heritage Master",
                Email = "hm@example.test",
                Specialties = new List<string> { "Heritage", "Temples" },
                Languages = new List<string> { "English", "French" },
                RatingAvg = 4.8m,
                IsActive = true
            };
            var g2 = new Guide
            {
                UserId = "user-g2",
                Name = "Safari Scout",
                Email = "ss@example.test",
                Specialties = new List<string> { "Safari" },
                Languages = new List<string> { "German" },
                RatingAvg = 3.5m,
                IsActive = true
            };
            var g3 = new Guide
            {
                UserId = "user-g3",
                Name = "Inactive Guide",
                Email = "inact@example.test",
                Specialties = new List<string> { "Heritage" },
                Languages = new List<string> { "English" },
                RatingAvg = 4.9m,
                IsActive = false
            };
            db.Guides.AddRange(g1, g2, g3);
            await db.SaveChangesAsync();
        }

        var res = await host.GetAsync("/api/v1/guides?language=English&specialty=Heritage&minRating=4.0&isActive=true&page=1&pageSize=10");

        Assert.Equal(HttpStatusCode.OK, res.Status);
        var list = res.Json;
        Assert.Single(list.EnumerateArray());
        Assert.Equal("Heritage Master", list[0].GetProperty("name").GetString());
    }

    [Fact, Trait("TestCase", "API-GUI-006")]
    public async Task GetGuideById_ValidId_ReturnsCorrectDetails()
    {
        await using var host = await NovaApiHost.StartAsync();

        var createRes = await host.PostAsync("/api/v1/guides", TestTokens.OperatorRoleClaim, ValidGuideBody("Guide Alpha", "alpha@example.test"));
        var id = createRes.Json.GetProperty("id").GetInt32();

        var res = await host.GetAsync($"/api/v1/guides/{id}");

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.Equal("Guide Alpha", res.Json.GetProperty("name").GetString());
        Assert.Equal("alpha@example.test", res.Json.GetProperty("email").GetString());
    }

    [Fact, Trait("TestCase", "API-GUI-007")]
    public async Task GetGuideById_NonExistingId_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.GetAsync("/api/v1/guides/999999");

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }

    [Fact, Trait("TestCase", "API-GUI-008")]
    public async Task UpdateGuide_ValidInformation_UpdatesSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();

        var createRes = await host.PostAsync("/api/v1/guides", TestTokens.OperatorRoleClaim, ValidGuideBody("Old Name", "old@example.test"));
        var id = createRes.Json.GetProperty("id").GetInt32();

        var updateBody = new
        {
            name = "New Name",
            email = "new@example.test",
            phone = "+94 77 999 8888",
            bio = "Updated bio.",
            languages = new[] { "English", "German" },
            specialties = new[] { "Hiking" },
            yearsExperience = 12,
            avatarUrl = "https://example.com/new.jpg"
        };

        var res = await host.PutAsync($"/api/v1/guides/{id}", TestTokens.OperatorRoleClaim, updateBody);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.Equal("New Name", res.Json.GetProperty("name").GetString());
        Assert.Equal("new@example.test", res.Json.GetProperty("email").GetString());

        await using var db = host.Db.CreateContext();
        var updated = await db.Guides.FindAsync(id);
        Assert.Equal("New Name", updated!.Name);
        Assert.Equal(12, updated.YearsExperience);
    }

    [Fact, Trait("TestCase", "API-GUI-009")]
    public async Task UpdateGuide_InvalidInformation_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();

        var createRes = await host.PostAsync("/api/v1/guides", TestTokens.OperatorRoleClaim, ValidGuideBody("Original", "orig@example.test"));
        var id = createRes.Json.GetProperty("id").GetInt32();

        var invalidUpdate = new
        {
            name = "",
            email = "not-an-email"
        };

        var res = await host.PutAsync($"/api/v1/guides/{id}", TestTokens.OperatorRoleClaim, invalidUpdate);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-GUI-010")]
    public async Task DeactivateGuide_ExistingGuide_SetsIsActiveFalse()
    {
        await using var host = await NovaApiHost.StartAsync();

        var createRes = await host.PostAsync("/api/v1/guides", TestTokens.OperatorRoleClaim, ValidGuideBody("To Deactivate", "deact@example.test"));
        var id = createRes.Json.GetProperty("id").GetInt32();

        var res = await host.DeleteAsync($"/api/v1/guides/{id}", TestTokens.Admin);

        Assert.Equal(HttpStatusCode.NoContent, res.Status);

        await using var db = host.Db.CreateContext();
        var guide = await db.Guides.FindAsync(id);
        Assert.NotNull(guide);
        Assert.False(guide.IsActive);
    }

    [Fact, Trait("TestCase", "API-GUI-011")]
    public async Task UpdateVerification_VerifiedStatus_UpdatesSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();

        var createRes = await host.PostAsync("/api/v1/guides", TestTokens.OperatorRoleClaim, ValidGuideBody("Guide Verify", "verify@example.test"));
        var id = createRes.Json.GetProperty("id").GetInt32();

        var res = await host.PatchAsync($"/api/v1/guides/{id}/verification", TestTokens.Admin, new { verificationStatus = "Verified" });

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.Equal("Verified", res.Json.GetProperty("verificationStatus").GetString());

        await using var db = host.Db.CreateContext();
        var guide = await db.Guides.FindAsync(id);
        Assert.Equal(GuideVerificationStatus.Verified, guide!.VerificationStatus);
    }

    [Fact, Trait("TestCase", "API-GUI-012")]
    public async Task UpdateVerification_RejectedStatus_PersistsCorrectStatus()
    {
        await using var host = await NovaApiHost.StartAsync();

        var createRes = await host.PostAsync("/api/v1/guides", TestTokens.OperatorRoleClaim, ValidGuideBody("Guide Reject", "reject@example.test"));
        var id = createRes.Json.GetProperty("id").GetInt32();

        var res = await host.PatchAsync($"/api/v1/guides/{id}/verification", TestTokens.Admin, new { verificationStatus = "Rejected" });

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.Equal("Rejected", res.Json.GetProperty("verificationStatus").GetString());

        await using var db = host.Db.CreateContext();
        var guide = await db.Guides.FindAsync(id);
        Assert.Equal(GuideVerificationStatus.Rejected, guide!.VerificationStatus);
    }

    [Fact, Trait("TestCase", "API-GUI-013")]
    public async Task UpdateVerification_NonExistingGuide_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.PatchAsync("/api/v1/guides/999999/verification", TestTokens.Admin, new { verificationStatus = "Verified" });

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }
}
