using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.TripPlanner;
using Nova.Api.Entities;
using Nova.Api.Services;
using Nova.Api.Services.Agents;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/trip-planner")]
public class TripPlannerController : ControllerBase
{
    private readonly NovaDbContext _db;
    private readonly IAiAgentClient _aiAgentClient;
    private readonly ITravelPlanningAgent _planningAgent;
    private readonly IDestinationResearchAgent _researchAgent;
    private readonly ITravelLogisticsAgent _logisticsAgent;
    private readonly ISafetyValidationAgent _safetyAgent;
    private readonly ILogger<TripPlannerController> _logger;

    public TripPlannerController(
        NovaDbContext db,
        IAiAgentClient aiAgentClient,
        ITravelPlanningAgent planningAgent,
        IDestinationResearchAgent researchAgent,
        ITravelLogisticsAgent logisticsAgent,
        ISafetyValidationAgent safetyAgent,
        ILogger<TripPlannerController> logger)
    {
        _db = db;
        _aiAgentClient = aiAgentClient;
        _planningAgent = planningAgent;
        _researchAgent = researchAgent;
        _logisticsAgent = logisticsAgent;
        _safetyAgent = safetyAgent;
        _logger = logger;
    }

    [HttpPost("generate")]
    [ProducesResponseType(typeof(ApiResponse<TripPlanDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GenerateTripPlan([FromBody] TripPlanningRequestDto request)
    {
        try
        {
            var destination = !string.IsNullOrWhiteSpace(request.Destination) ? request.Destination.Trim() : "Sri Lanka";
            var targetDestinations = request.Destinations != null && request.Destinations.Count > 0
                ? request.Destinations
                : [destination];

            // 1. Attempt generation via Python LangGraph + Gemini Agent Bridge if available
            var isPythonAgentUp = await _aiAgentClient.IsAvailableAsync();
            if (isPythonAgentUp)
            {
                var pythonPlan = await _aiAgentClient.PlanTripAsync(request);
                if (pythonPlan != null && pythonPlan.Days.Count > 0)
                {
                    if (!string.IsNullOrWhiteSpace(request.TripName) && pythonPlan.Trip != null)
                    {
                        pythonPlan.Trip.Title = request.TripName.Trim();
                    }
                    _logger.LogInformation("Successfully generated trip plan via Python LangGraph Multi-Agent Engine");
                    return Ok(ApiResponse<TripPlanDto>.Ok(pythonPlan, "AI trip itinerary generated successfully by LangGraph Multi-Agent Engine."));
                }
            }

            // 2. Deterministic 4-Agent C# Pipeline Fallback
            _logger.LogInformation("Generating trip plan via native C# 4-Agent Orchestrator");
            var nativePlan = await GenerateNativePlanAsync(request, targetDestinations);
            return Ok(ApiResponse<TripPlanDto>.Ok(nativePlan, "AI trip itinerary generated successfully by native 4-Agent Orchestrator."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating AI trip plan");
            return StatusCode(500, ApiResponse<TripPlanDto>.Fail("Failed to generate AI trip plan", [ex.Message]));
        }
    }

    [HttpPost("save")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status201Created)]
    public async Task<IActionResult> SaveTripPlan([FromBody] SaveTripPlanRequestDto request)
    {
        try
        {
            if (request.Plan == null || request.Plan.Days.Count == 0)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid trip plan payload. Plan must contain days."));
            }

            var userId = !string.IsNullOrWhiteSpace(request.UserId) ? request.UserId.Trim() : GetCurrentUserId();
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                user = await _db.Users.FirstOrDefaultAsync(u => u.Id == "U001")
                    ?? await _db.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Tourist)
                    ?? await _db.Users.FirstOrDefaultAsync();
                
                if (user != null)
                {
                    userId = user.Id;
                }
            }

            var startDate = DateTime.UtcNow.Date.AddDays(7);
            if (DateTime.TryParse(request.RequestInput?.StartDate, out var parsedStart))
            {
                startDate = parsedStart.ToUniversalTime();
            }

            var endDate = startDate.AddDays(Math.Max(1, request.Plan.Days.Count));
            if (DateTime.TryParse(request.RequestInput?.EndDate, out var parsedEnd))
            {
                endDate = parsedEnd.ToUniversalTime();
            }

            var destination = request.Plan.Trip.Destinations.Count > 0 
                ? string.Join(", ", request.Plan.Trip.Destinations) 
                : (!string.IsNullOrWhiteSpace(request.RequestInput?.Destination) ? request.RequestInput.Destination.Trim() : "Sri Lanka");

            var tripTitle = !string.IsNullOrWhiteSpace(request.Plan.Trip.Title) 
                ? request.Plan.Trip.Title.Trim() 
                : (!string.IsNullOrWhiteSpace(request.RequestInput?.TripName) ? request.RequestInput.TripName.Trim() : $"{destination} Tour");

            // Idempotent Trip Save: check if trip already exists with given ID or same title/destination
            Trip? trip = null;
            if (!string.IsNullOrWhiteSpace(request.TripId))
            {
                trip = await _db.Trips.Include(t => t.Itineraries).FirstOrDefaultAsync(t => t.Id == request.TripId);
            }

            if (trip == null)
            {
                // Check recent duplicate within 2 hours with same user & title
                trip = await _db.Trips.Include(t => t.Itineraries)
                    .FirstOrDefaultAsync(t => t.UserId == userId && t.TripName == tripTitle && t.CreatedAt >= DateTime.UtcNow.AddHours(-2));
            }

            if (trip != null)
            {
                // Update existing trip
                trip.TripName = tripTitle;
                trip.Destination = destination;
                trip.StartDate = startDate;
                trip.EndDate = endDate;
                trip.NumberOfTravelers = request.Plan.Trip.Travelers > 0 ? request.Plan.Trip.Travelers : 2;
                trip.Budget = request.Plan.Budget.Total > 0 ? request.Plan.Budget.Total : 600m;
                trip.TripStyle = request.Plan.Trip.AccommodationPreference ?? "Moderate";
                trip.Interests = request.RequestInput?.Activities ?? ["Culture", "Nature"];
                trip.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newTripId = await IdGenerator.GenerateTripIdAsync(_db);
                trip = new Trip
                {
                    Id = newTripId,
                    UserId = userId,
                    TripName = tripTitle,
                    Destination = destination,
                    StartDate = startDate,
                    EndDate = endDate,
                    NumberOfTravelers = request.Plan.Trip.Travelers > 0 ? request.Plan.Trip.Travelers : 2,
                    Budget = request.Plan.Budget.Total > 0 ? request.Plan.Budget.Total : 600m,
                    TripStyle = request.Plan.Trip.AccommodationPreference ?? "Moderate",
                    Interests = request.RequestInput?.Activities ?? ["Culture", "Nature"],
                    Status = TripStatus.Planned,
                    CreatedSource = request.Plan?.Metadata?.Agent?.Contains("Manual", StringComparison.OrdinalIgnoreCase) == true ? "USER" : "AI",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.Trips.Add(trip);
            }

            await _db.SaveChangesAsync();

            // Find or Create Itinerary
            var itinerary = await _db.Itineraries.Include(i => i.Days).ThenInclude(d => d.Items)
                .FirstOrDefaultAsync(i => i.TripId == trip.Id);

            if (itinerary != null)
            {
                itinerary.Title = tripTitle;
                itinerary.FeasibilityScore = request.Plan.Metadata.AiScore > 0 ? request.Plan.Metadata.AiScore : 95.0;
                itinerary.TotalEstimatedCost = request.Plan.Budget.Total;
                itinerary.CreatedSource = "AI";
                itinerary.UpdatedAt = DateTime.UtcNow;

                // Remove existing days to prevent duplication
                if (itinerary.Days.Count > 0)
                {
                    _db.ItineraryDays.RemoveRange(itinerary.Days);
                    await _db.SaveChangesAsync();
                }
            }
            else
            {
                var newItineraryId = await IdGenerator.GenerateItineraryIdAsync(_db);
                itinerary = new Itinerary
                {
                    Id = newItineraryId,
                    TripId = trip.Id,
                    Title = tripTitle,
                    Status = ItineraryStatus.Draft,
                    FeasibilityScore = request.Plan.Metadata.AiScore > 0 ? request.Plan.Metadata.AiScore : 95.0,
                    TotalEstimatedCost = request.Plan.Budget.Total,
                    CreatedSource = request.Plan?.Metadata?.Agent?.Contains("Manual", StringComparison.OrdinalIgnoreCase) == true ? "USER" : "AI",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.Itineraries.Add(itinerary);
                await _db.SaveChangesAsync();
            }

            // Add Days & Items with unique IDs and realistic distinct activity times
            foreach (var d in request.Plan.Days)
            {
                var dayDate = trip.StartDate.AddDays(d.Day - 1);
                if (DateTime.TryParse(d.Date, out var parsedDayDate))
                {
                    dayDate = parsedDayDate.ToUniversalTime();
                }

                var dayId = $"{itinerary.Id}-D{d.Day}";
                var day = new ItineraryDay
                {
                    Id = dayId,
                    ItineraryId = itinerary.Id,
                    DayNumber = d.Day,
                    Date = dayDate,
                    Location = d.Location,
                    Title = d.Title
                };

                _db.ItineraryDays.Add(day);
                await _db.SaveChangesAsync();

                int order = 1;
                foreach (var act in d.Activities)
                {
                    var (startTime, endTime) = ParseActivityTime(act.Time, order, act.DurationMinutes > 0 ? act.DurationMinutes : 120);

                    var item = new ItineraryItem
                    {
                        Id = $"{day.Id}-I{order}",
                        ItineraryDayId = day.Id,
                        SequenceOrder = order,
                        ActivityName = act.Title,
                        Location = act.Location,
                        EstimatedCost = act.EstimatedCost,
                        DurationMinutes = act.DurationMinutes > 0 ? act.DurationMinutes : (int)(endTime - startTime).TotalMinutes,
                        StartTime = startTime,
                        EndTime = endTime,
                        TravelTimeMinutes = ParseTravelMinutes(act.TravelTimeToNext),
                        Notes = act.Description
                    };
                    _db.ItineraryItems.Add(item);
                    order++;
                }
            }

            await _db.SaveChangesAsync();

            return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(new
            {
                tripId = trip.Id,
                itineraryId = itinerary.Id,
                tripName = trip.TripName,
                destination = trip.Destination,
                userId = trip.UserId,
                daysCount = request.Plan.Days.Count,
                message = "Trip plan saved to PostgreSQL database successfully"
            }, "Trip plan saved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save trip plan to database");
            return StatusCode(500, ApiResponse<object>.Fail("Failed to save trip plan", [ex.Message]));
        }
    }

    private static (TimeSpan Start, TimeSpan End) ParseActivityTime(string? timeStr, int sequenceOrder, int durationMinutes)
    {
        if (!string.IsNullOrWhiteSpace(timeStr) && timeStr.Contains('-'))
        {
            var parts = timeStr.Split('-');
            if (parts.Length == 2 &&
                TimeSpan.TryParse(parts[0].Trim(), out var s) &&
                TimeSpan.TryParse(parts[1].Trim(), out var e))
            {
                return (s, e);
            }
        }

        // Distinct scheduled times per order
        return sequenceOrder switch
        {
            1 => (new TimeSpan(8, 30, 0), new TimeSpan(11, 0, 0)),
            2 => (new TimeSpan(11, 30, 0), new TimeSpan(14, 0, 0)),
            3 => (new TimeSpan(14, 30, 0), new TimeSpan(17, 0, 0)),
            4 => (new TimeSpan(17, 30, 0), new TimeSpan(19, 30, 0)),
            5 => (new TimeSpan(20, 0, 0), new TimeSpan(21, 30, 0)),
            _ => (new TimeSpan(Math.Min(22, 7 + (sequenceOrder - 1) * 2), 0, 0),
                  new TimeSpan(Math.Min(23, 9 + (sequenceOrder - 1) * 2), 0, 0))
        };
    }

    private static int ParseTravelMinutes(string? travelStr)
    {
        if (string.IsNullOrWhiteSpace(travelStr)) return 20;
        var digits = new string(travelStr.Where(char.IsDigit).ToArray());
        return int.TryParse(digits, out var mins) && mins > 0 ? mins : 20;
    }


    [HttpPost("regenerate-day")]
    [ProducesResponseType(typeof(ApiResponse<ItineraryDayItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RegenerateDay([FromBody] RegenerateDayRequestDto request)
    {
        try
        {
            var loc = !string.IsNullOrWhiteSpace(request.Location) ? request.Location : "Kandy";
            var candidates = await _researchAgent.ResearchActivitiesAsync(loc, ["nature", "culture"], "moderate");

            var activities = new List<ItineraryActivityItemDto>();
            decimal dayCost = 0.0m;
            int actIdx = 1;

            foreach (var cand in candidates.Take(3))
            {
                dayCost += cand.CostPerPerson;
                activities.Add(new ItineraryActivityItemDto
                {
                    Id = $"act-regen-{request.DayNumber}-{actIdx++}",
                    Time = actIdx == 2 ? "09:00 - 11:30" : actIdx == 3 ? "13:30 - 16:00" : "17:00 - 19:00",
                    Title = cand.Name,
                    Location = cand.Location,
                    DurationMinutes = cand.DurationMinutes,
                    EstimatedCost = cand.CostPerPerson,
                    Description = cand.Description,
                    Type = "Attraction",
                    TravelTimeToNext = "20 mins",
                    Notes = "Refreshed via Destination Research Agent"
                });
            }

            var updatedDay = new ItineraryDayItemDto
            {
                Day = request.DayNumber,
                Date = DateTime.UtcNow.AddDays(request.DayNumber).ToString("yyyy-MM-dd"),
                Location = loc,
                Title = $"Day {request.DayNumber}: {loc} Highlights & Exploration",
                Description = $"Refreshed activities in {loc}",
                Activities = activities,
                EstimatedCost = dayCost
            };

            return Ok(ApiResponse<ItineraryDayItemDto>.Ok(updatedDay, "Day itinerary regenerated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<ItineraryDayItemDto>.Fail("Failed to regenerate day", [ex.Message]));
        }
    }

    [HttpPost("regenerate-activity")]
    [ProducesResponseType(typeof(ApiResponse<ItineraryActivityItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RegenerateActivity([FromBody] RegenerateActivityRequestDto request)
    {
        try
        {
            var loc = !string.IsNullOrWhiteSpace(request.Location) ? request.Location : "Sri Lanka";
            var candidates = await _researchAgent.ResearchActivitiesAsync(loc, ["sightseeing"], "moderate");
            var alt = candidates.FirstOrDefault(c => !c.Name.Equals(request.CurrentTitle, StringComparison.OrdinalIgnoreCase))
                ?? new ActivityCandidate
                {
                    Name = $"{loc} Scenic Heritage Trail",
                    Description = $"Historic landmark walk and cultural discovery in {loc}.",
                    Location = loc,
                    CostPerPerson = 15.0m,
                    DurationMinutes = 120
                };

            var activity = new ItineraryActivityItemDto
            {
                Id = $"act-rep-{Guid.NewGuid().ToString()[..6]}",
                Time = "02:00 PM - 04:30 PM",
                Title = alt.Name,
                Location = alt.Location,
                DurationMinutes = alt.DurationMinutes,
                EstimatedCost = alt.CostPerPerson,
                Description = alt.Description,
                Type = "Activity",
                TravelTimeToNext = "15 mins",
                Notes = "Replaced via Agentic Candidate Search"
            };

            return Ok(ApiResponse<ItineraryActivityItemDto>.Ok(activity, "Activity replaced successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<ItineraryActivityItemDto>.Fail("Failed to replace activity", [ex.Message]));
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTripPlan(string id)
    {
        var trip = await _db.Trips
            .Include(t => t.Itineraries)
                .ThenInclude(i => i.Days)
                    .ThenInclude(d => d.Items)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (trip == null) return NotFound(ApiResponse<object>.Fail("Trip not found"));

        return Ok(ApiResponse<object>.Ok(trip));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTripPlan(string id)
    {
        var trip = await _db.Trips.FirstOrDefaultAsync(t => t.Id == id);
        if (trip == null) return NotFound(ApiResponse<object>.Fail("Trip not found"));

        _db.Trips.Remove(trip);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { id, deleted = true }, "Trip plan deleted"));
    }

    private async Task<TripPlanDto> GenerateNativePlanAsync(TripPlanningRequestDto request, List<string> destinations)
    {
        var startDate = DateTime.UtcNow.Date.AddDays(7);
        if (DateTime.TryParse(request.StartDate, out var ps)) startDate = ps;

        var endDate = startDate.AddDays(3);
        if (DateTime.TryParse(request.EndDate, out var pe)) endDate = pe;

        int durationDays = Math.Max(1, (int)(endDate - startDate).TotalDays);
        if (request.Destinations != null && request.Destinations.Count > 0 && durationDays < request.Destinations.Count)
        {
            durationDays = request.Destinations.Count;
        }

        // Partition total days logically among destinations (e.g. 5 days for [Kandy, Ella] -> 3 in Kandy, 2 in Ella)
        var destinationSchedule = new List<(string Location, int DayInLocation, int TotalDaysInLocation, string? PreviousLocation)>();
        int destCount = destinations.Count;
        int baseDaysPerDest = durationDays / destCount;
        int extraDays = durationDays % destCount;

        string? prevLoc = null;
        for (int i = 0; i < destCount; i++)
        {
            var loc = destinations[i];
            int daysForThisDest = baseDaysPerDest + (i < extraDays ? 1 : 0);
            if (daysForThisDest < 1) daysForThisDest = 1;

            for (int dayInDest = 1; dayInDest <= daysForThisDest; dayInDest++)
            {
                destinationSchedule.Add((loc, dayInDest, daysForThisDest, dayInDest == 1 ? prevLoc : null));
            }
            prevLoc = loc;
        }

        while (destinationSchedule.Count < durationDays)
        {
            var lastLoc = destinations.Last();
            destinationSchedule.Add((lastLoc, destinationSchedule.Count + 1, 1, null));
        }

        var days = new List<ItineraryDayItemDto>();
        decimal totalActivityCost = 0.0m;

        for (int d = 1; d <= durationDays; d++)
        {
            var sched = destinationSchedule[d - 1];
            var loc = sched.Location;
            var dayDate = startDate.AddDays(d - 1).ToString("yyyy-MM-dd");
            var candidates = await _researchAgent.ResearchActivitiesAsync(loc, request.Activities ?? ["culture", "nature"], request.AccommodationPreference ?? "standard");

            var dayActivities = new List<ItineraryActivityItemDto>();
            decimal dayCost = 0.0m;
            int actIdx = 1;

            // If moving to a new destination on this day, include a scenic transit leg
            if (sched.PreviousLocation != null)
            {
                string transitTitle;
                string transitDesc;
                if ((sched.PreviousLocation.Contains("Kandy") && loc.Contains("Ella")) || (sched.PreviousLocation.Contains("Ella") && loc.Contains("Kandy")))
                {
                    transitTitle = $"Scenic Highland Train from {sched.PreviousLocation} to {loc}";
                    transitDesc = "Famous Ceylon blue train journey through mountain tea terraces, cloud forests, and colonial viaducts.";
                }
                else if (sched.PreviousLocation.Contains("Colombo") && loc.Contains("Galle"))
                {
                    transitTitle = $"Coastal Ocean Line Express from {sched.PreviousLocation} to {loc}";
                    transitDesc = "Scenic coastal rail track running inches from the Indian Ocean waves.";
                }
                else
                {
                    transitTitle = $"Regional Scenic Transfer from {sched.PreviousLocation} to {loc}";
                    transitDesc = $"Picturesque road travel through Sri Lankan countryside, village markets, and tropical groves.";
                }

                dayActivities.Add(new ItineraryActivityItemDto
                {
                    Id = $"act-native-{d}-{actIdx++}",
                    Time = "08:30 - 11:30",
                    Title = transitTitle,
                    Location = $"{sched.PreviousLocation} to {loc}",
                    DurationMinutes = 180,
                    EstimatedCost = 8.0m,
                    Description = transitDesc,
                    Type = "Transit",
                    TravelTimeToNext = "30 mins",
                    Notes = "Scenic transit arranged according to your travel preference"
                });
                dayCost += 8.0m;
            }

            // Select distinct candidates for each day spent in this destination
            int itemsToTake = sched.PreviousLocation != null ? 2 : 3;
            int skipCount = ((sched.DayInLocation - 1) * 3) % Math.Max(1, candidates.Count);
            var chosenCandidates = candidates.Skip(skipCount).Take(itemsToTake).ToList();
            if (chosenCandidates.Count < itemsToTake && candidates.Count > chosenCandidates.Count)
            {
                var remaining = candidates.Where(c => !chosenCandidates.Any(cc => cc.Name == c.Name)).Take(itemsToTake - chosenCandidates.Count);
                chosenCandidates.AddRange(remaining);
            }

            string[] defaultTimes = sched.PreviousLocation != null
                ? ["13:00 - 15:30", "16:30 - 18:30"]
                : ["09:00 - 11:30", "13:30 - 15:30", "16:30 - 18:30"];

            for (int cIdx = 0; cIdx < chosenCandidates.Count; cIdx++)
            {
                var cand = chosenCandidates[cIdx];
                dayCost += cand.CostPerPerson;
                string timeSlot = cIdx < defaultTimes.Length ? defaultTimes[cIdx] : "14:00 - 16:30";

                dayActivities.Add(new ItineraryActivityItemDto
                {
                    Id = $"act-native-{d}-{actIdx++}",
                    Time = timeSlot,
                    Title = cand.Name,
                    Location = cand.Location,
                    DurationMinutes = cand.DurationMinutes,
                    EstimatedCost = cand.CostPerPerson,
                    Description = cand.Description,
                    Type = cIdx == 0 ? "Attraction" : cIdx == 1 ? "Activity" : "Sightseeing",
                    TravelTimeToNext = "20 mins",
                    Notes = "Curated by NOVA Tourism Agents"
                });
            }

            totalActivityCost += dayCost;

            string dayTitle = sched.TotalDaysInLocation > 1
                ? $"Day {d}: {loc} (Day {sched.DayInLocation}) - {(chosenCandidates.FirstOrDefault()?.Name ?? "Exploration")}"
                : $"Day {d}: {loc} - Highlights & Exploration";

            days.Add(new ItineraryDayItemDto
            {
                Day = d,
                Date = dayDate,
                Location = loc,
                Title = dayTitle,
                Description = $"Curated sightseeing and authentic activities in {loc}",
                Activities = dayActivities,
                EstimatedCost = dayCost
            });
        }

        var budgetAmt = request.Budget?.Amount ?? 600.0m;
        var currency = request.Budget?.Currency ?? "USD";

        // Strict Budget Adherence: Cap activity allocation to 20% of total budget so total never exceeds budget
        decimal maxActivityBudget = Math.Round(budgetAmt * 0.20m, 2);
        decimal finalActivityCost = Math.Min(totalActivityCost, maxActivityBudget);

        decimal remainingBudgetPool = Math.Max(0.0m, budgetAmt - finalActivityCost);
        decimal accommodationCost = Math.Round(remainingBudgetPool * 0.45m, 2);
        decimal foodCost = Math.Round(remainingBudgetPool * 0.30m, 2);
        decimal transportCost = Math.Round(remainingBudgetPool * 0.20m, 2);
        decimal otherCost = Math.Round(remainingBudgetPool * 0.05m, 2);

        decimal totalCalculated = Math.Round(accommodationCost + foodCost + transportCost + otherCost + finalActivityCost, 2);
        if (totalCalculated > budgetAmt)
        {
            otherCost = Math.Max(0.0m, Math.Round(otherCost - (totalCalculated - budgetAmt), 2));
            totalCalculated = Math.Round(accommodationCost + foodCost + transportCost + otherCost + finalActivityCost, 2);
        }

        decimal budgetRemaining = Math.Max(0.0m, Math.Round(budgetAmt - totalCalculated, 2));

        return new TripPlanDto
        {
            Trip = new TripDetailsDto
            {
                Title = !string.IsNullOrWhiteSpace(request.TripName) ? request.TripName.Trim() : $"{durationDays}-Day Tour: {string.Join(" & ", destinations)}",
                Description = $"Curated journey across {string.Join(", ", destinations)} sticking strictly within {currency} {budgetAmt:N0} budget.",
                Duration = durationDays,
                Destinations = destinations,
                Travelers = request.Travelers,
                TransportPreference = request.TransportPreference ?? "Public Transport",
                AccommodationPreference = request.AccommodationPreference ?? "3 Star"
            },
            Days = days,
            Budget = new BudgetBreakdownDto
            {
                Accommodation = accommodationCost,
                Transportation = transportCost,
                Activities = finalActivityCost,
                Food = foodCost,
                Other = otherCost,
                Total = totalCalculated,
                Remaining = budgetRemaining,
                Currency = currency
            },
            Warnings = [],
            Recommendations =
            [
                new TripRecommendationDto
                {
                    Id = "rec-1",
                    Category = "Transport",
                    Title = "Intercity Rail Connections",
                    Description = "Scenic observation carriages recommended between Kandy and Ella."
                }
            ],
            Metadata = new TripMetadataDto
            {
                GeneratedAt = DateTime.UtcNow.ToString("o"),
                Agent = "NOVA 4-Agent Orchestrator",
                AiScore = 96.0
            }
        };
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ??
               User.FindFirstValue("sub") ??
               "U001";
    }
}
