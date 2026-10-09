using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Moq;
using Nova.Api.Controllers;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.Entities;
using Nova.Api.Services;
using Nova.Api.Services.Agents;

namespace Nova.Tests.TripItinerary.Support;

/// <summary>
/// Mints JWTs exactly the way AuthController.GenerateJwtToken does (same secret, same claim types).
/// NOTE: the real login only ever issues role claim "ADMIN" or "USER" (see AuthController line ~373).
/// </summary>
public static class TestTokens
{
    // Same default as Program.cs / AuthController / appsettings.json
    public const string Secret = "travel_link_super_secret_jwt_key_2026_enterprise_production_secure_key";

    /// <summary>Token identical in shape to a real login for the given user.</summary>
    public static string ForRealLogin(string userId, UserRole role)
    {
        var roleStr = role == UserRole.Admin ? "ADMIN" : "USER";
        return Mint(userId, roleStr);
    }

    /// <summary>Token with an explicit role claim (used only to exercise role names referenced by [Authorize] attributes).</summary>
    public static string ForRoleClaim(string userId, string roleClaim) => Mint(userId, roleClaim);

    private static string Mint(string userId, string roleStr)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret));
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Name, userId),
            new(ClaimTypes.Email, userId + "@example.test"),
            new(ClaimTypes.Role, roleStr),
            new("role", roleStr),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        var token = new JwtSecurityToken("TravelLink", "TravelLinkApp", claims,
            DateTime.UtcNow.AddSeconds(-5), DateTime.UtcNow.AddHours(1),
            new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static string UserA => ForRealLogin(PgTestDatabase.UserAId, UserRole.Tourist);
    public static string UserB => ForRealLogin(PgTestDatabase.UserBId, UserRole.Tourist);
    public static string Admin => ForRealLogin(PgTestDatabase.AdminId, UserRole.Admin);
    /// <summary>Real login cannot produce this role (AuthController maps every non-admin to "USER").</summary>
    public static string OperatorRoleClaim => ForRoleClaim(PgTestDatabase.OperatorId, "TourismOperator");
}

public sealed record ApiResult(HttpStatusCode Status, string Raw)
{
    private JsonDocument? _doc;
    public JsonElement Json => (_doc ??= JsonDocument.Parse(string.IsNullOrWhiteSpace(Raw) ? "{}" : Raw)).RootElement;
    public bool Success => Json.TryGetProperty("success", out var s) && s.ValueKind == JsonValueKind.True;
    public string? Message => Json.TryGetProperty("message", out var m) && m.ValueKind == JsonValueKind.String ? m.GetString() : null;
    public JsonElement Data => Json.TryGetProperty("data", out var d) ? d : default;
    public string DataString(string prop) => Data.GetProperty(prop).GetString()!;
}

/// <summary>
/// In-process ASP.NET Core host (TestServer) running the REAL controllers, REAL services, REAL JWT validation
/// and REAL authorization policies from Program.cs against an isolated PostgreSQL database.
/// Only the external AI microservice boundary (IAiAgentClient) and Google transport boundary are replaceable.
/// </summary>
public sealed class NovaApiHost : IAsyncDisposable
{
    public PgTestDatabase Db { get; }
    public Mock<IAiAgentClient> AiClient { get; }
    public HttpClient Client { get; }
    private readonly WebApplication _app;

    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private readonly bool _ownsDb;

    private NovaApiHost(PgTestDatabase db, Mock<IAiAgentClient> ai, WebApplication app, bool ownsDb = true)
    {
        Db = db; AiClient = ai; _app = app; Client = app.GetTestClient(); _ownsDb = ownsDb;
    }

    public static async Task<NovaApiHost> StartAsync(Action<IServiceCollection>? overrides = null, PgTestDatabase? db = null, bool ownsDb = true)
    {
        var isDbProvided = db != null;
        db ??= await PgTestDatabase.CreateAsync();

        var ai = new Mock<IAiAgentClient>();
        ai.Setup(a => a.IsAvailableAsync()).ReturnsAsync(false); // default: python microservice offline -> native agents

        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Testing" });
        builder.WebHost.UseTestServer();
        builder.Logging.ClearProviders();

        // --- mirrors Program.cs section 1 ---
        builder.Services.AddControllers()
            .AddApplicationPart(typeof(TripsController).Assembly)
            .AddJsonOptions(o =>
            {
                o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

        // --- section 2: DB (isolated test database, same provider + naming convention) ---
        builder.Services.AddDbContext<NovaDbContext>(o => o.UseNpgsql(db.ConnectionString).UseSnakeCaseNamingConvention());

        // --- sections 3/4/5: same service registrations as Program.cs ---
        builder.Services.AddScoped<ITripService, TripService>();
        builder.Services.AddScoped<IItineraryService, ItineraryService>();
        builder.Services.AddScoped<IItineraryValidationService, ItineraryValidationService>();
        builder.Services.AddScoped<IApprovalService, ApprovalService>();
        builder.Services.AddScoped<IGoogleTransportService, MockGoogleTransportService>(); // external Google boundary
        builder.Services.AddScoped<ITransportService, TransportService>();
        builder.Services.AddSingleton<IAiAgentClient>(ai.Object);                             // external AI microservice boundary
        builder.Services.AddScoped<IReviewService, ReviewService>();
        builder.Services.AddScoped<ITravelPlanningAgent, TravelPlanningAgent>();
        builder.Services.AddScoped<IDestinationResearchAgent, DestinationResearchAgent>();
        builder.Services.AddScoped<ITravelLogisticsAgent, TravelLogisticsAgent>();
        builder.Services.AddScoped<ISafetyValidationAgent, SafetyValidationAgent>();
        builder.Services.AddScoped<IItineraryGenerationService, ItineraryGenerationService>();

        // --- section 7: JWT + policies copied from Program.cs ---
        var key = Encoding.UTF8.GetBytes(TestTokens.Secret);
        builder.Services.AddAuthentication(o =>
        {
            o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(o =>
        {
            o.RequireHttpsMetadata = false;
            o.SaveToken = true;
            o.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero,
                RoleClaimType = ClaimTypes.Role,
                NameClaimType = ClaimTypes.Name
            };
            o.Events = new JwtBearerEvents
            {
                OnChallenge = ctx =>
                {
                    ctx.HandleResponse();
                    ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    ctx.Response.ContentType = "application/json";
                    return ctx.Response.WriteAsync(JsonSerializer.Serialize(new { success = false, status = 401, message = "Authentication required or invalid/expired token." }));
                },
                OnForbidden = ctx =>
                {
                    ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                    ctx.Response.ContentType = "application/json";
                    return ctx.Response.WriteAsync(JsonSerializer.Serialize(new { success = false, status = 403, message = "Forbidden: Insufficient permissions for this resource." }));
                }
            };
        });
        builder.Services.AddAuthorization(o =>
        {
            o.AddPolicy("TouristOnly", p => p.RequireRole("Tourist", "USER", "User"));
            o.AddPolicy("OperatorOrAdmin", p => p.RequireRole("TourismOperator", "Admin", "ADMIN", "ROLE_ADMIN"));
            o.AddPolicy("AdminOnly", p => p.RequireRole("Admin", "ADMIN", "ROLE_ADMIN"));
            o.AddPolicy("UserOnly", p => p.RequireRole("Tourist", "USER", "User"));
        });

        overrides?.Invoke(builder.Services);

        var app = builder.Build();

        // --- section 10: global exception middleware (same as Program.cs) ---
        app.Use(async (context, next) =>
        {
            try { await next(); }
            catch (Exception ex)
            {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsync(JsonSerializer.Serialize(ApiResponse<object>.Fail("An unexpected internal error occurred.", [ex.Message])));
            }
        });
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        await app.StartAsync();

        return new NovaApiHost(db, ai, app, ownsDb: isDbProvided ? ownsDb : true);
    }

    /// <summary>Send a JSON request. Pass token = null for an anonymous request.</summary>
    public async Task<ApiResult> SendAsync(HttpMethod method, string url, string? token = null, object? body = null)
    {
        using var req = new HttpRequestMessage(method, url);
        if (token != null) req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (body != null) req.Content = new StringContent(body is string s ? s : JsonSerializer.Serialize(body, JsonOpts), Encoding.UTF8, "application/json");
        using var resp = await Client.SendAsync(req);
        return new ApiResult(resp.StatusCode, await resp.Content.ReadAsStringAsync());
    }

    public Task<ApiResult> GetAsync(string url, string? token = null) => SendAsync(HttpMethod.Get, url, token);
    public Task<ApiResult> PostAsync(string url, string? token, object? body = null) => SendAsync(HttpMethod.Post, url, token, body ?? new { });
    public Task<ApiResult> PutAsync(string url, string? token, object body) => SendAsync(HttpMethod.Put, url, token, body);
    public Task<ApiResult> PatchAsync(string url, string? token, object? body = null) => SendAsync(HttpMethod.Patch, url, token, body);
    public Task<ApiResult> DeleteAsync(string url, string? token) => SendAsync(HttpMethod.Delete, url, token);

    public async ValueTask DisposeAsync()
    {
        Client.Dispose();
        await _app.StopAsync();
        await _app.DisposeAsync();
        if (_ownsDb)
        {
            await Db.DisposeAsync();
        }
    }
}

/// <summary>Deterministic builders for valid request bodies and persisted fixtures (no hard-coded pre-existing IDs).</summary>
public static class Fixtures
{
    // Deterministic dates far in the future so the timeline calculator always reports "Upcoming"
    public static readonly DateTime Start = new(2031, 3, 10, 0, 0, 0, DateTimeKind.Utc);
    public static readonly DateTime End = new(2031, 3, 13, 0, 0, 0, DateTimeKind.Utc);

    public static object ValidTripBody(string destination = "Kandy") => new
    {
        tripName = "Test Trip " + destination,
        destination,
        startDate = Start,
        endDate = End,
        numberOfTravelers = 2,
        budget = 1200.50m,
        interests = new[] { "Culture", "Nature" },
        tripStyle = "standard"
    };

    public static async Task<Trip> SeedTripAsync(NovaDbContext db, string ownerId, string destination = "Kandy")
    {
        var id = await IdGenerator.GenerateTripIdAsync(db);
        var trip = new Trip
        {
            Id = id, UserId = ownerId, TripName = destination + " Trip", Destination = destination,
            StartDate = Start, EndDate = End, NumberOfTravelers = 2, Budget = 900m,
            Interests = ["Culture"], TripStyle = "standard", Status = TripStatus.Draft
        };
        db.Trips.Add(trip);
        await db.SaveChangesAsync();
        return trip;
    }

    /// <summary>Trip -> Itinerary -> Day(1) -> Item(1) built through EF with real parent/child keys.</summary>
    public static async Task<(Trip trip, Itinerary itinerary, ItineraryDay day, ItineraryItem item)> SeedItineraryAsync(
        NovaDbContext db, string ownerId, ItineraryStatus status = ItineraryStatus.Draft)
    {
        var trip = await SeedTripAsync(db, ownerId);
        var itinId = await IdGenerator.GenerateItineraryIdAsync(db);
        var itinerary = new Itinerary { Id = itinId, TripId = trip.Id, Title = "Seed Itinerary", Status = status, TotalEstimatedCost = 10m };
        var day = new ItineraryDay { ItineraryId = itinId, Date = Start, DayNumber = 1, Title = "Day 1", Location = "Kandy" };
        var item = new ItineraryItem
        {
            ItineraryDayId = day.Id, ActivityName = "Temple Visit", Location = "Kandy",
            StartTime = new TimeSpan(9, 0, 0), EndTime = new TimeSpan(11, 0, 0),
            DurationMinutes = 120, EstimatedCost = 10m, SequenceOrder = 1
        };
        day.Items.Add(item);
        itinerary.Days.Add(day);
        db.Itineraries.Add(itinerary);
        await db.SaveChangesAsync();
        return (trip, itinerary, day, item);
    }
}
