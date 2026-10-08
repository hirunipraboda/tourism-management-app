using Microsoft.EntityFrameworkCore;
using Nova.Api.Entities;
using Xunit;

namespace Nova.Tests;

/// <summary>
/// End-to-end integration test for the Destination + Attraction management flow.
/// Tests the complete Create → Read → Update → Delete lifecycle across both
/// entities inside an isolated InMemory database.
///
/// Mirrors TripItineraryIntegrationTests.cs in structure and intent.
/// </summary>
public class DestinationAttractionIntegrationTests
{
    // ─────────────────────────────────────────────────────────────────────────
    // INT-DST-001  Complete Destination → Attraction CRUD lifecycle
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "INT-DST-001")]
    public async Task CompleteFlow_Destination_Create_Attraction_Update_Delete_Verification()
    {
        // ── 1. Initialise isolated database ───────────────────────────────────
        using var db = TestDbContextFactory.CreateInMemoryDbContext();

        // ── 2. Create destination ─────────────────────────────────────────────
        var destination = new Destination
        {
            Id = Guid.NewGuid().ToString(),
            Name = "Sinharaja Rain Forest",
            Slug = "sinharaja-rain-forest-int-test",
            Description = "UNESCO-listed tropical rain forest in Sri Lanka.",
            Location = "Ratnapura District",
            Province = "Sabaragamuwa",
            Category = "Nature",
            Rating = 4.8,
            IsActive = true
        };
        db.Destinations.Add(destination);
        await db.SaveChangesAsync();

        var savedDest = await db.Destinations.FirstOrDefaultAsync(d => d.Id == destination.Id);
        Assert.NotNull(savedDest);
        Assert.Equal("Sinharaja Rain Forest", savedDest.Name);

        // ── 3. Create attraction linked to destination ─────────────────────────
        var attraction = new Attraction
        {
            Id = Guid.NewGuid().ToString(),
            DestinationId = destination.Id,
            Name = "Forest Walk Trail",
            Category = "Nature",
            EntryFee = 15.0,
            DurationHours = 4.0,
            IsActive = true
        };
        db.Attractions.Add(attraction);
        await db.SaveChangesAsync();

        var savedAtt = await db.Attractions
            .Include(a => a.Destination)
            .FirstOrDefaultAsync(a => a.Id == attraction.Id);
        Assert.NotNull(savedAtt);
        Assert.Equal("Forest Walk Trail", savedAtt.Name);
        Assert.Equal(destination.Id, savedAtt.DestinationId);
        Assert.NotNull(savedAtt.Destination);

        // ── 4. Update attraction entry fee ─────────────────────────────────────
        savedAtt.EntryFee = 20.0;
        savedAtt.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var updatedAtt = await db.Attractions.FindAsync(attraction.Id);
        Assert.NotNull(updatedAtt);
        Assert.Equal(20.0, updatedAtt.EntryFee);

        // ── 5. Verify destination has the attraction via Include ───────────────
        var destWithAttractions = await db.Destinations
            .Include(d => d.Attractions)
            .FirstOrDefaultAsync(d => d.Id == destination.Id);
        Assert.NotNull(destWithAttractions);
        Assert.Contains(destWithAttractions.Attractions, a => a.Id == attraction.Id);

        // ── 6. Delete attraction ──────────────────────────────────────────────
        db.Attractions.Remove(updatedAtt);
        await db.SaveChangesAsync();

        var deletedAtt = await db.Attractions.FindAsync(attraction.Id);
        Assert.Null(deletedAtt);

        // ── 7. Destination still exists after attraction removed ───────────────
        var destStillExists = await db.Destinations.FindAsync(destination.Id);
        Assert.NotNull(destStillExists);

        // ── 8. Delete destination ─────────────────────────────────────────────
        db.Destinations.Remove(destStillExists);
        await db.SaveChangesAsync();

        var deletedDest = await db.Destinations.FindAsync(destination.Id);
        Assert.Null(deletedDest);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INT-DST-002  Destination slug lookup matches ID lookup
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "INT-DST-002")]
    public async Task GetDestination_BySlug_ReturnsSameRecordAsById()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var slug = "ella-mountain-gap-int-" + Guid.NewGuid().ToString("N")[..6];
        var destination = new Destination
        {
            Id = Guid.NewGuid().ToString(),
            Name = "Ella Mountain Gap",
            Slug = slug,
            Description = "Scenic mountain town.",
            Location = "Badulla District",
            Province = "Uva",
            Rating = 4.8
        };
        db.Destinations.Add(destination);
        await db.SaveChangesAsync();

        // Act
        var byId = await db.Destinations.FirstOrDefaultAsync(d => d.Id == destination.Id);
        var bySlug = await db.Destinations.FirstOrDefaultAsync(d => d.Slug == slug);

        // Assert
        Assert.NotNull(byId);
        Assert.NotNull(bySlug);
        Assert.Equal(byId.Id, bySlug.Id);
        Assert.Equal(byId.Name, bySlug.Name);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INT-DST-003  Destination active-status filter returns correct count
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "INT-DST-003")]
    public async Task GetDestinations_ActiveFilter_ReturnsOnlyActiveDestinations()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        db.Destinations.AddRange(
            new Destination
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Active Place A",
                Slug = "active-a-" + Guid.NewGuid().ToString("N")[..6],
                Description = "Active.",
                Location = "A",
                Province = "A",
                IsActive = true
            },
            new Destination
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Inactive Place B",
                Slug = "inactive-b-" + Guid.NewGuid().ToString("N")[..6],
                Description = "Inactive.",
                Location = "B",
                Province = "B",
                IsActive = false
            }
        );
        await db.SaveChangesAsync();

        // Act
        var active = await db.Destinations.Where(d => d.IsActive).ToListAsync();
        var all    = await db.Destinations.ToListAsync();

        // Assert
        Assert.True(all.Count > active.Count);
        Assert.All(active, d => Assert.True(d.IsActive));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INT-DST-004  Destination with multiple attractions – count is correct
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    [Trait("TestCase", "INT-DST-004")]
    public async Task DestinationWithMultipleAttractions_CountMatchesExpected()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var dest = new Destination
        {
            Id = Guid.NewGuid().ToString(),
            Name = "Multi-Attraction Destination",
            Slug = "multi-att-dst-" + Guid.NewGuid().ToString("N")[..6],
            Description = "Destination with 3 attractions.",
            Location = "Test",
            Province = "Test"
        };
        db.Destinations.Add(dest);
        db.Attractions.AddRange(
            new Attraction { Id = Guid.NewGuid().ToString(), DestinationId = dest.Id, Name = "Attr 1", Category = "A", EntryFee = 1, DurationHours = 1 },
            new Attraction { Id = Guid.NewGuid().ToString(), DestinationId = dest.Id, Name = "Attr 2", Category = "B", EntryFee = 2, DurationHours = 1 },
            new Attraction { Id = Guid.NewGuid().ToString(), DestinationId = dest.Id, Name = "Attr 3", Category = "C", EntryFee = 3, DurationHours = 1 }
        );
        await db.SaveChangesAsync();

        // Act
        var destWithAttractions = await db.Destinations
            .Include(d => d.Attractions)
            .FirstOrDefaultAsync(d => d.Id == dest.Id);

        // Assert
        Assert.NotNull(destWithAttractions);
        Assert.Equal(3, destWithAttractions.Attractions.Count);
    }
}
