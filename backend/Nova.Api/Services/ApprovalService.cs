using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Itineraries;
using Nova.Api.Entities;

namespace Nova.Api.Services;

public interface IApprovalService
{
    Task<ApiResponse<ApprovalResponse>> ApproveItineraryAsync(string itineraryId, string userId, string userRole, string comments);
    Task<ApiResponse<ApprovalResponse>> RejectItineraryAsync(string itineraryId, string userId, string userRole, string comments);
    Task<ApiResponse<ApprovalResponse>> RequestRevisionAsync(string itineraryId, string userId, string userRole, string comments);
}

public class ApprovalService : IApprovalService
{
    private readonly NovaDbContext _db;

    public ApprovalService(NovaDbContext db)
    {
        _db = db;
    }

    public async Task<ApiResponse<ApprovalResponse>> ApproveItineraryAsync(string itineraryId, string userId, string userRole, string comments)
    {
        return await ProcessApprovalAsync(itineraryId, userId, userRole, ApprovalAction.Approved, ItineraryStatus.Approved, WorkflowStatus.Approved, comments);
    }

    public async Task<ApiResponse<ApprovalResponse>> RejectItineraryAsync(string itineraryId, string userId, string userRole, string comments)
    {
        return await ProcessApprovalAsync(itineraryId, userId, userRole, ApprovalAction.Rejected, ItineraryStatus.Rejected, WorkflowStatus.Rejected, comments);
    }

    public async Task<ApiResponse<ApprovalResponse>> RequestRevisionAsync(string itineraryId, string userId, string userRole, string comments)
    {
        return await ProcessApprovalAsync(itineraryId, userId, userRole, ApprovalAction.RevisionRequested, ItineraryStatus.RevisionRequired, WorkflowStatus.RevisionRequired, comments);
    }

    private async Task<ApiResponse<ApprovalResponse>> ProcessApprovalAsync(
        string itineraryId,
        string userId,
        string userRole,
        ApprovalAction action,
        ItineraryStatus newStatus,
        WorkflowStatus newWorkflowStatus,
        string comments)
    {
        // 1. RBAC check: Only Operator or Admin can approve/reject/request revision
        if (!userRole.Equals(UserRole.TourismOperator.ToString(), StringComparison.OrdinalIgnoreCase) &&
            !userRole.Equals(UserRole.Admin.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<ApprovalResponse>.Fail("Forbidden: Only Tourism Operators or Administrators can approve or reject itineraries.");
        }

        var itinerary = await _db.Itineraries.Include(i => i.Trip).FirstOrDefaultAsync(i => i.Id == itineraryId);
        if (itinerary == null) return ApiResponse<ApprovalResponse>.Fail("Itinerary not found.");

        try
        {
            var prevStatus = itinerary.Status;
            itinerary.Status = newStatus;
            itinerary.ApprovedByUserId = userId;
            itinerary.ApprovedAt = DateTime.UtcNow;
            itinerary.ApprovalComments = comments;
            itinerary.UpdatedAt = DateTime.UtcNow;

            var approval = new ItineraryApproval
            {
                ItineraryId = itineraryId,
                ApprovedByUserId = userId,
                Action = action,
                PreviousStatus = prevStatus,
                NewStatus = newStatus,
                Comments = comments,
                Timestamp = DateTime.UtcNow
            };

            _db.Approvals.Add(approval);

            // Update associated workflow if exists
            var workflow = await _db.Workflows
                .Where(w => w.TripId == itinerary.TripId)
                .OrderByDescending(w => w.CreatedAt)
                .FirstOrDefaultAsync();

            if (workflow != null)
            {
                workflow.Status = newWorkflowStatus;
                workflow.CurrentStep = $"Human Decision: {action} by {userRole}";
                workflow.UpdatedAt = DateTime.UtcNow;

                workflow.AuditLogs.Add(new WorkflowAuditLog
                {
                    Action = action.ToString(),
                    Actor = $"{userRole}:{userId}",
                    Status = newWorkflowStatus.ToString(),
                    Details = comments
                });
            }

            // If approved, update trip status to Confirmed/Planned
            if (action == ApprovalAction.Approved && itinerary.Trip != null)
            {
                itinerary.Trip.Status = TripStatus.Planned;
                itinerary.Trip.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();

            return ApiResponse<ApprovalResponse>.Ok(new ApprovalResponse
            {
                ItineraryId = itineraryId,
                Action = action.ToString(),
                PreviousStatus = prevStatus.ToString(),
                NewStatus = newStatus.ToString(),
                Comments = comments,
                Timestamp = approval.Timestamp
            }, $"Itinerary {action} successfully.");
        }
        catch (Exception ex)
        {
            return ApiResponse<ApprovalResponse>.Fail($"Failed to record approval decision: {ex.Message}");
        }
    }
}
