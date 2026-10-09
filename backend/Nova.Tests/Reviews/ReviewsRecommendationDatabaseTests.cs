using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.Reviews;

public class ReviewsRecommendationDatabaseTests
{
    private static async Task<User> EnsureTestUserAsync(NovaDbContext db, string userId = "test_db_tourist_1")
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            user = new User
            {
                Id = userId,
                Email = $"{userId}@example.test",
                Name = "Database Test Tourist",
                Role = UserRole.Tourist
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }
        return user;
    }

    [Fact, Trait("TestCase", "DB-REV-001")]
    public async Task InsertReview_PersistsRecordCorrectly()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var user = await EnsureTestUserAsync(db, "usr-rev-01");

        var review = new Review
        {
            Id = "rev-db-001",
            UserId = user.Id,
            DestinationId = "dest-1",
            Rating = 5,
            Comment = "Excellent ancient fortress experience.",
            Status = ReviewStatus.Published,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        var retrieved = await db.Reviews.AsNoTracking().FirstOrDefaultAsync(r => r.Id == "rev-db-001");
        Assert.NotNull(retrieved);
        Assert.Equal("rev-db-001", retrieved.Id);
        Assert.Equal("usr-rev-01", retrieved.UserId);
        Assert.Equal(5, retrieved.Rating);
    }

    [Fact, Trait("TestCase", "DB-REV-002")]
    public async Task ReviewUserRelationship_LoadsAssociatedUser()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var user = await EnsureTestUserAsync(db, "usr-rev-02");

        var review = new Review
        {
            Id = "rev-db-002",
            UserId = user.Id,
            DestinationId = "dest-2",
            Rating = 4,
            Comment = "Bridge hike was scenic and peaceful.",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        var retrieved = await db.Reviews.Include(r => r.User).FirstOrDefaultAsync(r => r.Id == "rev-db-002");
        Assert.NotNull(retrieved);
        Assert.NotNull(retrieved.User);
        Assert.Equal("usr-rev-02", retrieved.User.Id);
        Assert.Equal(user.Email, retrieved.User.Email);
    }

    [Fact, Trait("TestCase", "DB-REV-003")]
    public async Task ReviewContentAndRating_PreservesSubmittedValues()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var user = await EnsureTestUserAsync(db, "usr-rev-03");

        var commentText = "Cultural ceremony at Kandy Temple was deeply moving [Tooth Relic Puja]";
        var review = new Review
        {
            Id = "rev-db-003",
            UserId = user.Id,
            DestinationId = "dest-3",
            Rating = 5,
            Comment = commentText,
            SentimentLabel = "Positive",
            SentimentScore = 0.98,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        var saved = await db.Reviews.FindAsync("rev-db-003");
        Assert.NotNull(saved);
        Assert.Equal(commentText, saved.Comment);
        Assert.Equal(5, saved.Rating);
        Assert.Equal("Positive", saved.SentimentLabel);
        Assert.Equal(0.98, saved.SentimentScore);
    }

    [Fact, Trait("TestCase", "DB-REV-004")]
    public async Task ReviewUpdate_PersistsChangesAccurately()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var user = await EnsureTestUserAsync(db, "usr-rev-04");

        var review = new Review
        {
            Id = "rev-db-004",
            UserId = user.Id,
            Rating = 3,
            Comment = "Initial review text before revision",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        // Update
        review.Rating = 4;
        review.Comment = "Revised updated review with more positive details";
        review.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var updated = await db.Reviews.FindAsync("rev-db-004");
        Assert.NotNull(updated);
        Assert.Equal(4, updated.Rating);
        Assert.Equal("Revised updated review with more positive details", updated.Comment);
    }

    [Fact, Trait("TestCase", "DB-REV-005")]
    public async Task ReviewDeletion_RemovesRecordFromDatabase()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var user = await EnsureTestUserAsync(db, "usr-rev-05");

        var review = new Review
        {
            Id = "rev-db-005",
            UserId = user.Id,
            Rating = 5,
            Comment = "Review about to be deleted.",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        db.Reviews.Remove(review);
        await db.SaveChangesAsync();

        var found = await db.Reviews.FindAsync("rev-db-005");
        Assert.Null(found);
    }

    [Fact, Trait("TestCase", "DB-REV-006")]
    public async Task ModerationStatus_PersistsStatusTransitions()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var user = await EnsureTestUserAsync(db, "usr-rev-06");

        var review = new Review
        {
            Id = "rev-db-006",
            UserId = user.Id,
            Rating = 2,
            Comment = "Spam or flagged candidate",
            Status = ReviewStatus.Published,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        review.Status = ReviewStatus.Flagged;
        await db.SaveChangesAsync();

        var flagged = await db.Reviews.AsNoTracking().FirstOrDefaultAsync(r => r.Id == "rev-db-006");
        Assert.NotNull(flagged);
        Assert.Equal(ReviewStatus.Flagged, flagged.Status);

        review.Status = ReviewStatus.Hidden;
        await db.SaveChangesAsync();

        var hidden = await db.Reviews.AsNoTracking().FirstOrDefaultAsync(r => r.Id == "rev-db-006");
        Assert.NotNull(hidden);
        Assert.Equal(ReviewStatus.Hidden, hidden.Status);
    }

    [Fact, Trait("TestCase", "DB-REV-007")]
    public async Task HelpfulAction_PersistsVoteRecord()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var reviewer = await EnsureTestUserAsync(db, "usr-rev-07a");
        var voter = await EnsureTestUserAsync(db, "usr-rev-07b");

        var review = new Review
        {
            Id = "rev-db-007",
            UserId = reviewer.Id,
            Rating = 5,
            Comment = "Helpful guide to Yala safari.",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        var vote = new ReviewHelpfulVote
        {
            ReviewId = review.Id,
            TouristId = voter.Id
        };
        db.ReviewHelpfulVotes.Add(vote);
        await db.SaveChangesAsync();

        var voteCount = await db.ReviewHelpfulVotes.CountAsync(v => v.ReviewId == review.Id);
        Assert.Equal(1, voteCount);

        var savedVote = await db.ReviewHelpfulVotes.FirstOrDefaultAsync(v => v.ReviewId == review.Id && v.TouristId == voter.Id);
        Assert.NotNull(savedVote);
    }

    [Fact, Trait("TestCase", "DB-REV-008")]
    public async Task InvalidUserRelationship_ThrowsForeignKeyConstraintException()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var review = new Review
        {
            Id = "rev-db-008",
            UserId = "non_existent_user_guid_9999",
            Rating = 5,
            Comment = "Foreign key test invalid user",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Reviews.Add(review);
        await Assert.ThrowsAnyAsync<DbUpdateException>(async () => await db.SaveChangesAsync());
    }

    [Fact, Trait("TestCase", "DB-REV-009")]
    public async Task ModeratedReviewRetrieval_FiltersByStatusCorrectly()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();
        var user = await EnsureTestUserAsync(db, "usr-rev-09");

        db.Reviews.AddRange(
            new Review { Id = "rev-pub-1", UserId = user.Id, Status = ReviewStatus.Published, Comment = "Pub 1" },
            new Review { Id = "rev-flg-1", UserId = user.Id, Status = ReviewStatus.Flagged, Comment = "Flg 1" },
            new Review { Id = "rev-hid-1", UserId = user.Id, Status = ReviewStatus.Hidden, Comment = "Hid 1" }
        );
        await db.SaveChangesAsync();

        var publishedOnly = await db.Reviews.Where(r => r.Status == ReviewStatus.Published).ToListAsync();
        Assert.Contains(publishedOnly, r => r.Id == "rev-pub-1");
        Assert.DoesNotContain(publishedOnly, r => r.Id == "rev-flg-1");
        Assert.DoesNotContain(publishedOnly, r => r.Id == "rev-hid-1");

        var flaggedOnly = await db.Reviews.Where(r => r.Status == ReviewStatus.Flagged).ToListAsync();
        Assert.Contains(flaggedOnly, r => r.Id == "rev-flg-1");
        Assert.DoesNotContain(flaggedOnly, r => r.Id == "rev-pub-1");
    }

    [Fact, Trait("TestCase", "DB-REC-SETTINGS")]
    public async Task RecommendationSettings_PersistsConfiguredWeights()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var settings = await db.RecommendationSettings.FirstOrDefaultAsync(s => s.Id == 1);
        if (settings == null)
        {
            settings = new RecommendationSettings { Id = 1, InterestWeight = 30m, RatingWeight = 25m };
            db.RecommendationSettings.Add(settings);
            await db.SaveChangesAsync();
        }

        Assert.NotNull(settings);
        Assert.True(settings.TotalWeight > 0);
    }
}
