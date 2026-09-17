using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.AgenticAI;
using Nova.Api.DTOs.Common;
using Nova.Api.Entities;
using Nova.Api.Services.Agents;

namespace Nova.Api.Services;

public interface IItineraryGenerationService
{
    Task<ApiResponse<GenerateItineraryResponse>> GenerateItineraryAsync(string tripId, string userId, string userRole, GenerateItineraryRequest request);
    Task<ApiResponse<WorkflowStatusResponse>> GetWorkflowStatusAsync(string workflowId, string userId, string userRole);
    Task<ApiResponse<List<WorkflowAuditLogResponse>>> GetWorkflowLogsAsync(string workflowId, string userId, string userRole);
}

public class ItineraryGenerationService : IItineraryGenerationService
{
    private readonly NovaDbContext _db;
    private readonly ITravelPlanningAgent _planningAgent;
    private readonly IDestinationResearchAgent _researchAgent;
    private readonly ITravelLogisticsAgent _logisticsAgent;
    private readonly ISafetyValidationAgent _safetyAgent;
    private readonly IItineraryValidationService _validationService;

    public ItineraryGenerationService(
        NovaDbContext db,
        ITravelPlanningAgent planningAgent,
        IDestinationResearchAgent researchAgent,
        ITravelLogisticsAgent logisticsAgent,
        ISafetyValidationAgent safetyAgent,
        IItineraryValidationService validationService)
    {
        _db = db;
        _planningAgent = planningAgent;
        _researchAgent = researchAgent;
        _logisticsAgent = logisticsAgent;
        _safetyAgent = safetyAgent;
        _validationService = validationService;
    }

    public async Task<ApiResponse<GenerateItineraryResponse>> GenerateItineraryAsync(string tripId, string userId, string userRole, GenerateItineraryRequest request)
    {
        var trip = await _db.Trips.FirstOrDefaultAsync(t => t.Id == tripId);
        if (trip == null) return ApiResponse<GenerateItineraryResponse>.Fail("Trip not found.");

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && trip.UserId != userId)
        {
            return ApiResponse<GenerateItineraryResponse>.Fail("You are not authorized to generate itineraries for this trip.");
        }

        // Apply constraints or fallbacks to trip
        var destination = !string.IsNullOrWhiteSpace(request.Destination) ? request.Destination.Trim() : trip.Destination;
        var startDate = request.StartDate ?? trip.StartDate;
        var endDate = request.EndDate ?? trip.EndDate;
        var travelers = request.Travelers ?? trip.NumberOfTravelers;
        var budget = request.TotalBudget ?? trip.Budget;
        var interests = request.Interests ?? trip.Interests;
        var tripStyle = request.PreferredTripStyle ?? trip.TripStyle;

        // Step 1: Initialize Workflow in PostgreSQL
        var workflow = new ItineraryGenerationWorkflow
        {
            TripId = tripId,
            Status = WorkflowStatus.Pending,
            CurrentStep = "Initialized",
            ConstraintsJson = JsonSerializer.Serialize(request),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Workflows.Add(workflow);

        workflow.AuditLogs.Add(new WorkflowAuditLog
        {
            Action = "WorkflowCreated",
            Actor = "WorkflowEngine",
            Status = "Pending",
            Details = JsonSerializer.Serialize(new { TripId = tripId, Destination = destination, Travelers = travelers, Budget = budget })
        });

        await _db.SaveChangesAsync();

        try
        {
            // Step 2: Agent 1 - Travel Planning Agent (Decompose objective into day structures)
            workflow.Status = WorkflowStatus.Planning;
            workflow.CurrentStep = "Agent 1: Travel Planning Agent active";
            workflow.UpdatedAt = DateTime.UtcNow;

            workflow.AuditLogs.Add(new WorkflowAuditLog
            {
                Action = "AgentStarted",
                Actor = "TravelPlanningAgent",
                Status = "Planning",
                Details = "Analyzing duration, travel pace, and day structures."
            });
            await _db.SaveChangesAsync();

            var structuredObjective = new StructuredObjectiveDto
            {
                TripId = tripId,
                UserId = userId,
                Destination = destination,
                StartDate = startDate,
                EndDate = endDate,
                Travelers = travelers,
                Budget = budget,
                Interests = interests,
                Preferences = new() { { "tripStyle", tripStyle } },
                Constraints = new()
                {
                    { "maxDailyTravelHours", request.MaxDailyTravelHours },
                    { "maxActivitiesPerDay", request.MaxActivitiesPerDay }
                }
            };

            var dayPlans = await _planningAgent.PlanDaysAsync(structuredObjective);

            workflow.AuditLogs.Add(new WorkflowAuditLog
            {
                Action = "AgentCompleted",
                Actor = "TravelPlanningAgent",
                Status = "Planned",
                Details = $"Successfully planned {dayPlans.Count} day frameworks."
            });
            await _db.SaveChangesAsync();

            // Step 3: Agent 2 - Destination Research & Recommendation Agent
            workflow.Status = WorkflowStatus.Researching;
            workflow.CurrentStep = "Agent 2: Destination Research & Recommendation Agent active";
            workflow.UpdatedAt = DateTime.UtcNow;

            workflow.AuditLogs.Add(new WorkflowAuditLog
            {
                Action = "AgentStarted",
                Actor = "DestinationResearchAgent",
                Status = "Researching",
                Details = $"Sourcing candidate attractions for {destination} matching interests: {string.Join(", ", interests)}."
            });
            await _db.SaveChangesAsync();

            var candidateActivities = await _researchAgent.ResearchActivitiesAsync(destination, interests, tripStyle);

            workflow.AuditLogs.Add(new WorkflowAuditLog
            {
                Action = "AgentCompleted",
                Actor = "DestinationResearchAgent",
                Status = "Researched",
                Details = $"Found {candidateActivities.Count} candidate activities."
            });
            await _db.SaveChangesAsync();

            // Step 4: Agent 3 - Travel Logistics & Availability Agent
            workflow.Status = WorkflowStatus.CheckingLogistics;
            workflow.CurrentStep = "Agent 3: Travel Logistics & Availability Agent active";
            workflow.UpdatedAt = DateTime.UtcNow;

            workflow.AuditLogs.Add(new WorkflowAuditLog
            {
                Action = "AgentStarted",
                Actor = "TravelLogisticsAgent",
                Status = "CheckingLogistics",
                Details = "Calculating sequential travel times and sequencing."
            });
            await _db.SaveChangesAsync();

            var generatedDays = new List<ItineraryDay>();

            foreach (var plan in dayPlans)
            {
                var day = new ItineraryDay
                {
                    Date = plan.Date,
                    DayNumber = plan.DayNumber,
                    Title = plan.Title,
                    Location = plan.Location
                };

                var items = await _logisticsAgent.SequenceAndScheduleAsync(plan.Date, plan.Location, candidateActivities, request.MaxDailyTravelHours);
                day.Items = items;
                generatedDays.Add(day);

                // Assess multimodal transport options (PickMe, Bus, Train) for logistics availability
                await _logisticsAgent.AssessTransportLogisticsAsync(plan.Date, destination, plan.Location, "PUBLIC_TRANSPORT");
            }

            workflow.AuditLogs.Add(new WorkflowAuditLog
            {
                Action = "AgentCompleted",
                Actor = "TravelLogisticsAgent",
                Status = "LogisticsScheduled",
                Details = "Scheduled activities and evaluated multimodal transport logistics (PickMe, Bus, Train) across all itinerary days."
            });
            await _db.SaveChangesAsync();

            // Step 5: Agent 4 - Itinerary Validation & Safety Agent
            workflow.Status = WorkflowStatus.Validating;
            workflow.CurrentStep = "Agent 4: Safety Validation Agent active";
            workflow.UpdatedAt = DateTime.UtcNow;

            workflow.AuditLogs.Add(new WorkflowAuditLog
            {
                Action = "AgentStarted",
                Actor = "SafetyValidationAgent",
                Status = "Validating",
                Details = "Assessing weather, terrain, and safety constraints."
            });
            await _db.SaveChangesAsync();

            var safetyAssessment = await _safetyAgent.AssessSafetyAsync(destination, generatedDays);

            // Step 6: Deterministic Backend Validation Rules
            var validationResult = _validationService.Validate(trip, generatedDays, request);
            validationResult.Advisories.AddRange(safetyAssessment.Advisories);

            workflow.AuditLogs.Add(new WorkflowAuditLog
            {
                Action = "DeterministicValidationPerformed",
                Actor = "ItineraryValidationService",
                Status = validationResult.IsValid ? "Valid" : "ViolationsDetected",
                Details = JsonSerializer.Serialize(new { validationResult.IsValid, validationResult.FeasibilityScore, ErrorCount = validationResult.Errors.Count })
            });
            await _db.SaveChangesAsync();

            // Step 7: Atomic Persistence of Itinerary & Workflow Status
            var itinerary = new Itinerary
            {
                TripId = tripId,
                Title = $"{durationDays(startDate, endDate)}-Day {destination} AI Itinerary",
                Status = ItineraryStatus.PendingApproval,
                TotalEstimatedCost = generatedDays.SelectMany(d => d.Items).Sum(i => i.EstimatedCost),
                FeasibilityScore = validationResult.FeasibilityScore,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            foreach (var gd in generatedDays)
            {
                gd.ItineraryId = itinerary.Id;
                itinerary.Days.Add(gd);
            }

            _db.Itineraries.Add(itinerary);

            // Advance workflow status
            workflow.Status = WorkflowStatus.PendingApproval;
            workflow.CurrentStep = "Awaiting Human Review & Approval";
            workflow.UpdatedAt = DateTime.UtcNow;

            workflow.AuditLogs.Add(new WorkflowAuditLog
            {
                Action = "ApprovalRequested",
                Actor = "WorkflowEngine",
                Status = "PendingApproval",
                Details = $"Itinerary '{itinerary.Id}' staged for operator approval."
            });

            await _db.SaveChangesAsync();

            return ApiResponse<GenerateItineraryResponse>.Ok(new GenerateItineraryResponse
            {
                WorkflowId = workflow.Id,
                TripId = tripId,
                ItineraryId = itinerary.Id,
                Status = workflow.Status.ToString(),
                CurrentStep = workflow.CurrentStep,
                ValidationResult = validationResult,
                Message = "Itinerary generated and pending operator review.",
                GeneratedAt = DateTime.UtcNow
            }, "Itinerary generated and pending operator review.");
        }
        catch (Exception ex)
        {
            workflow.Status = WorkflowStatus.Failed;
            workflow.CurrentStep = "Error";
            workflow.ErrorMessage = ex.Message;
            workflow.UpdatedAt = DateTime.UtcNow;

            workflow.AuditLogs.Add(new WorkflowAuditLog
            {
                Action = "WorkflowFailed",
                Actor = "WorkflowEngine",
                Status = "Failed",
                Details = ex.ToString()
            });

            await _db.SaveChangesAsync();

            return ApiResponse<GenerateItineraryResponse>.Fail($"Workflow execution failed: {ex.Message}");
        }
    }

    public async Task<ApiResponse<WorkflowStatusResponse>> GetWorkflowStatusAsync(string workflowId, string userId, string userRole)
    {
        var workflow = await _db.Workflows
            .Include(w => w.Trip)
            .Include(w => w.AuditLogs)
            .FirstOrDefaultAsync(w => w.Id == workflowId);

        if (workflow == null) return ApiResponse<WorkflowStatusResponse>.Fail("Workflow not found.");

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && workflow.Trip?.UserId != userId)
        {
            return ApiResponse<WorkflowStatusResponse>.Fail("You are not authorized to view this workflow.");
        }

        var itinerary = await _db.Itineraries.OrderByDescending(i => i.CreatedAt).FirstOrDefaultAsync(i => i.TripId == workflow.TripId);

        var response = new WorkflowStatusResponse
        {
            WorkflowId = workflow.Id,
            TripId = workflow.TripId,
            Status = workflow.Status.ToString(),
            CurrentStep = workflow.CurrentStep,
            GeneratedItineraryId = itinerary?.Id,
            ErrorMessage = workflow.ErrorMessage,
            CreatedAt = workflow.CreatedAt,
            UpdatedAt = workflow.UpdatedAt,
            Logs = workflow.AuditLogs.OrderBy(a => a.Timestamp).Select(a => new WorkflowAuditLogResponse
            {
                Id = a.Id,
                WorkflowId = a.WorkflowId,
                Action = a.Action,
                Actor = a.Actor,
                Timestamp = a.Timestamp,
                Status = a.Status,
                Details = a.Details
            }).ToList()
        };

        return ApiResponse<WorkflowStatusResponse>.Ok(response);
    }

    public async Task<ApiResponse<List<WorkflowAuditLogResponse>>> GetWorkflowLogsAsync(string workflowId, string userId, string userRole)
    {
        var workflow = await _db.Workflows.Include(w => w.Trip).FirstOrDefaultAsync(w => w.Id == workflowId);
        if (workflow == null) return ApiResponse<List<WorkflowAuditLogResponse>>.Fail("Workflow not found.");

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && workflow.Trip?.UserId != userId)
        {
            return ApiResponse<List<WorkflowAuditLogResponse>>.Fail("You are not authorized to view these logs.");
        }

        var logs = await _db.AuditLogs
            .Where(a => a.WorkflowId == workflowId)
            .OrderBy(a => a.Timestamp)
            .Select(a => new WorkflowAuditLogResponse
            {
                Id = a.Id,
                WorkflowId = a.WorkflowId,
                Action = a.Action,
                Actor = a.Actor,
                Timestamp = a.Timestamp,
                Status = a.Status,
                Details = a.Details
            })
            .ToListAsync();

        return ApiResponse<List<WorkflowAuditLogResponse>>.Ok(logs);
    }

    private static int durationDays(DateTime start, DateTime end) =>
        Math.Max(1, (int)Math.Ceiling((end - start).TotalDays));
}
