using Nova.Api.DTOs.AgenticAI;
using Nova.Api.Entities;

namespace Nova.Api.Services.Agents;

// 1. Travel Planning Agent
public interface ITravelPlanningAgent
{
    Task<List<ItineraryDayPlan>> PlanDaysAsync(StructuredObjectiveDto objective);
}

// 2. Destination Research & Recommendation Agent
public interface IDestinationResearchAgent
{
    Task<List<ActivityCandidate>> ResearchActivitiesAsync(string destination, List<string> interests, string tripStyle);
}

// 3. Travel Logistics & Availability Agent
public interface ITravelLogisticsAgent
{
    Task<List<ItineraryItem>> SequenceAndScheduleAsync(DateTime date, string location, List<ActivityCandidate> candidates, int maxDailyTravelHours);
    Task<TransportLogisticsAssessment> AssessTransportLogisticsAsync(DateTime date, string origin, string destination, string transportType);
}

// 4. Itinerary Validation & Safety Agent
public interface ISafetyValidationAgent
{
    Task<SafetyAssessmentResult> AssessSafetyAsync(string destination, List<ItineraryDay> days);
}

public class ActivityCandidate
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Category { get; set; } = "culture";
    public decimal CostPerPerson { get; set; } = 0.0m;
    public int DurationMinutes { get; set; } = 120;
    public TimeSpan DefaultStartTime { get; set; }
    public TimeSpan DefaultEndTime { get; set; }
    public int TravelTimeFromPrevious { get; set; } = 15;
}

public class ItineraryDayPlan
{
    public int DayNumber { get; set; }
    public DateTime Date { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
}

public class SafetyAssessmentResult
{
    public double SafetyScore { get; set; } = 96.0;
    public List<string> Advisories { get; set; } = [];
}

public class TransportLogisticsAssessment
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string RecommendedMode { get; set; } = "PUBLIC_TRANSPORT"; // PICKME, BUS, TRAIN
    public int EstimatedTravelMinutes { get; set; } = 60;
    public decimal EstimatedCost { get; set; } = 0.0m;
    public bool IsFeasible { get; set; } = true;
    public List<string> LogisticsNotes { get; set; } = [];
}

// Implementations
public class TravelPlanningAgent : ITravelPlanningAgent
{
    public Task<List<ItineraryDayPlan>> PlanDaysAsync(StructuredObjectiveDto objective)
    {
        int durationDays = objective.DurationDays > 0 
            ? objective.DurationDays 
            : Math.Max(1, (int)(objective.EndDate.Date - objective.StartDate.Date).TotalDays + 1);
        var days = new List<ItineraryDayPlan>();

        for (int d = 1; d <= durationDays; d++)
        {
            var date = objective.StartDate.AddDays(d - 1);
            days.Add(new ItineraryDayPlan
            {
                DayNumber = d,
                Date = date,
                Location = objective.Destination,
                Title = d == 1 ? $"Arrival & Exploration in {objective.Destination}" :
                        d == durationDays ? $"Final Highlights & Departure from {objective.Destination}" :
                        $"{objective.Destination} Cultural & Nature Excursions"
            });
        }

        return Task.FromResult(days);
    }
}

public class DestinationResearchAgent : IDestinationResearchAgent
{
    public Task<List<ActivityCandidate>> ResearchActivitiesAsync(string destination, List<string> interests, string tripStyle)
    {
        var candidates = new List<ActivityCandidate>();

        if (destination.Contains("Sigiriya", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Sigiriya Rock Citadel Fortress Climb",
                Description = "Climb the UNESCO rock fortress to King Kasyapa’s 5th-century royal palace.",
                Location = "Sigiriya Citadel",
                Category = "culture",
                CostPerPerson = 30.0m,
                DurationMinutes = 180,
                DefaultStartTime = new TimeSpan(6, 30, 0),
                DefaultEndTime = new TimeSpan(9, 30, 0),
                TravelTimeFromPrevious = 20
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Authentic Village Bullock Cart & Lunch",
                Description = "Traditional Sri Lankan culinary experience on banana leaves with catamaran ride.",
                Location = "Sigiriya Village",
                Category = "culture",
                CostPerPerson = 15.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(11, 30, 0),
                DefaultEndTime = new TimeSpan(13, 30, 0),
                TravelTimeFromPrevious = 20
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Pidurangala Rock Sunset Viewpoint",
                Description = "Hike to panoramic 360-degree viewpoint overlooking Sigiriya rock.",
                Location = "Pidurangala",
                Category = "nature",
                CostPerPerson = 5.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(16, 0, 0),
                DefaultEndTime = new TimeSpan(18, 0, 0),
                TravelTimeFromPrevious = 25
            });
        }
        else if (destination.Contains("Kandy", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Temple of the Sacred Tooth Relic (Sri Dalada Maligawa)",
                Description = "Historic Buddhist temple complex venerating the sacred tooth relic.",
                Location = "Kandy Lake Round",
                Category = "culture",
                CostPerPerson = 10.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(9, 0, 0),
                DefaultEndTime = new TimeSpan(11, 0, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Royal Botanical Gardens Botanical Walk",
                Description = "Walk through 147 acres of tropical flora, orchids, and giant palm trees.",
                Location = "Peradeniya",
                Category = "nature",
                CostPerPerson = 12.0m,
                DurationMinutes = 150,
                DefaultStartTime = new TimeSpan(12, 30, 0),
                DefaultEndTime = new TimeSpan(15, 0, 0),
                TravelTimeFromPrevious = 25
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Traditional Kandyan Cultural Dance Show",
                Description = "Vibrant drumming, fire-walking, and ceremonial Kandyan dance.",
                Location = "Kandy Cultural Center",
                Category = "culture",
                CostPerPerson = 10.0m,
                DurationMinutes = 90,
                DefaultStartTime = new TimeSpan(17, 30, 0),
                DefaultEndTime = new TimeSpan(19, 0, 0),
                TravelTimeFromPrevious = 20
            });
        }
        else if (destination.Contains("Ella", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add(new ActivityCandidate
            {
                Name = "Demodara Nine Arches Viaduct Bridge",
                Description = "Iconic colonial stone railway viaduct surrounded by emerald tea plantations.",
                Location = "Ella",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(8, 30, 0),
                DefaultEndTime = new TimeSpan(10, 30, 0),
                TravelTimeFromPrevious = 30
            });
            candidates.Add(new ActivityCandidate
            {
                Name = "Little Adam's Peak Mountain Trek",
                Description = "Scenic mountain ridge walk with 360-degree views across Ella Gap.",
                Location = "Ella Pass",
                Category = "nature",
                CostPerPerson = 0.0m,
                DurationMinutes = 150,
                DefaultStartTime = new TimeSpan(12, 0, 0),
                DefaultEndTime = new TimeSpan(14, 30, 0),
                TravelTimeFromPrevious = 20
            });
        }
        else
        {
            candidates.Add(new ActivityCandidate
            {
                Name = $"{destination} Heritage Ramparts & Discovery Walk",
                Description = $"Explore historic architecture, local markets, and scenic sights in {destination}.",
                Location = destination,
                Category = "culture",
                CostPerPerson = 15.0m,
                DurationMinutes = 120,
                DefaultStartTime = new TimeSpan(9, 0, 0),
                DefaultEndTime = new TimeSpan(11, 0, 0),
                TravelTimeFromPrevious = 15
            });
            candidates.Add(new ActivityCandidate
            {
                Name = $"{destination} Coastal & Artisan Excursion",
                Description = $"Handmade crafts, fresh local coconut, and relaxing scenery in {destination}.",
                Location = destination,
                Category = "nature",
                CostPerPerson = 20.0m,
                DurationMinutes = 150,
                DefaultStartTime = new TimeSpan(13, 0, 0),
                DefaultEndTime = new TimeSpan(15, 30, 0),
                TravelTimeFromPrevious = 20
            });
        }

        return Task.FromResult(candidates);
    }
}

public class TravelLogisticsAgent : ITravelLogisticsAgent
{
    public Task<List<ItineraryItem>> SequenceAndScheduleAsync(DateTime date, string location, List<ActivityCandidate> candidates, int maxDailyTravelHours)
    {
        var items = new List<ItineraryItem>();
        int order = 1;

        for (int i = 0; i < candidates.Count; i++)
        {
            var cand = candidates[i];
            items.Add(new ItineraryItem
            {
                Id = Guid.NewGuid().ToString(),
                ActivityName = cand.Name,
                Location = cand.Location,
                StartTime = cand.DefaultStartTime,
                EndTime = cand.DefaultEndTime,
                DurationMinutes = cand.DurationMinutes,
                EstimatedCost = cand.CostPerPerson,
                TravelTimeMinutes = i == 0 ? 0 : cand.TravelTimeFromPrevious,
                SequenceOrder = order++,
                Notes = cand.Description
            });
        }

        return Task.FromResult(items);
    }

    public Task<TransportLogisticsAssessment> AssessTransportLogisticsAsync(DateTime date, string origin, string destination, string transportType)
    {
        var assessment = new TransportLogisticsAssessment
        {
            Origin = origin,
            Destination = destination,
            RecommendedMode = transportType.ToUpper(),
            IsFeasible = true
        };

        if (transportType.Equals("BUS", StringComparison.OrdinalIgnoreCase))
        {
            assessment.EstimatedTravelMinutes = 180;
            assessment.EstimatedCost = 650.0m;
            assessment.LogisticsNotes.Add("Direct intercity highway/express bus connection available.");
        }
        else if (transportType.Equals("TRAIN", StringComparison.OrdinalIgnoreCase))
        {
            assessment.EstimatedTravelMinutes = 150;
            assessment.EstimatedCost = 1200.0m;
            assessment.LogisticsNotes.Add("Scenic rail connection with scheduled daily service.");
        }
        else if (transportType.Equals("PICKME", StringComparison.OrdinalIgnoreCase))
        {
            assessment.EstimatedTravelMinutes = 140;
            assessment.EstimatedCost = 4500.0m;
            assessment.LogisticsNotes.Add("Private ride-hailing partner option (PickMe car or van).");
        }
        else
        {
            assessment.EstimatedTravelMinutes = 160;
            assessment.EstimatedCost = 800.0m;
            assessment.LogisticsNotes.Add("Public transit routing feasible via bus or train.");
        }

        return Task.FromResult(assessment);
    }
}

public class SafetyValidationAgent : ISafetyValidationAgent
{
    public Task<SafetyAssessmentResult> AssessSafetyAsync(string destination, List<ItineraryDay> days)
    {
        var advisories = new List<string>();

        if (destination.Contains("Ella", StringComparison.OrdinalIgnoreCase))
        {
            advisories.Add("Weather Warning: Afternoons in Ella can experience mist and showers. Rain gear recommended.");
        }
        if (destination.Contains("Sigiriya", StringComparison.OrdinalIgnoreCase))
        {
            advisories.Add("Heat Advisory: Hydration and early morning climb recommended for the Citadel.");
        }

        return Task.FromResult(new SafetyAssessmentResult
        {
            SafetyScore = 98.0,
            Advisories = advisories
        });
    }
}
