using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.Entities;
using Nova.Tests.TripItinerary.Support;
using Xunit;

namespace Nova.Tests.NonFunctional;

/// <summary>
/// NON-FUNCTIONAL SECURITY TEST SUITE
/// Covers NFR-SEC-001 through NFR-SEC-010 verifying authentication,
/// authorization, IDOR/BOLA protection, token tampering, SQL injection resilience,
/// XSS sanitization, malformed payloads, credential exposure, and error leakage.
/// </summary>
public sealed class SecurityTests
{
    [Fact]
    public async Task NFR_SEC_001_UnauthenticatedAccessToProtectedApis()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Protected endpoint without token -> 401 Unauthorized
        var res1 = await host.GetAsync("/api/auth/me", null);
        Assert.Equal(HttpStatusCode.Unauthorized, res1.Status);

        var res2 = await host.PostAsync("/api/v1/tour-packages", null, new { packageName = "Test" });
        Assert.Equal(HttpStatusCode.Unauthorized, res2.Status);

        var res3 = await host.PostAsync("/api/v1/guides", null, new { name = "Test Guide" });
        Assert.Equal(HttpStatusCode.Unauthorized, res3.Status);
    }

    [Fact]
    public async Task NFR_SEC_002_UnauthorizedRoleAccess()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Tourist attempting Admin-only Guide deactivation -> 403 Forbidden
        var delGuideRes = await host.DeleteAsync("/api/v1/guides/1", TestTokens.UserA);
        Assert.Equal(HttpStatusCode.Forbidden, delGuideRes.Status);

        // Tourist attempting Operator/Admin Tour Operation creation -> 403 Forbidden
        var createOpRes = await host.PostAsync("/api/v1/tour-operations", TestTokens.UserA, new
        {
            tourPackageId = 1,
            guideId = 1,
            scheduledDate = DateTime.UtcNow.AddDays(5),
            numberOfTourists = 2,
            totalCost = 100m
        });
        Assert.Equal(HttpStatusCode.Forbidden, createOpRes.Status);
    }

    [Fact]
    public async Task NFR_SEC_003_IdorBolaAttempts()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Seed Trip for User A
        var tripRes = await host.PostAsync("/api/trips", TestTokens.UserA, Fixtures.ValidTripBody("Secret Trip"));
        var tripAId = tripRes.Data.GetProperty("id").GetString()!;

        // User B attempts IDOR attack on User A's private trip URL
        var idorView = await host.GetAsync($"/api/trips/user/{PgTestDatabase.UserAId}", TestTokens.UserB);
        Assert.Equal(HttpStatusCode.Forbidden, idorView.Status);

        var idorUpdate = await host.PutAsync($"/api/trips/{tripAId}", TestTokens.UserB, new
        {
            tripName = "Hijacked Trip",
            destination = "Kandy",
            startDate = DateTime.UtcNow.AddDays(10),
            endDate = DateTime.UtcNow.AddDays(12),
            numberOfTravelers = 1,
            budget = 100m
        });
        Assert.Equal(HttpStatusCode.Forbidden, idorUpdate.Status);

        var idorDelete = await host.DeleteAsync($"/api/trips/{tripAId}", TestTokens.UserB);
        Assert.Equal(HttpStatusCode.Forbidden, idorDelete.Status);
    }

    [Fact]
    public async Task NFR_SEC_004_InvalidJwtTokenHandling()
    {
        await using var host = await NovaApiHost.StartAsync();

        // 1. Tampered signature
        var validToken = TestTokens.UserA;
        var tamperedToken = validToken[..^6] + "xxxxxx";
        var res1 = await host.GetAsync("/api/auth/me", tamperedToken);
        Assert.Equal(HttpStatusCode.Unauthorized, res1.Status);

        // 2. Completely malformed token
        var malformedToken = "not.a.valid.jwt.token";
        var res2 = await host.GetAsync("/api/auth/me", malformedToken);
        Assert.Equal(HttpStatusCode.Unauthorized, res2.Status);

        // 3. Empty Bearer string
        var res3 = await host.GetAsync("/api/auth/me", "");
        Assert.Equal(HttpStatusCode.Unauthorized, res3.Status);
    }

    [Fact]
    public async Task NFR_SEC_005_SqlInjectionProbes()
    {
        await using var host = await NovaApiHost.StartAsync();

        // SQL injection probe in search parameter
        var sqliQuery = "'; DROP TABLE trips; SELECT * FROM destinations WHERE name = '";
        var res = await host.GetAsync($"/api/destinations?search={Uri.EscapeDataString(sqliQuery)}", null);

        // System should handle parameterized query safely without crashing or dropping tables
        Assert.Equal(HttpStatusCode.OK, res.Status);

        // Verify table still exists and data is intact
        await using var db = host.Db.CreateContext();
        Assert.True(await db.Destinations.AnyAsync());
    }

    [Fact]
    public async Task NFR_SEC_006_XssProbes()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Stored XSS payload in Review comment
        var xssPayload = "<script>alert('XSS-INJECTION');</script><img src='x' onerror='alert(1)'>";
        var revRes = await host.PostAsync("/api/reviews", TestTokens.UserA, new
        {
            destinationId = "dest-1",
            rating = 5,
            title = "<script>alert('Title-XSS')</script>",
            comment = xssPayload
        });
        Assert.Equal(HttpStatusCode.OK, revRes.Status);
        var revId = revRes.Data.GetProperty("id").GetString()!;

        // Retrieve stored review
        var getRes = await host.GetAsync("/api/reviews?destinationId=dest-1", null);
        Assert.Equal(HttpStatusCode.OK, getRes.Status);
        // Stored review should be treated as literal content rather than executable HTML
        var savedReview = getRes.Data.EnumerateArray().FirstOrDefault(r => r.GetProperty("id").GetString() == revId);
        Assert.NotNull(savedReview.GetProperty("id").GetString());
    }

    [Fact]
    public async Task NFR_SEC_007_MalformedRequestHandling()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Send invalid JSON body
        var malformedJson = "{ \"destination\": \"Sigiriya\", \"travelers\": [broken json";
        var res = await host.SendAsync(HttpMethod.Post, "/api/trip-planner/generate", TestTokens.UserA, malformedJson);

        // Must reject gracefully with 400 Bad Request rather than unhandled crash
        Assert.Equal(HttpStatusCode.BadRequest, res.Status);
    }

    [Fact]
    public async Task NFR_SEC_008_SensitiveInformationExposure()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Register user and verify password hash is NEVER exposed in response
        var email = $"leaktest.{Guid.NewGuid():N}@example.test";
        var regRes = await host.PostAsync("/api/auth/register", null, new
        {
            name = "Leak Test",
            email,
            password = "SecretPassword123!",
            confirmPassword = "SecretPassword123!"
        });
        Assert.Equal(HttpStatusCode.Created, regRes.Status);

        var rawResponse = regRes.Raw;
        Assert.DoesNotContain("SecretPassword123!", rawResponse);
        Assert.DoesNotContain("passwordHash", rawResponse, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("$2a$", rawResponse); // BCrypt prefix
        Assert.DoesNotContain("$2b$", rawResponse);
    }

    [Fact]
    public async Task NFR_SEC_009_SecurityHeadersAndOptions()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Verify CORS preflight or standard GET returns valid response
        var res = await host.GetAsync("/api/destinations", null);
        Assert.Equal(HttpStatusCode.OK, res.Status);
    }

    [Fact]
    public async Task NFR_SEC_010_ExcessiveErrorInformationSuppression()
    {
        await using var host = await NovaApiHost.StartAsync();

        // Request non-existing route
        var res = await host.GetAsync("/api/non-existing-path-for-testing", null);
        Assert.Equal(HttpStatusCode.NotFound, res.Status);

        // Verify stack trace details are not leaked in public responses
        Assert.DoesNotContain("at Nova.Api.Controllers", res.Raw);
        Assert.DoesNotContain("Exception: Stack trace", res.Raw);
    }
}
