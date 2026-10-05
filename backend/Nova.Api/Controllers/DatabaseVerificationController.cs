using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Entities;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/database-test")]
public class DatabaseVerificationController : ControllerBase
{
    private readonly NovaDbContext _db;
    private readonly ILogger<DatabaseVerificationController> _logger;

    public DatabaseVerificationController(NovaDbContext db, ILogger<DatabaseVerificationController> logger)
    {
        _db = db;
        _logger = logger;
    }

    public class TableStatus
    {
        public string TableName { get; set; } = string.Empty;
        public long RowCount { get; set; }
        public string Status { get; set; } = "OK";
    }

    public class TableTestResult
    {
        public string TableName { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string Operation { get; set; } = "Insert -> Query -> Verify -> Cleanup";
        public bool Passed { get; set; }
        public long LatencyMs { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// Inspects all tables currently present in the Supabase PostgreSQL database
    /// and reports live row counts for each table.
    /// </summary>
    [HttpGet("tables")]
    public async Task<IActionResult> GetTablesSummary()
    {
        var results = new List<TableStatus>();

        using var command = _db.Database.GetDbConnection().CreateCommand();
        command.CommandText = @"
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename;";

        await _db.Database.OpenConnectionAsync();
        var tableNames = new List<string>();

        using (var reader = await command.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                tableNames.Add(reader.GetString(0));
            }
        }

        foreach (var tableName in tableNames)
        {
            try
            {
                using var countCmd = _db.Database.GetDbConnection().CreateCommand();
                countCmd.CommandText = $"SELECT COUNT(*) FROM \"{tableName}\";";
                var count = Convert.ToInt64(await countCmd.ExecuteScalarAsync());

                results.Add(new TableStatus
                {
                    TableName = tableName,
                    RowCount = count,
                    Status = "Active in Supabase"
                });
            }
            catch (Exception ex)
            {
                results.Add(new TableStatus
                {
                    TableName = tableName,
                    RowCount = -1,
                    Status = $"Error: {ex.Message}"
                });
            }
        }

        return Ok(new
        {
            success = true,
            database = "Supabase Cloud PostgreSQL",
            host = "aws-0-ap-northeast-1.pooler.supabase.com",
            totalTables = results.Count,
            tables = results
        });
    }

    /// <summary>
    /// Executes a live end-to-end CRUD test on all 32 core application tables
    /// directly on Supabase PostgreSQL, verifying persistence, query retrieval,
    /// and data integrity.
    /// </summary>
    [HttpPost("verify-storage")]
    public async Task<IActionResult> VerifyAllTablesStorage()
    {
        var testResults = new List<TableTestResult>();
        var totalSw = Stopwatch.StartNew();

        var runId = Guid.NewGuid().ToString("N")[..8];
        var testUserId = $"test-u-{runId}";
        var testDestId = $"test-d-{runId}";
        var testTripId = $"test-t-{runId}";
        var testItinId = $"test-i-{runId}";
        var testDayId = $"test-day-{runId}";
        var testWorkflowId = $"test-wf-{runId}";
        var testGuideEmail = $"test.guide.{runId}@example.com";

        async Task RunTest(string tableName, string entityType, Func<Task<string>> action)
        {
            _db.ChangeTracker.Clear();
            var sw = Stopwatch.StartNew();
            try
            {
                var msg = await action();
                sw.Stop();
                testResults.Add(new TableTestResult
                {
                    TableName = tableName,
                    EntityType = entityType,
                    Passed = true,
                    LatencyMs = sw.ElapsedMilliseconds,
                    Message = msg
                });
            }
            catch (Exception ex)
            {
                _db.ChangeTracker.Clear();
                sw.Stop();
                testResults.Add(new TableTestResult
                {
                    TableName = tableName,
                    EntityType = entityType,
                    Passed = false,
                    LatencyMs = sw.ElapsedMilliseconds,
                    Message = $"FAILED: {ex.Message} (Inner: {ex.InnerException?.Message})"
                });
            }
        }

        // 1. Users
        User? createdUser = null;
        await RunTest("users", nameof(User), async () =>
        {
            createdUser = new User
            {
                Id = testUserId,
                Name = $"Tester {runId}",
                Email = $"test.{runId}@supabase.lk",
                PasswordHash = "hash123",
                Role = UserRole.Tourist,
                Status = "ACTIVE",
                Phone = "+94770000000",
                Bio = "Cloud verification tester",
                Location = "Colombo",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Users.Add(createdUser);
            await _db.SaveChangesAsync();

            var read = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == testUserId);
            if (read == null || read.Email != createdUser.Email)
                throw new InvalidOperationException("User was not stored correctly in Supabase.");

            return $"Verified INSERT & SELECT: ID '{testUserId}', Email '{read.Email}'.";
        });

        // 2. Destinations
        Destination? createdDest = null;
        await RunTest("destinations", nameof(Destination), async () =>
        {
            createdDest = new Destination
            {
                Id = testDestId,
                Name = $"Test Destination {runId}",
                Slug = $"test-dest-{runId}",
                Description = "Verification destination description",
                Location = "Matale District",
                Province = "Central",
                ImageUrl = "https://images.unsplash.com/test",
                Rating = 4.9,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Destinations.Add(createdDest);
            await _db.SaveChangesAsync();

            var read = await _db.Destinations.AsNoTracking().FirstOrDefaultAsync(d => d.Id == testDestId);
            if (read == null || read.Name != createdDest.Name)
                throw new InvalidOperationException("Destination was not stored correctly in Supabase.");

            return $"Verified INSERT & SELECT: ID '{testDestId}', Name '{read.Name}'.";
        });

        // 3. Attractions
        var testAttrId = $"test-attr-{runId}";
        await RunTest("attractions", nameof(Attraction), async () =>
        {
            var attr = new Attraction
            {
                Id = testAttrId,
                DestinationId = testDestId,
                Name = $"Ancient Summit Shrine {runId}",
                Description = "Panoramic archaeological landmark",
                Category = "Culture",
                EntryFee = 15.0,
                Location = "Matale Central",
                ImageUrl = "https://images.unsplash.com/sigiriya-test",
                OpeningTime = "08:00 AM",
                ClosingTime = "05:00 PM",
                DurationHours = 2.5,
                Rating = 4.8,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Attractions.Add(attr);
            await _db.SaveChangesAsync();

            var read = await _db.Attractions.AsNoTracking().FirstOrDefaultAsync(a => a.Id == testAttrId);
            if (read == null || read.DestinationId != testDestId)
                throw new InvalidOperationException("Attraction was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testAttrId}', DestId '{read.DestinationId}'.";
        });

        // 4. Trips
        Trip? createdTrip = null;
        await RunTest("trips", nameof(Trip), async () =>
        {
            createdTrip = new Trip
            {
                Id = testTripId,
                UserId = testUserId,
                TripName = $"Test Island Odyssey {runId}",
                StartDate = DateTime.UtcNow.AddDays(7),
                EndDate = DateTime.UtcNow.AddDays(14),
                NumberOfTravelers = 2,
                Budget = 1500.00m,
                Status = TripStatus.Draft,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Trips.Add(createdTrip);
            await _db.SaveChangesAsync();

            var read = await _db.Trips.AsNoTracking().FirstOrDefaultAsync(t => t.Id == testTripId);
            if (read == null || read.Budget != 1500.00m)
                throw new InvalidOperationException("Trip was not stored correctly in Supabase.");

            return $"Verified INSERT & SELECT: ID '{testTripId}', Budget '{read.Budget}'.";
        });

        // 5. TripDestinations
        await RunTest("trip_destinations", nameof(TripDestination), async () =>
        {
            var td = new TripDestination
            {
                TripId = testTripId,
                DestinationId = testDestId
            };
            _db.TripDestinations.Add(td);
            await _db.SaveChangesAsync();

            var read = await _db.TripDestinations.AsNoTracking().FirstOrDefaultAsync(x => x.TripId == testTripId && x.DestinationId == testDestId);
            if (read == null)
                throw new InvalidOperationException("TripDestination link was not stored correctly.");

            return $"Verified composite key INSERT & SELECT: Trip '{testTripId}' -> Dest '{testDestId}'.";
        });

        // 6. Itineraries
        Itinerary? createdItin = null;
        await RunTest("itineraries", nameof(Itinerary), async () =>
        {
            createdItin = new Itinerary
            {
                Id = testItinId,
                TripId = testTripId,
                Title = $"Test Day Plan {runId}",
                Status = ItineraryStatus.Draft,
                TotalEstimatedCost = 450.00m,
                CreatedSource = "TestRunner",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Itineraries.Add(createdItin);
            await _db.SaveChangesAsync();

            var read = await _db.Itineraries.AsNoTracking().FirstOrDefaultAsync(i => i.Id == testItinId);
            if (read == null || read.TotalEstimatedCost != 450.00m)
                throw new InvalidOperationException("Itinerary was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testItinId}', TotalCost '{read.TotalEstimatedCost}'.";
        });

        // 7. ItineraryDays
        await RunTest("itinerary_days", nameof(ItineraryDay), async () =>
        {
            var day = new ItineraryDay
            {
                Id = testDayId,
                ItineraryId = testItinId,
                DayNumber = 1,
                Date = DateTime.UtcNow.AddDays(7),
                Title = "Arrival in Colombo & Coastal Walk",
                Location = "Colombo"
            };
            _db.ItineraryDays.Add(day);
            await _db.SaveChangesAsync();

            var read = await _db.ItineraryDays.AsNoTracking().FirstOrDefaultAsync(d => d.Id == testDayId);
            if (read == null || read.DayNumber != 1)
                throw new InvalidOperationException("ItineraryDay was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testDayId}', DayNumber '{read.DayNumber}'.";
        });

        // 8. ItineraryItems
        var testItemId = $"test-item-{runId}";
        await RunTest("itinerary_items", nameof(ItineraryItem), async () =>
        {
            var item = new ItineraryItem
            {
                Id = testItemId,
                ItineraryDayId = testDayId,
                ActivityName = "Sunset Harbor Promenade",
                Location = "Colombo 01",
                StartTime = new TimeSpan(17, 0, 0),
                EndTime = new TimeSpan(19, 0, 0),
                DurationMinutes = 120,
                EstimatedCost = 0.00m,
                SequenceOrder = 1
            };
            _db.ItineraryItems.Add(item);
            await _db.SaveChangesAsync();

            var read = await _db.ItineraryItems.AsNoTracking().FirstOrDefaultAsync(i => i.Id == testItemId);
            if (read == null || read.ActivityName != item.ActivityName)
                throw new InvalidOperationException("ItineraryItem was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testItemId}', Activity '{read.ActivityName}'.";
        });

        // 9. Workflows
        await RunTest("itinerary_generation_workflows", nameof(ItineraryGenerationWorkflow), async () =>
        {
            var wf = new ItineraryGenerationWorkflow
            {
                Id = testWorkflowId,
                TripId = testTripId,
                Status = WorkflowStatus.Completed,
                CurrentStep = "Finalization",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Workflows.Add(wf);
            await _db.SaveChangesAsync();

            var read = await _db.Workflows.AsNoTracking().FirstOrDefaultAsync(w => w.Id == testWorkflowId);
            if (read == null || read.Status != WorkflowStatus.Completed)
                throw new InvalidOperationException("Workflow was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testWorkflowId}', Step '{read.CurrentStep}'.";
        });

        // 10. AuditLogs
        var testLogId = $"test-log-{runId}";
        await RunTest("workflow_audit_logs", nameof(WorkflowAuditLog), async () =>
        {
            var log = new WorkflowAuditLog
            {
                Id = testLogId,
                WorkflowId = testWorkflowId,
                Action = "PlanSynthesized",
                Actor = "TravelPlanningAgent",
                Timestamp = DateTime.UtcNow,
                Status = "Success",
                Details = "{\"status\": \"ok\"}"
            };
            _db.AuditLogs.Add(log);
            await _db.SaveChangesAsync();

            var read = await _db.AuditLogs.AsNoTracking().FirstOrDefaultAsync(l => l.Id == testLogId);
            if (read == null || read.Actor != "TravelPlanningAgent")
                throw new InvalidOperationException("WorkflowAuditLog was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testLogId}', Actor '{read.Actor}'.";
        });

        // 11. Approvals
        var testApprovalId = $"test-appr-{runId}";
        await RunTest("itinerary_approvals", nameof(ItineraryApproval), async () =>
        {
            var appr = new ItineraryApproval
            {
                Id = testApprovalId,
                ItineraryId = testItinId,
                ApprovedByUserId = testUserId,
                Action = ApprovalAction.Approved,
                PreviousStatus = ItineraryStatus.Draft,
                NewStatus = ItineraryStatus.Approved,
                Comments = "Approved for island journey.",
                Timestamp = DateTime.UtcNow
            };
            _db.Approvals.Add(appr);
            await _db.SaveChangesAsync();

            var read = await _db.Approvals.AsNoTracking().FirstOrDefaultAsync(a => a.Id == testApprovalId);
            if (read == null || read.Action != ApprovalAction.Approved)
                throw new InvalidOperationException("ItineraryApproval was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testApprovalId}', Action '{read.Action}'.";
        });

        // 12. TransportOptions
        var testTransId = $"test-trans-{runId}";
        await RunTest("transport_options", nameof(TransportOption), async () =>
        {
            var opt = new TransportOption
            {
                Id = testTransId,
                TripId = testTripId,
                TransportType = "TRAIN",
                Origin = "Colombo Fort",
                Destination = "Kandy Station",
                TravelDate = DateTime.UtcNow.Date,
                DepartureTime = "05:55 AM",
                ArrivalTime = "08:50 AM",
                EstimatedCost = 15.00m,
                Provider = "Sri Lanka Railways",
                VehicleType = "Express Train"
            };
            _db.TransportOptions.Add(opt);
            await _db.SaveChangesAsync();

            var read = await _db.TransportOptions.AsNoTracking().FirstOrDefaultAsync(o => o.Id == testTransId);
            if (read == null || read.Provider != "Sri Lanka Railways")
                throw new InvalidOperationException("TransportOption was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testTransId}', TransportType '{read.TransportType}'.";
        });

        // 13. TransportPartners
        var testPartnerId = $"test-part-{runId}";
        await RunTest("transport_partners", nameof(TransportPartner), async () =>
        {
            var p = new TransportPartner
            {
                Id = testPartnerId,
                Name = $"Ceylon Safari Express {runId}",
                Description = "Luxury 4x4 Jeep and Van tours",
                Logo = "https://images.unsplash.com/safari",
                WebsiteUrl = "https://ceylonsafari.lk",
                Discount = 10.0,
                DiscountDescription = "10% off for TourLink members",
                IsActive = true
            };
            _db.TransportPartners.Add(p);
            await _db.SaveChangesAsync();

            var read = await _db.TransportPartners.AsNoTracking().FirstOrDefaultAsync(x => x.Id == testPartnerId);
            if (read == null || read.Name != p.Name)
                throw new InvalidOperationException("TransportPartner was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testPartnerId}', Name '{read.Name}'.";
        });

        // 14. Bookings
        var testBookId = $"test-bk-{runId}";
        await RunTest("bookings", nameof(Booking), async () =>
        {
            var bk = new Booking
            {
                Id = testBookId,
                UserId = testUserId,
                TripId = testTripId,
                ServiceType = "Trip",
                ServiceName = "Kandy Cultural Tour",
                CustomerName = "Test Traveler",
                CustomerEmail = $"traveler.{runId}@test.com",
                Amount = 320.00m,
                Status = BookingStatus.Confirmed,
                BookingDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Bookings.Add(bk);
            await _db.SaveChangesAsync();

            var read = await _db.Bookings.AsNoTracking().FirstOrDefaultAsync(b => b.Id == testBookId);
            if (read == null || read.Amount != 320.00m)
                throw new InvalidOperationException("Booking was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testBookId}', Amount '{read.Amount}'.";
        });

        // 15. PromoCodes
        var testPromoId = $"test-prm-{runId}";
        var testPromoCodeStr = $"TL{runId.ToUpper()}";
        await RunTest("promo_codes", nameof(PromoCode), async () =>
        {
            var p = new PromoCode
            {
                Id = testPromoId,
                Code = testPromoCodeStr,
                DiscountType = PromoDiscountType.Percentage,
                DiscountValue = 15.0m,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(1),
                UsageLimit = 200,
                TimesUsed = 0,
                IsActive = true,
                Description = "Verification promo code",
                Partner = "TourLink",
                CreatedAt = DateTime.UtcNow
            };
            _db.PromoCodes.Add(p);
            await _db.SaveChangesAsync();

            var read = await _db.PromoCodes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == testPromoId);
            if (read == null || read.Code != testPromoCodeStr)
                throw new InvalidOperationException("PromoCode was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testPromoId}', Code '{read.Code}'.";
        });

        // 16. PromoCodeUsages
        var testUsageId = $"test-usg-{runId}";
        await RunTest("promo_code_usages", nameof(PromoCodeUsage), async () =>
        {
            var u = new PromoCodeUsage
            {
                Id = testUsageId,
                PromoCodeId = testPromoId,
                UserId = testUserId,
                DiscountApplied = 45.00m,
                UsedAt = DateTime.UtcNow
            };
            _db.PromoCodeUsages.Add(u);
            await _db.SaveChangesAsync();

            var read = await _db.PromoCodeUsages.AsNoTracking().FirstOrDefaultAsync(x => x.Id == testUsageId);
            if (read == null || read.DiscountApplied != 45.00m)
                throw new InvalidOperationException("PromoCodeUsage was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testUsageId}', Discount '{read.DiscountApplied}'.";
        });

        // 17. BusRoutes
        var testBusId = $"test-bus-{runId}";
        await RunTest("bus_routes", nameof(BusRoute), async () =>
        {
            var bus = new BusRoute
            {
                Id = testBusId,
                BusNumber = $"EX-{runId}",
                RouteName = "Colombo - Galle Southern Highway",
                Origin = "Colombo Makumbura",
                Destination = "Galle Bus Stand",
                DepartureTime = "06:30 AM",
                ArrivalTime = "07:45 AM",
                OperatingDays = "Daily",
                Fare = 850.0m,
                Status = TransportServiceStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            _db.BusRoutes.Add(bus);
            await _db.SaveChangesAsync();

            var read = await _db.BusRoutes.AsNoTracking().FirstOrDefaultAsync(b => b.Id == testBusId);
            if (read == null || read.BusNumber != bus.BusNumber)
                throw new InvalidOperationException("BusRoute was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testBusId}', BusNumber '{read.BusNumber}'.";
        });

        // 18. TrainSchedules
        var testTrainId = $"test-trn-{runId}";
        await RunTest("train_schedules", nameof(TrainSchedule), async () =>
        {
            var trn = new TrainSchedule
            {
                Id = testTrainId,
                TrainNumber = $"100{runId[..2]}",
                TrainName = "Udarata Menike Highland Express",
                Origin = "Colombo Fort",
                Destination = "Badulla via Ella",
                DepartureTime = "05:55 AM",
                ArrivalTime = "03:15 PM",
                TrainType = "Observation Saloon",
                OperatingDays = "Daily",
                Fare = 1200.0m,
                Status = TransportServiceStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            _db.TrainSchedules.Add(trn);
            await _db.SaveChangesAsync();

            var read = await _db.TrainSchedules.AsNoTracking().FirstOrDefaultAsync(t => t.Id == testTrainId);
            if (read == null || read.TrainName != trn.TrainName)
                throw new InvalidOperationException("TrainSchedule was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testTrainId}', Train '{read.TrainName}'.";
        });

        // 19. ChatbotPackages
        var testPkgId = $"test-pkg-{runId}";
        await RunTest("chatbot_packages", nameof(ChatbotPackage), async () =>
        {
            var pkg = new ChatbotPackage
            {
                Id = testPkgId,
                Name = $"AI Smart Guide {runId}",
                Description = "30-day unlimited AI recommendations",
                Price = 14.99m,
                QuestionLimit = 150,
                DurationDays = 30,
                Status = PackageStatus.Active,
                IncludesPhotoQueries = true,
                CreatedAt = DateTime.UtcNow
            };
            _db.ChatbotPackages.Add(pkg);
            await _db.SaveChangesAsync();

            var read = await _db.ChatbotPackages.AsNoTracking().FirstOrDefaultAsync(p => p.Id == testPkgId);
            if (read == null || read.Price != 14.99m)
                throw new InvalidOperationException("ChatbotPackage was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testPkgId}', Price '{read.Price}'.";
        });

        // 20. ChatbotPackagePurchases
        var testPurchId = $"test-pur-{runId}";
        await RunTest("chatbot_package_purchases", nameof(ChatbotPackagePurchase), async () =>
        {
            var pur = new ChatbotPackagePurchase
            {
                Id = testPurchId,
                UserId = testUserId,
                PackageId = testPkgId,
                Price = 14.99m,
                RemainingQueries = 150,
                PurchaseDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddDays(30),
                Status = PurchaseStatus.Active
            };
            _db.ChatbotPackagePurchases.Add(pur);
            await _db.SaveChangesAsync();

            var read = await _db.ChatbotPackagePurchases.AsNoTracking().FirstOrDefaultAsync(x => x.Id == testPurchId);
            if (read == null || read.RemainingQueries != 150)
                throw new InvalidOperationException("ChatbotPackagePurchase was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testPurchId}', Remaining '{read.RemainingQueries}'.";
        });

        // 21. AIChatSessions
        var testChatSessId = $"test-sess-{runId}";
        await RunTest("ai_chat_sessions", nameof(AIChatSession), async () =>
        {
            var sess = new AIChatSession
            {
                Id = testChatSessId,
                UserId = testUserId,
                PackageId = testPkgId,
                Topic = "Best whale watching in Mirissa",
                QueryCount = 4,
                Status = ChatSessionStatus.Active,
                StartedAt = DateTime.UtcNow,
                LastActivityAt = DateTime.UtcNow
            };
            _db.AIChatSessions.Add(sess);
            await _db.SaveChangesAsync();

            var read = await _db.AIChatSessions.AsNoTracking().FirstOrDefaultAsync(s => s.Id == testChatSessId);
            if (read == null || read.Topic != sess.Topic)
                throw new InvalidOperationException("AIChatSession was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testChatSessId}', Topic '{read.Topic}'.";
        });

        // 22. AIPhotoQueries
        var testPhotoId = $"test-pht-{runId}";
        await RunTest("ai_photo_queries", nameof(AIPhotoQuery), async () =>
        {
            var query = new AIPhotoQuery
            {
                Id = testPhotoId,
                UserId = testUserId,
                DestinationName = "Nine Arches Bridge",
                Category = "Landmark",
                IsSuccess = true,
                LatencyMs = 380,
                QueryDate = DateTime.UtcNow
            };
            _db.AIPhotoQueries.Add(query);
            await _db.SaveChangesAsync();

            var read = await _db.AIPhotoQueries.AsNoTracking().FirstOrDefaultAsync(q => q.Id == testPhotoId);
            if (read == null || read.DestinationName != query.DestinationName)
                throw new InvalidOperationException("AIPhotoQuery was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testPhotoId}', Dest '{read.DestinationName}'.";
        });

        // 23. Reviews
        var testRevId = $"test-rev-{runId}";
        await RunTest("reviews", nameof(Review), async () =>
        {
            var rev = new Review
            {
                Id = testRevId,
                UserId = testUserId,
                DestinationId = testDestId,
                Rating = 5,
                Comment = "Incredible scenic views, highly recommended!",
                SentimentLabel = "Positive",
                SentimentScore = 0.96,
                Status = ReviewStatus.Published,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Reviews.Add(rev);
            await _db.SaveChangesAsync();

            var read = await _db.Reviews.AsNoTracking().FirstOrDefaultAsync(r => r.Id == testRevId);
            if (read == null || read.Rating != 5)
                throw new InvalidOperationException("Review was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testRevId}', Rating '{read.Rating}'.";
        });

        // 24. ReviewHelpfulVotes
        await RunTest("review_helpful_votes", nameof(ReviewHelpfulVote), async () =>
        {
            var vote = new ReviewHelpfulVote
            {
                ReviewId = testRevId,
                TouristId = testUserId
            };
            _db.ReviewHelpfulVotes.Add(vote);
            await _db.SaveChangesAsync();

            var read = await _db.ReviewHelpfulVotes.AsNoTracking().FirstOrDefaultAsync(x => x.ReviewId == testRevId && x.TouristId == testUserId);
            if (read == null)
                throw new InvalidOperationException("ReviewHelpfulVote was not stored correctly.");

            return $"Verified composite key INSERT & SELECT: Review '{testRevId}' -> Tourist '{testUserId}'.";
        });

        // 25. ChatbotPayments
        var testCbPayId = $"test-cbpay-{runId}";
        await RunTest("chatbot_payments", nameof(ChatbotPayment), async () =>
        {
            var p = new ChatbotPayment
            {
                Id = testCbPayId,
                PurchaseId = testPurchId,
                UserId = testUserId,
                PackageName = "AI Smart Guide",
                Amount = 14.99m,
                PaymentMethod = "Credit Card",
                MaskedCardNumber = "**** **** **** 4242",
                TransactionReference = $"TXN-CB-{runId}",
                Status = PaymentStatus.Successful,
                CreatedAt = DateTime.UtcNow
            };
            _db.ChatbotPayments.Add(p);
            await _db.SaveChangesAsync();

            var read = await _db.ChatbotPayments.AsNoTracking().FirstOrDefaultAsync(x => x.Id == testCbPayId);
            if (read == null || read.Amount != 14.99m)
                throw new InvalidOperationException("ChatbotPayment was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testCbPayId}', Amount '{read.Amount}'.";
        });

        // 26. PromoPayments
        var testPmPayId = $"test-pmpay-{runId}";
        await RunTest("promo_payments", nameof(PromoPayment), async () =>
        {
            var pay = new PromoPayment
            {
                Id = testPmPayId,
                PromoCodeId = testPromoId,
                UserId = testUserId,
                PromoCode = testPromoCodeStr,
                AmountPaid = 85.00m,
                PaymentMethod = "Card / Online",
                MaskedCardNumber = "**** **** **** 8821",
                TransactionReference = $"TXN-PM-{runId}",
                Status = PaymentStatus.Successful,
                PromoCodeStatus = "Active",
                CreatedAt = DateTime.UtcNow
            };
            _db.PromoPayments.Add(pay);
            await _db.SaveChangesAsync();

            var read = await _db.PromoPayments.AsNoTracking().FirstOrDefaultAsync(x => x.Id == testPmPayId);
            if (read == null || read.AmountPaid != 85.00m)
                throw new InvalidOperationException("PromoPayment was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testPmPayId}', Paid '{read.AmountPaid}'.";
        });

        // 27. SystemActivities
        var testSysActId = $"test-act-{runId}";
        await RunTest("system_activities", nameof(SystemActivity), async () =>
        {
            var act = new SystemActivity
            {
                Id = testSysActId,
                ActivityType = "DATABASE_VERIFICATION",
                Description = "Verified Supabase cloud storage for all tables",
                ActorName = "Cloud Tester",
                ActorRole = "System",
                Severity = "Info",
                Timestamp = DateTime.UtcNow
            };
            _db.SystemActivities.Add(act);
            await _db.SaveChangesAsync();

            var read = await _db.SystemActivities.AsNoTracking().FirstOrDefaultAsync(x => x.Id == testSysActId);
            if (read == null || read.ActivityType != act.ActivityType)
                throw new InvalidOperationException("SystemActivity was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{testSysActId}', Type '{read.ActivityType}'.";
        });

        // 28. Guides
        Guide? createdGuide = null;
        await RunTest("guides", nameof(Guide), async () =>
        {
            createdGuide = new Guide
            {
                UserId = testUserId,
                Name = $"Certified Island Guide {runId}",
                Email = testGuideEmail,
                Phone = "+94771234567",
                Bio = "Licensed cultural heritage and trekking guide.",
                Languages = new List<string> { "English", "Sinhala", "German" },
                Specialties = new List<string> { "Cultural", "Hiking" },
                YearsExperience = 8,
                VerificationStatus = GuideVerificationStatus.Verified,
                RatingAvg = 4.95m,
                RatingCount = 34,
                ToursCompleted = 120,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Guides.Add(createdGuide);
            await _db.SaveChangesAsync();

            var read = await _db.Guides.AsNoTracking().FirstOrDefaultAsync(g => g.Email == testGuideEmail);
            if (read == null || read.Name != createdGuide.Name)
                throw new InvalidOperationException("Guide was not stored correctly in Supabase.");

            return $"Verified INSERT & SELECT: Generated ID '{read.Id}', Name '{read.Name}'.";
        });

        // 29. GuideAvailabilities
        await RunTest("guide_availabilities", nameof(GuideAvailability), async () =>
        {
            if (createdGuide == null) throw new InvalidOperationException("Pre-requisite Guide missing.");

            var avail = new GuideAvailability
            {
                GuideId = createdGuide.Id,
                AvailableDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5)),
                StartTime = new TimeOnly(9, 0),
                EndTime = new TimeOnly(17, 0),
                IsBooked = false
            };
            _db.GuideAvailabilities.Add(avail);
            await _db.SaveChangesAsync();

            var read = await _db.GuideAvailabilities.AsNoTracking().FirstOrDefaultAsync(a => a.GuideId == createdGuide.Id);
            if (read == null || read.IsBooked != false)
                throw new InvalidOperationException("GuideAvailability was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{read.AvailabilityId}', Guide '{read.GuideId}'.";
        });

        // 30. TourPackages
        TourPackage? createdTourPkg = null;
        await RunTest("tour_packages", nameof(TourPackage), async () =>
        {
            if (createdGuide == null) throw new InvalidOperationException("Pre-requisite Guide missing.");

            createdTourPkg = new TourPackage
            {
                GuideId = createdGuide.Id,
                PackageName = $"Sigiriya Heritage Expedition {runId}",
                Description = "Private guided fortress exploration",
                Destination = "Sigiriya",
                DurationDays = 1,
                Price = 120.00m,
                MaxGroupSize = 6,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _db.TourPackages.Add(createdTourPkg);
            await _db.SaveChangesAsync();

            var read = await _db.TourPackages.AsNoTracking().FirstOrDefaultAsync(p => p.GuideId == createdGuide.Id && p.PackageName == createdTourPkg.PackageName);
            if (read == null || read.Price != 120.00m)
                throw new InvalidOperationException("TourPackage was not stored correctly.");

            return $"Verified INSERT & SELECT: TourPackageId '{read.TourPackageId}', Price '{read.Price}'.";
        });

        // 31. TourOperations
        await RunTest("tour_operations", nameof(TourOperation), async () =>
        {
            if (createdGuide == null || createdTourPkg == null) throw new InvalidOperationException("Pre-requisites missing.");

            var op = new TourOperation
            {
                TourPackageId = createdTourPkg.TourPackageId,
                GuideId = createdGuide.Id,
                ScheduledDate = DateTime.UtcNow.AddDays(10),
                NumberOfTourists = 4,
                TotalCost = 480.00m,
                Status = TourOperationStatus.Scheduled,
                Notes = "Private family excursion.",
                CreatedAt = DateTime.UtcNow
            };
            _db.TourOperations.Add(op);
            await _db.SaveChangesAsync();

            var read = await _db.TourOperations.AsNoTracking().FirstOrDefaultAsync(o => o.TourPackageId == createdTourPkg.TourPackageId && o.GuideId == createdGuide.Id);
            if (read == null || read.TotalCost != 480.00m)
                throw new InvalidOperationException("TourOperation was not stored correctly.");

            return $"Verified INSERT & SELECT: ID '{read.TourOperationId}', Status '{read.Status}'.";
        });

        // 32. RecommendationSettings
        await RunTest("recommendation_settings", nameof(RecommendationSettings), async () =>
        {
            var setting = await _db.RecommendationSettings.FirstOrDefaultAsync();
            if (setting == null)
            {
                setting = new RecommendationSettings
                {
                    InterestWeight = 30.0m,
                    RatingWeight = 25.0m,
                    BudgetWeight = 15.0m,
                    DistanceWeight = 15.0m,
                    PopularityWeight = 10.0m,
                    HistoryWeight = 5.0m,
                    MinReviewCountToRank = 0,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = "SystemVerifier"
                };
                _db.RecommendationSettings.Add(setting);
                await _db.SaveChangesAsync();
            }
            else
            {
                setting.UpdatedBy = $"Verified-{runId}";
                setting.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }

            var read = await _db.RecommendationSettings.AsNoTracking().FirstOrDefaultAsync();
            if (read == null)
                throw new InvalidOperationException("RecommendationSettings was not stored correctly.");

            return $"Verified Record ID '{read.Id}', Interest '{read.InterestWeight}%', UpdatedBy '{read.UpdatedBy}'.";
        });

        // ── Clean up test records to keep Supabase pristine ──
        _db.ChangeTracker.Clear();
        try
        {
            // Remove dependent children first
            var testVoteObj = await _db.ReviewHelpfulVotes.FirstOrDefaultAsync(x => x.ReviewId == testRevId && x.TouristId == testUserId);
            if (testVoteObj != null) _db.ReviewHelpfulVotes.Remove(testVoteObj);

            var testRevObj = await _db.Reviews.FirstOrDefaultAsync(x => x.Id == testRevId);
            if (testRevObj != null) _db.Reviews.Remove(testRevObj);

            var testCbPayObj = await _db.ChatbotPayments.FirstOrDefaultAsync(x => x.Id == testCbPayId);
            if (testCbPayObj != null) _db.ChatbotPayments.Remove(testCbPayObj);

            var testSessObj = await _db.AIChatSessions.FirstOrDefaultAsync(x => x.Id == testChatSessId);
            if (testSessObj != null) _db.AIChatSessions.Remove(testSessObj);

            var testPurchObj = await _db.ChatbotPackagePurchases.FirstOrDefaultAsync(x => x.Id == testPurchId);
            if (testPurchObj != null) _db.ChatbotPackagePurchases.Remove(testPurchObj);

            var testPkgObj = await _db.ChatbotPackages.FirstOrDefaultAsync(x => x.Id == testPkgId);
            if (testPkgObj != null) _db.ChatbotPackages.Remove(testPkgObj);

            var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == testUserId);
            if (u != null) _db.Users.Remove(u);

            var d = await _db.Destinations.FirstOrDefaultAsync(x => x.Id == testDestId);
            if (d != null) _db.Destinations.Remove(d);

            if (createdGuide != null)
            {
                var ops = await _db.TourOperations.Where(x => x.GuideId == createdGuide.Id).ToListAsync();
                if (ops.Count > 0) _db.TourOperations.RemoveRange(ops);

                var pkgs = await _db.TourPackages.Where(x => x.GuideId == createdGuide.Id).ToListAsync();
                if (pkgs.Count > 0) _db.TourPackages.RemoveRange(pkgs);

                var avails = await _db.GuideAvailabilities.Where(x => x.GuideId == createdGuide.Id).ToListAsync();
                if (avails.Count > 0) _db.GuideAvailabilities.RemoveRange(avails);
            }

            var g = await _db.Guides.FirstOrDefaultAsync(x => x.Email == testGuideEmail);
            if (g != null) _db.Guides.Remove(g);

            var pmPay = await _db.PromoPayments.FirstOrDefaultAsync(x => x.Id == testPmPayId);
            if (pmPay != null) _db.PromoPayments.Remove(pmPay);

            var pmUsg = await _db.PromoCodeUsages.FirstOrDefaultAsync(x => x.Id == testUsageId);
            if (pmUsg != null) _db.PromoCodeUsages.Remove(pmUsg);

            var testPromoObj = await _db.PromoCodes.FirstOrDefaultAsync(x => x.Id == testPromoId);
            if (testPromoObj != null) _db.PromoCodes.Remove(testPromoObj);

            var testBusObj = await _db.BusRoutes.FirstOrDefaultAsync(x => x.Id == testBusId);
            if (testBusObj != null) _db.BusRoutes.Remove(testBusObj);

            var testTrainObj = await _db.TrainSchedules.FirstOrDefaultAsync(x => x.Id == testTrainId);
            if (testTrainObj != null) _db.TrainSchedules.Remove(testTrainObj);

            var testPartObj = await _db.TransportPartners.FirstOrDefaultAsync(x => x.Id == testPartnerId);
            if (testPartObj != null) _db.TransportPartners.Remove(testPartObj);

            var testActObj = await _db.SystemActivities.FirstOrDefaultAsync(x => x.Id == testSysActId);
            if (testActObj != null) _db.SystemActivities.Remove(testActObj);

            await _db.SaveChangesAsync();
        }
        catch (Exception cleanEx)
        {
            _logger.LogWarning(cleanEx, "[Cleanup Note] Non-critical test entity cleanup notice");
        }

        totalSw.Stop();

        var passedCount = testResults.Count(r => r.Passed);
        var failedCount = testResults.Count(r => !r.Passed);

        return Ok(new
        {
            success = failedCount == 0,
            database = "Supabase Cloud PostgreSQL",
            host = "aws-0-ap-northeast-1.pooler.supabase.com",
            totalTablesTested = testResults.Count,
            passedCount,
            failedCount,
            totalDurationMs = totalSw.ElapsedMilliseconds,
            allTablesVerified = failedCount == 0,
            results = testResults
        });
    }
}
