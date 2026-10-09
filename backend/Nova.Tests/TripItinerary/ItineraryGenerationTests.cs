using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Nova.Api.DTOs.AgenticAI;
using Nova.Api.Entities;
using Nova.Api.Services.Agents;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.TripItinerary;

/// <summary>
/// Tests for ItineraryGenerationController (api/trips/{tripId}/itinerary/generate, workflow status & logs)
/// covering GEN-001 through GEN-004.
/// </summary>
public class ItineraryGenerationTests
{
    private const string TouristA = PgTestDatabase.UserAId;

    [Fact, Trait("TestCase", "GEN-001")]
    public async Task StartItineraryGenerationWorkflow_ValidTrip_WorkflowStartsAndStagesForApproval_GEN001() // GEN-001
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId;
        await using (var db = host.Db.CreateContext()) tripId = (await Fixtures.SeedTripAsync(db, TouristA, "Sigiriya")).Id;

        var request = new GenerateItineraryRequest
        {
            Destination = "Sigiriya",
            MaxActivitiesPerDay = 3,
            MaxDailyTravelHours = 3
        };

        var res = await host.PostAsync($"/api/trips/{tripId}/itinerary/generate", TestTokens.UserA, request);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.NotNull(res.Data);
        var workflowId = res.Data.GetProperty("workflowId").GetString();
        var itineraryId = res.Data.GetProperty("itineraryId").GetString();
        Assert.NotNull(workflowId);
        Assert.NotNull(itineraryId);
        Assert.Equal("PendingApproval", res.Data.GetProperty("status").GetString());

        // Verify persistence in DB
        await using var verify = host.Db.CreateContext();
        var wf = await verify.Workflows.Include(w => w.AuditLogs).FirstOrDefaultAsync(w => w.Id == workflowId);
        Assert.NotNull(wf);
        Assert.Equal(WorkflowStatus.PendingApproval, wf.Status);
        Assert.NotEmpty(wf.AuditLogs);

        var itin = await verify.Itineraries.Include(i => i.Days).FirstOrDefaultAsync(i => i.Id == itineraryId);
        Assert.NotNull(itin);
        Assert.Equal(ItineraryStatus.PendingApproval, itin.Status);
        Assert.NotEmpty(itin.Days);
    }

    [Fact, Trait("TestCase", "GEN-002")]
    public async Task GetWorkflowStatus_ExistingWorkflow_ReturnsCurrentStatus_GEN002() // GEN-002
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId;
        await using (var db = host.Db.CreateContext()) tripId = (await Fixtures.SeedTripAsync(db, TouristA, "Kandy")).Id;

        var genRes = await host.PostAsync($"/api/trips/{tripId}/itinerary/generate", TestTokens.UserA, new GenerateItineraryRequest());
        var workflowId = genRes.Data.GetProperty("workflowId").GetString()!;

        var res = await host.GetAsync($"/api/trips/{tripId}/itinerary/workflow/{workflowId}", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        Assert.Equal(workflowId, res.Data.GetProperty("workflowId").GetString());
        Assert.Equal(tripId, res.Data.GetProperty("tripId").GetString());
        Assert.Equal("PendingApproval", res.Data.GetProperty("status").GetString());
        Assert.False(string.IsNullOrWhiteSpace(res.Data.GetProperty("currentStep").GetString()));
    }

    [Fact, Trait("TestCase", "GEN-003")]
    public async Task GetWorkflowLogs_ExistingWorkflow_ReturnsAuditLogsAcrossAgents_GEN003() // GEN-003
    {
        await using var host = await NovaApiHost.StartAsync();
        string tripId;
        await using (var db = host.Db.CreateContext()) tripId = (await Fixtures.SeedTripAsync(db, TouristA, "Ella")).Id;

        var genRes = await host.PostAsync($"/api/trips/{tripId}/itinerary/generate", TestTokens.UserA, new GenerateItineraryRequest());
        var workflowId = genRes.Data.GetProperty("workflowId").GetString()!;

        var res = await host.GetAsync($"/api/trips/{tripId}/itinerary/workflow/{workflowId}/logs", TestTokens.UserA);

        Assert.Equal(HttpStatusCode.OK, res.Status);
        Assert.True(res.Success);
        var logs = res.Data.EnumerateArray().ToList();
        Assert.NotEmpty(logs);

        // Verify multi-agent presence in audit log records
        var actors = logs.Select(l => l.GetProperty("actor").GetString()).ToList();
        Assert.Contains(actors, a => a == "TravelPlanningAgent");
        Assert.Contains(actors, a => a == "DestinationResearchAgent");
        Assert.Contains(actors, a => a == "TravelLogisticsAgent");
        Assert.Contains(actors, a => a == "SafetyValidationAgent");
    }

    [Fact, Trait("TestCase", "GEN-004")]
    public async Task GenerationWorkflow_DependencyFailure_EntersSafeFailureState_GEN004() // GEN-004
    {
        // Mock a failure at the research agent boundary
        var failingResearchAgent = new Mock<IDestinationResearchAgent>();
        failingResearchAgent
            .Setup(a => a.ResearchActivitiesAsync(It.IsAny<string>(), It.IsAny<List<string>>(), It.IsAny<string>()))
            .ThrowsAsync(new InvalidOperationException("External Attraction Data Source Timeout"));

        await using var host = await NovaApiHost.StartAsync(services =>
        {
            services.AddScoped(_ => failingResearchAgent.Object);
        });

        string tripId;
        await using (var db = host.Db.CreateContext()) tripId = (await Fixtures.SeedTripAsync(db, TouristA, "Trincomalee")).Id;

        var res = await host.PostAsync($"/api/trips/{tripId}/itinerary/generate", TestTokens.UserA, new GenerateItineraryRequest());

        // Returns Controlled BadRequest failure
        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
        Assert.False(res.Success);
        Assert.Contains("External Attraction Data Source Timeout", res.Message);

        // Verify Workflow recorded the failure safely in DB without corrupting itinerary data
        await using var verify = host.Db.CreateContext();
        var wf = await verify.Workflows.Include(w => w.AuditLogs).FirstOrDefaultAsync(w => w.TripId == tripId);
        Assert.NotNull(wf);
        Assert.Equal(WorkflowStatus.Failed, wf.Status);
        Assert.Equal("Error", wf.CurrentStep);
        Assert.Contains("External Attraction Data Source Timeout", wf.ErrorMessage);
        Assert.Contains(wf.AuditLogs, l => l.Action == "WorkflowFailed");

        // Verify no orphaned itinerary was left in database
        Assert.False(await verify.Itineraries.AnyAsync(i => i.TripId == tripId));
    }
}
