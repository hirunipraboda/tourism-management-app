namespace tourism_management_app.Api.DTOs
{
    public class ReviewStatusUpdateDto
    {
        public string? Status { get; set; } = "Published"; // "Published", "Pending", "Flagged", "Archived", "Rejected"
        public string? OperatorNotes { get; set; }
    }

    public class ReviewReplyDto
    {
        public string Reply { get; set; } = string.Empty;
    }
}
