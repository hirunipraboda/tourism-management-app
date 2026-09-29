using Nova.Api.DTOs.AgenticAI;
using Nova.Api.Entities;
using Nova.Api.Services.Agents;
using Xunit;

namespace Nova.Tests;

public class TourismAgentsTests
{
    [Fact]
    public async Task TravelPlanningAgent_DeconstructsObjectiveIntoDays()
    {
        var agent = new TravelPlanningAgent();
        var objective = new StructuredObjectiveDto
        {
            TripId = Guid.NewGuid().ToString(),
            Destination = "Sigiriya",
            StartDate = new DateTime(2026, 10, 1),
            EndDate = new DateTime(2026, 10, 3),
            DurationDays = 3,
            Travelers = 2,
            Budget = 1000,
            Interests = new List<string> { "Culture", "Adventure" },
            TripStyle = "Adventure"
        };

        var days = await agent.PlanDaysAsync(objective);

        Assert.NotNull(days);
        Assert.Equal(3, days.Count);
        Assert.Equal(1, days[0].DayNumber);
        Assert.Equal(3, days[2].DayNumber);
        Assert.All(days, d => Assert.False(string.IsNullOrEmpty(d.Title)));
    }

    [Fact]
    public async Task DestinationResearchAgent_ReturnsCuratedActivitiesForDestination()
    {
        var agent = new DestinationResearchAgent();
        var activities = await agent.ResearchActivitiesAsync("Sigiriya", new List<string> { "Culture", "History" }, "Luxury");

        Assert.NotNull(activities);
        Assert.NotEmpty(activities);
        Assert.Contains(activities, a => a.Name.Contains("Sigiriya", StringComparison.OrdinalIgnoreCase));
        Assert.All(activities, a => Assert.True(a.DurationMinutes > 0));
    }

    [Fact]
    public async Task TravelLogisticsAgent_SequencesItemsWithoutOverlap()
    {
        var agent = new TravelLogisticsAgent();
        var candidates = new List<ActivityCandidate>
        {
            new() { Name = "Activity 1", DurationMinutes = 120, TravelTimeFromPrevious = 30, CostPerPerson = 25 },
            new() { Name = "Activity 2", DurationMinutes = 90, TravelTimeFromPrevious = 20, CostPerPerson = 15 }
        };

        var items = await agent.SequenceAndScheduleAsync(DateTime.UtcNow, "Sigiriya", candidates, maxDailyTravelHours: 3);

        Assert.NotNull(items);
        Assert.Equal(2, items.Count);
        Assert.Equal(1, items[0].SequenceOrder);
        Assert.Equal(2, items[1].SequenceOrder);
        // Ensure no temporal overlap: item 2 starts at or after item 1 end time + travel buffer
        Assert.True(items[1].StartTime >= items[0].EndTime);
    }

    [Fact]
    public async Task SafetyValidationAgent_AssessesDestinationAndProvidesScore()
    {
        var agent = new SafetyValidationAgent();
        var days = new List<ItineraryDay>
        {
            new ItineraryDay
            {
                DayNumber = 1,
                Date = DateTime.UtcNow,
                Items = new List<ItineraryItem>
                {
                    new ItineraryItem { ActivityName = "Sigiriya Rock Climb", DurationMinutes = 180 }
                }
            }
        };

        var result = await agent.AssessSafetyAsync("Sigiriya", days);

        Assert.NotNull(result);
        Assert.True(result.SafetyScore > 80.0);
        Assert.NotEmpty(result.Advisories);
    }
}
