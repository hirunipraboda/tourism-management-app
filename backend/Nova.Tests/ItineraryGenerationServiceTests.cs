using Nova.Api.DTOs.AgenticAI;
using Nova.Api.Entities;
using Nova.Api.Services;
using Nova.Api.Services.Agents;
using Xunit;

namespace Nova.Tests;

public class ItineraryGenerationServiceTests
{
    private readonly string _touristId = "11111111-1111-1111-1111-111111111111";
    private readonly string _otherTouristId = "22222222-2222-2222-2222-222222222222";

    [Fact]
    public async Task GenerateItinerary_Executes4Agents_AdvancesWorkflowState_AndCreatesAuditLogs()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();

        // Create a test trip
        var trip = new Trip
        {
            UserId = _touristId,
            Destination = "Sigiriya",
            StartDate = DateTime.UtcNow.AddDays(1),
            EndDate = DateTime.UtcNow.AddDays(3),
            NumberOfTravelers = 2,
            Budget = 1500,
            Interests = new List<string> { "Culture", "History" },
            TripStyle = "Adventure",
            Status = TripStatus.Draft
        };
        db.Trips.Add(trip);
        await db.SaveChangesAsync();

        var planningAgent = new TravelPlanningAgent();
        var researchAgent = new DestinationResearchAgent();
        var logisticsAgent = new TravelLogisticsAgent();
        var safetyAgent = new SafetyValidationAgent();
        var validationService = new ItineraryValidationService();

        var generationService = new ItineraryGenerationService(
            db, planningAgent, researchAgent, logisticsAgent, safetyAgent, validationService);

        var request = new GenerateItineraryRequest
        {
            Destination = "Sigiriya",
            MaxActivitiesPerDay = 3,
            MaxDailyTravelHours = 3
        };

        var result = await generationService.GenerateItineraryAsync(trip.Id, _touristId, UserRole.Tourist.ToString(), request);

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.False(string.IsNullOrEmpty(result.Data.ItineraryId));
        Assert.False(string.IsNullOrEmpty(result.Data.WorkflowId));
        Assert.Equal(WorkflowStatus.PendingApproval.ToString(), result.Data.Status);
        Assert.NotNull(result.Data.ValidationResult);
        Assert.True(result.Data.ValidationResult.IsValid);

        // Verify Itinerary was persisted in Db
        var savedItinerary = db.Itineraries.FirstOrDefault(i => i.Id == result.Data.ItineraryId);
        Assert.NotNull(savedItinerary);
        Assert.Equal(ItineraryStatus.PendingApproval, savedItinerary.Status);
        Assert.NotEmpty(savedItinerary.Days);
        Assert.All(savedItinerary.Days, d => Assert.NotEmpty(d.Items));

        // Verify Workflow status and audit logs
        var savedWorkflow = db.Workflows.FirstOrDefault(w => w.Id == result.Data.WorkflowId);
        Assert.NotNull(savedWorkflow);
        Assert.Equal(WorkflowStatus.PendingApproval, savedWorkflow.Status);
        Assert.NotEmpty(savedWorkflow.AuditLogs);

        // Verify all 4 agents logged events
        Assert.Contains(savedWorkflow.AuditLogs, l => l.Actor == "TravelPlanningAgent");
        Assert.Contains(savedWorkflow.AuditLogs, l => l.Actor == "DestinationResearchAgent");
        Assert.Contains(savedWorkflow.AuditLogs, l => l.Actor == "TravelLogisticsAgent");
        Assert.Contains(savedWorkflow.AuditLogs, l => l.Actor == "SafetyValidationAgent");
        Assert.Contains(savedWorkflow.AuditLogs, l => l.Actor == "ItineraryValidationService");
    }

    [Fact]
    public async Task GenerateItinerary_UnauthorizedUser_ReturnsError()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();

        var trip = new Trip
        {
            UserId = _touristId,
            Destination = "Sigiriya",
            StartDate = DateTime.UtcNow.AddDays(1),
            EndDate = DateTime.UtcNow.AddDays(3),
            NumberOfTravelers = 2,
            Budget = 1000,
            Status = TripStatus.Draft
        };
        db.Trips.Add(trip);
        await db.SaveChangesAsync();

        var generationService = new ItineraryGenerationService(
            db, new TravelPlanningAgent(), new DestinationResearchAgent(),
            new TravelLogisticsAgent(), new SafetyValidationAgent(), new ItineraryValidationService());

        // Other tourist attempts to generate
        var result = await generationService.GenerateItineraryAsync(trip.Id, _otherTouristId, UserRole.Tourist.ToString(), new GenerateItineraryRequest());

        Assert.False(result.Success);
        Assert.Contains("not authorized", result.Message, StringComparison.OrdinalIgnoreCase);
    }
}
