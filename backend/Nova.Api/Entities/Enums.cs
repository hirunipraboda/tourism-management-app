namespace Nova.Api.Entities;

public enum UserRole
{
    Tourist,
    TourismOperator,
    Admin
}

public enum TripStatus
{
    Draft,
    Planned,
    Confirmed,
    Completed,
    Cancelled
}

public enum ItineraryStatus
{
    Draft,
    Generated,
    PendingApproval,
    Approved,
    Rejected,
    RevisionRequired
}

public enum WorkflowStatus
{
    Pending,
    Planning,
    Researching,
    CheckingLogistics,
    Validating,
    PendingApproval,
    Approved,
    Rejected,
    RevisionRequired,
    Completed,
    Failed
}

public enum ApprovalAction
{
    Approved,
    Rejected,
    RevisionRequested
}
