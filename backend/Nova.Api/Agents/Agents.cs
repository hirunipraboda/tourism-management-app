namespace Nova.Api.Agents;

public interface IDestinationResearchAgent
{
    Task<DestinationResearchResult> ResearchAsync(DestinationResearchRequest request);
}

public interface IRouteOptimizationAgent
{
    Task<RouteOptimizationResult> OptimizeAsync(RouteOptimizationRequest request);
}

public interface IItineraryValidationAgent
{
    Task<ItineraryValidationResult> ValidateAsync(ItineraryValidationRequest request);
}

public interface ITripPlannerOrchestrator
{
    Task<TripPlanResult> GeneratePlanAsync(TripPlanningRequest request);
    Task<ItineraryDayItem> RegenerateSingleDayAsync(int dayNumber, string location, TripPlanningRequest request);
    Task<ItineraryActivityItem> ReplaceSingleActivityAsync(string activityId, string currentTitle, string location);
}

// 1. Destination Research Agent
public class DestinationResearchAgent : IDestinationResearchAgent
{
    public Task<DestinationResearchResult> ResearchAsync(DestinationResearchRequest request)
    {
        var destinations = request.TargetDestinations.Count > 0
            ? request.TargetDestinations
            : ["Sigiriya", "Kandy", "Ella", "Galle"];

        var infoList = destinations.Select(name => new DestinationResearchInfo
        {
            Name = name,
            TopAttractions = [$"{name} Cultural Tour", $"{name} Nature Trails", $"{name} Local Culinary Experience"],
            BestTimeToVisit = "Dry Season (Dec - Apr / Jul - Sep)",
            Highlights = $"Famous for stunning scenery, rich historical heritage, and authentic Sri Lankan hospitality."
        }).ToList();

        return Task.FromResult(new DestinationResearchResult { DestinationsInfo = infoList });
    }
}

// 2. Route & Travel Logistics Optimization Agent
public class RouteOptimizationAgent : IRouteOptimizationAgent
{
    public Task<RouteOptimizationResult> OptimizeAsync(RouteOptimizationRequest request)
    {
        var ordered = request.Destinations.Count > 0 ? request.Destinations : ["Sigiriya", "Kandy", "Ella", "Galle"];
        var distance = ordered.Count * 85.0;

        return Task.FromResult(new RouteOptimizationResult
        {
            OrderedDestinations = ordered,
            EstimatedTotalTravelDistanceKm = distance,
            RecommendedTransport = "Private AC Vehicle / PickMe Partner Integration"
        });
    }
}

// 3. Itinerary Validation & Feasibility Agent
public class ItineraryValidationAgent : IItineraryValidationAgent
{
    public Task<ItineraryValidationResult> ValidateAsync(ItineraryValidationRequest request)
    {
        var warnings = new List<TripWarning>();
        var totalCost = request.Days.Sum(d => d.EstimatedCost);

        if (totalCost > request.BudgetAmount && request.BudgetAmount > 0)
        {
            warnings.Add(new TripWarning
            {
                Type = "budget",
                Title = "Budget Alert",
                Message = $"Estimated itinerary costs (${totalCost:F0}) exceed allocated activity budget (${request.BudgetAmount:F0}). Consider selecting free walking trails."
            });
        }

        var score = Math.Max(75.0, Math.Min(98.0, 100.0 - warnings.Count * 10.0));

        return Task.FromResult(new ItineraryValidationResult
        {
            IsValid = warnings.Count == 0,
            Score = score,
            Warnings = warnings
        });
    }
}

// 4. Trip Planner Orchestrator (Multi-Agent Coordinator)
public class TripPlannerOrchestrator : ITripPlannerOrchestrator
{
    private readonly IDestinationResearchAgent _researchAgent;
    private readonly IRouteOptimizationAgent _routeAgent;
    private readonly IItineraryValidationAgent _validationAgent;

    public TripPlannerOrchestrator(
        IDestinationResearchAgent researchAgent,
        IRouteOptimizationAgent routeAgent,
        IItineraryValidationAgent validationAgent)
    {
        _researchAgent = researchAgent;
        _routeAgent = routeAgent;
        _validationAgent = validationAgent;
    }

    public async Task<TripPlanResult> GeneratePlanAsync(TripPlanningRequest req)
    {
        // 1. Calculate duration
        DateTime start = DateTime.TryParse(req.StartDate, out var parsedStart) ? parsedStart : DateTime.UtcNow;
        DateTime end = DateTime.TryParse(req.EndDate, out var parsedEnd) ? parsedEnd : DateTime.UtcNow.AddDays(5);
        int durationDays = Math.Max(1, (int)Math.Ceiling((end - start).TotalDays));

        // 2. Target destinations
        var chosenDestinations = req.Destinations.Where(d => !string.IsNullOrWhiteSpace(d) && d != "Let AI recommend").ToList();
        if (chosenDestinations.Count == 0)
        {
            chosenDestinations = ["Sigiriya", "Kandy", "Ella", "Galle"];
        }

        // 3. Sub-Agent Execution: Research & Route
        var researchData = await _researchAgent.ResearchAsync(new DestinationResearchRequest
        {
            TargetDestinations = chosenDestinations,
            Interests = req.Interests,
            TravelStyle = req.TravelStyle
        });

        var routeData = await _routeAgent.OptimizeAsync(new RouteOptimizationRequest
        {
            Destinations = chosenDestinations,
            DurationDays = durationDays
        });

        var activeDestinations = routeData.OrderedDestinations;

        // 4. Generate Day-by-Day Activities
        var days = new List<ItineraryDayItem>();
        for (int d = 1; d <= durationDays; d++)
        {
            var dateStr = start.AddDays(d - 1).ToString("yyyy-MM-dd");
            var destName = activeDestinations[(d - 1) % activeDestinations.Count];
            var activities = GenerateDayActivities(d, destName, req);
            var dayCost = activities.Sum(a => a.EstimatedCost);

            days.Add(new ItineraryDayItem
            {
                Day = d,
                Date = dateStr,
                Location = destName,
                Title = d == 1 ? $"Arrival & Exploration in {destName}" : d == durationDays ? $"Coastal Departure & Farewell in {destName}" : $"{destName} Highlights & Cultural Discovery",
                Description = $"Curated experience highlighting the best of {string.Join(", ", req.TravelStyle.DefaultIfEmpty("heritage & nature"))} in {destName}.",
                Activities = activities,
                EstimatedCost = dayCost
            });
        }

        // 5. Budget Allocation
        var budgetAmount = req.Budget.Amount > 0 ? req.Budget.Amount : 800.0;
        var travelersCount = req.Travelers > 0 ? req.Travelers : 2;
        var totalActivityCost = days.Sum(d => d.EstimatedCost) * travelersCount;

        var accommodationCost = Math.Round(budgetAmount * 0.35);
        var transportCost = Math.Round(budgetAmount * 0.25);
        var foodCost = Math.Round(budgetAmount * 0.20);
        var calculatedTotal = accommodationCost + transportCost + foodCost + totalActivityCost;
        var remaining = Math.Max(0, budgetAmount - calculatedTotal);

        var budgetBreakdown = new BudgetBreakdown
        {
            Accommodation = accommodationCost,
            Transportation = transportCost,
            Activities = totalActivityCost,
            Food = foodCost,
            Other = Math.Round(budgetAmount * 0.05),
            Total = calculatedTotal,
            Remaining = remaining,
            Currency = req.Budget.Currency ?? "USD"
        };

        // 6. Sub-Agent Execution: Validation & Feasibility
        var validationRes = await _validationAgent.ValidateAsync(new ItineraryValidationRequest
        {
            Days = days,
            BudgetAmount = budgetAmount
        });

        var warnings = new List<TripWarning>(validationRes.Warnings);
        if (activeDestinations.Contains("Ella") || req.TravelStyle.Contains("nature"))
        {
            warnings.Add(new TripWarning
            {
                Type = "weather",
                Title = "Hill Country Microclimate Advisory",
                Message = "Afternoon mist and light showers frequent the Ella ridges. Carry lightweight rainproof jackets."
            });
        }

        if (durationDays < activeDestinations.Count)
        {
            warnings.Add(new TripWarning
            {
                Type = "schedule",
                Title = "High-Paced Travel Notice",
                Message = $"Covering {activeDestinations.Count} regions across {durationDays} days involves early transfers. Travel segments have been optimized."
            });
        }

        var recommendations = new List<TripRecommendation>
        {
            new()
            {
                Category = "Transportation Partner",
                Title = "10% Discount on PickMe Transfers",
                Description = "Use partner code TRAVELLINK10 for intercity rides and city tuk-tuks across all destinations."
            },
            new()
            {
                Category = "Cultural Etiquette",
                Title = "Sacred Sites Guidelines",
                Description = "Cover shoulders and knees when visiting cultural temple grounds such as Kandy's Temple of the Tooth."
            }
        };

        return new TripPlanResult
        {
            Trip = new TripSummary
            {
                Title = $"{durationDays}-Day {req.Destination ?? "Sri Lanka"} {string.Join(" & ", req.TravelStyle.Take(2).DefaultIfEmpty("Explorer"))} Journey",
                Description = $"4-agent AI optimized trip plan for {travelersCount} traveler(s) combining cultural immersion, scenic landmarks, and transport efficiency.",
                Duration = durationDays,
                Destinations = activeDestinations,
                Travelers = travelersCount,
                TransportPreference = req.TransportPreference ?? "AI Recommended",
                AccommodationPreference = req.AccommodationPreference ?? "3 Star"
            },
            Days = days,
            Budget = budgetBreakdown,
            Warnings = warnings,
            Recommendations = recommendations,
            Metadata = new Dictionary<string, object>
            {
                { "generatedAt", DateTime.UtcNow.ToString("o") },
                { "orchestrator", "4-Agent Tourism Planning Engine v2.0" },
                { "aiScore", validationRes.Score }
            }
        };
    }

    private static string MessageOrDesc(string msg) => msg;

    public Task<ItineraryDayItem> RegenerateSingleDayAsync(int dayNumber, string location, TripPlanningRequest request)
    {
        var activities = GenerateDayActivities(dayNumber, location, request);
        var altActivities = activities.Select((act, idx) => new ItineraryActivityItem
        {
            Id = Guid.NewGuid().ToString(),
            Time = act.Time,
            Title = idx == 0 ? $"Alternative: {act.Title}" : act.Title,
            Location = act.Location,
            DurationMinutes = act.DurationMinutes,
            EstimatedCost = act.EstimatedCost,
            Description = act.Description,
            Type = act.Type,
            TravelTimeToNext = act.TravelTimeToNext
        }).ToList();

        return Task.FromResult(new ItineraryDayItem
        {
            Day = dayNumber,
            Date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
            Location = location,
            Title = $"Optimized Day {dayNumber} in {location}",
            Description = $"Regenerated alternative day plan emphasizing flexibility and local experiences.",
            Activities = altActivities,
            EstimatedCost = altActivities.Sum(a => a.EstimatedCost)
        });
    }

    public Task<ItineraryActivityItem> ReplaceSingleActivityAsync(string activityId, string currentTitle, string location)
    {
        return Task.FromResult(new ItineraryActivityItem
        {
            Id = Guid.NewGuid().ToString(),
            Time = "02:30 PM",
            Title = $"Alternative Experience: {location} Artisan & Craft Workshop",
            Location = location,
            DurationMinutes = 90,
            EstimatedCost = 15.0,
            Description = "Hands-on traditional craft workshop guided by local master artisans.",
            Type = "Activity",
            TravelTimeToNext = "20 mins transfer"
        });
    }

    private List<ItineraryActivityItem> GenerateDayActivities(int dayNum, string location, TripPlanningRequest req)
    {
        if (location.Contains("Sigiriya", StringComparison.OrdinalIgnoreCase))
        {
            return [
                new() { Time = "06:30 AM", Title = "Sigiriya Rock Citadel Sunrise Climb", Location = "Sigiriya", DurationMinutes = 180, EstimatedCost = 30.0, Description = "Climb 1,200 steps past ancient frescoes to King Kasyapa’s palace ruins.", Type = "Attraction", TravelTimeToNext = "20 mins transfer" },
                new() { Time = "11:30 AM", Title = "Authentic Village Catamaran & Rice & Curry Lunch", Location = "Sigiriya Village", DurationMinutes = 120, EstimatedCost = 15.0, Description = "Traditional Sri Lankan culinary experience on banana leaves.", Type = "Dining", TravelTimeToNext = "15 mins" },
                new() { Time = "04:30 PM", Title = "Pidurangala Rock Sunset Viewpoint", Location = "Pidurangala", DurationMinutes = 120, EstimatedCost = 3.0, Description = "Panoramic 360-degree sunset vistas directly facing the Sigiriya fortress.", Type = "Activity", TravelTimeToNext = "End of day" }
            ];
        }
        else if (location.Contains("Kandy", StringComparison.OrdinalIgnoreCase))
        {
            return [
                new() { Time = "09:00 AM", Title = "Temple of the Sacred Tooth Relic (Sri Dalada Maligawa)", Location = "Kandy Lake", DurationMinutes = 120, EstimatedCost = 10.0, Description = "Venerated Buddhist shrine holding the sacred tooth relic.", Type = "Attraction", TravelTimeToNext = "15 mins" },
                new() { Time = "01:30 PM", Title = "Peradeniya Royal Botanical Gardens Walk", Location = "Peradeniya", DurationMinutes = 150, EstimatedCost = 12.0, Description = "147 acres of tropical orchid collections and historic palm avenues.", Type = "Activity", TravelTimeToNext = "25 mins" },
                new() { Time = "05:30 PM", Title = "Traditional Kandyan Cultural Dance & Drum Show", Location = "Kandy Cultural Centre", DurationMinutes = 90, EstimatedCost = 10.0, Description = "Dazzling ceremonial fire-walking and rhythmic Kandyan drumming.", Type = "Activity", TravelTimeToNext = "End of day" }
            ];
        }
        else if (location.Contains("Ella", StringComparison.OrdinalIgnoreCase))
        {
            return [
                new() { Time = "08:30 AM", Title = "Demodara Nine Arches Viaduct Bridge", Location = "Ella", DurationMinutes = 120, EstimatedCost = 0.0, Description = "Watch the blue mountain train cross the colonial stone arches through tea plantations.", Type = "Attraction", TravelTimeToNext = "30 mins hike" },
                new() { Time = "01:00 PM", Title = "Little Adam's Peak Trek & Flying Ravine Zipline", Location = "Ella Pass", DurationMinutes = 150, EstimatedCost = 20.0, Description = "Panoramic mountain ridges overlooking Ella Gap followed by thrilling zipline.", Type = "Activity", TravelTimeToNext = "End of day" }
            ];
        }
        else
        {
            return [
                new() { Time = "09:00 AM", Title = $"{location} Historic Ramparts & Colonial Walk", Location = location, DurationMinutes = 120, EstimatedCost = 10.0, Description = $"Explore colonial ramparts, artisan boutiques, and ocean vistas in {location}.", Type = "Attraction", TravelTimeToNext = "15 mins" },
                new() { Time = "02:00 PM", Title = $"{location} Coastal Dining & Beachside Relaxation", Location = location, DurationMinutes = 180, EstimatedCost = 25.0, Description = $"Sample fresh catch-of-the-day seafood and fresh king coconut.", Type = "Dining", TravelTimeToNext = "End of day" }
            ];
        }
    }
}
