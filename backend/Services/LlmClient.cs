using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace tourism_management_app.Api.Services
{
    /// <summary>
    /// Minimal abstraction over OpenAI / Anthropic chat completions.
    /// Provider is selected by Ai:Provider config key ("openai" | "anthropic").
    /// </summary>
    public class LlmClient
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;
        private readonly ILogger<LlmClient> _logger;

        public LlmClient(HttpClient http, IConfiguration config, ILogger<LlmClient> logger)
        {
            _http = http;
            _config = config;
            _logger = logger;
        }

        private string Provider => _config["Ai:Provider"] ?? "openai";

        public async Task<LlmResponse?> ChatAsync(
            List<LlmMessage> messages,
            List<LlmTool>? tools = null,
            CancellationToken ct = default)
        {
            return Provider.ToLowerInvariant() switch
            {
                "anthropic" => await CallAnthropicAsync(messages, tools, ct),
                _ => await CallOpenAiAsync(messages, tools, ct),
            };
        }

        // ── OpenAI ────────────────────────────────────────────────────────────
        private async Task<LlmResponse?> CallOpenAiAsync(
            List<LlmMessage> messages, List<LlmTool>? tools, CancellationToken ct)
        {
            var apiKey = _config["Ai:OpenAi:ApiKey"] ?? "";
            var model = _config["Ai:OpenAi:Model"] ?? "gpt-4o-mini";
            var baseUrl = _config["Ai:OpenAi:BaseUrl"] ?? "https://api.openai.com/v1";

            // Never log the key
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogWarning("[LlmClient] OpenAI API key not configured.");
                return null;
            }

            var body = new Dictionary<string, object>
            {
                ["model"] = model,
                ["messages"] = messages.Select(m => new { role = m.Role, content = m.Content }).ToList(),
                ["max_tokens"] = 1500,
                ["temperature"] = 0.3
            };

            if (tools?.Any() == true)
            {
                body["tools"] = tools.Select(t => new
                {
                    type = "function",
                    function = new { name = t.Name, description = t.Description, parameters = t.Parameters }
                }).ToList();
                body["tool_choice"] = "auto";
            }

            var req = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/chat/completions")
            {
                Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
            };
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            try
            {
                var resp = await _http.SendAsync(req, ct);
                resp.EnsureSuccessStatusCode();
                var json = await resp.Content.ReadAsStringAsync(ct);
                return ParseOpenAiResponse(json);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[LlmClient] OpenAI call unavailable ({Message}). Using algorithmic fallback.", ex.Message);
                return null;
            }
        }

        private static LlmResponse? ParseOpenAiResponse(string json)
        {
            using var doc = JsonDocument.Parse(json);
            var choice = doc.RootElement.GetProperty("choices")[0];
            var msg = choice.GetProperty("message");

            var response = new LlmResponse { Role = "assistant" };

            if (msg.TryGetProperty("content", out var contentEl) && contentEl.ValueKind == JsonValueKind.String)
                response.Content = contentEl.GetString() ?? "";

            if (msg.TryGetProperty("tool_calls", out var toolCallsEl) && toolCallsEl.ValueKind == JsonValueKind.Array)
            {
                foreach (var tc in toolCallsEl.EnumerateArray())
                {
                    var fn = tc.GetProperty("function");
                    response.ToolCalls.Add(new LlmToolCall
                    {
                        Id = tc.GetProperty("id").GetString() ?? "",
                        Name = fn.GetProperty("name").GetString() ?? "",
                        ArgumentsJson = fn.GetProperty("arguments").GetString() ?? "{}"
                    });
                }
            }
            return response;
        }

        // ── Anthropic ─────────────────────────────────────────────────────────
        private async Task<LlmResponse?> CallAnthropicAsync(
            List<LlmMessage> messages, List<LlmTool>? tools, CancellationToken ct)
        {
            var apiKey = _config["Ai:Anthropic:ApiKey"] ?? "";
            var model = _config["Ai:Anthropic:Model"] ?? "claude-3-5-haiku-20241022";
            var baseUrl = _config["Ai:Anthropic:BaseUrl"] ?? "https://api.anthropic.com";

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogWarning("[LlmClient] Anthropic API key not configured.");
                return null;
            }

            // Anthropic uses system message separately
            var systemMsg = messages.FirstOrDefault(m => m.Role == "system")?.Content ?? "";
            var chatMessages = messages.Where(m => m.Role != "system")
                .Select(m => new { role = m.Role, content = m.Content })
                .ToList();

            var body = new Dictionary<string, object>
            {
                ["model"] = model,
                ["max_tokens"] = 1500,
                ["system"] = systemMsg,
                ["messages"] = chatMessages
            };

            if (tools?.Any() == true)
            {
                body["tools"] = tools.Select(t => new
                {
                    name = t.Name,
                    description = t.Description,
                    input_schema = t.Parameters
                }).ToList();
            }

            var req = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/v1/messages")
            {
                Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
            };
            req.Headers.Add("x-api-key", apiKey);
            req.Headers.Add("anthropic-version", "2023-06-01");

            try
            {
                var resp = await _http.SendAsync(req, ct);
                resp.EnsureSuccessStatusCode();
                var json = await resp.Content.ReadAsStringAsync(ct);
                return ParseAnthropicResponse(json);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[LlmClient] Anthropic call unavailable ({Message}). Using algorithmic fallback.", ex.Message);
                return null;
            }
        }

        private static LlmResponse? ParseAnthropicResponse(string json)
        {
            using var doc = JsonDocument.Parse(json);
            var response = new LlmResponse { Role = "assistant" };

            if (!doc.RootElement.TryGetProperty("content", out var contentArr))
                return response;

            foreach (var block in contentArr.EnumerateArray())
            {
                var blockType = block.GetProperty("type").GetString();
                if (blockType == "text")
                    response.Content = block.GetProperty("text").GetString() ?? "";
                else if (blockType == "tool_use")
                {
                    response.ToolCalls.Add(new LlmToolCall
                    {
                        Id = block.GetProperty("id").GetString() ?? "",
                        Name = block.GetProperty("name").GetString() ?? "",
                        ArgumentsJson = block.GetProperty("input").GetRawText()
                    });
                }
            }
            return response;
        }
    }

    // ── Value objects ──────────────────────────────────────────────────────────

    public class LlmMessage
    {
        public string Role { get; set; } = "user";
        public string Content { get; set; } = string.Empty;
        public static LlmMessage System(string c) => new() { Role = "system", Content = c };
        public static LlmMessage User(string c) => new() { Role = "user", Content = c };
        public static LlmMessage Assistant(string c) => new() { Role = "assistant", Content = c };
        public static LlmMessage Tool(string content) => new() { Role = "tool", Content = content };
    }

    public class LlmTool
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public object Parameters { get; set; } = new { type = "object", properties = new { } };
    }

    public class LlmResponse
    {
        public string Role { get; set; } = "assistant";
        public string Content { get; set; } = string.Empty;
        public List<LlmToolCall> ToolCalls { get; set; } = new();
        public bool HasToolCalls => ToolCalls.Any();
    }

    public class LlmToolCall
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string ArgumentsJson { get; set; } = "{}";
    }
}
