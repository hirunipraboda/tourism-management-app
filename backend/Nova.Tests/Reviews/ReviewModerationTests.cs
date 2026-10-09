using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.Reviews;

public class ReviewModerationTests
{
    private static async Task<string> SeedReviewAsync(NovaApiHost host, ReviewStatus initialStatus = ReviewStatus.Published)
    {
        await using var db = host.Db.CreateContext();
        var review = new Review
        {
            Id = $"rev-mod-{Guid.NewGuid():N}",
            UserId = PgTestDatabase.UserAId,
            DestinationId = "dest-1",
            Rating = 4,
            Comment = "Review to moderate by admin",
            Status = initialStatus,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Reviews.Add(review);
        await db.SaveChangesAsync();
        return review.Id;
    }

    [Fact, Trait("TestCase", "API-MOD-001")]
    public async Task GetModerationReviews_AdminRole_ReturnsReviewList()
    {
        await using var host = await NovaApiHost.StartAsync();
        await SeedReviewAsync(host);

        var res = await host.GetAsync("/api/admin/reviews", TestTokens.Admin);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Json.GetProperty("success").GetBoolean());
        var data = res.Json.GetProperty("data");
        Assert.Equal(JsonValueKind.Array, data.ValueKind);
        Assert.True(data.GetArrayLength() > 0);
    }

    [Fact, Trait("TestCase", "API-MOD-002")]
    public async Task UpdateReviewStatus_AdminRole_ValidStatus_UpdatesSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();
        var reviewId = await SeedReviewAsync(host, ReviewStatus.Published);

        var updateBody = new
        {
            status = "Flagged"
        };

        var res = await host.PutAsync($"/api/admin/reviews/{reviewId}/status", TestTokens.Admin, updateBody);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Json.GetProperty("success").GetBoolean());

        await using var db = host.Db.CreateContext();
        var updated = await db.Reviews.FindAsync(reviewId);
        Assert.NotNull(updated);
        Assert.Equal(ReviewStatus.Flagged, updated.Status);

        // Transition to Hidden
        var hideRes = await host.PutAsync($"/api/admin/reviews/{reviewId}/status", TestTokens.Admin, new { status = "Hidden" });
        Assert.Equal(HttpStatusCode.OK, hideRes.Status);

        await using var db2 = host.Db.CreateContext();
        var hiddenRev = await db2.Reviews.FindAsync(reviewId);
        Assert.NotNull(hiddenRev);
        Assert.Equal(ReviewStatus.Hidden, hiddenRev.Status);
    }

    [Fact, Trait("TestCase", "API-MOD-003")]
    public async Task UpdateReviewStatus_AdminRole_InvalidStatus_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();
        var reviewId = await SeedReviewAsync(host);

        var invalidBody = new
        {
            status = "NonExistentStatus123"
        };

        var res = await host.PutAsync($"/api/admin/reviews/{reviewId}/status", TestTokens.Admin, invalidBody);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-MOD-004")]
    public async Task UpdateReviewStatus_AdminRole_NonExistingReview_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();

        var body = new { status = "Flagged" };
        var res = await host.PutAsync("/api/admin/reviews/rev-missing-9999/status", TestTokens.Admin, body);

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }

    [Fact, Trait("TestCase", "API-MOD-005")]
    public async Task GetModerationReviews_NonAdmin_AccessDenied()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.GetAsync("/api/admin/reviews", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.Forbidden, res.Status);
    }

    [Fact, Trait("TestCase", "API-MOD-006")]
    public async Task UpdateReviewStatus_NonAdmin_AccessDenied()
    {
        await using var host = await NovaApiHost.StartAsync();
        var reviewId = await SeedReviewAsync(host);

        var body = new { status = "Flagged" };
        var res = await host.PutAsync($"/api/admin/reviews/{reviewId}/status", TestTokens.UserA, body);

        Assert.Equal(HttpStatusCode.Forbidden, res.Status);
    }
}
