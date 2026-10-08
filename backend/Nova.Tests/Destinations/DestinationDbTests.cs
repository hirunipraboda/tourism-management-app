using Microsoft.EntityFrameworkCore;
using Nova.Api.Entities;
using Xunit;

namespace Nova.Tests;

/// <summary>
/// DB-DST-xxx / DB-ATT-xxx
/// Tests EF Core persistence, relationships, and constraints for the
/// Destination and Attraction entities stored in NovaDbContext.
/// Mirrors the approach used by TripServiceTests (InMemory DB, no real PostgreSQL).
/// </summary>
public class DestinationDbTests
{
    // ─────────────────────────────────────────────────────────────────────────
    // DB-DST-001  Destination persistence
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-DST-001")]
    public async Task CreateDestination_ValidData_PersistsToDatabase()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var destination = new Destination
        {
            Id = Guid.NewGuid().ToString(),
            Name = "Yala National Park",
            Slug = "yala-national-park",
            Description = "Sri Lanka's second-largest national park famous for leopards.",
            Location = "Hambantota District",
            Province = "Southern",
            Category = "Wildlife",
            Rating = 4.7,
            IsActive = true
        };

        // Act
        db.Destinations.Add(destination);
        await db.SaveChangesAsync();

        // Assert
        var saved = await db.Destinations.FirstOrDefaultAsync(d => d.Id == destination.Id);
        Assert.NotNull(saved);
        Assert.Equal("Yala National Park", saved.Name);
        Assert.Equal("yala-national-park", saved.Slug);
        Assert.Equal("Southern", saved.Province);
        Assert.True(saved.IsActive);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-DST-002  Destination update persistence
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-DST-002")]
    public async Task UpdateDestination_NameAndRating_PersistsChanges()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var destination = new Destination
        {
            Id = Guid.NewGuid().ToString(),
            Name = "Galle Old",
            Slug = "galle-old-" + Guid.NewGuid().ToString("N")[..6],
            Description = "Old name",
            Location = "Galle",
            Province = "Southern",
            Rating = 4.0
        };
        db.Destinations.Add(destination);
        await db.SaveChangesAsync();

        // Act
        destination.Name = "Galle Fort";
        destination.Rating = 4.9;
        destination.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        // Assert
        var updated = await db.Destinations.FirstOrDefaultAsync(d => d.Id == destination.Id);
        Assert.NotNull(updated);
        Assert.Equal("Galle Fort", updated.Name);
        Assert.Equal(4.9, updated.Rating);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-DST-003  Destination deletion persistence
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-DST-003")]
    public async Task DeleteDestination_ExistingDestination_RemovedFromDatabase()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var destination = new Destination
        {
            Id = Guid.NewGuid().ToString(),
            Name = "Nuwara Eliya",
            Slug = "nuwara-eliya-" + Guid.NewGuid().ToString("N")[..6],
            Description = "Hill country tea estates.",
            Location = "Nuwara Eliya",
            Province = "Central"
        };
        db.Destinations.Add(destination);
        await db.SaveChangesAsync();

        // Act
        db.Destinations.Remove(destination);
        await db.SaveChangesAsync();

        // Assert
        var deleted = await db.Destinations.FirstOrDefaultAsync(d => d.Id == destination.Id);
        Assert.Null(deleted);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-DST-004  Unique slug constraint
    // ─────────────────────────────────────────────────────────────────────────
    [Fact(Skip = "EF Core InMemory DB does not enforce unique constraints")]
    [Trait("TestCase", "DB-DST-004")]
    public async Task CreateDestination_DuplicateSlug_ThrowsException()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var slug = "unique-slug-" + Guid.NewGuid().ToString("N")[..8];
        db.Destinations.Add(new Destination
        {
            Id = Guid.NewGuid().ToString(),
            Name = "First",
            Slug = slug,
            Description = "First",
            Location = "L",
            Province = "P"
        });
        await db.SaveChangesAsync();

        db.Destinations.Add(new Destination
        {
            Id = Guid.NewGuid().ToString(),
            Name = "Second",
            Slug = slug,          // same slug – violates unique index
            Description = "Second",
            Location = "L",
            Province = "P"
        });

        // Act & Assert
        // EF Core InMemory DB does not enforce unique constraints natively.
        // We will skip this test as it requires a relational provider (like SQLite or Postgres).
        // await Assert.ThrowsAsync<InvalidOperationException>(() => db.SaveChangesAsync());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-ATT-001  Attraction persistence with FK to Destination
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-ATT-001")]
    public async Task CreateAttraction_ValidDestination_PersistsToDatabase()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        // Use the seeded Sigiriya destination from TestDbContextFactory
        var destination = await db.Destinations.FirstAsync();

        var attraction = new Attraction
        {
            Id = Guid.NewGuid().ToString(),
            DestinationId = destination.Id,
            Name = "Sigiriya Rock Climb",
            Description = "Climb to the 5th-century palace ruins.",
            Category = "Heritage",
            EntryFee = 30.0,
            DurationHours = 3.0,
            IsActive = true
        };

        // Act
        db.Attractions.Add(attraction);
        await db.SaveChangesAsync();

        // Assert
        var saved = await db.Attractions.FirstOrDefaultAsync(a => a.Id == attraction.Id);
        Assert.NotNull(saved);
        Assert.Equal("Sigiriya Rock Climb", saved.Name);
        Assert.Equal(destination.Id, saved.DestinationId);
        Assert.Equal(30.0, saved.EntryFee);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-ATT-002  Attraction update persistence
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-ATT-002")]
    public async Task UpdateAttraction_EntryFeeAndDuration_PersistsChanges()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var destination = await db.Destinations.FirstAsync();
        var attraction = new Attraction
        {
            Id = Guid.NewGuid().ToString(),
            DestinationId = destination.Id,
            Name = "Water Park",
            Category = "Recreation",
            EntryFee = 15.0,
            DurationHours = 2.0
        };
        db.Attractions.Add(attraction);
        await db.SaveChangesAsync();

        // Act
        attraction.EntryFee = 20.0;
        attraction.DurationHours = 3.5;
        attraction.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        // Assert
        var updated = await db.Attractions.FirstOrDefaultAsync(a => a.Id == attraction.Id);
        Assert.NotNull(updated);
        Assert.Equal(20.0, updated.EntryFee);
        Assert.Equal(3.5, updated.DurationHours);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-ATT-003  Attraction deletion
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-ATT-003")]
    public async Task DeleteAttraction_ExistingAttraction_RemovedFromDatabase()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var destination = await db.Destinations.FirstAsync();
        var attraction = new Attraction
        {
            Id = Guid.NewGuid().ToString(),
            DestinationId = destination.Id,
            Name = "Temporary Exhibit",
            Category = "Cultural",
            EntryFee = 5.0,
            DurationHours = 1.0
        };
        db.Attractions.Add(attraction);
        await db.SaveChangesAsync();

        // Act
        db.Attractions.Remove(attraction);
        await db.SaveChangesAsync();

        // Assert
        var deleted = await db.Attractions.FirstOrDefaultAsync(a => a.Id == attraction.Id);
        Assert.Null(deleted);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-ATT-004  Attraction→Destination FK relationship retrieval
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-ATT-004")]
    public async Task GetAttractions_WithInclude_ReturnsNavigationProperty()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var destination = await db.Destinations.FirstAsync();
        db.Attractions.Add(new Attraction
        {
            Id = Guid.NewGuid().ToString(),
            DestinationId = destination.Id,
            Name = "Pidurangala Viewpoint",
            Category = "Scenic",
            EntryFee = 5.0,
            DurationHours = 2.0
        });
        await db.SaveChangesAsync();

        // Act
        var attractionWithDest = await db.Attractions
            .Include(a => a.Destination)
            .FirstOrDefaultAsync(a => a.Name == "Pidurangala Viewpoint");

        // Assert
        Assert.NotNull(attractionWithDest);
        Assert.NotNull(attractionWithDest.Destination);
        Assert.Equal(destination.Name, attractionWithDest.Destination.Name);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-DST-005  Destination retrieval after multiple inserts
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-DST-005")]
    public async Task GetDestinations_MultipleSeeded_ReturnsAllDestinations()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        db.Destinations.AddRange(
            new Destination
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Kandy Sacred City",
                Slug = "kandy-sacred-city-" + Guid.NewGuid().ToString("N")[..6],
                Description = "Temple of the Tooth Relic.",
                Location = "Kandy",
                Province = "Central"
            },
            new Destination
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Mirissa Beach",
                Slug = "mirissa-beach-" + Guid.NewGuid().ToString("N")[..6],
                Description = "Whale watching paradise.",
                Location = "Matara District",
                Province = "Southern"
            }
        );
        await db.SaveChangesAsync();

        // Act
        var allDestinations = await db.Destinations.ToListAsync();

        // Assert
        // TestDbContextFactory seeds 1 destination (Sigiriya), we added 2 more
        Assert.True(allDestinations.Count >= 3);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-DST-006  IsActive soft-delete filter
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-DST-006")]
    public async Task FilterDestinations_InactiveExcluded_OnlyActiveReturned()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        db.Destinations.AddRange(
            new Destination
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Active Destination",
                Slug = "active-dest-" + Guid.NewGuid().ToString("N")[..6],
                Description = "Active.",
                Location = "L",
                Province = "P",
                IsActive = true
            },
            new Destination
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Inactive Destination",
                Slug = "inactive-dest-" + Guid.NewGuid().ToString("N")[..6],
                Description = "Inactive.",
                Location = "L",
                Province = "P",
                IsActive = false
            }
        );
        await db.SaveChangesAsync();

        // Act
        var activeOnly = await db.Destinations.Where(d => d.IsActive).ToListAsync();

        // Assert
        Assert.All(activeOnly, d => Assert.True(d.IsActive));
        Assert.DoesNotContain(activeOnly, d => d.Name == "Inactive Destination");
    }
}
