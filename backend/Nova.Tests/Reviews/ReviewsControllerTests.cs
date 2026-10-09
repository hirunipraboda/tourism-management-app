using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.Reviews;

public class ReviewsControllerTests
{
    private static object ValidReviewBody(string comment = "Stunning historic views and amazing atmosphere.", int rating = 5) => new
    {
        title = "Incredible Experience",
        comment,
        rating,
        destinationId = "dest-1",
        targetId = "dest-1",
        targetName = "Sigiriya Ancient Rock Fortress",
        targetType = "destination",
        touristName = "Alice Morgan",
        travelerType = "Solo"
    };

    [Fact, Trait("TestCase", "API-REV-001")]
    public async Task CreateReview_ValidInformation_ReturnsCreatedWithIdAndUser()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.PostAsync("/api/reviews", TestTokens.UserA, ValidReviewBody());

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Json.GetProperty("success").GetBoolean());
        var data = res.Json.GetProperty("data");
        var id = data.GetProperty("id").GetString();
        Assert.False(string.IsNullOrWhiteSpace(id));
        Assert.Equal(5, data.GetProperty("rating").GetInt32());
        Assert.Equal("Incredible Experience", data.GetProperty("title").GetString());
        Assert.Equal("Alice Morgan", data.GetProperty("touristName").GetString());

        await using var db = host.Db.CreateContext();
        var saved = await db.Reviews.FindAsync(id);
        Assert.NotNull(saved);
        Assert.Equal(5, saved.Rating);
        Assert.Contains("Stunning historic views", saved.Comment);
    }

    [Fact, Trait("TestCase", "API-REV-002")]
    public async Task CreateReview_MissingRequiredFields_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();

        var invalidBody = new
        {
            title = "Missing Comment and Rating",
            comment = ""
        };

        var res = await host.PostAsync("/api/reviews", TestTokens.UserA, invalidBody);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-REV-003")]
    public async Task CreateReview_InvalidRatingValue_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Rating out of 1-5 range
        var invalidBody = new
        {
            title = "Invalid Rating",
            comment = "Great location but rating is zero",
            rating = 0
        };

        var res = await host.PostAsync("/api/reviews", TestTokens.UserA, invalidBody);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);

        // Rating above 5
        var highBody = new
        {
            title = "Invalid Rating High",
            comment = "Great location but rating is 10",
            rating = 10
        };

        var resHigh = await host.PostAsync("/api/reviews", TestTokens.UserA, highBody);
        Assert.Equal(HttpStatusCode.BadRequest, resHigh.Status);
    }

    [Fact, Trait("TestCase", "API-REV-004")]
    public async Task CreateReview_EmptyReviewContent_ReturnsBadRequest()
    {
        await using var host = await NovaApiHost.StartAsync();

        var emptyBody = new
        {
            title = "Empty Comment",
            comment = "   ",
            rating = 4
        };

        var res = await host.PostAsync("/api/reviews", TestTokens.UserA, emptyBody);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-REV-005")]
    public async Task GetReviews_ReturnsListSuccessfully()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.GetAsync("/api/reviews");

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Json.GetProperty("success").GetBoolean());
        var data = res.Json.GetProperty("data");
        Assert.Equal(JsonValueKind.Array, data.ValueKind);
        Assert.True(data.GetArrayLength() > 0);
    }

    [Fact, Trait("TestCase", "API-REV-006")]
    public async Task GetReviews_SupportedFilters_ReturnsMatchingReviews()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Filter by minRating
        var ratingRes = await host.GetAsync("/api/reviews?minRating=5");
        Assert.Equal(HttpStatusCode.OK, ratingRes.Status);
        var ratingList = ratingRes.Json.GetProperty("data");
        foreach (var item in ratingList.EnumerateArray())
        {
            Assert.True(item.GetProperty("rating").GetInt32() >= 5);
        }

        // Filter by destinationId
        var destRes = await host.GetAsync("/api/reviews?destinationId=dest-1");
        Assert.Equal(HttpStatusCode.OK, destRes.Status);
        var destList = destRes.Json.GetProperty("data");
        foreach (var item in destList.EnumerateArray())
        {
            Assert.Contains("dest-1", item.GetProperty("targetId").GetString(), StringComparison.OrdinalIgnoreCase);
        }

        // Filter by search query
        var searchRes = await host.GetAsync("/api/reviews?searchQuery=magic");
        Assert.Equal(HttpStatusCode.OK, searchRes.Status);
        var searchList = searchRes.Json.GetProperty("data");
        Assert.True(searchList.GetArrayLength() >= 1);
    }

    [Fact, Trait("TestCase", "API-REV-007")]
    public async Task GetMyReviews_AuthenticatedUser_ReturnsOnlyUserReviews()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Create a review with UserA
        var createRes = await host.PostAsync("/api/reviews", TestTokens.UserA, ValidReviewBody("User A personal review"));
        Assert.Equal(HttpStatusCode.OK, createRes.Status);

        var myReviewsRes = await host.GetAsync("/api/reviews/my-reviews", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.OK, myReviewsRes.Status);
        var list = myReviewsRes.Json.GetProperty("data");
        Assert.True(list.GetArrayLength() >= 1);
        foreach (var item in list.EnumerateArray())
        {
            Assert.Equal(PgTestDatabase.UserAId, item.GetProperty("userId").GetString());
        }
    }

    [Fact, Trait("TestCase", "API-REV-008")]
    public async Task GetMyReviews_UserHasNoReviews_ReturnsEmptyResultWithoutCrashing()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Fresh user with no reviews
        var emptyUserToken = TestTokens.ForRealLogin("user_with_no_reviews_123", UserRole.Tourist);
        var res = await host.GetAsync("/api/reviews/my-reviews", emptyUserToken);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        var list = res.Json.GetProperty("data");
        Assert.Equal(0, list.GetArrayLength());
    }

    [Fact, Trait("TestCase", "API-REV-009")]
    public async Task UpdateReview_OwnedByUser_SuccessfullyUpdates()
    {
        await using var host = await NovaApiHost.StartAsync();

        var createRes = await host.PostAsync("/api/reviews", TestTokens.UserA, ValidReviewBody("Original comment", 4));
        var id = createRes.Json.GetProperty("data").GetProperty("id").GetString()!;

        var updateBody = new
        {
            title = "Updated Title",
            comment = "Updated wonderful experience after revision.",
            rating = 5
        };

        var updateRes = await host.PutAsync($"/api/reviews/{id}", TestTokens.UserA, updateBody);

        Assert.Equal(HttpStatusCode.OK, updateRes.Status);
        var data = updateRes.Json.GetProperty("data");
        Assert.Equal(5, data.GetProperty("rating").GetInt32());
        Assert.Equal("Updated Title", data.GetProperty("title").GetString());
        Assert.Contains("Updated wonderful experience", data.GetProperty("comment").GetString());

        await using var db = host.Db.CreateContext();
        var saved = await db.Reviews.FindAsync(id);
        Assert.NotNull(saved);
        Assert.Equal(5, saved.Rating);
    }

    [Fact, Trait("TestCase", "API-REV-010")]
    public async Task UpdateReview_InvalidInformation_RejectsUpdate()
    {
        await using var host = await NovaApiHost.StartAsync();

        var createRes = await host.PostAsync("/api/reviews", TestTokens.UserA, ValidReviewBody());
        var id = createRes.Json.GetProperty("data").GetProperty("id").GetString()!;

        var invalidUpdate = new
        {
            rating = 99 // Invalid rating > 5
        };

        var res = await host.PutAsync($"/api/reviews/{id}", TestTokens.UserA, invalidUpdate);

        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact, Trait("TestCase", "API-REV-011")]
    public async Task UpdateReview_AnotherUserReview_RejectsUnauthorized()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Created by UserA
        var createRes = await host.PostAsync("/api/reviews", TestTokens.UserA, ValidReviewBody("User A review"));
        var id = createRes.Json.GetProperty("data").GetProperty("id").GetString()!;

        // Attempted update by UserB
        var hackBody = new
        {
            comment = "Tampered by User B",
            rating = 1
        };

        var res = await host.PutAsync($"/api/reviews/{id}", TestTokens.UserB, hackBody);

        Assert.Equal(HttpStatusCode.Forbidden, res.Status);
    }

    [Fact, Trait("TestCase", "API-REV-012")]
    public async Task DeleteReview_OwnedByUser_SuccessfullyDeletes()
    {
        await using var host = await NovaApiHost.StartAsync();

        var createRes = await host.PostAsync("/api/reviews", TestTokens.UserA, ValidReviewBody("To be deleted"));
        var id = createRes.Json.GetProperty("data").GetProperty("id").GetString()!;

        var deleteRes = await host.DeleteAsync($"/api/reviews/{id}", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.OK, deleteRes.Status);

        await using var db = host.Db.CreateContext();
        var found = await db.Reviews.FindAsync(id);
        Assert.Null(found);
    }

    [Fact, Trait("TestCase", "API-REV-013")]
    public async Task DeleteReview_AnotherUserReview_RejectsUnauthorized()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Created by UserA
        var createRes = await host.PostAsync("/api/reviews", TestTokens.UserA, ValidReviewBody("User A review to keep"));
        var id = createRes.Json.GetProperty("data").GetProperty("id").GetString()!;

        // Attempted deletion by UserB
        var deleteRes = await host.DeleteAsync($"/api/reviews/{id}", TestTokens.UserB);

        Assert.Equal(HttpStatusCode.Forbidden, deleteRes.Status);

        await using var db = host.Db.CreateContext();
        var found = await db.Reviews.FindAsync(id);
        Assert.NotNull(found);
    }

    [Fact, Trait("TestCase", "API-REV-014")]
    public async Task DeleteReview_NonExistingId_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.DeleteAsync("/api/reviews/rev-non-existent-9999", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }

    [Fact, Trait("TestCase", "API-REV-015")]
    public async Task ToggleHelpful_ExistingReview_RecordsVote()
    {
        await using var host = await NovaApiHost.StartAsync();

        var createRes = await host.PostAsync("/api/reviews", TestTokens.UserA, ValidReviewBody("Great tour review"));
        var id = createRes.Json.GetProperty("data").GetProperty("id").GetString()!;

        var res = await host.PostAsync($"/api/reviews/{id}/helpful", TestTokens.UserB);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        var data = res.Json.GetProperty("data");
        Assert.True(data.GetProperty("isHelpfulByUser").GetBoolean());
        Assert.Equal(1, data.GetProperty("helpfulCount").GetInt32());

        await using var db = host.Db.CreateContext();
        var vote = await db.ReviewHelpfulVotes.FirstOrDefaultAsync(v => v.ReviewId == id && v.TouristId == PgTestDatabase.UserBId);
        Assert.NotNull(vote);
    }

    [Fact, Trait("TestCase", "API-REV-016")]
    public async Task ToggleHelpful_NonExistingReview_ReturnsNotFound()
    {
        await using var host = await NovaApiHost.StartAsync();

        var res = await host.PostAsync("/api/reviews/rev-non-existent-9999/helpful", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.NotFound, res.Status);
    }

    [Fact, Trait("TestCase", "API-REV-017")]
    public async Task ToggleHelpful_RepeatedMarking_TogglesVote()
    {
        await using var host = await NovaApiHost.StartAsync();

        var createRes = await host.PostAsync("/api/reviews", TestTokens.UserA, ValidReviewBody("Toggle review"));
        var id = createRes.Json.GetProperty("data").GetProperty("id").GetString()!;

        // First vote: adds vote
        var firstRes = await host.PostAsync($"/api/reviews/{id}/helpful", TestTokens.UserB);
        Assert.Equal(HttpStatusCode.OK, firstRes.Status);
        Assert.True(firstRes.Json.GetProperty("data").GetProperty("isHelpfulByUser").GetBoolean());
        Assert.Equal(1, firstRes.Json.GetProperty("data").GetProperty("helpfulCount").GetInt32());

        // Second vote: removes vote (toggle)
        var secondRes = await host.PostAsync($"/api/reviews/{id}/helpful", TestTokens.UserB);
        Assert.Equal(HttpStatusCode.OK, secondRes.Status);
        Assert.False(secondRes.Json.GetProperty("data").GetProperty("isHelpfulByUser").GetBoolean());
        Assert.Equal(0, secondRes.Json.GetProperty("data").GetProperty("helpfulCount").GetInt32());
    }
}
