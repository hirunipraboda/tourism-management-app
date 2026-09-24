using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.Services;
using Nova.Api.Services.Agents;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure JSON & Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// 2. Database Connection (PostgreSQL with EF Core & Snake Case naming)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=travel_link;Username=postgres;Password=user123";

builder.Services.AddDbContext<NovaDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(3);
    })
    .UseSnakeCaseNamingConvention();
});

// 3. Register Core Services & Deterministic Validation
builder.Services.AddScoped<ITripService, TripService>();
builder.Services.AddScoped<IItineraryService, ItineraryService>();
builder.Services.AddScoped<IItineraryValidationService, ItineraryValidationService>();
builder.Services.AddScoped<IApprovalService, ApprovalService>();

// Register Google Maps Transport Service & Public Transport Service
builder.Services.AddHttpClient<IGoogleTransportService, GoogleTransportService>();
builder.Services.AddScoped<ITransportService, TransportService>();

// 4. Register Four Tourism Agents
builder.Services.AddScoped<ITravelPlanningAgent, TravelPlanningAgent>();
builder.Services.AddScoped<IDestinationResearchAgent, DestinationResearchAgent>();
builder.Services.AddScoped<ITravelLogisticsAgent, TravelLogisticsAgent>();
builder.Services.AddScoped<ISafetyValidationAgent, SafetyValidationAgent>();

// 5. Register Agentic AI Workflow Orchestrator
builder.Services.AddScoped<IItineraryGenerationService, ItineraryGenerationService>();


// 7. JWT Authentication & Role-Based Authorization
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "SuperSecretNovaEnterpriseTourismKey2026!#$";
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("TouristOnly", policy => policy.RequireRole("Tourist"));
    options.AddPolicy("OperatorOrAdmin", policy => policy.RequireRole("TourismOperator", "Admin"));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

// 8. CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 9. Swagger & OpenAPI Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "NOVA - Trip & Itinerary Management API",
        Version = "v1",
        Description = "Production ASP.NET Core Web API with EF Core, PostgreSQL, JWT/RBAC & 4-Agent AI Itinerary Generation Workflow"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Format: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Seed Database
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<NovaDbContext>();
        await db.Database.MigrateAsync();
        await DbInitializer.SeedAsync(db);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DbInitializer Seed Error] {ex}");
    }
}

// 10. Global Exception Handling Middleware
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        var errorResponse = ApiResponse<object>.Fail("An unexpected internal error occurred.", [ex.Message]);
        await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
    }
});

// Configure the HTTP request pipeline (Swagger enabled)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "NOVA Trip & Itinerary API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", service = "Nova.Api", timestamp = DateTime.UtcNow }));

app.MapControllers();

app.Run();
