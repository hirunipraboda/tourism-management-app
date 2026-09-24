using Microsoft.EntityFrameworkCore;
using Nova.Api.Entities;

namespace Nova.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(NovaDbContext db)
    {
        // 1. Seed Users
        var usersToEnsure = new List<User>
        {
            new() { Id = "user-tourist-1", Name = "Hiruni Praboda", Email = "hiruni@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), Role = UserRole.Tourist, CreatedAt = DateTime.UtcNow.AddDays(-30) },
            new() { Id = "user-kasun", Name = "Kasun Perera", Email = "kasun@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), Role = UserRole.Tourist, CreatedAt = DateTime.UtcNow.AddDays(-25) },
            new() { Id = "user-nimal", Name = "Nimal Fernando", Email = "nimal@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), Role = UserRole.Tourist, CreatedAt = DateTime.UtcNow.AddDays(-18) },
            new() { Id = "user-tourist-2", Name = "David Miller", Email = "david@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), Role = UserRole.Tourist, CreatedAt = DateTime.UtcNow.AddDays(-20) },
            new() { Id = "user-tourist-3", Name = "Elena Rostova", Email = "elena@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), Role = UserRole.Tourist, CreatedAt = DateTime.UtcNow.AddDays(-15) },
            new() { Id = "user-operator-1", Name = "Bob Operator", Email = "operator@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), Role = UserRole.TourismOperator, CreatedAt = DateTime.UtcNow.AddDays(-40) },
            new() { Id = "user-admin-1", Name = "Charlie Admin", Email = "admin@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), Role = UserRole.Admin, CreatedAt = DateTime.UtcNow.AddDays(-60) }
        };

        foreach (var u in usersToEnsure)
        {
            if (!await db.Users.AnyAsync(existing => existing.Id == u.Id || existing.Email == u.Email))
            {
                db.Users.Add(u);
            }
        }
        await db.SaveChangesAsync();

        // 2. Seed Destinations & Activities
        if (!await db.Destinations.AnyAsync())
        {
            var sigiriya = new Destination
            {
                Id = "dest-sigiriya",
                Name = "Sigiriya",
                Slug = "sigiriya-citadel",
                Description = "Ancient palace and fortress complex recognized as an 8th wonder of the world.",
                Location = "Matale District",
                Province = "Central",
                ImageUrl = "https://images.unsplash.com/photo-1588598198321-9735fd52455d",
                Rating = 4.9,
                Activities = [
                    new()
                    {
                        Id = "act-sigiriya-climb",
                        Name = "Sigiriya Rock Citadel Fortress Climb",
                        Description = "Climb past mirror wall and ancient frescoes to royal palace ruins.",
                        Category = "culture",
                        CostPerPerson = 30.0m,
                        DurationMinutes = 180,
                        OpeningTime = new TimeSpan(6, 30, 0),
                        ClosingTime = new TimeSpan(17, 30, 0)
                    },
                    new()
                    {
                        Id = "act-sigiriya-village",
                        Name = "Authentic Village Bullock Cart & Lunch",
                        Description = "Catamaran ride, bullock cart, and traditional rice & curry on banana leaves.",
                        Category = "culture",
                        CostPerPerson = 15.0m,
                        DurationMinutes = 120,
                        OpeningTime = new TimeSpan(11, 0, 0),
                        ClosingTime = new TimeSpan(15, 0, 0)
                    },
                    new()
                    {
                        Id = "act-pidurangala",
                        Name = "Pidurangala Rock Sunset Viewpoint",
                        Description = "Hike to panoramic 360-degree viewpoint overlooking Sigiriya rock.",
                        Category = "nature",
                        CostPerPerson = 5.0m,
                        DurationMinutes = 120,
                        OpeningTime = new TimeSpan(5, 0, 0),
                        ClosingTime = new TimeSpan(19, 0, 0)
                    }
                ]
            };

            var kandy = new Destination
            {
                Id = "dest-kandy",
                Name = "Kandy",
                Slug = "kandy-sacred-city",
                Description = "Last royal capital of Sri Lanka, home to the Temple of the Sacred Tooth Relic.",
                Location = "Kandy District",
                Province = "Central",
                ImageUrl = "https://images.unsplash.com/photo-1546708973-b339540b5162",
                Rating = 4.8,
                Activities = [
                    new()
                    {
                        Id = "act-tooth-relic",
                        Name = "Temple of the Sacred Tooth Relic",
                        Description = "Venerated Buddhist shrine holding Buddha's tooth relic.",
                        Category = "culture",
                        CostPerPerson = 10.0m,
                        DurationMinutes = 120,
                        OpeningTime = new TimeSpan(5, 30, 0),
                        ClosingTime = new TimeSpan(20, 0, 0)
                    },
                    new()
                    {
                        Id = "act-botanical",
                        Name = "Royal Botanical Gardens Botanical Walk",
                        Description = "147 acres of tropical orchid collections and historic palm avenues.",
                        Category = "nature",
                        CostPerPerson = 12.0m,
                        DurationMinutes = 150,
                        OpeningTime = new TimeSpan(8, 0, 0),
                        ClosingTime = new TimeSpan(17, 30, 0)
                    },
                    new()
                    {
                        Id = "act-kandyan-dance",
                        Name = "Traditional Kandyan Cultural Dance Show",
                        Description = "Ceremonial fire-walking and rhythmic Kandyan drumming.",
                        Category = "culture",
                        CostPerPerson = 10.0m,
                        DurationMinutes = 90,
                        OpeningTime = new TimeSpan(17, 0, 0),
                        ClosingTime = new TimeSpan(19, 30, 0)
                    }
                ]
            };

            var ella = new Destination
            {
                Id = "dest-ella",
                Name = "Ella",
                Slug = "ella-mountain-gap",
                Description = "Scenic mountain village known for Nine Arches Bridge and misty tea gardens.",
                Location = "Badulla District",
                Province = "Uva",
                ImageUrl = "https://images.unsplash.com/photo-1546708973-b339540b5162",
                Rating = 4.8,
                Activities = [
                    new()
                    {
                        Id = "act-nine-arches",
                        Name = "Demodara Nine Arches Viaduct Bridge",
                        Description = "Watch the blue mountain train cross the colonial viaduct bridge.",
                        Category = "nature",
                        CostPerPerson = 0.0m,
                        DurationMinutes = 120,
                        OpeningTime = new TimeSpan(6, 0, 0),
                        ClosingTime = new TimeSpan(18, 0, 0)
                    },
                    new()
                    {
                        Id = "act-adams-peak",
                        Name = "Little Adam's Peak Mountain Trek",
                        Description = "Gentle mountain trail with 360-degree views across Ella Gap.",
                        Category = "nature",
                        CostPerPerson = 0.0m,
                        DurationMinutes = 150,
                        OpeningTime = new TimeSpan(6, 0, 0),
                        ClosingTime = new TimeSpan(18, 0, 0)
                    }
                ]
            };

            var galle = new Destination
            {
                Id = "dest-galle",
                Name = "Galle",
                Slug = "galle-fort",
                Description = "16th-century Portuguese and Dutch colonial seaside fortress with cobblestone ramparts.",
                Location = "Galle District",
                Province = "Southern",
                ImageUrl = "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
                Rating = 4.9,
                Activities = [
                    new()
                    {
                        Id = "act-galle-ramparts",
                        Name = "Dutch Fort Ramparts Sunset Walk",
                        Description = "Walk along ancient bastions, lighthouse, and maritime clocktower.",
                        Category = "culture",
                        CostPerPerson = 0.0m,
                        DurationMinutes = 120,
                        OpeningTime = new TimeSpan(6, 0, 0),
                        ClosingTime = new TimeSpan(21, 0, 0)
                    }
                ]
            };

            db.Destinations.AddRange(sigiriya, kandy, ella, galle);
            await db.SaveChangesAsync();
        }

        if (!await db.Destinations.AnyAsync(d => d.Id == "dest-galle"))
        {
            db.Destinations.Add(new Destination
            {
                Id = "dest-galle",
                Name = "Galle",
                Slug = "galle-fort",
                Description = "16th-century Portuguese and Dutch colonial seaside fortress with cobblestone ramparts.",
                Location = "Galle District",
                Province = "Southern",
                ImageUrl = "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
                Rating = 4.9,
                Activities = [
                    new()
                    {
                        Id = "act-galle-ramparts",
                        Name = "Dutch Fort Ramparts Sunset Walk",
                        Description = "Walk along ancient bastions, lighthouse, and maritime clocktower.",
                        Category = "culture",
                        CostPerPerson = 0.0m,
                        DurationMinutes = 120,
                        OpeningTime = new TimeSpan(6, 0, 0),
                        ClosingTime = new TimeSpan(21, 0, 0)
                    }
                ]
            });
            await db.SaveChangesAsync();
        }

        // 3. Seed Trips with AI Workflows & User Approval states
        try
        {
            if (!await db.Trips.AnyAsync(t => t.Id == "trip-ai-001"))
            {
            var trip1 = new Trip
            {
                Id = "trip-ai-001",
                UserId = "user-tourist-1",
                Destination = "Sigiriya & Kandy",
                DestinationId = "dest-sigiriya",
                StartDate = DateTime.UtcNow.AddDays(7),
                EndDate = DateTime.UtcNow.AddDays(10),
                NumberOfTravelers = 2,
                Budget = 750.0m,
                Interests = ["culture", "nature"],
                TripStyle = "standard",
                Status = TripStatus.Planned,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            };

            var itin1 = new Itinerary
            {
                Id = "itin-001",
                TripId = trip1.Id,
                Title = "Cultural Triangle Highlights",
                Status = ItineraryStatus.PendingApproval,
                TotalEstimatedCost = 420.0m,
                FeasibilityScore = 96.0,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            };

            var wf1 = new ItineraryGenerationWorkflow
            {
                Id = "wf-ai-891",
                TripId = trip1.Id,
                Status = WorkflowStatus.PendingApproval,
                CurrentStep = "Waiting for User Approval",
                ConstraintsJson = "{\"budget\": 750, \"maxPace\": \"balanced\", \"transport\": \"Bus + Train\"}",
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                UpdatedAt = DateTime.UtcNow.AddDays(-1),
                AuditLogs = [
                    new() { Action = "PlanningStarted", Actor = "TravelPlanningAgent", Status = "SUCCESS", Timestamp = DateTime.UtcNow.AddDays(-2).AddMinutes(1), Details = "Day slots generated" },
                    new() { Action = "ResearchCompleted", Actor = "DestinationResearchAgent", Status = "SUCCESS", Timestamp = DateTime.UtcNow.AddDays(-2).AddMinutes(3), Details = "Sigiriya tickets & opening hours verified" },
                    new() { Action = "LogisticsScheduled", Actor = "TravelLogisticsAgent", Status = "SUCCESS", Timestamp = DateTime.UtcNow.AddDays(-2).AddMinutes(5), Details = "Podi Menike train option mapped" },
                    new() { Action = "ValidationPassed", Actor = "DeterministicValidator", Status = "SUCCESS", Timestamp = DateTime.UtcNow.AddDays(-2).AddMinutes(6), Details = "All 8 deterministic checks PASSED" },
                    new() { Action = "SubmittedForApproval", Actor = "System", Status = "WAITING_FOR_USER_APPROVAL", Timestamp = DateTime.UtcNow.AddDays(-1), Details = "Awaiting decision from Alice Tourist" }
                ]
            };

            // Trip 2: Approved by user
            var trip2 = new Trip
            {
                Id = "trip-ai-002",
                UserId = "user-tourist-2",
                Destination = "Ella Mountain Gap",
                DestinationId = "dest-ella",
                StartDate = DateTime.UtcNow.AddDays(14),
                EndDate = DateTime.UtcNow.AddDays(17),
                NumberOfTravelers = 1,
                Budget = 400.0m,
                Interests = ["nature", "hiking"],
                TripStyle = "relaxed",
                Status = TripStatus.Confirmed,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                UpdatedAt = DateTime.UtcNow.AddDays(-4)
            };

            var itin2 = new Itinerary
            {
                Id = "itin-002",
                TripId = trip2.Id,
                Title = "Ella Scenic Trails & Bridges",
                Status = ItineraryStatus.Approved,
                TotalEstimatedCost = 280.0m,
                FeasibilityScore = 98.0,
                ApprovedByUserId = "user-tourist-2",
                ApprovedAt = DateTime.UtcNow.AddDays(-4),
                ApprovalComments = "Approved by tourist without changes.",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                UpdatedAt = DateTime.UtcNow.AddDays(-4),
                Approvals = [
                    new()
                    {
                        Id = "appr-002",
                        ItineraryId = "itin-002",
                        ApprovedByUserId = "user-tourist-2",
                        Action = ApprovalAction.Approved,
                        PreviousStatus = ItineraryStatus.PendingApproval,
                        NewStatus = ItineraryStatus.Approved,
                        Comments = "Looks perfect, cannot wait for the Nine Arches train ride!",
                        Timestamp = DateTime.UtcNow.AddDays(-4)
                    }
                ]
            };

            // Trip 3: Revision Requested by user
            var trip3 = new Trip
            {
                Id = "trip-ai-003",
                UserId = "user-tourist-3",
                Destination = "Galle & Mirissa",
                DestinationId = "dest-galle",
                StartDate = DateTime.UtcNow.AddDays(20),
                EndDate = DateTime.UtcNow.AddDays(24),
                NumberOfTravelers = 3,
                Budget = 900.0m,
                Interests = ["beach", "culture"],
                TripStyle = "luxury",
                Status = TripStatus.Planned,
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                UpdatedAt = DateTime.UtcNow.AddHours(-5)
            };

            var itin3 = new Itinerary
            {
                Id = "itin-003",
                TripId = trip3.Id,
                Title = "Southern Coast Explorer",
                Status = ItineraryStatus.RevisionRequired,
                TotalEstimatedCost = 820.0m,
                FeasibilityScore = 92.0,
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                UpdatedAt = DateTime.UtcNow.AddHours(-5),
                Approvals = [
                    new()
                    {
                        Id = "appr-003",
                        ItineraryId = "itin-003",
                        ApprovedByUserId = "user-tourist-3",
                        Action = ApprovalAction.RevisionRequested,
                        PreviousStatus = ItineraryStatus.PendingApproval,
                        NewStatus = ItineraryStatus.RevisionRequired,
                        Comments = "I want fewer activities on the second day so we have more beach relaxation time in Mirissa.",
                        Timestamp = DateTime.UtcNow.AddHours(-5)
                    }
                ]
            };

            db.Trips.AddRange(trip1, trip2, trip3);
            db.Itineraries.AddRange(itin1, itin2, itin3);
            db.Workflows.Add(wf1);
            await db.SaveChangesAsync();
        }

        // Ensure User-Created trip exists (TR002: Kasun Perera - Ella - User Created - Active)
        if (!await db.Trips.AnyAsync(t => t.Id == "trip-user-002"))
        {
            var tripKasun = new Trip
            {
                Id = "trip-user-002",
                UserId = "user-kasun",
                Destination = "Ella",
                DestinationId = "dest-ella",
                StartDate = DateTime.UtcNow.AddDays(5),
                EndDate = DateTime.UtcNow.AddDays(9),
                NumberOfTravelers = 2,
                Budget = 550.0m,
                Interests = ["hiking", "scenic"],
                TripStyle = "active",
                Status = TripStatus.Planned,
                CreatedAt = DateTime.UtcNow.AddDays(-4),
                UpdatedAt = DateTime.UtcNow.AddDays(-2)
            };

            var itinKasun = new Itinerary
            {
                Id = "itin-kasun-002",
                TripId = tripKasun.Id,
                Title = "Ella Mountain Gap & High Trails",
                Status = ItineraryStatus.Draft,
                TotalEstimatedCost = 310.0m,
                FeasibilityScore = 95.0,
                CreatedAt = DateTime.UtcNow.AddDays(-4),
                UpdatedAt = DateTime.UtcNow.AddDays(-2)
            };

            db.Trips.Add(tripKasun);
            db.Itineraries.Add(itinKasun);
            await db.SaveChangesAsync();
        }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Seed Trips Warning]: {ex.Message}");
        }

        // 4. Seed Bookings
        try
        {
            if (!await db.Bookings.AnyAsync())
            {
                db.Bookings.AddRange(
                    new Booking
                    {
                        Id = "bkg-1001",
                        UserId = "user-tourist-1",
                        TripId = null,
                        ServiceType = "Trip",
                        ServiceName = "Cultural Triangle 4-Day Tour",
                        CustomerName = "Alice Tourist",
                        CustomerEmail = "alice@example.com",
                        Amount = 420.0m,
                        Status = BookingStatus.Confirmed,
                        BookingDate = DateTime.UtcNow.AddDays(-2),
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    },
                    new Booking
                    {
                        Id = "bkg-1002",
                        UserId = "user-tourist-2",
                        TripId = null,
                        ServiceType = "Trip",
                        ServiceName = "Ella Mountain Getaway",
                        CustomerName = "David Miller",
                        CustomerEmail = "david@example.com",
                        Amount = 280.0m,
                        Status = BookingStatus.Completed,
                        BookingDate = DateTime.UtcNow.AddDays(-10),
                        CreatedAt = DateTime.UtcNow.AddDays(-10)
                    },
                    new Booking
                    {
                        Id = "bkg-1003",
                        UserId = "user-tourist-3",
                        ServiceType = "AI_Guide",
                        ServiceName = "Island Pro AI Travel Guide Package",
                        CustomerName = "Elena Rostova",
                        CustomerEmail = "elena@example.com",
                        Amount = 14.99m,
                        Status = BookingStatus.Confirmed,
                        BookingDate = DateTime.UtcNow.AddDays(-1),
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    }
                );
                await db.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Seed Bookings Warning]: {ex.Message}");
        }

        // 5. Seed Transportation: Promo Codes, Bus Routes, Train Schedules
        if (!await db.PromoCodes.AnyAsync())
        {
            var p1 = new PromoCode
            {
                Id = "promo-nova10",
                Code = "NOVA10",
                DiscountType = PromoDiscountType.Percentage,
                DiscountValue = 10.0m,
                StartDate = DateTime.UtcNow.AddDays(-15),
                EndDate = DateTime.UtcNow.AddMonths(2),
                UsageLimit = 500,
                TimesUsed = 154,
                IsActive = true,
                Description = "10% off travel vouchers and tourist bookings",
                Partner = "TourLink",
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            };

            var p2 = new PromoCode
            {
                Id = "promo-sl2026",
                Code = "SRILANKA2026",
                DiscountType = PromoDiscountType.FixedAmount,
                DiscountValue = 500.0m, // LKR 500
                StartDate = DateTime.UtcNow.AddDays(-5),
                EndDate = DateTime.UtcNow.AddMonths(1),
                UsageLimit = 200,
                TimesUsed = 42,
                IsActive = true,
                Description = "LKR 500 discount for intercity travel across Central Province",
                Partner = "TourLink",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            };

            db.PromoCodes.AddRange(p1, p2);
            await db.SaveChangesAsync();

            // Seed sample promo usage
            db.PromoCodeUsages.AddRange(
                new PromoCodeUsage
                {
                    Id = "usage-1",
                    PromoCodeId = p1.Id,
                    UserId = "user-tourist-1",
                    TripId = "trip-ai-001",
                    DiscountApplied = 42.0m,
                    UsedAt = DateTime.UtcNow.AddDays(-2)
                },
                new PromoCodeUsage
                {
                    Id = "usage-2",
                    PromoCodeId = p2.Id,
                    UserId = "user-tourist-2",
                    TripId = "trip-ai-002",
                    DiscountApplied = 500.0m,
                    UsedAt = DateTime.UtcNow.AddDays(-1)
                }
            );
            await db.SaveChangesAsync();
        }

        if (!await db.BusRoutes.AnyAsync())
        {
            db.BusRoutes.AddRange(
                new BusRoute
                {
                    Id = "bus-01",
                    BusNumber = "01",
                    RouteName = "Colombo - Kandy AC Highway Express",
                    Origin = "Colombo Bastian Mawatha",
                    Destination = "Kandy Goodshed Terminal",
                    DepartureTime = "05:30 AM",
                    ArrivalTime = "08:45 AM",
                    OperatingDays = "Daily (Every 30 mins)",
                    Fare = 480.0m,
                    Status = TransportServiceStatus.Active
                },
                new BusRoute
                {
                    Id = "bus-02",
                    BusNumber = "EX 1-1",
                    RouteName = "Makumbura - Galle Southern Expressway",
                    Origin = "Makumbura Multimodal Center",
                    Destination = "Galle Bus Station",
                    DepartureTime = "06:00 AM",
                    ArrivalTime = "07:30 AM",
                    OperatingDays = "Daily (Hourly)",
                    Fare = 650.0m,
                    Status = TransportServiceStatus.Active
                },
                new BusRoute
                {
                    Id = "bus-48",
                    BusNumber = "48",
                    RouteName = "Colombo - Polonnaruwa Intercity",
                    Origin = "Colombo Fort",
                    Destination = "Polonnaruwa Town",
                    DepartureTime = "06:30 AM",
                    ArrivalTime = "12:15 PM",
                    OperatingDays = "Daily",
                    Fare = 850.0m,
                    Status = TransportServiceStatus.Active
                }
            );
            await db.SaveChangesAsync();
        }

        if (!await db.TrainSchedules.AnyAsync())
        {
            db.TrainSchedules.AddRange(
                new TrainSchedule
                {
                    Id = "train-1005",
                    TrainNumber = "1005",
                    TrainName = "Podi Menike (Main Line)",
                    Origin = "Colombo Fort",
                    Destination = "Badulla (via Kandy & Ella)",
                    DepartureTime = "05:55 AM",
                    ArrivalTime = "03:15 PM",
                    TrainType = "Intercity Express",
                    OperatingDays = "Daily",
                    Fare = 1200.0m,
                    Status = TransportServiceStatus.Active
                },
                new TrainSchedule
                {
                    Id = "train-1015",
                    TrainNumber = "1015",
                    TrainName = "Udarata Menike (Main Line)",
                    Origin = "Colombo Fort",
                    Destination = "Badulla",
                    DepartureTime = "08:30 AM",
                    ArrivalTime = "05:45 PM",
                    TrainType = "Express",
                    OperatingDays = "Daily",
                    Fare = 1000.0m,
                    Status = TransportServiceStatus.Active
                },
                new TrainSchedule
                {
                    Id = "train-8056",
                    TrainNumber = "8056",
                    TrainName = "Galle Coastal Express",
                    Origin = "Maradana / Colombo Fort",
                    Destination = "Galle / Matara",
                    DepartureTime = "06:50 AM",
                    ArrivalTime = "08:50 AM",
                    TrainType = "Coastal Express",
                    OperatingDays = "Daily",
                    Fare = 500.0m,
                    Status = TransportServiceStatus.Active
                },
                new TrainSchedule
                {
                    Id = "train-1021",
                    TrainNumber = "1021",
                    TrainName = "Ella Odyssey (Tourist Special)",
                    Origin = "Kandy",
                    Destination = "Demodara (Nine Arches)",
                    DepartureTime = "07:00 AM",
                    ArrivalTime = "01:50 PM",
                    TrainType = "Tourist Observation Saloon",
                    OperatingDays = "Thursday - Sunday",
                    Fare = 4000.0m,
                    Status = TransportServiceStatus.Active
                }
            );
            await db.SaveChangesAsync();
        }

        // 6. Seed AI Travel Guide: Chatbot Packages, Purchases, Chat Sessions, Photo Queries
        if (!await db.ChatbotPackages.AnyAsync())
        {
            var pStarter = new ChatbotPackage
            {
                Id = "pkg-starter",
                Name = "Basic Explorer",
                Description = "Essential AI Guide assistance with destination queries and local etiquette recommendations.",
                Price = 0.0m,
                QuestionLimit = 25,
                DurationDays = 7,
                Status = PackageStatus.Active,
                IncludesPhotoQueries = false,
                CreatedAt = DateTime.UtcNow.AddMonths(-1)
            };

            var pPro = new ChatbotPackage
            {
                Id = "pkg-pro",
                Name = "Island Pro Companion",
                Description = "Unlimited text questions plus 50 photo-based monument and temple identification queries.",
                Price = 14.99m,
                QuestionLimit = 250,
                DurationDays = 30,
                Status = PackageStatus.Active,
                IncludesPhotoQueries = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-1)
            };

            var pUnlimited = new ChatbotPackage
            {
                Id = "pkg-unlimited",
                Name = "Unlimited Wanderer",
                Description = "Comprehensive 24/7 AI Guide with unlimited questions, multilingual audio generation, and unlimited photo scanning.",
                Price = 29.99m,
                QuestionLimit = -1,
                DurationDays = 60,
                Status = PackageStatus.Active,
                IncludesPhotoQueries = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-1)
            };

            db.ChatbotPackages.AddRange(pStarter, pPro, pUnlimited);
            await db.SaveChangesAsync();

            // Purchases
            db.ChatbotPackagePurchases.AddRange(
                new ChatbotPackagePurchase
                {
                    Id = "purch-01",
                    UserId = "user-tourist-3",
                    PackageId = pPro.Id,
                    Price = 14.99m,
                    RemainingQueries = 230,
                    PurchaseDate = DateTime.UtcNow.AddDays(-1),
                    ExpiryDate = DateTime.UtcNow.AddDays(29),
                    Status = PurchaseStatus.Active
                },
                new ChatbotPackagePurchase
                {
                    Id = "purch-02",
                    UserId = "user-tourist-2",
                    PackageId = pStarter.Id,
                    Price = 0.0m,
                    RemainingQueries = 12,
                    PurchaseDate = DateTime.UtcNow.AddDays(-5),
                    ExpiryDate = DateTime.UtcNow.AddDays(2),
                    Status = PurchaseStatus.Active
                }
            );
            await db.SaveChangesAsync();
        }

        if (!await db.AIChatSessions.AnyAsync())
        {
            db.AIChatSessions.AddRange(
                new AIChatSession
                {
                    Id = "session-101",
                    UserId = "user-tourist-1",
                    PackageId = "pkg-starter",
                    Topic = "Sigiriya climbing tips and dress codes",
                    QueryCount = 8,
                    Status = ChatSessionStatus.Active,
                    StartedAt = DateTime.UtcNow.AddHours(-3),
                    LastActivityAt = DateTime.UtcNow.AddMinutes(-20)
                },
                new AIChatSession
                {
                    Id = "session-102",
                    UserId = "user-tourist-2",
                    PackageId = "pkg-starter",
                    Topic = "Train seat reservation timings from Kandy to Ella",
                    QueryCount = 14,
                    Status = ChatSessionStatus.Closed,
                    StartedAt = DateTime.UtcNow.AddDays(-2),
                    LastActivityAt = DateTime.UtcNow.AddDays(-2).AddHours(1)
                },
                new AIChatSession
                {
                    Id = "session-103",
                    UserId = "user-tourist-3",
                    PackageId = "pkg-pro",
                    Topic = "Southern seafood restaurants & surf safety Mirissa",
                    QueryCount = 22,
                    Status = ChatSessionStatus.Active,
                    StartedAt = DateTime.UtcNow.AddHours(-1),
                    LastActivityAt = DateTime.UtcNow.AddMinutes(-5)
                }
            );
            await db.SaveChangesAsync();
        }

        if (!await db.AIPhotoQueries.AnyAsync())
        {
            db.AIPhotoQueries.AddRange(
                new AIPhotoQuery
                {
                    Id = "photo-01",
                    UserId = "user-tourist-3",
                    DestinationName = "Sigiriya",
                    Category = "Ancient Frescoes",
                    IsSuccess = true,
                    LatencyMs = 380,
                    QueryDate = DateTime.UtcNow.AddDays(-1)
                },
                new AIPhotoQuery
                {
                    Id = "photo-02",
                    UserId = "user-tourist-3",
                    DestinationName = "Galle",
                    Category = "Colonial Lighthouse",
                    IsSuccess = true,
                    LatencyMs = 410,
                    QueryDate = DateTime.UtcNow.AddHours(-4)
                },
                new AIPhotoQuery
                {
                    Id = "photo-03",
                    UserId = "user-tourist-1",
                    DestinationName = "Kandy",
                    Category = "Temple Architecture",
                    IsSuccess = false,
                    LatencyMs = 750,
                    ErrorMessage = "Low resolution / blurry capture. Retried successfully.",
                    QueryDate = DateTime.UtcNow.AddHours(-2)
                }
            );
            await db.SaveChangesAsync();
        }

        // 7. Seed Reviews
        if (!await db.Reviews.AnyAsync())
        {
            db.Reviews.AddRange(
                new Review
                {
                    Id = "rev-01",
                    UserId = "user-tourist-1",
                    DestinationId = "dest-sigiriya",
                    Rating = 5,
                    Comment = "Climbing Sigiriya at sunrise was magical! The AI Guide gave great tips on hydration and avoiding monkey interactions.",
                    SentimentLabel = "Positive",
                    SentimentScore = 0.98,
                    Status = ReviewStatus.Published,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Review
                {
                    Id = "rev-02",
                    UserId = "user-tourist-2",
                    DestinationId = "dest-ella",
                    Rating = 5,
                    Comment = "Nine Arches Bridge was stunning. The train schedule on the app was pinpoint accurate.",
                    SentimentLabel = "Positive",
                    SentimentScore = 0.95,
                    Status = ReviewStatus.Published,
                    CreatedAt = DateTime.UtcNow.AddDays(-4)
                },
                new Review
                {
                    Id = "rev-03",
                    UserId = "user-tourist-3",
                    DestinationId = "dest-kandy",
                    Rating = 4,
                    Comment = "Sacred Tooth Relic temple was crowded in the evening, but the cultural performance was worth every rupee.",
                    SentimentLabel = "Positive",
                    SentimentScore = 0.82,
                    Status = ReviewStatus.Published,
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                }
            );
            await db.SaveChangesAsync();
        }

        // 8. Ensure All Users Have IsActive = true
        await db.Database.ExecuteSqlRawAsync("UPDATE users SET is_active = true WHERE is_active = false");

        // 9. Seed Attractions
        if (!await db.Attractions.AnyAsync())
        {
            db.Attractions.AddRange(
                new Attraction
                {
                    Id = "attr-01",
                    DestinationId = "dest-kandy",
                    Name = "Temple of the Sacred Tooth Relic",
                    Description = "Venerated golden-roofed Buddhist temple housing the sacred tooth relic of Gautama Buddha.",
                    Location = "Sri Dalada Veediya, Kandy",
                    OpeningTime = "05:30 AM",
                    ClosingTime = "08:00 PM",
                    EstimatedDuration = "2-3 Hours",
                    EstimatedCost = 15.0m,
                    ImageUrl = "https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=600&q=80",
                    Status = AttractionStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                },
                new Attraction
                {
                    Id = "attr-02",
                    DestinationId = "dest-kandy",
                    Name = "Royal Botanical Gardens Peradeniya",
                    Description = "Sprawling 147-acre botanical garden renowned for orchid collections, royal palm avenues, and cannonball trees.",
                    Location = "Peradeniya, Kandy",
                    OpeningTime = "07:30 AM",
                    ClosingTime = "06:00 PM",
                    EstimatedDuration = "2 Hours",
                    EstimatedCost = 10.0m,
                    ImageUrl = "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80",
                    Status = AttractionStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                },
                new Attraction
                {
                    Id = "attr-03",
                    DestinationId = "dest-ella",
                    Name = "Nine Arch Bridge",
                    Description = "Colonial-era stone viaduct bridge set amid lush tea plantation jungles, famed for train crossings.",
                    Location = "Demodara, Ella",
                    OpeningTime = "06:00 AM",
                    ClosingTime = "06:30 PM",
                    EstimatedDuration = "1.5 Hours",
                    EstimatedCost = 0.0m,
                    ImageUrl = "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80",
                    Status = AttractionStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddDays(-25)
                },
                new Attraction
                {
                    Id = "attr-04",
                    DestinationId = "dest-ella",
                    Name = "Little Adam's Peak",
                    Description = "Gentle panoramic hike offering sweeping views across Ella Rock and the Southern lowlands.",
                    Location = "Passara Road, Ella",
                    OpeningTime = "05:00 AM",
                    ClosingTime = "07:00 PM",
                    EstimatedDuration = "2 Hours",
                    EstimatedCost = 0.0m,
                    ImageUrl = "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80",
                    Status = AttractionStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddDays(-25)
                },
                new Attraction
                {
                    Id = "attr-05",
                    DestinationId = "dest-sigiriya",
                    Name = "Sigiriya Rock Citadel Fortress",
                    Description = "5th-century royal citadel towering 200m high with ancient water gardens, frescoes, and lion staircase.",
                    Location = "Sigiriya, Dambulla",
                    OpeningTime = "06:30 AM",
                    ClosingTime = "05:30 PM",
                    EstimatedDuration = "3-4 Hours",
                    EstimatedCost = 35.0m,
                    ImageUrl = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=600&q=80",
                    Status = AttractionStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                },
                new Attraction
                {
                    Id = "attr-06",
                    DestinationId = "dest-galle",
                    Name = "Galle Dutch Fort & Ocean Ramparts",
                    Description = "Living UNESCO World Heritage fortified city dating back to 16th century European Portuguese & Dutch eras.",
                    Location = "Church Street, Galle Fort",
                    OpeningTime = "Open 24 Hours",
                    ClosingTime = "Open 24 Hours",
                    EstimatedDuration = "3 Hours",
                    EstimatedCost = 0.0m,
                    ImageUrl = "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80",
                    Status = AttractionStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddDays(-20)
                }
            );
            await db.SaveChangesAsync();
        }

        // 10. Seed Chatbot Payments
        if (!await db.ChatbotPayments.AnyAsync())
        {
            db.ChatbotPayments.AddRange(
                new ChatbotPayment
                {
                    Id = "pay-cb-001",
                    PurchaseId = "purch-01",
                    UserId = "user-tourist-1",
                    PackageName = "Cultural Heritage AI Specialist",
                    Amount = 15.00m,
                    PaymentMethod = "Card (Visa)",
                    MaskedCardNumber = "**** **** **** 4242",
                    TransactionReference = "TXN-CH-882194",
                    Status = PaymentStatus.Successful,
                    CreatedAt = DateTime.UtcNow.AddDays(-14)
                },
                new ChatbotPayment
                {
                    Id = "pay-cb-002",
                    PurchaseId = "purch-02",
                    UserId = "user-tourist-2",
                    PackageName = "Standard Island Explorer",
                    Amount = 10.00m,
                    PaymentMethod = "Card (Mastercard)",
                    MaskedCardNumber = "**** **** **** 5100",
                    TransactionReference = "TXN-CH-991204",
                    Status = PaymentStatus.Successful,
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                },
                new ChatbotPayment
                {
                    Id = "pay-cb-003",
                    PurchaseId = "purch-01",
                    UserId = "user-tourist-3",
                    PackageName = "Island Explorer Pro",
                    Amount = 20.00m,
                    PaymentMethod = "Apple Pay",
                    MaskedCardNumber = "**** **** **** 1029",
                    TransactionReference = "TXN-CH-774102",
                    Status = PaymentStatus.Pending,
                    CreatedAt = DateTime.UtcNow.AddHours(-5)
                }
            );
            await db.SaveChangesAsync();
        }

        // 11. Seed Promo Payments
        if (!await db.PromoPayments.AnyAsync())
        {
            var promo1 = await db.PromoCodes.FirstOrDefaultAsync(p => p.Code == "TRAVEL25");
            var promo2 = await db.PromoCodes.FirstOrDefaultAsync(p => p.Code == "HIGHLAND15");

            db.PromoPayments.AddRange(
                new PromoPayment
                {
                    Id = "pay-pm-001",
                    PromoCodeId = promo1?.Id,
                    UserId = "user-tourist-1",
                    PromoCode = "TRAVEL25",
                    AmountPaid = 250.0m,
                    PaymentMethod = "Card / Online",
                    MaskedCardNumber = "**** **** **** 8821",
                    TransactionReference = "TXN-40192",
                    Status = PaymentStatus.Successful,
                    PromoCodeStatus = "Active",
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new PromoPayment
                {
                    Id = "pay-pm-002",
                    PromoCodeId = promo2?.Id,
                    UserId = "user-tourist-2",
                    PromoCode = "HIGHLAND15",
                    AmountPaid = 150.0m,
                    PaymentMethod = "Card (Visa)",
                    MaskedCardNumber = "**** **** **** 3311",
                    TransactionReference = "PM-TXN-55019",
                    Status = PaymentStatus.Successful,
                    PromoCodeStatus = "Active",
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new PromoPayment
                {
                    Id = "pay-pm-003",
                    PromoCodeId = promo1?.Id,
                    UserId = "user-tourist-3",
                    PromoCode = "COASTAL500",
                    AmountPaid = 500.0m,
                    PaymentMethod = "Online Banking",
                    MaskedCardNumber = "**** **** **** 9012",
                    TransactionReference = "PM-TXN-66102",
                    Status = PaymentStatus.Pending,
                    PromoCodeStatus = "Pending",
                    CreatedAt = DateTime.UtcNow.AddHours(-3)
                }
            );
            await db.SaveChangesAsync();
        }

        // 12. Seed System Activities
        if (!await db.SystemActivities.AnyAsync())
        {
            db.SystemActivities.AddRange(
                new SystemActivity
                {
                    Id = "act-sys-01",
                    ActivityType = "Trip",
                    Description = "User Alice Tourist created a 4-day trip to Sigiriya & Kandy",
                    ActorName = "Alice Tourist",
                    ActorRole = "Tourist",
                    Severity = "Info",
                    Timestamp = DateTime.UtcNow.AddMinutes(-32)
                },
                new SystemActivity
                {
                    Id = "act-sys-02",
                    ActivityType = "Payment",
                    Description = "User David Miller purchased Standard Island Explorer AI Guide ($10.00)",
                    ActorName = "David Miller",
                    ActorRole = "Tourist",
                    Severity = "Info",
                    Timestamp = DateTime.UtcNow.AddMinutes(-48)
                },
                new SystemActivity
                {
                    Id = "act-sys-03",
                    ActivityType = "Payment",
                    Description = "User Alice Tourist purchased promo voucher TRAVEL25 (LKR 250)",
                    ActorName = "Alice Tourist",
                    ActorRole = "Tourist",
                    Severity = "Info",
                    Timestamp = DateTime.UtcNow.AddHours(-2)
                },
                new SystemActivity
                {
                    Id = "act-sys-04",
                    ActivityType = "Transport",
                    Description = "Admin Charlie Admin updated schedule for Colombo - Kandy AC Express",
                    ActorName = "Charlie Admin",
                    ActorRole = "Admin",
                    Severity = "Info",
                    Timestamp = DateTime.UtcNow.AddHours(-4)
                },
                new SystemActivity
                {
                    Id = "act-sys-05",
                    ActivityType = "Review",
                    Description = "User Elena Rostova submitted a 4-star review for Kandy",
                    ActorName = "Elena Rostova",
                    ActorRole = "Tourist",
                    Severity = "Info",
                    Timestamp = DateTime.UtcNow.AddHours(-6)
                },
                new SystemActivity
                {
                    Id = "act-sys-06",
                    ActivityType = "Chatbot",
                    Description = "User David Miller queried AI Travel Guide on Nine Arch Bridge train timetable",
                    ActorName = "David Miller",
                    ActorRole = "Tourist",
                    Severity = "Info",
                    Timestamp = DateTime.UtcNow.AddHours(-8)
                },
                new SystemActivity
                {
                    Id = "act-sys-07",
                    ActivityType = "User",
                    Description = "New tourist account Elena Rostova registered and verified",
                    ActorName = "Elena Rostova",
                    ActorRole = "Tourist",
                    Severity = "Info",
                    Timestamp = DateTime.UtcNow.AddDays(-1)
                }
            );
            await db.SaveChangesAsync();
        }
    }
}
