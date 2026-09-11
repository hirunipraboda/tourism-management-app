using Nova.Api.Agents;
using Xunit;

namespace Nova.Tests;

public class AgentOrchestrationTests
{
    [Fact]
    public async Task DestinationResearchAgent_Returns_Attractions_For_Destinations()
    {
        var agent = new DestinationResearchAgent();
        var request = new DestinationResearchRequest
        {
            TargetDestinations = ["Sigiriya", "Kandy"],
            TravelStyle = ["culture"]
        };

        var result = await agent.ResearchAsync(request);

        Assert.NotNull(result);
        Assert.Equal(2, result.DestinationsInfo.Count);
        Assert.Contains(result.DestinationsInfo, d => d.Name == "Sigiriya");
        Assert.NotEmpty(result.DestinationsInfo[0].TopAttractions);
    }

    [Fact]
    public async Task RouteOptimizationAgent_Orders_Destinations_And_Calculates_Distance()
    {
        var agent = new RouteOptimizationAgent();
        var request = new RouteOptimizationRequest
        {
            Destinations = ["Sigiriya", "Kandy", "Ella"],
            DurationDays = 5
        };

        var result = await agent.OptimizeAsync(request);

        Assert.NotNull(result);
        Assert.Equal(3, result.OrderedDestinations.Count);
        Assert.True(result.EstimatedTotalTravelDistanceKm > 0);
        Assert.False(string.IsNullOrEmpty(result.RecommendedTransport));
    }

    [Fact]
    public async Task ItineraryValidationAgent_Detects_Budget_Exceeded()
    {
        var agent = new ItineraryValidationAgent();
        var request = new ItineraryValidationRequest
        {
            BudgetAmount = 200.0,
            Days = [
                new() { Day = 1, EstimatedCost = 150.0 },
                new() { Day = 2, EstimatedCost = 100.0 }
            ]
        };

        var result = await agent.ValidateAsync(request);

        Assert.NotNull(result);
        Assert.False(result.IsValid);
        Assert.Single(result.Warnings);
        Assert.Equal("budget", result.Warnings[0].Type);
        Assert.True(result.Score < 100);
    }

    [Fact]
    public async Task TripPlannerOrchestrator_Generates_Complete_MultiAgent_Itinerary()
    {
        var researchAgent = new DestinationResearchAgent();
        var routeAgent = new RouteOptimizationAgent();
        var validationAgent = new ItineraryValidationAgent();
        var orchestrator = new TripPlannerOrchestrator(researchAgent, routeAgent, validationAgent);

        var request = new TripPlanningRequest
        {
            Destination = "Sri Lanka",
            Destinations = ["Sigiriya", "Kandy", "Ella"],
            StartDate = "2026-10-01",
            EndDate = "2026-10-04",
            Travelers = 2,
            Budget = new PlanBudget { Amount = 1000.0, Currency = "USD" },
            TravelStyle = ["culture", "nature"]
        };

        var result = await orchestrator.GeneratePlanAsync(request);

        Assert.NotNull(result);
        Assert.Equal(3, result.Days.Count);
        Assert.Equal(1000.0, result.Budget.Total + result.Budget.Remaining - result.Budget.Activities + (result.Days.Sum(d => d.EstimatedCost) * 2));
        Assert.True(result.Budget.Total > 0);
        Assert.NotEmpty(result.Trip.Destinations);
        Assert.NotNull(result.Metadata["aiScore"]);
    }
}
