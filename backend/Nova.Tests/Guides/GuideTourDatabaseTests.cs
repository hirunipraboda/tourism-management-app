using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.Guides;

public class GuideTourDatabaseTests
{
    // =========================================================================
    // 4.1 GUIDE DATABASE (DB-GUI-001 – DB-GUI-006)
    // =========================================================================

    [Fact, Trait("TestCase", "DB-GUI-001")]
    public async Task Db_GuideRecord_InsertedAfterRegistration()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide
        {
            UserId = PgTestDatabase.OperatorId,
            Name = "Kamal Gunaratne",
            Email = "kamal@example.test",
            Phone = "+94 77 123 4567",
            Languages = new List<string> { "English", "Sinhala" },
            Specialties = new List<string> { "Culture", "History" },
            YearsExperience = 8,
            RatingAvg = 4.85m,
            IsActive = true
        };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        Assert.True(guide.Id > 0);
        var inDb = await db.Guides.AsNoTracking().FirstOrDefaultAsync(g => g.Id == guide.Id);
        Assert.NotNull(inDb);
        Assert.Equal("Kamal Gunaratne", inDb.Name);
        Assert.Equal("kamal@example.test", inDb.Email);
    }

    [Fact, Trait("TestCase", "DB-GUI-002")]
    public async Task Db_GuideAccount_UserRelationshipMaintained()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide
        {
            UserId = PgTestDatabase.OperatorId,
            Name = "Operator Linked Guide",
            Email = "oplink@example.test",
            IsActive = true
        };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var loaded = await db.Guides.Include(g => g.User).FirstOrDefaultAsync(g => g.Id == guide.Id);
        Assert.NotNull(loaded);
        Assert.NotNull(loaded.User);
        Assert.Equal(PgTestDatabase.OperatorId, loaded.User.Id);
    }

    [Fact, Trait("TestCase", "DB-GUI-003")]
    public async Task Db_GuideInformation_UpdatePersistsCorrectly()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide
        {
            UserId = PgTestDatabase.OperatorId,
            Name = "Initial Name",
            Email = "initial@example.test",
            RatingAvg = 4.0m,
            ToursCompleted = 5
        };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        guide.Name = "Updated Guide Name";
        guide.RatingAvg = 4.95m;
        guide.ToursCompleted = 6;
        guide.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var updated = await db.Guides.AsNoTracking().FirstOrDefaultAsync(g => g.Id == guide.Id);
        Assert.NotNull(updated);
        Assert.Equal("Updated Guide Name", updated.Name);
        Assert.Equal(4.95m, updated.RatingAvg);
        Assert.Equal(6, updated.ToursCompleted);
    }

    [Fact, Trait("TestCase", "DB-GUI-004")]
    public async Task Db_GuideDeactivation_StatePersists()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide
        {
            UserId = PgTestDatabase.OperatorId,
            Name = "Active Guide",
            Email = "active@example.test",
            IsActive = true
        };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        guide.IsActive = false;
        await db.SaveChangesAsync();

        var deactivated = await db.Guides.AsNoTracking().FirstOrDefaultAsync(g => g.Id == guide.Id);
        Assert.NotNull(deactivated);
        Assert.False(deactivated.IsActive);
    }

    [Fact, Trait("TestCase", "DB-GUI-005")]
    public async Task Db_GuideVerification_StatusAndNotesPersisted()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide
        {
            UserId = PgTestDatabase.OperatorId,
            Name = "Verification Target",
            Email = "target@example.test",
            VerificationStatus = GuideVerificationStatus.Pending
        };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        guide.VerificationStatus = GuideVerificationStatus.Verified;
        guide.Bio = "Verified by SLTDA board on 2026-10.";
        await db.SaveChangesAsync();

        var verified = await db.Guides.AsNoTracking().FirstOrDefaultAsync(g => g.Id == guide.Id);
        Assert.NotNull(verified);
        Assert.Equal(GuideVerificationStatus.Verified, verified.VerificationStatus);
        Assert.Equal("Verified by SLTDA board on 2026-10.", verified.Bio);
    }

    [Fact, Trait("TestCase", "DB-GUI-006")]
    public async Task Db_ActiveGuideFiltering_ExcludesDeactivatedGuides()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var gActive = new Guide { UserId = PgTestDatabase.OperatorId, Name = "G Active", Email = "gact@example.test", IsActive = true };
        var gInactive = new Guide { UserId = PgTestDatabase.OperatorId, Name = "G Inactive", Email = "ginact@example.test", IsActive = false };
        db.Guides.AddRange(gActive, gInactive);
        await db.SaveChangesAsync();

        var activeOnly = await db.Guides.Where(g => g.IsActive).ToListAsync();
        Assert.Contains(activeOnly, g => g.Name == "G Active");
        Assert.DoesNotContain(activeOnly, g => g.Name == "G Inactive");
    }

    // =========================================================================
    // 4.2 GUIDE AVAILABILITY DATABASE (DB-AVL-001 – DB-AVL-005)
    // =========================================================================

    [Fact, Trait("TestCase", "DB-AVL-001")]
    public async Task Db_AvailabilitySlot_IsInserted()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Avail Guide", Email = "ag@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var slot = new GuideAvailability
        {
            GuideId = guide.Id,
            AvailableDate = new DateOnly(2026, 12, 1),
            StartTime = new TimeOnly(8, 0),
            EndTime = new TimeOnly(16, 0),
            IsBooked = false
        };
        db.GuideAvailabilities.Add(slot);
        await db.SaveChangesAsync();

        Assert.True(slot.AvailabilityId > 0);
        var inDb = await db.GuideAvailabilities.FindAsync(slot.AvailabilityId);
        Assert.NotNull(inDb);
        Assert.Equal(guide.Id, inDb.GuideId);
    }

    [Fact, Trait("TestCase", "DB-AVL-002")]
    public async Task Db_AvailabilitySlot_LinkedToCorrectGuide()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Target Guide", Email = "targetg@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var slot = new GuideAvailability
        {
            GuideId = guide.Id,
            AvailableDate = new DateOnly(2026, 12, 2),
            StartTime = new TimeOnly(10, 0),
            EndTime = new TimeOnly(18, 0)
        };
        db.GuideAvailabilities.Add(slot);
        await db.SaveChangesAsync();

        var loaded = await db.GuideAvailabilities.Include(s => s.Guide).FirstOrDefaultAsync(s => s.AvailabilityId == slot.AvailabilityId);
        Assert.NotNull(loaded);
        Assert.Equal("Target Guide", loaded.Guide?.Name);
    }

    [Fact, Trait("TestCase", "DB-AVL-003")]
    public async Task Db_AvailabilityValues_PersistedCorrectly()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Time Guide", Email = "tg@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var expectedDate = new DateOnly(2026, 12, 15);
        var expectedStart = new TimeOnly(7, 30);
        var expectedEnd = new TimeOnly(15, 45);

        var slot = new GuideAvailability
        {
            GuideId = guide.Id,
            AvailableDate = expectedDate,
            StartTime = expectedStart,
            EndTime = expectedEnd,
            IsBooked = true
        };
        db.GuideAvailabilities.Add(slot);
        await db.SaveChangesAsync();

        var loaded = await db.GuideAvailabilities.AsNoTracking().FirstOrDefaultAsync(s => s.AvailabilityId == slot.AvailabilityId);
        Assert.NotNull(loaded);
        Assert.Equal(expectedDate, loaded.AvailableDate);
        Assert.Equal(expectedStart, loaded.StartTime);
        Assert.Equal(expectedEnd, loaded.EndTime);
        Assert.True(loaded.IsBooked);
    }

    [Fact, Trait("TestCase", "DB-AVL-004")]
    public async Task Db_AvailabilityDeletion_RemovesRecord()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Del Guide", Email = "dg@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var slot = new GuideAvailability
        {
            GuideId = guide.Id,
            AvailableDate = new DateOnly(2026, 12, 20),
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(17, 0)
        };
        db.GuideAvailabilities.Add(slot);
        await db.SaveChangesAsync();

        db.GuideAvailabilities.Remove(slot);
        await db.SaveChangesAsync();

        var deleted = await db.GuideAvailabilities.FindAsync(slot.AvailabilityId);
        Assert.Null(deleted);
    }

    [Fact, Trait("TestCase", "DB-AVL-005")]
    public async Task Db_InvalidGuideRelationship_RejectedByDb()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var slot = new GuideAvailability
        {
            GuideId = 999999, // non-existing foreign key
            AvailableDate = new DateOnly(2026, 12, 25),
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(17, 0)
        };
        db.GuideAvailabilities.Add(slot);

        await Assert.ThrowsAnyAsync<DbUpdateException>(async () =>
        {
            await db.SaveChangesAsync();
        });
    }

    // =========================================================================
    // 4.3 TOUR PACKAGE DATABASE (DB-TPK-001 – DB-TPK-005)
    // =========================================================================

    [Fact, Trait("TestCase", "DB-TPK-001")]
    public async Task Db_TourPackage_IsStored()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Pkg Guide", Email = "pg@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var pkg = new TourPackage
        {
            GuideId = guide.Id,
            PackageName = "Horton Plains Trek",
            Description = "Early morning cloud forest walk.",
            Destination = "Nuwara Eliya",
            DurationDays = 1,
            Price = 95.00m,
            MaxGroupSize = 6,
            IsActive = true
        };
        db.TourPackages.Add(pkg);
        await db.SaveChangesAsync();

        Assert.True(pkg.TourPackageId > 0);
        var inDb = await db.TourPackages.FindAsync(pkg.TourPackageId);
        Assert.NotNull(inDb);
        Assert.Equal("Horton Plains Trek", inDb.PackageName);
        Assert.Equal(95.00m, inDb.Price);
    }

    [Fact, Trait("TestCase", "DB-TPK-002")]
    public async Task Db_PackageGuide_RelationshipMaintained()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Rel Guide", Email = "rg@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var pkg = new TourPackage
        {
            GuideId = guide.Id,
            PackageName = "Galle Ramparts Walk",
            Destination = "Galle",
            DurationDays = 1,
            Price = 60m,
            MaxGroupSize = 10
        };
        db.TourPackages.Add(pkg);
        await db.SaveChangesAsync();

        var loaded = await db.TourPackages.Include(p => p.Guide).FirstOrDefaultAsync(p => p.TourPackageId == pkg.TourPackageId);
        Assert.NotNull(loaded);
        Assert.Equal(guide.Id, loaded.Guide?.Id);
        Assert.Equal("Rel Guide", loaded.Guide?.Name);
    }

    [Fact, Trait("TestCase", "DB-TPK-003")]
    public async Task Db_PackageUpdate_PersistsChanges()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Update Guide", Email = "ug@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var pkg = new TourPackage
        {
            GuideId = guide.Id,
            PackageName = "Original Package",
            Destination = "Kandy",
            DurationDays = 2,
            Price = 120m,
            MaxGroupSize = 8
        };
        db.TourPackages.Add(pkg);
        await db.SaveChangesAsync();

        pkg.PackageName = "Updated Package Title";
        pkg.Price = 180m;
        pkg.MaxGroupSize = 12;
        await db.SaveChangesAsync();

        var updated = await db.TourPackages.AsNoTracking().FirstOrDefaultAsync(p => p.TourPackageId == pkg.TourPackageId);
        Assert.NotNull(updated);
        Assert.Equal("Updated Package Title", updated.PackageName);
        Assert.Equal(180m, updated.Price);
        Assert.Equal(12, updated.MaxGroupSize);
    }

    [Fact, Trait("TestCase", "DB-TPK-004")]
    public async Task Db_PackageDeletionOrDeactivation_PersistsState()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Soft Del Guide", Email = "sdg@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var pkg = new TourPackage
        {
            GuideId = guide.Id,
            PackageName = "Deactivation Candidate",
            Destination = "Yala",
            DurationDays = 1,
            Price = 200m,
            MaxGroupSize = 6,
            IsActive = true
        };
        db.TourPackages.Add(pkg);
        await db.SaveChangesAsync();

        pkg.IsActive = false;
        await db.SaveChangesAsync();

        var deactivated = await db.TourPackages.AsNoTracking().FirstOrDefaultAsync(p => p.TourPackageId == pkg.TourPackageId);
        Assert.NotNull(deactivated);
        Assert.False(deactivated.IsActive);
    }

    [Fact, Trait("TestCase", "DB-TPK-005")]
    public async Task Db_PackagesCanBeRetrievedByGuide()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guideA = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Guide 1", Email = "g1_db@example.test" };
        var guideB = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Guide 2", Email = "g2_db@example.test" };
        db.Guides.AddRange(guideA, guideB);
        await db.SaveChangesAsync();

        var p1 = new TourPackage { GuideId = guideA.Id, PackageName = "P1 GuideA", Destination = "Kandy", Price = 100m, DurationDays = 1, MaxGroupSize = 5 };
        var p2 = new TourPackage { GuideId = guideA.Id, PackageName = "P2 GuideA", Destination = "Ella", Price = 150m, DurationDays = 2, MaxGroupSize = 6 };
        var p3 = new TourPackage { GuideId = guideB.Id, PackageName = "P3 GuideB", Destination = "Colombo", Price = 80m, DurationDays = 1, MaxGroupSize = 4 };
        db.TourPackages.AddRange(p1, p2, p3);
        await db.SaveChangesAsync();

        var guideAPackages = await db.TourPackages.Where(p => p.GuideId == guideA.Id).ToListAsync();
        Assert.Equal(2, guideAPackages.Count);
        Assert.All(guideAPackages, p => Assert.Equal(guideA.Id, p.GuideId));
    }

    // =========================================================================
    // 4.4 TOUR OPERATION DATABASE (DB-TOP-001 – DB-TOP-005)
    // =========================================================================

    [Fact, Trait("TestCase", "DB-TOP-001")]
    public async Task Db_TourOperation_IsStored()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Op Target Guide", Email = "otg@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var pkg = new TourPackage { GuideId = guide.Id, PackageName = "Op Pkg", Destination = "Jaffna", Price = 300m, DurationDays = 3, MaxGroupSize = 8 };
        db.TourPackages.Add(pkg);
        await db.SaveChangesAsync();

        var op = new TourOperation
        {
            TourPackageId = pkg.TourPackageId,
            GuideId = guide.Id,
            ScheduledDate = DateTime.UtcNow.AddDays(7),
            NumberOfTourists = 4,
            TotalCost = 1200m,
            Status = TourOperationStatus.Scheduled,
            Notes = "Database insert test."
        };
        db.TourOperations.Add(op);
        await db.SaveChangesAsync();

        Assert.True(op.TourOperationId > 0);
        var inDb = await db.TourOperations.FindAsync(op.TourOperationId);
        Assert.NotNull(inDb);
        Assert.Equal(4, inDb.NumberOfTourists);
        Assert.Equal(1200m, inDb.TotalCost);
    }

    [Fact, Trait("TestCase", "DB-TOP-002")]
    public async Task Db_OperationRelationships_LinkedCorrectly()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Master Guide", Email = "mg@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var pkg = new TourPackage { GuideId = guide.Id, PackageName = "Master Tour", Destination = "Anuradhapura", Price = 180m, DurationDays = 2, MaxGroupSize = 6 };
        db.TourPackages.Add(pkg);
        await db.SaveChangesAsync();

        var op = new TourOperation
        {
            TourPackageId = pkg.TourPackageId,
            GuideId = guide.Id,
            ScheduledDate = DateTime.UtcNow.AddDays(3),
            NumberOfTourists = 5,
            TotalCost = 900m
        };
        db.TourOperations.Add(op);
        await db.SaveChangesAsync();

        var loaded = await db.TourOperations
            .Include(o => o.Guide)
            .Include(o => o.TourPackage)
            .FirstOrDefaultAsync(o => o.TourOperationId == op.TourOperationId);

        Assert.NotNull(loaded);
        Assert.Equal("Master Guide", loaded.Guide?.Name);
        Assert.Equal("Master Tour", loaded.TourPackage?.PackageName);
    }

    [Fact, Trait("TestCase", "DB-TOP-003")]
    public async Task Db_OperationUpdate_PersistsChanges()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Op Upd Guide", Email = "oug@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var pkg = new TourPackage { GuideId = guide.Id, PackageName = "Update Op Tour", Destination = "Mirissa", Price = 80m, DurationDays = 1, MaxGroupSize = 5 };
        db.TourPackages.Add(pkg);
        await db.SaveChangesAsync();

        var op = new TourOperation
        {
            TourPackageId = pkg.TourPackageId,
            GuideId = guide.Id,
            ScheduledDate = DateTime.UtcNow.AddDays(5),
            NumberOfTourists = 2,
            TotalCost = 160m
        };
        db.TourOperations.Add(op);
        await db.SaveChangesAsync();

        op.NumberOfTourists = 3;
        op.TotalCost = 240m;
        op.Notes = "Additional tourist added.";
        await db.SaveChangesAsync();

        var updated = await db.TourOperations.AsNoTracking().FirstOrDefaultAsync(o => o.TourOperationId == op.TourOperationId);
        Assert.NotNull(updated);
        Assert.Equal(3, updated.NumberOfTourists);
        Assert.Equal(240m, updated.TotalCost);
        Assert.Equal("Additional tourist added.", updated.Notes);
    }

    [Fact, Trait("TestCase", "DB-TOP-004")]
    public async Task Db_OperationStatus_PersistsAcrossTransitions()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Status Guide", Email = "sg@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var pkg = new TourPackage { GuideId = guide.Id, PackageName = "Status Tour", Destination = "Kandy", Price = 100m, DurationDays = 1, MaxGroupSize = 4 };
        db.TourPackages.Add(pkg);
        await db.SaveChangesAsync();

        var op = new TourOperation
        {
            TourPackageId = pkg.TourPackageId,
            GuideId = guide.Id,
            ScheduledDate = DateTime.UtcNow.AddDays(1),
            NumberOfTourists = 2,
            TotalCost = 200m,
            Status = TourOperationStatus.Scheduled
        };
        db.TourOperations.Add(op);
        await db.SaveChangesAsync();

        // Transition through statuses
        op.Status = TourOperationStatus.CheckedIn;
        await db.SaveChangesAsync();
        var checkedIn = await db.TourOperations.AsNoTracking().FirstOrDefaultAsync(o => o.TourOperationId == op.TourOperationId);
        Assert.Equal(TourOperationStatus.CheckedIn, checkedIn!.Status);

        op.Status = TourOperationStatus.InProgress;
        await db.SaveChangesAsync();
        var inProgress = await db.TourOperations.AsNoTracking().FirstOrDefaultAsync(o => o.TourOperationId == op.TourOperationId);
        Assert.Equal(TourOperationStatus.InProgress, inProgress!.Status);

        op.Status = TourOperationStatus.Completed;
        await db.SaveChangesAsync();
        var completed = await db.TourOperations.AsNoTracking().FirstOrDefaultAsync(o => o.TourOperationId == op.TourOperationId);
        Assert.Equal(TourOperationStatus.Completed, completed!.Status);
    }

    [Fact, Trait("TestCase", "DB-TOP-005")]
    public async Task Db_OperationDeletion_RemovesRecord()
    {
        await using var pg = await PgTestDatabase.CreateAsync();
        await using var db = pg.CreateContext();

        var guide = new Guide { UserId = PgTestDatabase.OperatorId, Name = "Del Op Guide", Email = "dog@example.test" };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();

        var pkg = new TourPackage { GuideId = guide.Id, PackageName = "Del Op Tour", Destination = "Ella", Price = 120m, DurationDays = 1, MaxGroupSize = 4 };
        db.TourPackages.Add(pkg);
        await db.SaveChangesAsync();

        var op = new TourOperation
        {
            TourPackageId = pkg.TourPackageId,
            GuideId = guide.Id,
            ScheduledDate = DateTime.UtcNow.AddDays(2),
            NumberOfTourists = 2,
            TotalCost = 240m
        };
        db.TourOperations.Add(op);
        await db.SaveChangesAsync();

        db.TourOperations.Remove(op);
        await db.SaveChangesAsync();

        var deleted = await db.TourOperations.FindAsync(op.TourOperationId);
        Assert.Null(deleted);
    }
}
