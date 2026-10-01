using System.Text.Json;
using tourism_management_app.Api.DTOs;

namespace tourism_management_app.Api.Services
{
    /// <summary>
    /// Tool-calling agent that understands natural-language travel requests,
    /// calls service-backed tools, and returns a structured ranked list.
    /// Safety: max 5 tool iterations, validated tool args, no hallucinated attractions,
    /// graceful fallback to /personalized if LLM call fails.
    /// </summary>
    public class AgentService : IAgentService
    {
        private readonly LlmClient _llm;
        private readonly IRecommendationService _recService;
        private readonly IConfiguration _config;
        private readonly ILogger<AgentService> _logger;

        private int MaxIterations => int.TryParse(_config["Ai:Agent:MaxIterations"], out var v) ? v : 5;
        private int MaxRecommendations => int.TryParse(_config["Ai:Agent:MaxRecommendations"], out var v) ? v : 6;

        public AgentService(LlmClient llm, IRecommendationService recService,
            IConfiguration config, ILogger<AgentService> logger)
        {
            _llm = llm;
            _recService = recService;
            _config = config;
            _logger = logger;
        }

        public async Task<AgentResponseDto> RunAgentAsync(AgentRequestDto request, int touristId, CancellationToken ct = default)
        {
            var conversationId = request.ConversationId ?? Guid.NewGuid().ToString("N")[..8];
            var defaultFilters = request.Filters ?? new PersonalizedQueryParams();

            try
            {
                return await RunToolLoopAsync(request.Message, defaultFilters, touristId, conversationId, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Agent] Tool loop failed, falling back to personalized.");
                return await FallbackResponseAsync(request.Message, defaultFilters, touristId, conversationId);
            }
        }

        private async Task<AgentResponseDto> RunToolLoopAsync(
            string userMessage, PersonalizedQueryParams filters, int touristId,
            string conversationId, CancellationToken ct)
        {
            var tools = BuildTools();
            var messages = new List<LlmMessage>
            {
                LlmMessage.System(BuildSystemPrompt()),
                LlmMessage.User(userMessage)
            };

            var collectedResults = new Dictionary<string, object>(); // tool -> result
            int iteration = 0;

            while (iteration < MaxIterations && !ct.IsCancellationRequested)
            {
                var response = await _llm.ChatAsync(messages, tools, ct);

                if (response == null)
                {
                    _logger.LogWarning("[Agent] LLM returned null at iteration {I}.", iteration);
                    break;
                }

                if (!response.HasToolCalls)
                {
                    // Final response — parse and return
                    return ParseFinalResponse(response.Content, collectedResults, conversationId, userMessage);
                }

                // Process tool calls
                foreach (var tc in response.ToolCalls)
                {
                    var toolResult = await DispatchToolAsync(tc.Name, tc.ArgumentsJson, filters, touristId, ct);
                    collectedResults[tc.Name] = toolResult;
                    var resultJson = JsonSerializer.Serialize(toolResult);

                    // Add assistant's tool call + tool result to message history
                    messages.Add(LlmMessage.Assistant($"[tool_call:{tc.Name}]"));
                    messages.Add(new LlmMessage { Role = "tool", Content = resultJson });
                }

                iteration++;
            }

            // Ran out of iterations — construct response from collected data
            return await ConstructResponseFromToolResults(collectedResults, userMessage, conversationId, filters, touristId);
        }

        // ── Tool Definitions (passed to LLM) ─────────────────────────────────
        private static List<LlmTool> BuildTools() => new()
        {
            new LlmTool
            {
                Name = "search_attractions",
                Description = "Search Sri Lanka attractions using filters. Use when the user mentions specific budget, category interests, distance, or rating requirements.",
                Parameters = new
                {
                    type = "object",
                    properties = new
                    {
                        interests = new { type = "array", items = new { type = "string" }, description = "Interest categories: Culture, History, Nature, Adventure, Food, Wildlife, Beaches" },
                        maxBudget = new { type = "number", description = "Max daily budget in USD" },
                        maxDistanceKm = new { type = "number", description = "Max distance in km from Colombo" },
                        minRating = new { type = "number", description = "Minimum review rating 0-5" },
                        activityType = new { type = "string", description = "All, attraction, or tour" },
                        limit = new { type = "integer", description = "Max results (default 6)" }
                    },
                    required = Array.Empty<string>()
                }
            },
            new LlmTool
            {
                Name = "get_popular_attractions",
                Description = "Get the most popular Sri Lanka attractions by review count and rating. Use for general 'best places' queries.",
                Parameters = new { type = "object", properties = new { }, required = Array.Empty<string>() }
            },
            new LlmTool
            {
                Name = "get_review_insights",
                Description = "Get aggregate review statistics: top rated places, trending categories, average ratings. Useful for understanding overall tourism trends.",
                Parameters = new
                {
                    type = "object",
                    properties = new
                    {
                        attractionId = new { type = "integer", description = "Optional specific attraction ID for focused insights" }
                    },
                    required = Array.Empty<string>()
                }
            },
            new LlmTool
            {
                Name = "get_suitability",
                Description = "Get a detailed suitability breakdown for a specific attraction vs the user's current filters.",
                Parameters = new
                {
                    type = "object",
                    properties = new
                    {
                        attractionId = new { type = "integer", description = "The attraction ID to analyze" }
                    },
                    required = new[] { "attractionId" }
                }
            },
            new LlmTool
            {
                Name = "get_user_review_history",
                Description = "Get the current user's past reviews and visited places to understand their preferences.",
                Parameters = new { type = "object", properties = new { }, required = Array.Empty<string>() }
            }
        };

        // ── Tool Dispatch ─────────────────────────────────────────────────────
        private async Task<object> DispatchToolAsync(
            string toolName, string argsJson, PersonalizedQueryParams baseFilters,
            int touristId, CancellationToken ct)
        {
            try
            {
                using var doc = JsonDocument.Parse(argsJson);
                var args = doc.RootElement;

                switch (toolName)
                {
                    case "search_attractions":
                        var qp = CloneFilters(baseFilters);
                        if (args.TryGetProperty("interests", out var interestsEl))
                            qp.Interests = interestsEl.EnumerateArray()
                                .Select(x => x.GetString() ?? "").Where(x => x.Length > 0).ToList();
                        if (args.TryGetProperty("maxBudget", out var budgetEl))
                            qp.MaxBudget = budgetEl.GetDouble();
                        if (args.TryGetProperty("maxDistanceKm", out var distEl))
                            qp.MaxDistanceKm = distEl.GetDouble();
                        if (args.TryGetProperty("minRating", out var ratingEl))
                            qp.MinRating = ratingEl.GetDouble();
                        if (args.TryGetProperty("activityType", out var actEl))
                            qp.ActivityType = actEl.GetString() ?? "All";
                        if (args.TryGetProperty("limit", out var limitEl))
                            qp.Limit = limitEl.GetInt32();
                        else qp.Limit = MaxRecommendations;
                        return await _recService.SearchAttractionsAsync(qp);

                    case "get_popular_attractions":
                        return await _recService.GetPopularAttractionsForAgentAsync();

                    case "get_review_insights":
                        int? attrId = null;
                        if (args.TryGetProperty("attractionId", out var attrEl) && attrEl.ValueKind == JsonValueKind.Number)
                            attrId = attrEl.GetInt32();
                        return await _recService.GetReviewInsightsAsync(attrId);

                    case "get_suitability":
                        if (!args.TryGetProperty("attractionId", out var suitIdEl))
                            return new { error = "attractionId is required" };
                        var suitId = suitIdEl.GetInt32();
                        if (!await _recService.AttractionExistsAsync(suitId))
                            return new { error = $"Attraction {suitId} not found in database" };
                        return (object?)await _recService.GetSuitabilityForAgentAsync(suitId, baseFilters, touristId)
                            ?? new { error = "Suitability not available" };

                    case "get_user_review_history":
                        return await _recService.GetUserReviewHistoryAsync(touristId);

                    default:
                        _logger.LogWarning("[Agent] Unknown tool requested: {Tool}", toolName);
                        return new { error = $"Unknown tool: {toolName}" };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Agent] Tool dispatch error for {Tool}", toolName);
                return new { error = "Tool execution failed" };
            }
        }

        // ── Parse final structured response from LLM ─────────────────────────
        private AgentResponseDto ParseFinalResponse(
            string content, Dictionary<string, object> collectedResults,
            string conversationId, string userMessage)
        {
            // Try to extract JSON from the response content
            var recs = ExtractRecommendationsFromResults(collectedResults);
            return new AgentResponseDto
            {
                Summary = content.Length > 10 ? content : BuildFallbackSummary(userMessage, recs),
                Recommendations = recs.Take(MaxRecommendations).ToList(),
                FollowUpQuestion = ExtractFollowUpQuestion(content),
                ConversationId = conversationId
            };
        }

        // ── Build recommendations from tool results ────────────────────────────
        private List<AgentRecommendationItem> ExtractRecommendationsFromResults(
            Dictionary<string, object> results)
        {
            var items = new List<AgentRecommendationItem>();

            foreach (var (_, result) in results)
            {
                var recs = TryExtractRecs(result);
                items.AddRange(recs);
            }

            return items
                .GroupBy(r => r.AttractionId)
                .Select(g => g.OrderByDescending(x => x.MatchScore).First())
                .OrderByDescending(r => r.MatchScore)
                .Take(MaxRecommendations)
                .ToList();
        }

        private static IEnumerable<AgentRecommendationItem> TryExtractRecs(object result)
        {
            if (result is IEnumerable<PersonalizedRecommendationDto> recs)
            {
                return recs.Select(r => new AgentRecommendationItem
                {
                    AttractionId = r.AttractionId,
                    Name = r.Name,
                    Reason = r.MatchReasons.FirstOrDefault() ?? r.Explanation,
                    MatchScore = r.MatchScore,
                    Category = r.Category,
                    ImageUrl = r.ImageUrl,
                    AvgRating = r.AvgRating,
                    ReviewCount = r.ReviewCount,
                    EstimatedCost = r.EstimatedCost,
                    Location = r.Location
                });
            }
            return Enumerable.Empty<AgentRecommendationItem>();
        }

        private static string? ExtractFollowUpQuestion(string content)
        {
            if (string.IsNullOrEmpty(content)) return null;
            var lines = content.Split('\n');
            var questionLine = lines.FirstOrDefault(l =>
                l.TrimStart().StartsWith("?") || l.Contains("?") &&
                (l.ToLower().Contains("would") || l.ToLower().Contains("are you") ||
                 l.ToLower().Contains("do you") || l.ToLower().Contains("how many")));
            return questionLine?.Trim();
        }

        // ── Fallback when LLM is unavailable ─────────────────────────────────
        private async Task<AgentResponseDto> FallbackResponseAsync(
            string userMessage, PersonalizedQueryParams filters, int touristId, string conversationId)
        {
            var lower = userMessage.ToLowerInvariant();
            var detectedInterests = new List<string>(filters.Interests ?? new List<string>());

            if (lower.Contains("history") || lower.Contains("ancient") || lower.Contains("heritage") || lower.Contains("temple") || lower.Contains("ruins"))
            {
                if (!detectedInterests.Contains("History")) detectedInterests.Add("History");
                if (!detectedInterests.Contains("Culture")) detectedInterests.Add("Culture");
            }
            if (lower.Contains("nature") || lower.Contains("mountain") || lower.Contains("hill") || lower.Contains("waterfall") || lower.Contains("hiking") || lower.Contains("trek"))
            {
                if (!detectedInterests.Contains("Nature")) detectedInterests.Add("Nature");
                if (!detectedInterests.Contains("Adventure")) detectedInterests.Add("Adventure");
            }
            if (lower.Contains("wildlife") || lower.Contains("safari") || lower.Contains("elephant") || lower.Contains("leopard") || lower.Contains("whale") || lower.Contains("national park"))
            {
                if (!detectedInterests.Contains("Wildlife")) detectedInterests.Add("Wildlife");
            }
            if (lower.Contains("beach") || lower.Contains("ocean") || lower.Contains("surf") || lower.Contains("coast") || lower.Contains("snorkel"))
            {
                if (!detectedInterests.Contains("Beaches")) detectedInterests.Add("Beaches");
            }
            if (lower.Contains("food") || lower.Contains("tea") || lower.Contains("culinary") || lower.Contains("dining"))
            {
                if (!detectedInterests.Contains("Food")) detectedInterests.Add("Food");
            }

            var clonedFilters = CloneFilters(filters);
            if (detectedInterests.Any())
            {
                clonedFilters.Interests = detectedInterests;
            }

            var allRecs = await _recService.GetPersonalizedRecommendationsAsync(clonedFilters, touristId);
            
            // Prioritize matching text/location in name, description or category
            var filteredRecs = allRecs
                .OrderByDescending(r =>
                {
                    double boost = r.MatchScore;
                    if (lower.Contains("colombo") && (r.Location.Contains("Colombo", StringComparison.OrdinalIgnoreCase) || r.Name.Contains("Colombo", StringComparison.OrdinalIgnoreCase)))
                        boost += 50;
                    if (lower.Contains("kandy") && (r.Location.Contains("Kandy", StringComparison.OrdinalIgnoreCase) || r.Name.Contains("Kandy", StringComparison.OrdinalIgnoreCase)))
                        boost += 50;
                    if (lower.Contains("ella") && (r.Location.Contains("Ella", StringComparison.OrdinalIgnoreCase) || r.Name.Contains("Ella", StringComparison.OrdinalIgnoreCase)))
                        boost += 50;
                    if (lower.Contains("galle") && (r.Location.Contains("Galle", StringComparison.OrdinalIgnoreCase) || r.Name.Contains("Galle", StringComparison.OrdinalIgnoreCase)))
                        boost += 50;
                    if (lower.Contains("yala") && (r.Location.Contains("Yala", StringComparison.OrdinalIgnoreCase) || r.Name.Contains("Yala", StringComparison.OrdinalIgnoreCase)))
                        boost += 50;
                    if (lower.Contains("sigiriya") && (r.Location.Contains("Sigiriya", StringComparison.OrdinalIgnoreCase) || r.Name.Contains("Sigiriya", StringComparison.OrdinalIgnoreCase)))
                        boost += 50;
                    if (detectedInterests.Any(i => i.Equals(r.Category, StringComparison.OrdinalIgnoreCase)))
                        boost += 30;
                    return boost;
                })
                .Take(MaxRecommendations)
                .Select(r => new AgentRecommendationItem
                {
                    AttractionId = r.AttractionId,
                    Name = r.Name,
                    Reason = r.MatchReasons.FirstOrDefault() ?? $"Top match for {r.Category} in {r.Location}",
                    MatchScore = r.MatchScore,
                    Category = r.Category,
                    ImageUrl = r.ImageUrl,
                    AvgRating = r.AvgRating,
                    ReviewCount = r.ReviewCount,
                    EstimatedCost = r.EstimatedCost,
                    Location = r.Location
                }).ToList();

            var topNames = string.Join(", ", filteredRecs.Take(3).Select(r => r.Name));
            var summary = filteredRecs.Any()
                ? $"Based on your request \"{userMessage}\", I recommend exploring these {filteredRecs.Count} verified attractions: {topNames}."
                : $"Here are top recommended destinations in Sri Lanka based on your inquiry: \"{userMessage}\".";

            return new AgentResponseDto
            {
                Summary = summary,
                Recommendations = filteredRecs,
                FollowUpQuestion = "Would you like me to adjust the budget, filter by specific region, or add these to your itinerary?",
                ConversationId = conversationId
            };
        }

        private async Task<AgentResponseDto> ConstructResponseFromToolResults(
            Dictionary<string, object> results, string userMessage,
            string conversationId, PersonalizedQueryParams filters, int touristId)
        {
            var recs = ExtractRecommendationsFromResults(results);
            if (!recs.Any())
                return await FallbackResponseAsync(userMessage, filters, touristId, conversationId);

            return new AgentResponseDto
            {
                Summary = BuildFallbackSummary(userMessage, recs),
                Recommendations = recs,
                FollowUpQuestion = "Would you like more details on any of these, or shall I refine the search?",
                ConversationId = conversationId
            };
        }

        private static string BuildFallbackSummary(string userMessage, List<AgentRecommendationItem> recs)
        {
            if (!recs.Any()) return $"I couldn't find specific matches for \"{userMessage}\". Try widening your filters.";
            var names = recs.Take(3).Select(r => r.Name);
            return $"Based on your request \"{userMessage}\", I found {recs.Count} great options. Top picks: {string.Join(", ", names)}.";
        }

        private static string BuildSystemPrompt() => """
            You are a knowledgeable Sri Lanka travel advisor AI. Your job is to:
            1. Understand the traveller's natural language request (budget, interests, group type, etc.)
            2. Use the available tools to search for matching attractions in the database
            3. Return a ranked list (max 6) of real attractions from the database only
            4. Never suggest places that are not in the database
            5. Keep your summary friendly, informative, and under 150 words
            6. If you need more information, ask exactly ONE follow-up question at the end
            7. Always base recommendations on the tool results, not training data

            Important: Only recommend attractions whose IDs you received from tool calls.
            """;

        private static PersonalizedQueryParams CloneFilters(PersonalizedQueryParams src) => new()
        {
            Interests = src.Interests?.ToList(),
            MaxBudget = src.MaxBudget,
            MaxDistanceKm = src.MaxDistanceKm,
            MinRating = src.MinRating,
            ActivityType = src.ActivityType,
            UserLat = src.UserLat,
            UserLng = src.UserLng,
            Limit = src.Limit
        };
    }
}
