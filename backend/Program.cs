using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using tourism_management_app.Api.Data;
using tourism_management_app.Api.Models;
using tourism_management_app.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Silence verbose EF Core data reader/command logs and Npgsql noise from terminal output
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning);
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.Warning);
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore.Infrastructure", LogLevel.Warning);
builder.Logging.AddFilter("Npgsql", LogLevel.Warning);
builder.Logging.AddFilter("Microsoft.AspNetCore.HttpsPolicy.HttpsRedirectionMiddleware", LogLevel.Error);

// Add services to the container.
builder.Services.AddControllers();

// CORS: allow the React frontend (Vite default port 5173) during development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Tourism Management API",
        Version = "v1",
        Description = "API for Sri Lanka tourism: reviews, recommendations, AI travel agent."
    });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Configure JWT Authentication (Stub / Minimum viable configuration)
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"] ?? "ThisIsADummyKeyForTestingPurposesOnly!");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddAuthentication("Development")
        .AddScheme<AuthenticationSchemeOptions, tourism_management_app.Api.DevelopmentAuthenticationHandler>(
            "Development",
            _ => { });
}

builder.Services.AddDbContext<tourism_management_app.Api.Data.AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// In-memory cache (for popular + insights caching)
builder.Services.AddMemoryCache();

// Scoring options from config
builder.Services.Configure<ScoringOptions>(builder.Configuration.GetSection(ScoringOptions.Section));

// Application services
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IRecommendationService, RecommendationService>();
builder.Services.AddScoped<IAgentService, AgentService>();

// LLM HTTP client
builder.Services.AddHttpClient<LlmClient>();

var app = builder.Build();

// ── Database migration + seed ────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    // Ensure Review moderation and reply columns exist
    await db.Database.ExecuteSqlRawAsync(@"
        ALTER TABLE ""Reviews"" ADD COLUMN IF NOT EXISTS ""Status"" text DEFAULT 'Published';
        ALTER TABLE ""Reviews"" ADD COLUMN IF NOT EXISTS ""OperatorNotes"" text;
    ");

    // Seed default RecommendationSettings if not present
    if (!await db.RecommendationSettings.AnyAsync())
    {
        db.RecommendationSettings.Add(new RecommendationSettings
        {
            Id = 1,
            InterestWeight = 30m,
            RatingWeight = 25m,
            BudgetWeight = 15m,
            DistanceWeight = 15m,
            PopularityWeight = 10m,
            HistoryWeight = 5m,
            MinReviewCountToRank = 0,
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = "System"
        });
        await db.SaveChangesAsync();
    }

    // Seed tourist
    if (!await db.Tourists.AnyAsync(t => t.Id == 1))
    {
        db.Tourists.Add(new Tourist { Id = 1, Name = "Development Tourist", Email = "development@tourlink.local" });
        await db.SaveChangesAsync();
    }

    // Seed destinations
    async Task<Destination> EnsureDestination(string name)
    {
        var dest = await db.Destinations.FirstOrDefaultAsync(d => d.Name == name);
        if (dest == null)
        {
            dest = new Destination { Name = name };
            db.Destinations.Add(dest);
            await db.SaveChangesAsync();
        }
        return dest;
    }

    // Seed attractions if not yet populated with full catalog
    if (await db.Attractions.CountAsync() < 10)
    {
        // Clean up old incomplete attraction records if any
        var oldAttractions = await db.Attractions.ToListAsync();
        if (oldAttractions.Any())
        {
            var oldReviews = await db.Reviews.Where(r => r.EntityType == "Attraction").ToListAsync();
            db.Reviews.RemoveRange(oldReviews);
            db.Attractions.RemoveRange(oldAttractions);
            await db.SaveChangesAsync();
        }
        var kandy = await EnsureDestination("Kandy");
        var sigiriya = await EnsureDestination("Sigiriya");
        var ella = await EnsureDestination("Ella");
        var mirissa = await EnsureDestination("Mirissa");
        var yala = await EnsureDestination("Yala");
        var galle = await EnsureDestination("Galle");
        var nuwaraEliya = await EnsureDestination("Nuwara Eliya");
        var colombo = await EnsureDestination("Colombo");
        var anuradhapura = await EnsureDestination("Anuradhapura");
        var trincomalee = await EnsureDestination("Trincomalee");

        var attractions = new List<Attraction>
        {
            new Attraction
            {
                Name = "Temple of the Tooth (Sri Dalada Maligawa)",
                DestinationId = kandy.Id, Category = "Culture", ActivityType = "attraction",
                ImageUrl = "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=800&q=80",
                EstimatedCostUsd = 15, Latitude = 7.2936, Longitude = 80.6413,
                Description = "The sacred Buddhist temple in Kandy that houses the relic of the tooth of the Buddha. A UNESCO World Heritage Site and one of Sri Lanka's most revered places of worship.",
                OpeningHours = "5:30 AM - 8:00 PM", BestTimeToVisit = "December - April", Duration = "2 - 3 hours"
            },
            new Attraction
            {
                Name = "Sigiriya Rock Fortress",
                DestinationId = sigiriya.Id, Category = "History", ActivityType = "attraction",
                ImageUrl = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80",
                EstimatedCostUsd = 30, Latitude = 7.9568, Longitude = 80.7603,
                Description = "A majestic 5th-century rock fortress rising 180m above the jungle plain. Features ancient frescoes, the iconic Lion's Gate, and panoramic views of the Cultural Triangle.",
                OpeningHours = "7:00 AM - 5:30 PM", BestTimeToVisit = "January - April", Duration = "3 - 4 hours"
            },
            new Attraction
            {
                Name = "Nine Arches Bridge",
                DestinationId = ella.Id, Category = "Nature", ActivityType = "attraction",
                ImageUrl = "https://images.unsplash.com/photo-1616627577385-2b3e08e0a38f?auto=format&fit=crop&w=800&q=80",
                EstimatedCostUsd = 5, Latitude = 6.8753, Longitude = 81.0539,
                Description = "A stunning colonial-era stone viaduct built in 1921 surrounded by lush tea plantations. One of the most photographed spots in Sri Lanka, especially magical when the train passes through.",
                OpeningHours = "Open Daily", BestTimeToVisit = "November - April", Duration = "1 - 2 hours"
            },
            new Attraction
            {
                Name = "Mirissa Beach & Whale Watching",
                DestinationId = mirissa.Id, Category = "Beaches", ActivityType = "tour",
                ImageUrl = "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80",
                EstimatedCostUsd = 45, Latitude = 5.9437, Longitude = 80.4716,
                Description = "Sri Lanka's premier beach destination offering pristine golden sands and world-class whale watching. Blue whales and spinner dolphins are regularly spotted between November and April.",
                OpeningHours = "Tours: 6:00 AM", BestTimeToVisit = "November - April", Duration = "Half day"
            },
            new Attraction
            {
                Name = "Yala National Park Safari",
                DestinationId = yala.Id, Category = "Wildlife", ActivityType = "tour",
                ImageUrl = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
                EstimatedCostUsd = 60, Latitude = 6.3748, Longitude = 81.5081,
                Description = "Sri Lanka's most-visited national park with the world's highest density of leopards. Home to elephants, sloth bears, crocodiles, and over 200 bird species across diverse ecosystems.",
                OpeningHours = "6:00 AM - 6:00 PM", BestTimeToVisit = "February - July", Duration = "3 - 6 hours"
            },
            new Attraction
            {
                Name = "Galle Dutch Fort",
                DestinationId = galle.Id, Category = "History", ActivityType = "attraction",
                ImageUrl = "https://images.unsplash.com/photo-1605106702842-01a887a31122?auto=format&fit=crop&w=800&q=80",
                EstimatedCostUsd = 0, Latitude = 6.0278, Longitude = 80.2167,
                Description = "A remarkably preserved 17th-century Dutch colonial fort — a UNESCO World Heritage Site featuring cobblestone streets, boutique hotels, art galleries, and stunning ocean sunsets.",
                OpeningHours = "Open Daily (24 hrs)", BestTimeToVisit = "December - April", Duration = "2 - 4 hours"
            },
            new Attraction
            {
                Name = "Horton Plains & World's End",
                DestinationId = nuwaraEliya.Id, Category = "Nature", ActivityType = "attraction",
                ImageUrl = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
                EstimatedCostUsd = 25, Latitude = 6.8008, Longitude = 80.8008,
                Description = "A hauntingly beautiful high plateau at 2,100m offering cloud forest trails, waterfalls, and the dramatic 880m cliff drop of World's End. Home to endemic sambar deer and purple-faced langurs.",
                OpeningHours = "6:00 AM - 6:00 PM", BestTimeToVisit = "January - March", Duration = "4 - 5 hours"
            },
            new Attraction
            {
                Name = "Colombo City Food Tour",
                DestinationId = colombo.Id, Category = "Food", ActivityType = "tour",
                ImageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
                EstimatedCostUsd = 35, Latitude = 6.9271, Longitude = 79.8612,
                Description = "Explore Sri Lanka's culinary soul through Colombo's vibrant street food scene — hoppers, kottu roti, crab curry, and tropical fruits. Includes visits to Pettah Market and local restaurants.",
                OpeningHours = "Tours: 5:00 PM - 9:00 PM", BestTimeToVisit = "Year-round", Duration = "3 - 4 hours"
            },
            new Attraction
            {
                Name = "Anuradhapura Sacred City",
                DestinationId = anuradhapura.Id, Category = "History", ActivityType = "attraction",
                ImageUrl = "https://images.unsplash.com/photo-1573108037329-37aa135a142e?auto=format&fit=crop&w=800&q=80",
                EstimatedCostUsd = 25, Latitude = 8.3350, Longitude = 80.4108,
                Description = "Sri Lanka's ancient first capital — a UNESCO World Heritage Site with 2,500-year-old dagobas, the sacred Bodhi Tree (one of the world's oldest living trees), and royal palace ruins.",
                OpeningHours = "6:00 AM - 6:00 PM", BestTimeToVisit = "May - September", Duration = "Full day"
            },
            new Attraction
            {
                Name = "Trincomalee Beaches & Snorkelling",
                DestinationId = trincomalee.Id, Category = "Beaches", ActivityType = "tour",
                ImageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
                EstimatedCostUsd = 20, Latitude = 8.5753, Longitude = 81.2156,
                Description = "Sri Lanka's east coast gem featuring pristine Nilaveli and Uppuveli beaches with crystal-clear waters ideal for snorkelling, diving, and dolphin watching. Best whale shark sightings in the region.",
                OpeningHours = "Open Daily", BestTimeToVisit = "May - September", Duration = "Full day"
            },
            new Attraction
            {
                Name = "Ella Rock Hike",
                DestinationId = ella.Id, Category = "Adventure", ActivityType = "attraction",
                ImageUrl = "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80",
                EstimatedCostUsd = 5, Latitude = 6.8740, Longitude = 81.0465,
                Description = "A rewarding 4-hour hike through jungle, tea estates, and rocky terrain to a 1,041m summit with breathtaking 360° views over the Ella Gap. Sri Lanka's most popular hiking trail.",
                OpeningHours = "Start by 7:00 AM", BestTimeToVisit = "December - March", Duration = "4 - 5 hours"
            },
            new Attraction
            {
                Name = "Udawalwe Elephant Safari",
                DestinationId = yala.Id, Category = "Wildlife", ActivityType = "tour",
                ImageUrl = "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=800&q=80",
                EstimatedCostUsd = 40, Latitude = 6.4728, Longitude = 80.8889,
                Description = "The best place in Sri Lanka to see wild Asian elephants in their natural habitat. Herds of 150+ elephants regularly gather at the reservoir at dawn and dusk. Also hosts water buffalo, crocodiles, and fish eagles.",
                OpeningHours = "6:00 AM - 6:00 PM", BestTimeToVisit = "Year-round", Duration = "3 - 4 hours"
            },
        };

        db.Attractions.AddRange(attractions);
        await db.SaveChangesAsync();

        // Seed some sample reviews for proper scoring
        var rng = new Random(42);
        var sampleReviews = new List<Review>();
        var attrIds = attractions.Select(a => a.Id).ToList();

        foreach (var attrId in attrIds)
        {
            var count = rng.Next(3, 12);
            for (int i = 0; i < count; i++)
            {
                sampleReviews.Add(new Review
                {
                    TouristId = 1,
                    EntityId = attrId,
                    EntityType = "Attraction",
                    Rating = rng.Next(3, 6), // 3-5
                    Title = "Wonderful Experience",
                    Comment = "Great experience visiting this beautiful place in Sri Lanka!",
                    CreatedAt = DateTime.UtcNow.AddDays(-rng.Next(1, 90))
                });
            }
        }
        db.Reviews.AddRange(sampleReviews);
        await db.SaveChangesAsync();
    }

    // Clean up any existing reviews with title and comment combined
    var allExistingReviews = await db.Reviews.ToListAsync();
    var hasChanges = false;
    foreach (var rev in allExistingReviews)
    {
        if (string.IsNullOrWhiteSpace(rev.Title) && rev.Comment.Contains(": "))
        {
            var parts = rev.Comment.Split(new[] { ": " }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length > 1)
            {
                rev.Title = parts[0].Trim();
                rev.Comment = string.Join(": ", parts.Skip(1)).Trim();
                hasChanges = true;
            }
        }
        if (string.IsNullOrWhiteSpace(rev.Title))
        {
            rev.Title = rev.Comment.Length > 40 ? rev.Comment.Substring(0, 40) + "..." : rev.Comment;
            hasChanges = true;
        }
        // Remove repeated duplicate title prefix if present in Comment
        while (!string.IsNullOrEmpty(rev.Title) && rev.Comment.StartsWith(rev.Title + ":", StringComparison.OrdinalIgnoreCase))
        {
            rev.Comment = rev.Comment.Substring(rev.Title.Length + 1).Trim();
            hasChanges = true;
        }
    }
    if (hasChanges)
    {
        await db.SaveChangesAsync();
    }
}

app.UseCors("AllowFrontend");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Only use HTTPS redirection if HTTPS port is configured (prevents startup warning in HTTP dev profile)
if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_HTTPS_PORT")) ||
    !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("HTTPS_PORT")))
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
