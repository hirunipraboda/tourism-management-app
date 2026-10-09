using System.Diagnostics;
using System.Net;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;
using Xunit.Abstractions;

namespace Nova.Tests.NonFunctional;

/// <summary>
/// PERFORMANCE, LOAD & STRESS TEST SUITE
/// Covers NFR-PERF-001 through NFR-PERF-007 (latencies & throughput),
/// NFR-LOAD-001 through NFR-LOAD-004 (10, 25, 50, 100 concurrent requests),
/// and NFR-STRESS-001 through NFR-STRESS-004 (gradual ramp-up and stress workload).
/// All thresholds are explicitly marked as TESTING CRITERIA per project instructions.
/// </summary>
public sealed class PerformanceAndLoadTests
{
    private readonly ITestOutputHelper _output;

    public PerformanceAndLoadTests(ITestOutputHelper output)
    {
        _output = output;
    }

    private static async Task<double> MeasureLatencyAsync(Func<Task<ApiResult>> action)
    {
        var sw = Stopwatch.StartNew();
        var res = await action();
        sw.Stop();
        Assert.True(res.Status == HttpStatusCode.OK || res.Status == HttpStatusCode.Created, $"Expected 200/201 but got {res.Status}");
        return sw.Elapsed.TotalMilliseconds;
    }

    [Fact]
    public async Task NFR_PERF_001_DestinationApiResponsePerformance()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Testing Criterion: Read-heavy destination catalog response time < 500ms
        var latencies = new List<double>();
        for (int i = 0; i < 5; i++)
        {
            var ms = await MeasureLatencyAsync(() => host.GetAsync("/api/destinations", null));
            latencies.Add(ms);
        }

        var avg = latencies.Average();
        _output.WriteLine($"NFR-PERF-001 Destination API Latency: Avg={avg:F2}ms, Min={latencies.Min():F2}ms, Max={latencies.Max():F2}ms");
        Assert.True(avg < 500.0, $"Destination API average latency ({avg}ms) exceeded 500ms testing criterion.");
    }

    [Fact]
    public async Task NFR_PERF_002_TripApiResponsePerformance()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Testing Criterion: Authenticated trip retrieval response time < 500ms
        var trip = await Fixtures.SeedTripAsync(host.Db.CreateContext(), PgTestDatabase.UserAId, "Sigiriya");

        var latencies = new List<double>();
        for (int i = 0; i < 5; i++)
        {
            var ms = await MeasureLatencyAsync(() => host.GetAsync($"/api/trips/{trip.Id}", TestTokens.UserA));
            latencies.Add(ms);
        }

        var avg = latencies.Average();
        _output.WriteLine($"NFR-PERF-002 Trip API Latency: Avg={avg:F2}ms, Min={latencies.Min():F2}ms, Max={latencies.Max():F2}ms");
        Assert.True(avg < 500.0, $"Trip API average latency ({avg}ms) exceeded 500ms testing criterion.");
    }

    [Fact]
    public async Task NFR_PERF_003_ItineraryApiResponsePerformance()
    {
        await using var host = await NovaApiHost.StartAsync();
        var (trip, itin, _, _) = await Fixtures.SeedItineraryAsync(host.Db.CreateContext(), PgTestDatabase.UserAId);

        // Testing Criterion: Itinerary retrieval response time < 500ms
        var latencies = new List<double>();
        for (int i = 0; i < 5; i++)
        {
            var ms = await MeasureLatencyAsync(() => host.GetAsync($"/api/itineraries/{itin.Id}", TestTokens.UserA));
            latencies.Add(ms);
        }

        var avg = latencies.Average();
        _output.WriteLine($"NFR-PERF-003 Itinerary API Latency: Avg={avg:F2}ms");
        Assert.True(avg < 500.0, $"Itinerary API average latency ({avg}ms) exceeded 500ms testing criterion.");
    }

    [Fact]
    public async Task NFR_PERF_004_GuideApiResponsePerformance()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Testing Criterion: Guides catalog query response time < 500ms
        var latencies = new List<double>();
        for (int i = 0; i < 5; i++)
        {
            var ms = await MeasureLatencyAsync(() => host.GetAsync("/api/v1/guides", null));
            latencies.Add(ms);
        }

        var avg = latencies.Average();
        _output.WriteLine($"NFR-PERF-004 Guide API Latency: Avg={avg:F2}ms");
        Assert.True(avg < 500.0, $"Guide API average latency ({avg}ms) exceeded 500ms testing criterion.");
    }

    [Fact]
    public async Task NFR_PERF_005_TourPackageApiResponsePerformance()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Testing Criterion: Tour package catalog query response time < 500ms
        var latencies = new List<double>();
        for (int i = 0; i < 5; i++)
        {
            var ms = await MeasureLatencyAsync(() => host.GetAsync("/api/v1/tour-packages", null));
            latencies.Add(ms);
        }

        var avg = latencies.Average();
        _output.WriteLine($"NFR-PERF-005 Tour Package API Latency: Avg={avg:F2}ms");
        Assert.True(avg < 500.0, $"Tour Package API average latency ({avg}ms) exceeded 500ms testing criterion.");
    }

    [Fact]
    public async Task NFR_PERF_006_ReviewApiResponsePerformance()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Testing Criterion: Review catalog query response time < 500ms
        var latencies = new List<double>();
        for (int i = 0; i < 5; i++)
        {
            var ms = await MeasureLatencyAsync(() => host.GetAsync("/api/reviews", null));
            latencies.Add(ms);
        }

        var avg = latencies.Average();
        _output.WriteLine($"NFR-PERF-006 Review API Latency: Avg={avg:F2}ms");
        Assert.True(avg < 500.0, $"Review API average latency ({avg}ms) exceeded 500ms testing criterion.");
    }

    [Fact]
    public async Task NFR_PERF_007_RecommendationApiResponsePerformance()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Testing Criterion: Recommendation smart match response time < 1000ms
        var req = new { interests = new[] { "culture" }, minRating = 4.0 };
        var latencies = new List<double>();
        for (int i = 0; i < 3; i++)
        {
            var ms = await MeasureLatencyAsync(() => host.PostAsync("/api/recommendations/smart-match", null, req));
            latencies.Add(ms);
        }

        var avg = latencies.Average();
        _output.WriteLine($"NFR-PERF-007 Recommendation API Latency: Avg={avg:F2}ms");
        Assert.True(avg < 1000.0, $"Recommendation API average latency ({avg}ms) exceeded 1000ms testing criterion.");
    }

    [Fact]
    public async Task NFR_LOAD_001_TenConcurrentUsers_Load()
    {
        await using var host = await NovaApiHost.StartAsync();
        const int concurrency = 10;

        var tasks = Enumerable.Range(0, concurrency).Select(_ => host.GetAsync("/api/destinations", null)).ToList();
        var sw = Stopwatch.StartNew();
        var results = await Task.WhenAll(tasks);
        sw.Stop();

        var passCount = results.Count(r => r.Status == HttpStatusCode.OK);
        _output.WriteLine($"NFR-LOAD-001 (10 Concurrent): Total={sw.ElapsedMilliseconds}ms, Passed={passCount}/{concurrency}");
        Assert.Equal(concurrency, passCount);
    }

    [Fact]
    public async Task NFR_LOAD_002_TwentyFiveConcurrentUsers_Load()
    {
        await using var host = await NovaApiHost.StartAsync();
        const int concurrency = 25;

        var tasks = Enumerable.Range(0, concurrency).Select(_ => host.GetAsync("/api/destinations", null)).ToList();
        var sw = Stopwatch.StartNew();
        var results = await Task.WhenAll(tasks);
        sw.Stop();

        var passCount = results.Count(r => r.Status == HttpStatusCode.OK);
        _output.WriteLine($"NFR-LOAD-002 (25 Concurrent): Total={sw.ElapsedMilliseconds}ms, Passed={passCount}/{concurrency}");
        Assert.Equal(concurrency, passCount);
    }

    [Fact]
    public async Task NFR_LOAD_003_FiftyConcurrentUsers_Load()
    {
        await using var host = await NovaApiHost.StartAsync();
        const int concurrency = 50;

        var tasks = Enumerable.Range(0, concurrency).Select(_ => host.GetAsync("/api/destinations", null)).ToList();
        var sw = Stopwatch.StartNew();
        var results = await Task.WhenAll(tasks);
        sw.Stop();

        var passCount = results.Count(r => r.Status == HttpStatusCode.OK);
        _output.WriteLine($"NFR-LOAD-003 (50 Concurrent): Total={sw.ElapsedMilliseconds}ms, Passed={passCount}/{concurrency}");
        Assert.Equal(concurrency, passCount);
    }

    [Fact]
    public async Task NFR_LOAD_004_OneHundredConcurrentUsers_Load()
    {
        await using var host = await NovaApiHost.StartAsync();
        const int concurrency = 100;

        var tasks = Enumerable.Range(0, concurrency).Select(_ => host.GetAsync("/api/destinations", null)).ToList();
        var sw = Stopwatch.StartNew();
        var results = await Task.WhenAll(tasks);
        sw.Stop();

        var passCount = results.Count(r => r.Status == HttpStatusCode.OK);
        _output.WriteLine($"NFR-LOAD-004 (100 Concurrent): Total={sw.ElapsedMilliseconds}ms, Passed={passCount}/{concurrency}");
        Assert.Equal(concurrency, passCount);
    }

    [Fact]
    public async Task NFR_STRESS_001_GradualConcurrentRampUp()
    {
        await using var host = await NovaApiHost.StartAsync();

        int[] batches = [5, 15, 30, 60];
        foreach (var count in batches)
        {
            var tasks = Enumerable.Range(0, count).Select(_ => host.GetAsync("/api/destinations", null));
            var results = await Task.WhenAll(tasks);
            Assert.All(results, r => Assert.Equal(HttpStatusCode.OK, r.Status));
        }
    }

    [Fact]
    public async Task NFR_STRESS_002_HighRequestVolumeAgainstDestinationApis()
    {
        await using var host = await NovaApiHost.StartAsync();
        const int totalRequests = 150;

        var tasks = Enumerable.Range(0, totalRequests).Select(i =>
            host.GetAsync(i % 2 == 0 ? "/api/destinations" : "/api/destinations/dest-1", null));

        var results = await Task.WhenAll(tasks);
        var successCount = results.Count(r => r.Status == HttpStatusCode.OK);
        Assert.True(successCount >= totalRequests * 0.98, "High volume stress test achieved >= 98% success.");
    }

    [Fact]
    public async Task NFR_STRESS_003_HighRequestVolumeAgainstTripApis()
    {
        await using var host = await NovaApiHost.StartAsync();
        var trip = await Fixtures.SeedTripAsync(host.Db.CreateContext(), PgTestDatabase.UserAId, "StressTrip");

        const int totalRequests = 60;
        var tasks = Enumerable.Range(0, totalRequests).Select(_ =>
            host.GetAsync($"/api/trips/{trip.Id}", TestTokens.UserA));

        var results = await Task.WhenAll(tasks);
        Assert.All(results, r => Assert.Equal(HttpStatusCode.OK, r.Status));
    }

    [Fact]
    public async Task NFR_STRESS_004_AiRecommendationWorkloadStress()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Execute batch of recommendation requests under concurrent pressure
        const int concurrentAiRequests = 10;
        var tasks = Enumerable.Range(0, concurrentAiRequests).Select(i =>
            host.PostAsync("/api/recommendations/smart-match", null, new
            {
                interests = i % 2 == 0 ? new[] { "culture" } : new[] { "nature" },
                minRating = 4.0
            }));

        var results = await Task.WhenAll(tasks);
        Assert.All(results, r => Assert.Equal(HttpStatusCode.OK, r.Status));
    }
}
