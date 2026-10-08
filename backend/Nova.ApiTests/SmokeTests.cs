using System.Net;

namespace Nova.ApiTests;

public class SmokeTests : IClassFixture<MyFactory>
{
    private readonly MyFactory _factory;

    public SmokeTests(MyFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetDestinations_ReturnsOk()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/destinations");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}