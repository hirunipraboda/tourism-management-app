using System.Net.Http.Json;
using System.Text.Json;
using Nova.Api.DTOs.TripPlanner;
using Nova.Api.Services.Agents;

namespace Nova.Api.Services;

public interface IAiAgentClient
{
    Task<bool> IsAvailableAsync();
    Task<List<ActivityCandidate>> ResearchDestinationAsync(string destination, List<string> interests, string tripStyle);
    Task<TripPlanDto?> PlanTripAsync(TripPlanningRequestDto request);
    Task<TransportLogisticsAssessment?> CheckLogisticsAsync(string origin, string destination, string? travelDate, List<string> interests);
}

public class AiAgentClient : IAiAgentClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AiAgentClient> _logger;
    private readonly string _baseUrl;

    public AiAgentClient(HttpClient httpClient, IConfiguration configuration, ILogger<AiAgentClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _baseUrl = configuration["AiAgentService:BaseUrl"] ?? "http://127.0.0.1:8000";
        _httpClient.BaseAddress = new Uri(_baseUrl);
        
        var timeoutSec = int.TryParse(configuration["AiAgentService:TimeoutSeconds"], out var sec) ? sec : 60;
        _httpClient.Timeout = TimeSpan.FromSeconds(timeoutSec);
    }

    public async Task<bool> IsAvailableAsync()
    {
        try
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));
            var response = await _httpClient.GetAsync("/health", cts.Token);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("AI Agent microservice health check failed: {Message}", ex.Message);
            return false;
        }
    }

    public async Task<List<ActivityCandidate>> ResearchDestinationAsync(string destination, List<string> interests, string tripStyle)
    {
        var candidates = new List<ActivityCandidate>();

        try
        {
            var payload = new
            {
                destination,
                interests = interests ?? [],
                requested_information = $"Top attractions, opening hours, ticket costs for {tripStyle} traveler"
            };

            var response = await _httpClient.PostAsJsonAsync("/agents/destination-research", payload);
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadFromJsonAsync<JsonElement>();
                if (json.TryGetProperty("data", out var dataProp))
                {
                    if (dataProp.TryGetProperty("attractions", out var attractionsProp) && attractionsProp.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var att in attractionsProp.EnumerateArray())
                        {
                            var name = att.TryGetProperty("name", out var n) ? n.GetString() ?? "" : "";
                            var desc = att.TryGetProperty("description", out var d) ? d.GetString() ?? "" : "";
                            var loc = att.TryGetProperty("location", out var l) ? l.GetString() ?? destination : destination;
                            var cat = att.TryGetProperty("category", out var c) ? c.GetString() ?? "culture" : "culture";
                            
                            decimal cost = 15.0m;
                            if (att.TryGetProperty("estimated_cost", out var costProp))
                            {
                                var costStr = costProp.GetString() ?? "";
                                var cleanedCost = new string(costStr.Where(ch => char.IsDigit(ch) || ch == '.').ToArray());
                                if (decimal.TryParse(cleanedCost, out var parsedCost))
                                {
                                    cost = parsedCost;
                                }
                            }

                            int duration = 120;
                            if (att.TryGetProperty("estimated_duration_hours", out var durProp))
                            {
                                var durStr = durProp.GetString() ?? "";
                                var cleanedDur = new string(durStr.Where(ch => char.IsDigit(ch) || ch == '.').ToArray());
                                if (double.TryParse(cleanedDur, out var parsedDur))
                                {
                                    duration = (int)(parsedDur * 60);
                                }
                            }

                            if (!string.IsNullOrWhiteSpace(name))
                            {
                                candidates.Add(new ActivityCandidate
                                {
                                    Name = name,
                                    Description = desc,
                                    Location = loc,
                                    Category = cat.ToLowerInvariant(),
                                    CostPerPerson = cost,
                                    DurationMinutes = duration > 0 ? duration : 120,
                                    DefaultStartTime = new TimeSpan(9, 0, 0),
                                    DefaultEndTime = new TimeSpan(11, 30, 0),
                                    TravelTimeFromPrevious = 20
                                });
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed calling Python DestinationResearchAgent: {Message}", ex.Message);
        }

        return candidates;
    }

    public async Task<TripPlanDto?> PlanTripAsync(TripPlanningRequestDto request)
    {
        try
        {
            var payload = new
            {
                destination = request.Destination,
                destinations = request.Destinations,
                startDate = request.StartDate,
                endDate = request.EndDate,
                travelers = request.Travelers,
                budgetAmount = request.Budget?.Amount ?? 600.0m,
                currency = request.Budget?.Currency ?? "USD",
                travelStyle = request.TravelStyle,
                activities = request.Activities,
                accommodationPreference = request.AccommodationPreference,
                transportPreference = request.TransportPreference,
                specialRequirements = request.SpecialRequirements
            };

            var response = await _httpClient.PostAsJsonAsync("/agents/plan", payload);
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var json = await response.Content.ReadFromJsonAsync<JsonElement>();
                if (json.TryGetProperty("data", out var dataProp))
                {
                    return JsonSerializer.Deserialize<TripPlanDto>(dataProp.GetRawText(), options);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed calling Python TravelPlanningAgent: {Message}", ex.Message);
        }

        return null;
    }

    public async Task<TransportLogisticsAssessment?> CheckLogisticsAsync(string origin, string destination, string? travelDate, List<string> interests)
    {
        try
        {
            var payload = new
            {
                origin,
                destination,
                travel_date = travelDate,
                interests = interests ?? []
            };

            var response = await _httpClient.PostAsJsonAsync("/agents/logistics", payload);
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadFromJsonAsync<JsonElement>();
                if (json.TryGetProperty("data", out var dataProp))
                {
                    var opt = new TransportLogisticsAssessment
                    {
                        Origin = origin,
                        Destination = destination,
                        RecommendedMode = dataProp.TryGetProperty("recommended_mode", out var m) ? m.GetString() ?? "TRAIN" : "TRAIN",
                        EstimatedTravelMinutes = dataProp.TryGetProperty("estimated_travel_minutes", out var tm) ? tm.GetInt32() : 120,
                        EstimatedCost = dataProp.TryGetProperty("estimated_cost_lkr", out var c) ? c.GetDecimal() : 1500m,
                        IsFeasible = true
                    };
                    return opt;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed calling Python TravelLogisticsAgent: {Message}", ex.Message);
        }

        return null;
    }

    private static string ResolveAttractionImage(string name, string location, string category)
    {
        var n = name.ToLowerInvariant();
        var l = location.ToLowerInvariant();
        var c = category.ToLowerInvariant();

        if (n.Contains("sigiriya") || l.Contains("sigiriya"))
            return "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80";
        if (n.Contains("tooth") || n.Contains("kandy") || l.Contains("kandy"))
            return "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80";
        if (n.Contains("nine arch") || n.Contains("bridge") || n.Contains("ella") || l.Contains("ella"))
            return "https://images.unsplash.com/photo-1588598198321-9735fd52455b?auto=format&fit=crop&w=1200&q=80";
        if (n.Contains("galle") || l.Contains("galle") || n.Contains("fort"))
            return "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80";
        if (n.Contains("yala") || l.Contains("yala") || c.Contains("wildlife") || n.Contains("safari"))
            return "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80";
        if (n.Contains("mirissa") || l.Contains("mirissa") || n.Contains("whale") || c.Contains("beach"))
            return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
        if (n.Contains("colombo") || n.Contains("gangaramaya") || l.Contains("colombo"))
            return "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80";
        if (n.Contains("horton") || n.Contains("world's end"))
            return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";

        return "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80";
    }
}
