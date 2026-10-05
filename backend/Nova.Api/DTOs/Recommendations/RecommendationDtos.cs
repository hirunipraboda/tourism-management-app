namespace Nova.Api.DTOs.Recommendations;

public class RecommendationFilterRequestDto
{
    public string? DestinationId { get; set; }
    public string? Destination { get; set; }
    public List<string>? Interests { get; set; } = new();
    public string? TripStyle { get; set; }
    public string? TravelStyle { get; set; }
    public int? NumberOfTravelers { get; set; }
    public decimal? Budget { get; set; }
    public decimal? MaxBudget { get; set; }
    public double? MinRating { get; set; }
    public double? MaxDistance { get; set; }
    public string? ActivityType { get; set; }
    public string? SearchQuery { get; set; }
    public string? PreferredEnvironment { get; set; }
    public int MaxResults { get; set; } = 10;
}

public class AiRecommendationDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Location { get; set; } = "";
    public string Category { get; set; } = "";
    public string TargetType { get; set; } = "attraction";
    public double Rating { get; set; } = 4.8;
    public int ReviewCount { get; set; } = 150;
    public string Price { get; set; } = "$20 / person";
    public int SuitabilityScore { get; set; } = 92;
    public int InterestMatch { get; set; } = 95;
    public int RatingMatch { get; set; } = 92;
    public int BudgetMatch { get; set; } = 90;
    public int LocationMatch { get; set; } = 95;
    public int PopularityScore { get; set; } = 94;
    public string Explanation { get; set; } = "";
    public string Image { get; set; } = "";
    public string? SentimentSummary { get; set; }
    public List<string>? SupportingFeedback { get; set; } = new();
    public List<string>? Limitations { get; set; } = new();
    public string? ScoreBreakdown { get; set; }
    public bool IsAiGenerated { get; set; } = true;
    public string? OpeningHours { get; set; }
    public string? BestTimeToVisit { get; set; }
    public string? Duration { get; set; }
    public double? DistanceKm { get; set; }
}

public class RecommendedAttractionDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Location { get; set; }
    public decimal? EntryFee { get; set; }
    public int? VisitDurationMinutes { get; set; }
    public string? ImageUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double RelevanceScore { get; set; }
    public string ReasonForRecommendation { get; set; } = string.Empty;
}

public class RecommendationResponseDto
{
    public List<AiRecommendationDto> Recommendations { get; set; } = new();
    public string AnalysisSummary { get; set; } = "";
    public string? Summary { get; set; }
    public List<string> InformationLimitations { get; set; } = new();
    public string? UnsupportedRequestsNote { get; set; }
    public string ValidationStatus { get; set; } = "PASSED";
    public List<object>? ExecutionTrace { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
