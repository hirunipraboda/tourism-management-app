using System.Security.Claims;
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

// Configure dynamic listening port from Render's $PORT environment variable if specified
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://+:{port}");
}

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

// 4. Register Four Tourism Agents & AI Agent Microservice Client
builder.Services.AddHttpClient<IAiAgentClient, AiAgentClient>();
builder.Services.AddScoped<ITravelPlanningAgent, TravelPlanningAgent>();
builder.Services.AddScoped<IDestinationResearchAgent, DestinationResearchAgent>();
builder.Services.AddScoped<ITravelLogisticsAgent, TravelLogisticsAgent>();
builder.Services.AddScoped<ISafetyValidationAgent, SafetyValidationAgent>();

// 5. Register Agentic AI Workflow Orchestrator
builder.Services.AddScoped<IItineraryGenerationService, ItineraryGenerationService>();

// 6. Register Reviews & Guide Services (merged from sub-projects)
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IGuideBookingService, GuideBookingService>();



// 7. JWT Authentication & Role-Based Authorization
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "travel_link_super_secret_jwt_key_2026_enterprise_production_secure_key";
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
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.Name
    };
    options.Events = new JwtBearerEvents
    {
        OnChallenge = context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            return context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                success = false,
                status = 401,
                message = "Authentication required or invalid/expired token."
            }));
        },
        OnForbidden = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            return context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                success = false,
                status = 403,
                message = "Forbidden: Insufficient permissions for this resource."
            }));
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("TouristOnly", policy => policy.RequireRole("Tourist", "USER", "User"));
    options.AddPolicy("OperatorOrAdmin", policy => policy.RequireRole("TourismOperator", "Admin", "ADMIN", "ROLE_ADMIN"));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin", "ADMIN", "ROLE_ADMIN"));
    options.AddPolicy("UserOnly", policy => policy.RequireRole("Tourist", "USER", "User"));
    options.AddPolicy("GuideOnly", policy => policy.RequireRole("Guide", "GUIDE"));
    options.AddPolicy("GuideOrAdmin", policy => policy.RequireRole("Guide", "GUIDE", "Admin", "ADMIN", "ROLE_ADMIN"));
});

// 8. CORS Policy
// Extra origins (e.g. the deployed Render static site) can be supplied via the
// Cors__AllowedOrigins environment variable as a comma-separated list.
var allowedOrigins = new List<string> { "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000" };
var extraOrigins = builder.Configuration["Cors:AllowedOrigins"];
if (!string.IsNullOrWhiteSpace(extraOrigins))
{
    allowedOrigins.AddRange(extraOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Select(o => o.TrimEnd('/')));
}
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins.ToArray())
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
        Title = "TourLink / NOVA Travel Management & AI Tour Ecosystem API",
        Version = "v1",
        Description = "Enterprise RESTful API for TourLink & NOVA Tourism Management System. Features AI agent workflows, destination guides, tour packages, bookings, payment receipts, reviews, and role-based access control (Admin, TourismOperator, Tourist).",
        Contact = new OpenApiContact
        {
            Name = "TourLink / NOVA Engineering",
            Email = "support@tourlink.lk"
        }
    });

    c.CustomSchemaIds(type => type.FullName?.Replace("+", "."));

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
    }

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer {token}' below.\nExample: Bearer eyJhbGciOi...",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
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
        try
        {
            await db.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE users ADD COLUMN IF NOT EXISTS status text DEFAULT 'ACTIVE';
                ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS location text;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image text;

                ALTER TABLE destinations ADD COLUMN IF NOT EXISTS district text;
                ALTER TABLE destinations ADD COLUMN IF NOT EXISTS category text;
                ALTER TABLE destinations ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
                ALTER TABLE destinations ADD COLUMN IF NOT EXISTS entry_fee double precision DEFAULT 0.0;
                ALTER TABLE destinations ADD COLUMN IF NOT EXISTS opening_time text;
                ALTER TABLE destinations ADD COLUMN IF NOT EXISTS closing_time text;
                ALTER TABLE destinations ADD COLUMN IF NOT EXISTS best_time_to_visit text;
                ALTER TABLE destinations ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
                ALTER TABLE destinations ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT NOW();

                ALTER TABLE transport_options ADD COLUMN IF NOT EXISTS provider text;
                ALTER TABLE transport_options ADD COLUMN IF NOT EXISTS vehicle_type text;
                ALTER TABLE transport_options ADD COLUMN IF NOT EXISTS estimated_cost numeric;
                ALTER TABLE transport_options ADD COLUMN IF NOT EXISTS status text;
                ALTER TABLE transport_options ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

                ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT NOW();
                ALTER TABLE reviews ALTER COLUMN sentiment_label DROP NOT NULL;
                ALTER TABLE reviews ALTER COLUMN sentiment_score DROP NOT NULL;
                ALTER TABLE reviews ALTER COLUMN status DROP NOT NULL;
                ALTER TABLE reviews ALTER COLUMN sentiment_label SET DEFAULT 'Positive';
                ALTER TABLE reviews ALTER COLUMN sentiment_score SET DEFAULT 0.0;
                ALTER TABLE reviews ALTER COLUMN status SET DEFAULT 'Published';

                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS image_url text;
                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS category text;
                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS entry_fee double precision DEFAULT 0.0;
                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS opening_time text;
                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS closing_time text;
                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS latitude double precision;
                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS longitude double precision;
                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS duration_hours double precision DEFAULT 2.0;
                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS rating double precision DEFAULT 4.5;
                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT NOW();
                ALTER TABLE attractions ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT NOW();

                ALTER TABLE trips ALTER COLUMN destination DROP NOT NULL;
                ALTER TABLE itineraries ALTER COLUMN feasibility_score DROP NOT NULL;
                ALTER TABLE transport_options ALTER COLUMN intermediate_stops DROP NOT NULL;
                ALTER TABLE transport_options ALTER COLUMN source DROP NOT NULL;
                ALTER TABLE transport_options ALTER COLUMN source SET DEFAULT 'SYSTEM';
                ALTER TABLE transport_options ALTER COLUMN retrieved_at DROP NOT NULL;
                ALTER TABLE transport_options ALTER COLUMN retrieved_at SET DEFAULT NOW();

                ALTER TABLE attractions ALTER COLUMN location DROP NOT NULL;
                ALTER TABLE attractions ALTER COLUMN location SET DEFAULT '';
                ALTER TABLE attractions ALTER COLUMN image_url DROP NOT NULL;
                ALTER TABLE attractions ALTER COLUMN image_url SET DEFAULT '';
                ALTER TABLE attractions ALTER COLUMN estimated_duration DROP NOT NULL;
                ALTER TABLE attractions ALTER COLUMN estimated_duration SET DEFAULT '2 Hours';
                ALTER TABLE attractions ALTER COLUMN estimated_cost DROP NOT NULL;
                ALTER TABLE attractions ALTER COLUMN estimated_cost SET DEFAULT 0.0;

                CREATE TABLE IF NOT EXISTS trip_destinations (
                    trip_id text NOT NULL,
                    destination_id text NOT NULL,
                    CONSTRAINT pk_trip_destinations PRIMARY KEY (trip_id, destination_id),
                    CONSTRAINT fk_trip_destinations_trips_trip_id FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
                    CONSTRAINT fk_trip_destinations_destinations_destination_id FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
                );
                CREATE INDEX IF NOT EXISTS ix_trip_destinations_destination_id ON trip_destinations (destination_id);

                CREATE TABLE IF NOT EXISTS transport_partners (
                    id text NOT NULL,
                    name text NOT NULL,
                    description text NOT NULL,
                    logo text,
                    website_url text NOT NULL,
                    discount double precision NOT NULL DEFAULT 0.0,
                    discount_description text NOT NULL,
                    is_active boolean NOT NULL DEFAULT true,
                    CONSTRAINT pk_transport_partners PRIMARY KEY (id)
                );

                -- Guide booking system tables & columns
                ALTER TABLE guides ADD COLUMN IF NOT EXISTS date_of_birth date;
                ALTER TABLE guides ADD COLUMN IF NOT EXISTS gender text;
                ALTER TABLE guides ADD COLUMN IF NOT EXISTS show_age_publicly boolean DEFAULT false;
                ALTER TABLE guides ADD COLUMN IF NOT EXISTS qualifications text;
                ALTER TABLE guides ADD COLUMN IF NOT EXISTS hourly_rate numeric(12,2) DEFAULT 0.0;
                ALTER TABLE guides ADD COLUMN IF NOT EXISTS half_day_rate numeric(12,2) DEFAULT 0.0;
                ALTER TABLE guides ADD COLUMN IF NOT EXISTS full_day_rate numeric(12,2) DEFAULT 0.0;
                ALTER TABLE guides ADD COLUMN IF NOT EXISTS accepting_bookings boolean DEFAULT true;
                ALTER TABLE guides ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;
                ALTER TABLE guides ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;
                ALTER TABLE guides ADD COLUMN IF NOT EXISTS payout_account_note text;

                ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false;

                CREATE TABLE IF NOT EXISTS guide_destinations (
                    guide_id integer NOT NULL,
                    destination_id text NOT NULL,
                    CONSTRAINT pk_guide_destinations PRIMARY KEY (guide_id, destination_id)
                );

                CREATE TABLE IF NOT EXISTS guide_working_hours (
                    id serial PRIMARY KEY,
                    guide_id integer NOT NULL,
                    day_of_week integer NOT NULL,
                    start_time time without time zone NOT NULL,
                    end_time time without time zone NOT NULL
                );

                CREATE TABLE IF NOT EXISTS guide_blocked_dates (
                    id serial PRIMARY KEY,
                    guide_id integer NOT NULL,
                    start_date date NOT NULL,
                    end_date date NOT NULL,
                    reason text,
                    created_at timestamp with time zone DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS guide_bookings (
                    id character varying(20) PRIMARY KEY,
                    guide_id integer NOT NULL,
                    customer_id text NOT NULL,
                    customer_name text NOT NULL,
                    customer_email text NOT NULL,
                    customer_phone text,
                    start_date date NOT NULL,
                    end_date date NOT NULL,
                    start_time time without time zone NOT NULL,
                    end_time time without time zone NOT NULL,
                    travelers integer NOT NULL DEFAULT 1,
                    pickup_location text,
                    preferred_language text,
                    special_requests text,
                    status text NOT NULL DEFAULT 'PendingPayment',
                    subtotal numeric(12,2) NOT NULL DEFAULT 0.0,
                    service_fee numeric(12,2) NOT NULL DEFAULT 0.0,
                    total_amount numeric(12,2) NOT NULL DEFAULT 0.0,
                    commission_amount numeric(12,2) NOT NULL DEFAULT 0.0,
                    guide_net_amount numeric(12,2) NOT NULL DEFAULT 0.0,
                    currency character varying(3) NOT NULL DEFAULT 'USD',
                    billable_days integer NOT NULL DEFAULT 1,
                    pricing_breakdown text,
                    hold_expires_at timestamp with time zone,
                    confirmed_at timestamp with time zone,
                    guide_decision_at timestamp with time zone,
                    completed_at timestamp with time zone,
                    cancelled_at timestamp with time zone,
                    cancelled_by text,
                    cancellation_reason text,
                    reminder_sent_at timestamp with time zone,
                    refund_status text NOT NULL DEFAULT 'None',
                    refund_amount numeric(12,2) NOT NULL DEFAULT 0.0,
                    idempotency_key text,
                    created_at timestamp with time zone DEFAULT NOW(),
                    updated_at timestamp with time zone DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS guide_booking_destinations (
                    booking_id character varying(20) NOT NULL,
                    destination_id text NOT NULL,
                    destination_name text NOT NULL,
                    CONSTRAINT pk_guide_booking_destinations PRIMARY KEY (booking_id, destination_id)
                );

                CREATE TABLE IF NOT EXISTS guide_payments (
                    id text PRIMARY KEY,
                    booking_id character varying(20) NOT NULL,
                    provider character varying(30) NOT NULL DEFAULT 'Stripe',
                    provider_session_id text,
                    provider_payment_intent_id text,
                    transaction_reference text,
                    payment_method text,
                    checkout_url text,
                    amount numeric(12,2) NOT NULL DEFAULT 0.0,
                    currency character varying(3) NOT NULL DEFAULT 'USD',
                    status text NOT NULL DEFAULT 'Initiated',
                    failure_reason text,
                    created_at timestamp with time zone DEFAULT NOW(),
                    paid_at timestamp with time zone,
                    refunded_at timestamp with time zone,
                    refund_reference text,
                    refunded_amount numeric(12,2) NOT NULL DEFAULT 0.0
                );

                CREATE TABLE IF NOT EXISTS guide_payouts (
                    id text PRIMARY KEY,
                    booking_id character varying(20) NOT NULL,
                    guide_id integer NOT NULL,
                    gross_amount numeric(12,2) NOT NULL DEFAULT 0.0,
                    commission_amount numeric(12,2) NOT NULL DEFAULT 0.0,
                    net_amount numeric(12,2) NOT NULL DEFAULT 0.0,
                    currency character varying(3) NOT NULL DEFAULT 'USD',
                    status text NOT NULL DEFAULT 'Pending',
                    payout_reference text,
                    payout_method text,
                    processed_by_user_id text,
                    notes text,
                    paid_at timestamp with time zone,
                    created_at timestamp with time zone DEFAULT NOW(),
                    updated_at timestamp with time zone DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS guide_booking_events (
                    id bigserial PRIMARY KEY,
                    booking_id character varying(20),
                    guide_id integer,
                    actor_id text,
                    actor_role text NOT NULL DEFAULT 'System',
                    event_type text NOT NULL,
                    details text,
                    created_at timestamp with time zone DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS payment_webhook_events (
                    id bigserial PRIMARY KEY,
                    provider character varying(30) NOT NULL,
                    provider_event_id text NOT NULL,
                    event_type text NOT NULL,
                    processed_at timestamp with time zone DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS notifications (
                    id text PRIMARY KEY,
                    user_id text NOT NULL,
                    type character varying(50) NOT NULL,
                    title character varying(200) NOT NULL,
                    message character varying(1000) NOT NULL,
                    related_booking_id text,
                    is_read boolean NOT NULL DEFAULT false,
                    created_at timestamp with time zone DEFAULT NOW()
                );
            ");
        }
        catch (Exception colEx)
        {
            Console.WriteLine($"[Schema Sync Warning] {colEx.Message}");
        }
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

// Configure the HTTP request pipeline (Swagger enabled globally)
app.UseSwagger(c =>
{
    c.RouteTemplate = "swagger/{documentName}/swagger.json";
});
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TourLink / NOVA API v1");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "TourLink / NOVA API Documentation";
    c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
    c.EnablePersistAuthorization();
    c.DisplayRequestDuration();
});

// Root URL redirects straight to Swagger UI for quick developer access
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        status = "Healthy"
    });
});

app.MapGet("/api/health", () =>
{
    return Results.Ok(new
    {
        status = "Healthy"
    });
});

app.MapControllers();

app.Run();
