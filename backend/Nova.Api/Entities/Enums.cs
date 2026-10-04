namespace Nova.Api.Entities;

public enum UserRole
{
    Tourist,
    TourismOperator,
    Admin,
    User
}

public enum TripStatus
{
    Draft,
    Planned,
    Confirmed,
    Ongoing,
    Completed,
    Cancelled
}

public enum ItineraryStatus
{
    Draft,
    Generated,
    PendingApproval,
    Approved,
    Published,
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
