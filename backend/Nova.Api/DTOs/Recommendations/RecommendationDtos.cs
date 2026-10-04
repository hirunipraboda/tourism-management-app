namespace Nova.Api.DTOs.Recommendations;

public class RecommendationFilterRequestDto
{
    public List<string>? Interests { get; set; } = new();
    public string? Destination { get; set; }
    public double? MinRating { get; set; }
    public decimal? MaxBudget { get; set; }
    public double? MaxDistance { get; set; }
    public string? ActivityType { get; set; }
    public string? SearchQuery { get; set; }
    public string? TravelStyle { get; set; }
    public string? PreferredEnvironment { get; set; }
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

public class RecommendationResponseDto
{
    public List<AiRecommendationDto> Recommendations { get; set; } = new();
    public string AnalysisSummary { get; set; } = "";
    public List<string> InformationLimitations { get; set; } = new();
    public string? UnsupportedRequestsNote { get; set; }
    public string ValidationStatus { get; set; } = "PASSED";
    public List<object>? ExecutionTrace { get; set; } = new();
}
