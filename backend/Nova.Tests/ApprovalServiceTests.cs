using Nova.Api.Entities;
using Nova.Api.Services;
using Xunit;

namespace Nova.Tests;

public class ApprovalServiceTests
{
    private readonly string _operatorId = "33333333-3333-3333-3333-333333333333";
    private readonly string _touristId = "11111111-1111-1111-1111-111111111111";

    [Fact]
    public async Task ApproveItinerary_TourismOperator_UpdatesStatusToApprovedAndCreatesAuditLog()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new ApprovalService(db);

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

        var itinerary = new Itinerary
        {
            TripId = trip.Id,
            Title = "Sigiriya Adventure",
            Status = ItineraryStatus.PendingApproval,
            TotalEstimatedCost = 500
        };
        db.Itineraries.Add(itinerary);

        var workflow = new ItineraryGenerationWorkflow
        {
            TripId = trip.Id,
            Status = WorkflowStatus.PendingApproval,
            CurrentStep = "Awaiting Human Review"
        };
        db.Workflows.Add(workflow);
        await db.SaveChangesAsync();

        var result = await service.ApproveItineraryAsync(itinerary.Id, _operatorId, UserRole.TourismOperator.ToString(), "Looks great and safety approved!");

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(ApprovalAction.Approved.ToString(), result.Data.Action);
        Assert.Equal(ItineraryStatus.Approved.ToString(), result.Data.NewStatus);

        // Verify Itinerary status
        var updatedItinerary = db.Itineraries.FirstOrDefault(i => i.Id == itinerary.Id);
        Assert.NotNull(updatedItinerary);
        Assert.Equal(ItineraryStatus.Approved, updatedItinerary.Status);
        Assert.Equal(_operatorId, updatedItinerary.ApprovedByUserId);

        // Verify Trip status updated to Planned
        var updatedTrip = db.Trips.FirstOrDefault(t => t.Id == trip.Id);
        Assert.NotNull(updatedTrip);
        Assert.Equal(TripStatus.Planned, updatedTrip.Status);

        // Verify Approval record created
        var approvalRecord = db.Approvals.FirstOrDefault(a => a.ItineraryId == itinerary.Id);
        Assert.NotNull(approvalRecord);
        Assert.Equal(ApprovalAction.Approved, approvalRecord.Action);

        // Verify Workflow audit log
        var updatedWorkflow = db.Workflows.FirstOrDefault(w => w.Id == workflow.Id);
        Assert.NotNull(updatedWorkflow);
        Assert.Equal(WorkflowStatus.Approved, updatedWorkflow.Status);
        Assert.Contains(updatedWorkflow.AuditLogs, l => l.Action == "Approved" && l.Details.Contains("safety approved"));
    }

    [Fact]
    public async Task ApproveItinerary_TouristRole_ThrowsForbiddenError()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new ApprovalService(db);

        var itinerary = new Itinerary
        {
            TripId = Guid.NewGuid().ToString(),
            Title = "Unauthorized Approval Test",
            Status = ItineraryStatus.PendingApproval
        };
        db.Itineraries.Add(itinerary);
        await db.SaveChangesAsync();

        var result = await service.ApproveItineraryAsync(itinerary.Id, _touristId, UserRole.Tourist.ToString(), "Attempting self-approval");

        Assert.False(result.Success);
        Assert.Contains("Forbidden", result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task RejectItinerary_TourismOperator_UpdatesStatusToRejected()
    {
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new ApprovalService(db);

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

        var itinerary = new Itinerary
        {
            TripId = trip.Id,
            Title = "Reject Test",
            Status = ItineraryStatus.PendingApproval
        };
        db.Itineraries.Add(itinerary);
        await db.SaveChangesAsync();

        var result = await service.RejectItineraryAsync(itinerary.Id, _operatorId, UserRole.TourismOperator.ToString(), "Unrealistic climbing schedule");

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(ItineraryStatus.Rejected.ToString(), result.Data.NewStatus);

        var updatedItinerary = db.Itineraries.FirstOrDefault(i => i.Id == itinerary.Id);
        Assert.NotNull(updatedItinerary);
        Assert.Equal(ItineraryStatus.Rejected, updatedItinerary.Status);
    }
}
