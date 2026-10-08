using System.Net;
using System.Text.Json;

namespace Nova.ApiTests;

public class DestinationRetrievalTests : IClassFixture<MyFactory>
{
    private readonly HttpClient _client;

    public DestinationRetrievalTests(MyFactory factory)
    {
        _client = factory.CreateClient();
    }

    // Reads the response body and returns the parsed JSON root
    private static async Task<JsonElement> ReadJson(HttpResponseMessage response)
    {
        var text = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(text);
        return doc.RootElement.Clone();
    }

    [Fact]
    [Trait("TestCase", "TC-API-001")]
    public async Task GetDestinations_ReturnsSuccessWithData()
    {
        var response = await _client.GetAsync("/api/destinations");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await ReadJson(response);
        Assert.True(json.GetProperty("success").GetBoolean());
        Assert.True(json.GetProperty("data").GetArrayLength() >= 1);
    }

    [Fact]
    [Trait("TestCase", "TC-API-002")]
    public async Task GetDestinationById_ExistingId_ReturnsDestination()
    {
        var response = await _client.GetAsync("/api/destinations/test-dest-galle");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await ReadJson(response);
        Assert.Equal("test-dest-galle", json.GetProperty("data").GetProperty("id").GetString());
        Assert.Equal("Galle Fort", json.GetProperty("data").GetProperty("name").GetString());
    }

    [Fact]
    [Trait("TestCase", "TC-API-003")]
    public async Task GetDestinationBySlug_ExistingSlug_ReturnsDestination()
    {
        var response = await _client.GetAsync("/api/destinations/galle-fort");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await ReadJson(response);
        Assert.Equal("Galle Fort", json.GetProperty("data").GetProperty("name").GetString());
    }

    [Fact]
    [Trait("TestCase", "TC-API-004")]
    public async Task GetDestinationById_UnknownId_Returns404()
    {
        var response = await _client.GetAsync("/api/destinations/does-not-exist");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var json = await ReadJson(response);
        Assert.False(json.GetProperty("success").GetBoolean());
        Assert.Equal("Destination not found.", json.GetProperty("message").GetString());
    }
}