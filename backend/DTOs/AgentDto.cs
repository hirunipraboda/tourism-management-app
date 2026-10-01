namespace tourism_management_app.Api.DTOs
{
    /// <summary>Request body for POST /api/Recommendations/agent</summary>
    public class AgentRequestDto
    {
        /// <summary>Natural-language travel request from the user.</summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>Optional filter context to ground the agent.</summary>
        public PersonalizedQueryParams? Filters { get; set; }

        /// <summary>Optional conversation ID for multi-turn conversations.</summary>
        public string? ConversationId { get; set; }
    }

    /// <summary>Structured response from the AI travel agent.</summary>
    public class AgentResponseDto
    {
        /// <summary>A natural-language summary of the agent's reasoning.</summary>
        public string Summary { get; set; } = string.Empty;

        /// <summary>Up to 6 ranked attraction recommendations.</summary>
        public List<AgentRecommendationItem> Recommendations { get; set; } = new();

        /// <summary>A follow-up question if more info is needed, or null.</summary>
        public string? FollowUpQuestion { get; set; }

        /// <summary>Conversation ID for multi-turn continuation.</summary>
        public string ConversationId { get; set; } = string.Empty;
    }

    public class AgentRecommendationItem
    {
        public int AttractionId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public double MatchScore { get; set; }
        public string Category { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public double AvgRating { get; set; }
        public int ReviewCount { get; set; }
        public double EstimatedCost { get; set; }
        public string Location { get; set; } = string.Empty;
    }
}
