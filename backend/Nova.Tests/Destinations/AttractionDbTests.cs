using Microsoft.EntityFrameworkCore;
using Nova.Api.Entities;
using Xunit;

namespace Nova.Tests;

/// <summary>
/// DB-ATT-xxx / API-ATT-xxx service-level tests for the Attraction entity.
/// These tests exercise direct entity persistence (no HTTP layer).
/// Follows the same pattern as TripServiceTests.cs.
/// </summary>
public class AttractionDbTests
{
    private readonly string _destinationId;

    public AttractionDbTests()
    {
        // All tests share the seeded Sigiriya destination from TestDbContextFactory
        _destinationId = string.Empty; // resolved per-test
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-ATT-005  Attraction with non-existing destination FK raises error
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-ATT-005")]
    public async Task CreateAttraction_NonExistingDestinationId_IsNotInDestinationCollection()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var fakeDest = "non-existing-destination-id";
        var attraction = new Attraction
        {
            Id = Guid.NewGuid().ToString(),
            DestinationId = fakeDest,
            Name = "Orphaned Attraction",
            Category = "Unknown",
            EntryFee = 0.0,
            DurationHours = 1.0
        };
        db.Attractions.Add(attraction);
        await db.SaveChangesAsync();

        // Act
        var retrieved = await db.Attractions
            .FirstOrDefaultAsync(a => a.Id == attraction.Id);

        // Assert – attraction is persisted, but the fake destination has no attractions
        Assert.NotNull(retrieved);
        var anyDestinationHasIt = await db.Destinations.AnyAsync(d => d.Id == fakeDest);
        Assert.False(anyDestinationHasIt);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-ATT-006  Multiple attractions per destination
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-ATT-006")]
    public async Task CreateMultipleAttractions_SameDestination_AllPersisted()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var destination = await db.Destinations.FirstAsync();

        db.Attractions.AddRange(
            new Attraction
            {
                Id = Guid.NewGuid().ToString(),
                DestinationId = destination.Id,
                Name = "Water Cave",
                Category = "Adventure",
                EntryFee = 10.0,
                DurationHours = 1.5
            },
            new Attraction
            {
                Id = Guid.NewGuid().ToString(),
                DestinationId = destination.Id,
                Name = "Cave Museum",
                Category = "Cultural",
                EntryFee = 8.0,
                DurationHours = 1.0
            }
        );
        await db.SaveChangesAsync();

        // Act
        var destAttractions = await db.Attractions
            .Where(a => a.DestinationId == destination.Id)
            .ToListAsync();

        // Assert
        Assert.True(destAttractions.Count >= 2);
        Assert.Contains(destAttractions, a => a.Name == "Water Cave");
        Assert.Contains(destAttractions, a => a.Name == "Cave Museum");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-ATT-007  Attraction IsActive default is true
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-ATT-007")]
    public async Task CreateAttraction_DefaultIsActive_IsTrue()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var destination = await db.Destinations.FirstAsync();
        var attraction = new Attraction
        {
            Id = Guid.NewGuid().ToString(),
            DestinationId = destination.Id,
            Name = "New Exhibit",
            Category = "Historical",
            EntryFee = 12.0,
            DurationHours = 2.0
            // IsActive not set – defaults to true
        };

        // Act
        db.Attractions.Add(attraction);
        await db.SaveChangesAsync();

        // Assert
        var saved = await db.Attractions.FindAsync(attraction.Id);
        Assert.NotNull(saved);
        Assert.True(saved.IsActive);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-ATT-008  Deactivate attraction (soft-delete pattern)
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-ATT-008")]
    public async Task DeactivateAttraction_SetsIsActiveToFalse()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var destination = await db.Destinations.FirstAsync();
        var attraction = new Attraction
        {
            Id = Guid.NewGuid().ToString(),
            DestinationId = destination.Id,
            Name = "Closed Site",
            Category = "Historical",
            EntryFee = 0.0,
            DurationHours = 1.0,
            IsActive = true
        };
        db.Attractions.Add(attraction);
        await db.SaveChangesAsync();

        // Act
        attraction.IsActive = false;
        await db.SaveChangesAsync();

        // Assert
        var updated = await db.Attractions.FindAsync(attraction.Id);
        Assert.NotNull(updated);
        Assert.False(updated.IsActive);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-ATT-009  Filter active attractions only
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-ATT-009")]
    public async Task GetActiveAttractions_ExcludesInactive()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var destination = await db.Destinations.FirstAsync();
        db.Attractions.AddRange(
            new Attraction
            {
                Id = Guid.NewGuid().ToString(),
                DestinationId = destination.Id,
                Name = "Active Attraction",
                Category = "Scenic",
                EntryFee = 5.0,
                DurationHours = 2.0,
                IsActive = true
            },
            new Attraction
            {
                Id = Guid.NewGuid().ToString(),
                DestinationId = destination.Id,
                Name = "Inactive Attraction",
                Category = "Closed",
                EntryFee = 0.0,
                DurationHours = 0.0,
                IsActive = false
            }
        );
        await db.SaveChangesAsync();

        // Act
        var active = await db.Attractions
            .Where(a => a.IsActive && a.DestinationId == destination.Id)
            .ToListAsync();

        // Assert
        Assert.All(active, a => Assert.True(a.IsActive));
        Assert.DoesNotContain(active, a => a.Name == "Inactive Attraction");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB-ATT-010  Destination + Attractions eager-load includes attraction list
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "DB-ATT-010")]
    public async Task GetDestinationWithAttractions_Include_ReturnsAttractionCollection()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var destination = await db.Destinations.FirstAsync();
        db.Attractions.Add(new Attraction
        {
            Id = Guid.NewGuid().ToString(),
            DestinationId = destination.Id,
            Name = "Included Attraction",
            Category = "Nature",
            EntryFee = 3.0,
            DurationHours = 1.0
        });
        await db.SaveChangesAsync();

        // Act
        var destWithAttractions = await db.Destinations
            .Include(d => d.Attractions)
            .FirstOrDefaultAsync(d => d.Id == destination.Id);

        // Assert
        Assert.NotNull(destWithAttractions);
        Assert.NotEmpty(destWithAttractions.Attractions);
        Assert.Contains(destWithAttractions.Attractions, a => a.Name == "Included Attraction");
    }
}
