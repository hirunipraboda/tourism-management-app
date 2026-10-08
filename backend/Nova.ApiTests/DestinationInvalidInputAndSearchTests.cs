using System.Net;
using System.Text.Json;

namespace Nova.ApiTests;

public class DestinationInvalidInputAndSearchTests : IClassFixture<MyFactory>
{
    private readonly HttpClient _client;

    public DestinationInvalidInputAndSearchTests(MyFactory factory)
    {
        _client = factory.CreateClient();
    }

    private static async Task<JsonElement> ReadJson(HttpResponseMessage response)
    {
        var text = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(text);
        return doc.RootElement.Clone();
    }

    // ---------- invalid / edge input ----------

    [Fact]
    [Trait("TestCase", "TC-API-005")]
    public async Task GetDestinationById_VeryLongId_Returns404NotServerError()
    {
        var response = await _client.GetAsync("/api/destinations/" + new string('a', 2000));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    [Trait("TestCase", "TC-API-006")]
    public async Task GetDestinationById_SqlInjectionLikeId_Returns404NotServerError()
    {
        var id = Uri.EscapeDataString("' OR '1'='1");

        var response = await _client.GetAsync("/api/destinations/" + id);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    [Trait("TestCase", "TC-API-007")]
    public async Task UnknownSubRoute_Returns404()
    {
        var response = await _client.GetAsync("/api/destinations/a/b/c");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ---------- search ----------
    // NOTE: the in-memory database cannot run EF.Functions.ILike (PostgreSQL only),
    // so the controller falls back to its built-in list for search requests.

    [Fact]
    [Trait("TestCase", "TC-API-008")]
    public async Task Search_MatchingTerm_ReturnsOnlyMatches()
    {
        var response = await _client.GetAsync("/api/destinations?search=ella");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await ReadJson(response);
        var items = json.GetProperty("data").EnumerateArray().ToList();
        Assert.NotEmpty(items);
        Assert.All(items, item =>
        {
            var text = (item.GetProperty("name").GetString() + " " +
                        item.GetProperty("description").GetString()).ToLowerInvariant();
            Assert.Contains("ella", text);
        });
    }

    [Fact]
    [Trait("TestCase", "TC-API-009")]
    public async Task Search_NoMatch_ReturnsOkWithEmptyList()
    {
        var response = await _client.GetAsync("/api/destinations?search=zzzxqjkw");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await ReadJson(response);
        Assert.True(json.GetProperty("success").GetBoolean());
        Assert.Equal(0, json.GetProperty("data").GetArrayLength());
    }

    [Fact]
    [Trait("TestCase", "TC-API-010")]
    public async Task Search_WhitespaceOnly_ReturnsAllDestinations()
    {
        var response = await _client.GetAsync("/api/destinations?search=%20%20%20");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await ReadJson(response);
        Assert.True(json.GetProperty("data").GetArrayLength() >= 1);
    }

    [Fact]
    [Trait("TestCase", "TC-API-011")]
    public async Task Search_SqlInjectionLikeTerm_DoesNotCauseServerError()
    {
        var term = Uri.EscapeDataString("'; DROP TABLE destinations;--");

        var response = await _client.GetAsync("/api/destinations?search=" + term);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ---------- contract ----------

    [Fact]
    [Trait("TestCase", "TC-API-012")]
    public async Task GetDestinations_ReturnsJsonContentType()
    {
        var response = await _client.GetAsync("/api/destinations");

        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    [Trait("TestCase", "TC-API-013")]
    public async Task GetAttractionsOfDestination_RouteUsedByMobileApp_Returns200()
    {
        // DEF-DST-001 FIX: The Flutter app (api_service.dart) calls
        // GET /destinations/{id}/attractions. This route was missing from
        // DestinationsController and has been added as part of this test cycle.
        var response = await _client.GetAsync("/api/destinations/test-dest-galle/attractions");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await ReadJson(response);
        Assert.True(json.GetProperty("success").GetBoolean());
        Assert.True(json.TryGetProperty("data", out _));
    }
}