using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Guides;
using Nova.Api.DTOs.Itineraries;
using Nova.Api.DTOs.Recommendations;
using Nova.Api.DTOs.TripPlanner;
using Nova.Api.DTOs.Trips;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Moq;
using Xunit;

namespace Nova.Tests.SystemIntegration;

/// <summary>
/// WHOLE-SYSTEM INTEGRATION / END-TO-END AUTOMATED TEST SUITE
/// Covers E2E-001 through E2E-015 against real ASP.NET Core TestServer,
/// real controllers, real services, and an isolated PostgreSQL database.
/// </summary>
public sealed class E2EWorkflowTests
{
    private static async Task<Guide> EnsureGuideInDb(NovaDbContext db)
    {
        var guide = await db.Guides.FirstOrDefaultAsync();
        if (guide != null) return guide;

        var operatorUser = await db.Users.FirstOrDefaultAsync(u => u.Id == PgTestDatabase.OperatorId)
            ?? new User
            {
                Id = PgTestDatabase.OperatorId,
                Name = "Test Operator",
                Email = "test-operator@example.test",
                Role = UserRole.TourismOperator,
                PasswordHash = "hashed"
            };

        guide = new Guide
        {
            UserId = operatorUser.Id,
            Name = "Bandara Navarathne",
            Email = "bandara.guide@example.test",
            Phone = "+94771234567",
            Bio = "Licensed archaeological and cultural tour guide.",
            Languages = ["English", "Sinhala", "German"],
            Specialties = ["Cultural Heritage", "Hiking"],
            YearsExperience = 8,
            VerificationStatus = GuideVerificationStatus.Verified,
            RatingAvg = 4.9m,
            RatingCount = 42,
            ToursCompleted = 120,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Guides.Add(guide);
        await db.SaveChangesAsync();
        return guide;
    }

    private static async Task<TourPackage> EnsureTourPackageInDb(NovaDbContext db, int guideId)
    {
        var tp = await db.TourPackages.FirstOrDefaultAsync();
        if (tp != null) return tp;

        tp = new TourPackage
        {
            GuideId = guideId,
            PackageName = "Sigiriya & Dambulla Heritage Explorer",
            Description = "Full cultural circuit including rock fortress and cave temples.",
            Destination = "Sigiriya",
            DurationDays = 3,
            Price = 450.0m,
            MaxGroupSize = 8,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        db.TourPackages.Add(tp);
        await db.SaveChangesAsync();
        return tp;
    }

    [Fact]
    public async Task E2E_001_UserRegistrationAndLogin_Workflow()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Register new tourist
        var uniqueEmail = $"tourist.{Guid.NewGuid():N}@example.test";
        var regPayload = new
        {
            name = "Ayesha Silva",
            email = uniqueEmail,
            password = "SecurePassword123!",
            confirmPassword = "SecurePassword123!"
        };

        var regRes = await host.PostAsync("/api/auth/register", null, regPayload);
        Assert.Equal(HttpStatusCode.Created, regRes.Status);
        Assert.True(regRes.Success);
        var regToken = regRes.Json.GetProperty("token").GetString();
        Assert.False(string.IsNullOrWhiteSpace(regToken));

        // 2. Login with credentials
        var loginPayload = new
        {
            email = uniqueEmail,
            password = "SecurePassword123!"
        };
        var loginRes = await host.PostAsync("/api/auth/login", null, loginPayload);
        Assert.Equal(HttpStatusCode.OK, loginRes.Status);
        var loginToken = loginRes.Json.GetProperty("token").GetString();
        Assert.False(string.IsNullOrWhiteSpace(loginToken));

        // 3. Verify user identity on protected profile endpoint
        var meRes = await host.GetAsync("/api/auth/me", loginToken);
        Assert.Equal(HttpStatusCode.OK, meRes.Status);
        Assert.Equal(uniqueEmail, meRes.Json.GetProperty("user").GetProperty("email").GetString());

        // 4. Unauthorized access without token is rejected
        var unauthRes = await host.GetAsync("/api/auth/me", null);
        Assert.Equal(HttpStatusCode.Unauthorized, unauthRes.Status);
    }

    [Fact]
    public async Task E2E_002_DestinationDiscovery_To_TripCreation()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Discover destinations
        var destsRes = await host.GetAsync("/api/destinations", null);
        Assert.Equal(HttpStatusCode.OK, destsRes.Status);
        Assert.True(destsRes.Success);
        var firstDestId = destsRes.Data.EnumerateArray().First().GetProperty("id").GetString()!;

        // 2. View details
        var detailRes = await host.GetAsync($"/api/destinations/{firstDestId}", null);
        Assert.Equal(HttpStatusCode.OK, detailRes.Status);
        var destName = detailRes.Data.GetProperty("name").GetString()!;

        // 3. Create trip using destination
        var tripBody = new
        {
            tripName = $"Holiday to {destName}",
            destination = destName,
            startDate = DateTime.UtcNow.AddDays(14),
            endDate = DateTime.UtcNow.AddDays(19),
            numberOfTravelers = 2,
            budget = 1400.0m,
            interests = new[] { "Culture", "Nature" },
            tripStyle = "Comfort"
        };
        var tripRes = await host.PostAsync("/api/trips", TestTokens.UserA, tripBody);
        Assert.Equal(HttpStatusCode.Created, tripRes.Status);
        var tripId = tripRes.Data.GetProperty("id").GetString()!;

        // 4. Retrieve and verify
        var getTripRes = await host.GetAsync($"/api/trips/{tripId}", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.OK, getTripRes.Status);
        Assert.Equal(destName, getTripRes.Data.GetProperty("destination").GetString());
    }

    [Fact]
    public async Task E2E_003_Destination_Attraction_To_TripItinerary()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Get destination details
        var destRes = await host.GetAsync("/api/destinations/dest-1", null);
        Assert.Equal(HttpStatusCode.OK, destRes.Status);

        // 2. Create trip
        var tripRes = await host.PostAsync("/api/trips", TestTokens.UserA, Fixtures.ValidTripBody("Sigiriya"));
        Assert.Equal(HttpStatusCode.Created, tripRes.Status);
        var tripId = tripRes.Data.GetProperty("id").GetString()!;

        // 3. Create itinerary
        var itinRes = await host.PostAsync($"/api/trips/{tripId}/itineraries", TestTokens.UserA, new
        {
            title = "Sigiriya Heritage Itinerary",
            feasibilityScore = 94.0
        });
        Assert.Equal(HttpStatusCode.Created, itinRes.Status);
        var itinId = itinRes.Data.GetProperty("id").GetString()!;

        // 4. Add day with attraction activity
        var dayRes = await host.PostAsync($"/api/itineraries/{itinId}/days", TestTokens.UserA, new
        {
            dayNumber = 1,
            date = DateTime.UtcNow.AddDays(10),
            title = "Day 1: Sigiriya Citadel Hike",
            location = "Sigiriya"
        });
        Assert.Equal(HttpStatusCode.OK, dayRes.Status);

        // 5. Verify itinerary retrieval
        var getItinRes = await host.GetAsync($"/api/trips/{tripId}/itinerary", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.OK, getItinRes.Status);
        Assert.Equal("Sigiriya Heritage Itinerary", getItinRes.Data.GetProperty("title").GetString());
    }

    [Fact]
    public async Task E2E_004_AIDestinationResearch_To_TripPlanning()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Request AI Trip Plan generation
        var planReq = new
        {
            tripName = "AI Sigiriya & Kandy Journey",
            destination = "Sigiriya",
            destinations = new[] { "Sigiriya", "Kandy" },
            startDate = DateTime.UtcNow.AddDays(10).ToString("yyyy-MM-dd"),
            endDate = DateTime.UtcNow.AddDays(14).ToString("yyyy-MM-dd"),
            travelers = 2,
            budgetAmount = 1500m,
            interests = new[] { "culture", "nature" }
        };

        var genRes = await host.PostAsync("/api/trip-planner/generate", TestTokens.UserA, planReq);
        Assert.Equal(HttpStatusCode.OK, genRes.Status);
        Assert.True(genRes.Success);
        var days = genRes.Data.GetProperty("days");
        Assert.True(days.GetArrayLength() >= 2);

        // 2. Save generated plan into PostgreSQL
        var saveRes = await host.PostAsync("/api/trip-planner/save", TestTokens.UserA, new
        {
            plan = genRes.Data,
            requestInput = planReq
        });
        Assert.Equal(HttpStatusCode.Created, saveRes.Status);
        var savedTripId = saveRes.Data.GetProperty("tripId").GetString()!;

        // 3. Retrieve saved trip from DB
        var checkTripRes = await host.GetAsync($"/api/trips/{savedTripId}", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.OK, checkTripRes.Status);
        Assert.Equal("AI Sigiriya & Kandy Journey", checkTripRes.Data.GetProperty("tripName").GetString());
    }

    [Fact]
    public async Task E2E_005_AITripPlanning_To_ItineraryApproval()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Generate and save AI plan
        var planReq = new
        {
            tripName = "Cultural Triangle Approval Expedition",
            destination = "Kandy",
            destinations = new[] { "Kandy" },
            startDate = DateTime.UtcNow.AddDays(15).ToString("yyyy-MM-dd"),
            endDate = DateTime.UtcNow.AddDays(17).ToString("yyyy-MM-dd"),
            travelers = 2,
            budgetAmount = 1200m,
            interests = new[] { "culture" }
        };
        var genRes = await host.PostAsync("/api/trip-planner/generate", TestTokens.UserA, planReq);
        var saveRes = await host.PostAsync("/api/trip-planner/save", TestTokens.UserA, new
        {
            plan = genRes.Data,
            requestInput = planReq
        });
        var itinId = saveRes.Data.GetProperty("itineraryId").GetString()!;

        // 2. Regular tourist attempt to approve -> 403 Forbidden (Tourists cannot approve)
        var touristApproveRes = await host.PostAsync($"/api/itineraries/{itinId}/approve", TestTokens.UserA, new
        {
            comments = "Tourist attempting self-approval"
        });
        Assert.Equal(HttpStatusCode.Forbidden, touristApproveRes.Status);

        // 3. Authorized Admin approves itinerary -> 200 OK
        var adminApproveRes = await host.PostAsync($"/api/itineraries/{itinId}/approve", TestTokens.Admin, new
        {
            comments = "Verified feasible by Tourism Admin"
        });
        Assert.Equal(HttpStatusCode.OK, adminApproveRes.Status);
        Assert.True(adminApproveRes.Success);

        // 4. Verify updated status
        var getItinRes = await host.GetAsync($"/api/itineraries/{itinId}", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.OK, getItinRes.Status);
        Assert.Equal("Approved", getItinRes.Data.GetProperty("status").GetString());
    }

    [Fact]
    public async Task E2E_006_Trip_To_TourGuideDiscovery()
    {
        await using var host = await NovaApiHost.StartAsync();
        await using (var db = host.Db.CreateContext())
        {
            var guide = await EnsureGuideInDb(db);
            await EnsureTourPackageInDb(db, guide.Id);
        }

        // 1. Create a trip for Kandy
        var tripRes = await host.PostAsync("/api/trips", TestTokens.UserA, Fixtures.ValidTripBody("Kandy"));
        Assert.Equal(HttpStatusCode.Created, tripRes.Status);

        // 2. Discover guides matching language
        var guidesRes = await host.GetAsync("/api/v1/guides?language=English", null);
        Assert.Equal(HttpStatusCode.OK, guidesRes.Status);
        Assert.True(guidesRes.Json.GetArrayLength() > 0);

        // 3. Discover tour packages
        var pkgsRes = await host.GetAsync("/api/v1/tour-packages", null);
        Assert.Equal(HttpStatusCode.OK, pkgsRes.Status);
        Assert.True(pkgsRes.Json.GetArrayLength() > 0);
    }

    [Fact]
    public async Task E2E_007_GuideAvailability_To_TourScheduling()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        int pkgId;
        await using (var db = host.Db.CreateContext())
        {
            var g = await EnsureGuideInDb(db);
            var p = await EnsureTourPackageInDb(db, g.Id);
            guideId = g.Id;
            pkgId = p.TourPackageId;
        }

        // 1. Create valid availability slot
        var slotRes = await host.PostAsync($"/api/v1/guides/{guideId}/availability", TestTokens.OperatorRoleClaim, new
        {
            guideId,
            availableDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)).ToString("yyyy-MM-dd"),
            startTime = "08:00:00",
            endTime = "16:00:00"
        });
        Assert.Equal(HttpStatusCode.Created, slotRes.Status);

        // 2. Reject inverted time slot
        var invRes = await host.PostAsync($"/api/v1/guides/{guideId}/availability", TestTokens.OperatorRoleClaim, new
        {
            guideId,
            availableDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(8)).ToString("yyyy-MM-dd"),
            startTime = "17:00:00",
            endTime = "09:00:00"
        });
        Assert.Equal(HttpStatusCode.BadRequest, invRes.Status);

        // 3. Schedule Tour Operation with Guide and Package
        var opRes = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, new
        {
            tourPackageId = pkgId,
            guideId,
            scheduledDate = DateTime.UtcNow.Date.AddDays(7),
            numberOfTourists = 4,
            totalCost = 350.0m,
            notes = "Scheduled cultural tour operation"
        });
        Assert.Equal(HttpStatusCode.Created, opRes.Status);
        Assert.Equal("Scheduled", opRes.Json.GetProperty("status").GetString());
    }

    [Fact]
    public async Task E2E_008_TourPackageDiscovery_To_OperationLifecycle()
    {
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        int pkgId;
        await using (var db = host.Db.CreateContext())
        {
            var g = await EnsureGuideInDb(db);
            var p = await EnsureTourPackageInDb(db, g.Id);
            guideId = g.Id;
            pkgId = p.TourPackageId;
        }

        // 1. Discovery
        var pkgRes = await host.GetAsync($"/api/v1/tour-packages/{pkgId}", null);
        Assert.Equal(HttpStatusCode.OK, pkgRes.Status);
        Assert.Equal("Sigiriya & Dambulla Heritage Explorer", pkgRes.Json.GetProperty("packageName").GetString());

        // 2. Schedule operation
        var opRes = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, new
        {
            tourPackageId = pkgId,
            guideId,
            scheduledDate = DateTime.UtcNow.Date.AddDays(12),
            numberOfTourists = 6,
            totalCost = 500.0m
        });
        Assert.Equal(HttpStatusCode.Created, opRes.Status);
        var opId = opRes.Json.GetProperty("tourOperationId").GetInt32();

        // 3. Update operation status to CheckedIn via status patch endpoint
        var updateRes = await host.PatchAsync($"/api/v1/tour-operations/{opId}/status", TestTokens.OperatorRoleClaim, new
        {
            status = "CheckedIn"
        });
        Assert.Equal(HttpStatusCode.OK, updateRes.Status);
        Assert.Equal("CheckedIn", updateRes.Json.GetProperty("status").GetString());
    }

    [Fact]
    public async Task E2E_009_TripCompletion_To_ReviewSubmission()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Submit review
        var revRes = await host.PostAsync("/api/reviews", TestTokens.UserA, new
        {
            destinationId = "dest-1",
            rating = 5,
            title = "Unmatched Sunrise Over Sigiriya Citadel",
            comment = "An extraordinary climb through 5th-century mirror walls and ancient frescoes.",
            touristName = "Test User A"
        });
        Assert.Equal(HttpStatusCode.OK, revRes.Status);
        Assert.True(revRes.Success);
        var revId = revRes.Data.GetProperty("id").GetString()!;

        // 2. Verify destination review listing
        var listRes = await host.GetAsync("/api/reviews?destinationId=dest-1", null);
        Assert.Equal(HttpStatusCode.OK, listRes.Status);
        Assert.True(listRes.Data.GetArrayLength() > 0);

        // 3. Verify user's own reviews
        var myRes = await host.GetAsync("/api/reviews/my-reviews", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.OK, myRes.Status);
        Assert.Contains(myRes.Data.EnumerateArray(), r => r.GetProperty("id").GetString() == revId);
    }

    [Fact]
    public async Task E2E_010_Review_To_Recommendation()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Submit review to enrich destination data
        await host.PostAsync("/api/reviews", TestTokens.UserA, new
        {
            destinationId = "dest-3",
            rating = 5,
            title = "Sacred Tooth Relic Reverence",
            comment = "Spiritual evening puja ceremony in historic Kandy temple complex."
        });

        // 2. Request smart match recommendations
        var recRes = await host.PostAsync("/api/recommendations/smart-match", null, new
        {
            interests = new[] { "culture", "spiritual" },
            minRating = 4.5
        });
        Assert.Equal(HttpStatusCode.OK, recRes.Status);
        Assert.True(recRes.Success);

        var recList = recRes.Data.GetProperty("recommendations");
        Assert.True(recList.GetArrayLength() > 0);
        var firstRec = recList.EnumerateArray().First();
        Assert.True(firstRec.GetProperty("suitabilityScore").GetInt32() >= 80);
    }

    [Fact]
    public async Task E2E_011_Destination_To_Recommendation()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Request recommendations with interest matching
        var recRes = await host.GetAsync("/api/recommendations?interests=Culture&minRating=4.0", null);
        Assert.Equal(HttpStatusCode.OK, recRes.Status);
        Assert.True(recRes.Success);
        Assert.True(recRes.Data.GetProperty("recommendations").GetArrayLength() > 0);
    }

    [Fact]
    public async Task E2E_012_FullTourismPlanningWorkflow_EndToEnd()
    {
        // ─────────────────────────────────────────────────────────────────────────
        // PRIMARY WHOLE-SYSTEM WORKFLOW:
        // Register -> Discover Destination -> AI Plan -> Save Plan -> Approve Plan
        // -> Discover Guide/Tour -> Schedule Tour -> Submit Review -> Get Recommendations
        // ─────────────────────────────────────────────────────────────────────────
        await using var host = await NovaApiHost.StartAsync();
        int guideId;
        int pkgId;
        await using (var db = host.Db.CreateContext())
        {
            var g = await EnsureGuideInDb(db);
            var p = await EnsureTourPackageInDb(db, g.Id);
            guideId = g.Id;
            pkgId = p.TourPackageId;
        }

        // 1. Register & Login
        var userEmail = $"whole.system.{Guid.NewGuid():N}@example.test";
        var regRes = await host.PostAsync("/api/auth/register", null, new
        {
            name = "Saman Kumara",
            email = userEmail,
            password = "MasterPassword2026!",
            confirmPassword = "MasterPassword2026!"
        });
        Assert.Equal(HttpStatusCode.Created, regRes.Status);
        var token = regRes.Json.GetProperty("token").GetString();

        // 2. Discover Destinations
        var destsRes = await host.GetAsync("/api/destinations", token);
        Assert.Equal(HttpStatusCode.OK, destsRes.Status);

        // 3. View Destination Details
        var detailRes = await host.GetAsync("/api/destinations/dest-1", token);
        Assert.Equal(HttpStatusCode.OK, detailRes.Status);
        var destName = detailRes.Data.GetProperty("name").GetString()!;

        // 4. Generate AI Plan
        var planReq = new
        {
            tripName = $"Complete Sri Lanka Tour: {destName}",
            destination = "Sigiriya",
            destinations = new[] { "Sigiriya", "Kandy" },
            startDate = DateTime.UtcNow.AddDays(20).ToString("yyyy-MM-dd"),
            endDate = DateTime.UtcNow.AddDays(24).ToString("yyyy-MM-dd"),
            travelers = 2,
            budgetAmount = 1800m,
            interests = new[] { "culture", "nature" }
        };
        var genRes = await host.PostAsync("/api/trip-planner/generate", token, planReq);
        Assert.Equal(HttpStatusCode.OK, genRes.Status);

        // 5. Save AI Plan to PostgreSQL
        var saveRes = await host.PostAsync("/api/trip-planner/save", token, new
        {
            plan = genRes.Data,
            requestInput = planReq
        });
        Assert.Equal(HttpStatusCode.Created, saveRes.Status);
        var tripId = saveRes.Data.GetProperty("tripId").GetString()!;
        var itinId = saveRes.Data.GetProperty("itineraryId").GetString()!;

        // 6. Admin Approves Itinerary
        var approveRes = await host.PostAsync($"/api/itineraries/{itinId}/approve", TestTokens.Admin, new
        {
            comments = "Approved for full tourism workflow"
        });
        Assert.Equal(HttpStatusCode.OK, approveRes.Status);

        // 7. Discover Guide & Tour Package
        var guideRes = await host.GetAsync($"/api/v1/guides/{guideId}", token);
        Assert.Equal(HttpStatusCode.OK, guideRes.Status);
        var pkgRes = await host.GetAsync($"/api/v1/tour-packages/{pkgId}", token);
        Assert.Equal(HttpStatusCode.OK, pkgRes.Status);

        // 8. Operator Schedules Operation
        var opRes = await host.PostAsync("/api/v1/tour-operations", TestTokens.OperatorRoleClaim, new
        {
            tourPackageId = pkgId,
            guideId,
            scheduledDate = DateTime.UtcNow.Date.AddDays(21),
            numberOfTourists = 2,
            totalCost = 300.0m
        });
        Assert.Equal(HttpStatusCode.Created, opRes.Status);

        // 9. Tourist Submits Review
        var revRes = await host.PostAsync("/api/reviews", token, new
        {
            destinationId = "dest-1",
            rating = 5,
            title = "Unforgettable Whole-System Vacation",
            comment = "Seamless journey from planning to execution with fantastic guides!"
        });
        Assert.Equal(HttpStatusCode.OK, revRes.Status);

        // 10. Synthesize Next Recommendations
        var recRes = await host.PostAsync("/api/recommendations/smart-match", token, new
        {
            interests = new[] { "culture", "nature" },
            minRating = 4.0
        });
        Assert.Equal(HttpStatusCode.OK, recRes.Status);
        Assert.True(recRes.Data.GetProperty("recommendations").GetArrayLength() > 0);
    }

    [Fact]
    public async Task E2E_013_InvalidDataAcrossWorkflow()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Invalid Registration (password < 6 characters)
        var badReg = await host.PostAsync("/api/auth/register", null, new
        {
            name = "Test",
            email = "bad@test.com",
            password = "123",
            confirmPassword = "123"
        });
        Assert.Equal(HttpStatusCode.BadRequest, badReg.Status);

        // 2. Invalid Trip (EndDate before StartDate)
        var badTrip = await host.PostAsync("/api/trips", TestTokens.UserA, new
        {
            tripName = "Inverted Trip",
            destination = "Kandy",
            startDate = DateTime.UtcNow.AddDays(10),
            endDate = DateTime.UtcNow.AddDays(5),
            numberOfTravelers = 1,
            budget = 500m
        });
        Assert.Equal(HttpStatusCode.BadRequest, badTrip.Status);

        // 3. Invalid Review Rating (> 5)
        var badRev = await host.PostAsync("/api/reviews", TestTokens.UserA, new
        {
            destinationId = "dest-1",
            rating = 7,
            comment = "Exorbitant rating"
        });
        Assert.Equal(HttpStatusCode.BadRequest, badRev.Status);

        // 4. Invalid Guide Availability (Inverted time)
        var badSlot = await host.PostAsync("/api/v1/guides/1/availability", TestTokens.OperatorRoleClaim, new
        {
            guideId = 1,
            availableDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5)).ToString("yyyy-MM-dd"),
            startTime = "18:00:00",
            endTime = "09:00:00"
        });
        Assert.Equal(HttpStatusCode.BadRequest, badSlot.Status);

        // 5. Invalid Recommendation MinRating (> 5)
        var badRec = await host.PostAsync("/api/recommendations/smart-match", null, new
        {
            minRating = 9.5
        });
        Assert.Equal(HttpStatusCode.BadRequest, badRec.Status);
    }

    [Fact]
    public async Task E2E_014_UserSpecificDataIsolation_IDOR_Guards()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. User A creates private trip
        var tripRes = await host.PostAsync("/api/trips", TestTokens.UserA, Fixtures.ValidTripBody("Secret Place"));
        Assert.Equal(HttpStatusCode.Created, tripRes.Status);
        var tripAId = tripRes.Data.GetProperty("id").GetString()!;

        // 2. User A creates private review
        var revRes = await host.PostAsync("/api/reviews", TestTokens.UserA, new
        {
            destinationId = "dest-1",
            rating = 5,
            comment = "User A review"
        });
        var reviewAId = revRes.Data.GetProperty("id").GetString()!;

        // 3. User B tries to view User A's trips list -> 403 Forbidden
        var bViewA = await host.GetAsync($"/api/trips/user/{PgTestDatabase.UserAId}", TestTokens.UserB);
        Assert.Equal(HttpStatusCode.Forbidden, bViewA.Status);

        // 4. User B tries to modify User A's trip -> 403 Forbidden
        var bEditTrip = await host.PutAsync($"/api/trips/{tripAId}", TestTokens.UserB, new
        {
            tripName = "Hacked Trip",
            destination = "Hacked",
            startDate = DateTime.UtcNow.AddDays(1),
            endDate = DateTime.UtcNow.AddDays(2),
            numberOfTravelers = 1,
            budget = 100m,
            interests = new[] { "None" }
        });
        Assert.Equal(HttpStatusCode.Forbidden, bEditTrip.Status);

        // 5. User B tries to delete User A's trip -> 403 Forbidden
        var bDeleteTrip = await host.DeleteAsync($"/api/trips/{tripAId}", TestTokens.UserB);
        Assert.Equal(HttpStatusCode.Forbidden, bDeleteTrip.Status);

        // 6. User B tries to modify User A's review -> 403 Forbidden
        var bEditRev = await host.PutAsync($"/api/reviews/{reviewAId}", TestTokens.UserB, new
        {
            rating = 1,
            comment = "Tampered comment"
        });
        Assert.Equal(HttpStatusCode.Forbidden, bEditRev.Status);

        // 7. User B tries to delete User A's review -> 403 Forbidden
        var bDeleteRev = await host.DeleteAsync($"/api/reviews/{reviewAId}", TestTokens.UserB);
        Assert.Equal(HttpStatusCode.Forbidden, bDeleteRev.Status);
    }

    [Fact]
    public async Task E2E_015_CompleteErrorRecoveryWorkflow()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Simulate external AI microservice downtime
        host.AiClient.Setup(a => a.IsAvailableAsync()).ReturnsAsync(false);

        // 2. Controller seamlessly falls back to native 4-agent orchestrator
        var planReq = new
        {
            tripName = "Resilient Offline Tour",
            destination = "Ella",
            destinations = new[] { "Ella" },
            startDate = DateTime.UtcNow.AddDays(10).ToString("yyyy-MM-dd"),
            endDate = DateTime.UtcNow.AddDays(12).ToString("yyyy-MM-dd"),
            travelers = 2,
            budgetAmount = 600m
        };
        var planRes = await host.PostAsync("/api/trip-planner/generate", TestTokens.UserA, planReq);
        Assert.Equal(HttpStatusCode.OK, planRes.Status);
        Assert.True(planRes.Success);
        Assert.Contains("native", planRes.Message, StringComparison.OrdinalIgnoreCase);

        // 3. Fallback recommendations also operate seamlessly without throwing unhandled exceptions
        var recRes = await host.PostAsync("/api/recommendations/smart-match", null, new
        {
            interests = new[] { "nature" }
        });
        Assert.Equal(HttpStatusCode.OK, recRes.Status);
        Assert.True(recRes.Success);
        Assert.True(recRes.Data.GetProperty("recommendations").GetArrayLength() > 0);
    }
}
