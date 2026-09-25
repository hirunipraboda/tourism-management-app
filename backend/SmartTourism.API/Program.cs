using Microsoft.EntityFrameworkCore;
using SmartTourism.API.Domain.Entities.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Ensure our AppDbContext is wired up correctly!
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.
builder.Services.AddControllers();          // ← ADDED: registers support for controllers like GuideController
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.ExecuteSqlRaw(@"
        CREATE TABLE IF NOT EXISTS ""Users"" (
            ""Id"" uuid NOT NULL PRIMARY KEY,
            ""FullName"" text NOT NULL,
            ""Email"" text NOT NULL,
            ""PasswordHash"" text NOT NULL,
            ""Role"" integer NOT NULL,
            ""Status"" integer NOT NULL DEFAULT 0,
            ""Phone"" text NULL,
            ""CreatedAt"" timestamp with time zone NOT NULL,
            ""UpdatedAt"" timestamp with time zone NOT NULL
        );
        ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""Status"" integer NOT NULL DEFAULT 0;
        CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Users_Email"" ON ""Users"" (""Email"");
        ALTER TABLE ""TourPackages"" ADD COLUMN IF NOT EXISTS ""ImageUrl"" text NULL;
        UPDATE ""TourPackages"" SET ""ImageUrl"" = '' WHERE ""ImageUrl"" IS NULL;
    ");

    // Seed default database users if table is empty
    if (!db.Users.Any())
    {
        var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
        db.Users.AddRange(new[]
        {
            new SmartTourism.API.Domain.Entities.User
            {
                Id = Guid.NewGuid(),
                FullName = "Admin Desk Officer",
                Email = "admin@travellink.lk",
                PasswordHash = defaultPasswordHash,
                Role = SmartTourism.API.Domain.Entities.Enums.UserRole.Admin,
                Status = SmartTourism.API.Domain.Entities.UserStatus.Active,
                Phone = "+94 11 777 0000",
                CreatedAt = DateTime.UtcNow.AddMonths(-5),
                UpdatedAt = DateTime.UtcNow
            },
            new SmartTourism.API.Domain.Entities.User
            {
                Id = Guid.NewGuid(),
                FullName = "Ceylon Travels Operator",
                Email = "operator@ceylontravels.lk",
                PasswordHash = defaultPasswordHash,
                Role = SmartTourism.API.Domain.Entities.Enums.UserRole.Provider,
                Status = SmartTourism.API.Domain.Entities.UserStatus.Active,
                Phone = "+94 11 234 5678",
                CreatedAt = DateTime.UtcNow.AddMonths(-3),
                UpdatedAt = DateTime.UtcNow
            },
            new SmartTourism.API.Domain.Entities.User
            {
                Id = Guid.NewGuid(),
                FullName = "Sanath Wickramasinghe",
                Email = "sanath.w@gmail.com",
                PasswordHash = defaultPasswordHash,
                Role = SmartTourism.API.Domain.Entities.Enums.UserRole.Tourist,
                Status = SmartTourism.API.Domain.Entities.UserStatus.Active,
                Phone = "+94 77 123 4567",
                CreatedAt = DateTime.UtcNow.AddMonths(-2),
                UpdatedAt = DateTime.UtcNow
            },
            new SmartTourism.API.Domain.Entities.User
            {
                Id = Guid.NewGuid(),
                FullName = "Anula Wickramasinghe",
                Email = "anula.w@gmail.com",
                PasswordHash = defaultPasswordHash,
                Role = SmartTourism.API.Domain.Entities.Enums.UserRole.Tourist,
                Status = SmartTourism.API.Domain.Entities.UserStatus.Active,
                Phone = "+94 71 987 6543",
                CreatedAt = DateTime.UtcNow.AddMonths(-1),
                UpdatedAt = DateTime.UtcNow
            }
        });
        db.SaveChanges();
    }
}

app.UseCors("AllowFrontend");
app.MapControllers();                        // ← ADDED: activates GuideController's routes

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

// Placeholder route for weather — safe to delete once you confirm Guide works, this isn't part of your project
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
