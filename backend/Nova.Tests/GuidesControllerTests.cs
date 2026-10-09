using Microsoft.AspNetCore.Mvc;
using Nova.Api.Controllers;
using Nova.Api.DTOs.Guides;
using Nova.Api.Entities;
using Xunit;

namespace Nova.Tests;

public class GuidesControllerTests
{
    [Fact]
    public async Task Create_ValidRequest_CreatesGuideAndReturnsGuideResponse()
    {
        var db = TestDbContextFactory.CreateInMemoryDbContext();
        var controller = new GuidesController(db);

        var request = new CreateGuideRequest(
            Name: "Sunil Silva",
            Email: "sunil.silva@example.com",
            Phone: "+94 77 111 2222",
            Bio: "Experienced wildlife guide with 10 years at Yala.",
            Languages: new List<string> { "English", "Sinhala" },
            Specialties: new List<string> { "Wildlife", "Bird Watching" },
            YearsExperience: 10,
            AvatarUrl: "https://example.com/avatar.jpg"
        );

        var result = await controller.Create(request);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var response = Assert.IsType<GuideResponse>(createdResult.Value);
        Assert.Equal("Sunil Silva", response.Name);
        Assert.Equal("sunil.silva@example.com", response.Email);
        Assert.Equal("Pending", response.VerificationStatus);
        Assert.Equal("Available", response.Status);
    }

    [Fact]
    public async Task GetAll_WithoutFilters_ReturnsAllGuides()
    {
        var db = TestDbContextFactory.CreateInMemoryDbContext();
        var controller = new GuidesController(db);

        await controller.Create(new CreateGuideRequest("Guide One", "g1@example.com", null, null, null, null, null, null));
        await controller.Create(new CreateGuideRequest("Guide Two", "g2@example.com", null, null, null, null, null, null));

        var result = await controller.GetAll(null, null, null, null);
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var guides = Assert.IsType<List<GuideResponse>>(okResult.Value);

        Assert.True(guides.Count >= 2);
    }

    [Fact]
    public async Task GetAll_WithFilters_FiltersBySpecialtyAndRating()
    {
        var db = TestDbContextFactory.CreateInMemoryDbContext();
        var controller = new GuidesController(db);

        var g1 = new Guide
        {
            UserId = "u1",
            Name = "Heritage Master",
            Email = "hm@example.com",
            Specialties = new List<string> { "Heritage", "Temples" },
            Languages = new List<string> { "English" },
            RatingAvg = 4.8m,
            IsActive = true
        };
        var g2 = new Guide
        {
            UserId = "u2",
            Name = "Safari Scout",
            Email = "ss@example.com",
            Specialties = new List<string> { "Safari" },
            Languages = new List<string> { "German" },
            RatingAvg = 4.0m,
            IsActive = true
        };
        db.Guides.AddRange(g1, g2);
        await db.SaveChangesAsync();

        var result = await controller.GetAll("English", "Heritage", 4.5m, true);
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var guides = Assert.IsType<List<GuideResponse>>(okResult.Value);

        Assert.Single(guides);
        Assert.Equal("Heritage Master", guides[0].Name);
    }

    [Fact]
    public async Task GetById_ExistingId_ReturnsGuide()
    {
        var db = TestDbContextFactory.CreateInMemoryDbContext();
        var controller = new GuidesController(db);

        var createResult = await controller.Create(new CreateGuideRequest("Guide Three", "g3@example.com", null, null, null, null, null, null));
        var created = (createResult.Result as CreatedAtActionResult)!.Value as GuideResponse;

        var result = await controller.GetById(created!.Id);
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var guide = Assert.IsType<GuideResponse>(okResult.Value);

        Assert.Equal("Guide Three", guide.Name);
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        var db = TestDbContextFactory.CreateInMemoryDbContext();
        var controller = new GuidesController(db);

        var result = await controller.GetById(99999);
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Update_ExistingGuide_UpdatesProperties()
    {
        var db = TestDbContextFactory.CreateInMemoryDbContext();
        var controller = new GuidesController(db);

        var createResult = await controller.Create(new CreateGuideRequest("Old Name", "old@example.com", null, null, null, null, null, null));
        var created = (createResult.Result as CreatedAtActionResult)!.Value as GuideResponse;

        var updateReq = new UpdateGuideRequest(
            Name: "Updated Name",
            Email: "updated@example.com",
            Phone: "+94 71 999 8888",
            Bio: "Updated bio description",
            Languages: new List<string> { "English", "French" },
            Specialties: new List<string> { "Culinary" },
            YearsExperience: 7,
            AvatarUrl: "https://example.com/new.jpg"
        );

        var updateResult = await controller.Update(created!.Id, updateReq);
        var okResult = Assert.IsType<OkObjectResult>(updateResult.Result);
        var updatedGuide = Assert.IsType<GuideResponse>(okResult.Value);

        Assert.Equal("Updated Name", updatedGuide.Name);
        Assert.Equal("updated@example.com", updatedGuide.Email);
    }

    [Fact]
    public async Task UpdateVerification_ValidStatus_UpdatesStatus()
    {
        var db = TestDbContextFactory.CreateInMemoryDbContext();
        var controller = new GuidesController(db);

        var createResult = await controller.Create(new CreateGuideRequest("Guide Verify", "verify@example.com", null, null, null, null, null, null));
        var created = (createResult.Result as CreatedAtActionResult)!.Value as GuideResponse;

        var verifyResult = await controller.UpdateVerification(created!.Id, new VerifyGuideRequest("Verified"));
        var okResult = Assert.IsType<OkObjectResult>(verifyResult.Result);
        var verifiedGuide = Assert.IsType<GuideResponse>(okResult.Value);

        Assert.Equal("Verified", verifiedGuide.VerificationStatus);
    }

    [Fact]
    public async Task UpdateVerification_InvalidStatus_ReturnsBadRequest()
    {
        var db = TestDbContextFactory.CreateInMemoryDbContext();
        var controller = new GuidesController(db);

        var createResult = await controller.Create(new CreateGuideRequest("Guide Bad", "bad@example.com", null, null, null, null, null, null));
        var created = (createResult.Result as CreatedAtActionResult)!.Value as GuideResponse;

        var verifyResult = await controller.UpdateVerification(created!.Id, new VerifyGuideRequest("UnknownStatus"));
        Assert.IsType<BadRequestObjectResult>(verifyResult.Result);
    }

    [Fact]
    public async Task Deactivate_ExistingGuide_SetsIsActiveFalse()
    {
        var db = TestDbContextFactory.CreateInMemoryDbContext();
        var controller = new GuidesController(db);

        var createResult = await controller.Create(new CreateGuideRequest("Guide Deactivate", "deact@example.com", null, null, null, null, null, null));
        var created = (createResult.Result as CreatedAtActionResult)!.Value as GuideResponse;

        var deleteResult = await controller.Deactivate(created!.Id);
        Assert.IsType<NoContentResult>(deleteResult);

        var guideInDb = await db.Guides.FindAsync(created.Id);
        Assert.NotNull(guideInDb);
        Assert.False(guideInDb.IsActive);
    }

    [Fact]
    public async Task GuideAvailability_CrudFlow_Succeeds()
    {
        var db = TestDbContextFactory.CreateInMemoryDbContext();
        var guideCtrl = new GuidesController(db);
        var availCtrl = new GuideAvailabilityController(db);

        var createGuideRes = await guideCtrl.Create(new CreateGuideRequest("Guide Avail", "avail@example.com", null, null, null, null, null, null));
        var guide = (createGuideRes.Result as CreatedAtActionResult)!.Value as GuideResponse;

        // 1. Add availability slot
        var createSlotReq = new CreateAvailabilityRequest(
            GuideId: guide!.Id,
            AvailableDate: new DateOnly(2026, 10, 20),
            StartTime: new TimeOnly(9, 0),
            EndTime: new TimeOnly(17, 0)
        );
        var createSlotRes = await availCtrl.Create(guide.Id, createSlotReq);
        var createdSlotResult = Assert.IsType<CreatedAtActionResult>(createSlotRes.Result);
        var slot = Assert.IsType<AvailabilityResponse>(createdSlotResult.Value);
        Assert.Equal(guide.Id, slot.GuideId);
        Assert.Equal(new DateOnly(2026, 10, 20), slot.AvailableDate);

        // 2. List availability slots
        var listRes = await availCtrl.GetByGuide(guide.Id);
        var okList = Assert.IsType<OkObjectResult>(listRes.Result);
        var slots = Assert.IsType<List<AvailabilityResponse>>(okList.Value);
        Assert.Single(slots);

        // 3. Delete availability slot
        var deleteRes = await availCtrl.Delete(guide.Id, slot.AvailabilityId);
        Assert.IsType<NoContentResult>(deleteRes);

        // Verify slot deleted
        var listAfterDelete = await availCtrl.GetByGuide(guide.Id);
        var okListAfter = Assert.IsType<OkObjectResult>(listAfterDelete.Result);
        var slotsAfter = Assert.IsType<List<AvailabilityResponse>>(okListAfter.Value);
        Assert.Empty(slotsAfter);
    }
}
