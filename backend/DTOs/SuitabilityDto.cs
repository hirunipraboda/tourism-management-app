namespace tourism_management_app.Api.DTOs
{
    public class SuitabilityDto
    {
        public int AttractionId { get; set; }
        public string Name { get; set; } = string.Empty;
        public double OverallScore { get; set; }
        public string Verdict { get; set; } = string.Empty; // e.g. "Excellent Match", "Good Match"
        public List<SuitabilityCriterion> Criteria { get; set; } = new();
    }

    public class SuitabilityCriterion
    {
        public string Name { get; set; } = string.Empty;
        public double Score { get; set; }    // 0-100
        public double Weight { get; set; }   // e.g. 0.30
        public string Reason { get; set; } = string.Empty;
    }
}
