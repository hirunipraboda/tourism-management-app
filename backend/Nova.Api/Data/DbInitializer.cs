using Microsoft.EntityFrameworkCore;
using Nova.Api.Entities;

namespace Nova.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(NovaDbContext db)
    {
        // 1. Seed Users (Tourist, Operator, Admin)
        if (!await db.Users.AnyAsync())
        {
            db.Users.AddRange(
                new User
                {
                    Id = "user-tourist-1",
                    Name = "Alice Tourist",
                    Email = "alice@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    Role = UserRole.Tourist,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = "user-operator-1",
                    Name = "Bob Operator",
                    Email = "operator@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    Role = UserRole.TourismOperator,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = "user-admin-1",
                    Name = "Charlie Admin",
                    Email = "admin@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    Role = UserRole.Admin,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );
            await db.SaveChangesAsync();
        }

        // 2. Seed Destinations & Activities
        if (!await db.Destinations.AnyAsync())
        {
            var sigiriya = new Destination
            {
                Id = "dest-sigiriya",
                Name = "Sigiriya",
                Slug = "sigiriya-citadel",
                Description = "Ancient palace and fortress complex recognized as an 8th wonder of the world.",
                Location = "Matale District",
                Province = "Central",
                ImageUrl = "https://images.unsplash.com/photo-1588598198321-9735fd52455d",
                Rating = 4.9,
                Activities = [
                    new()
                    {
                        Id = "act-sigiriya-climb",
                        Name = "Sigiriya Rock Citadel Fortress Climb",
                        Description = "Climb past mirror wall and ancient frescoes to royal palace ruins.",
                        Category = "culture",
                        CostPerPerson = 30.0m,
                        DurationMinutes = 180,
                        OpeningTime = new TimeSpan(6, 30, 0),
                        ClosingTime = new TimeSpan(17, 30, 0)
                    },
                    new()
                    {
                        Id = "act-sigiriya-village",
                        Name = "Authentic Village Bullock Cart & Lunch",
                        Description = "Catamaran ride, bullock cart, and traditional rice & curry on banana leaves.",
                        Category = "culture",
                        CostPerPerson = 15.0m,
                        DurationMinutes = 120,
                        OpeningTime = new TimeSpan(11, 0, 0),
                        ClosingTime = new TimeSpan(15, 0, 0)
                    },
                    new()
                    {
                        Id = "act-pidurangala",
                        Name = "Pidurangala Rock Sunset Viewpoint",
                        Description = "Hike to panoramic 360-degree viewpoint overlooking Sigiriya rock.",
                        Category = "nature",
                        CostPerPerson = 5.0m,
                        DurationMinutes = 120,
                        OpeningTime = new TimeSpan(5, 0, 0),
                        ClosingTime = new TimeSpan(19, 0, 0)
                    }
                ]
            };

            var kandy = new Destination
            {
                Id = "dest-kandy",
                Name = "Kandy",
                Slug = "kandy-sacred-city",
                Description = "Last royal capital of Sri Lanka, home to the Temple of the Sacred Tooth Relic.",
                Location = "Kandy District",
                Province = "Central",
                ImageUrl = "https://images.unsplash.com/photo-1546708973-b339540b5162",
                Rating = 4.8,
                Activities = [
                    new()
                    {
                        Id = "act-tooth-relic",
                        Name = "Temple of the Sacred Tooth Relic",
                        Description = "Venerated Buddhist shrine holding Buddha's tooth relic.",
                        Category = "culture",
                        CostPerPerson = 10.0m,
                        DurationMinutes = 120,
                        OpeningTime = new TimeSpan(5, 30, 0),
                        ClosingTime = new TimeSpan(20, 0, 0)
                    },
                    new()
                    {
                        Id = "act-botanical",
                        Name = "Royal Botanical Gardens Botanical Walk",
                        Description = "147 acres of tropical orchid collections and historic palm avenues.",
                        Category = "nature",
                        CostPerPerson = 12.0m,
                        DurationMinutes = 150,
                        OpeningTime = new TimeSpan(8, 0, 0),
                        ClosingTime = new TimeSpan(17, 30, 0)
                    },
                    new()
                    {
                        Id = "act-kandyan-dance",
                        Name = "Traditional Kandyan Cultural Dance Show",
                        Description = "Ceremonial fire-walking and rhythmic Kandyan drumming.",
                        Category = "culture",
                        CostPerPerson = 10.0m,
                        DurationMinutes = 90,
                        OpeningTime = new TimeSpan(17, 0, 0),
                        ClosingTime = new TimeSpan(19, 30, 0)
                    }
                ]
            };

            var ella = new Destination
            {
                Id = "dest-ella",
                Name = "Ella",
                Slug = "ella-mountain-gap",
                Description = "Scenic mountain village known for Nine Arches Bridge and misty tea gardens.",
                Location = "Badulla District",
                Province = "Uva",
                ImageUrl = "https://images.unsplash.com/photo-1546708973-b339540b5162",
                Rating = 4.8,
                Activities = [
                    new()
                    {
                        Id = "act-nine-arches",
                        Name = "Demodara Nine Arches Viaduct Bridge",
                        Description = "Watch the blue mountain train cross the colonial viaduct bridge.",
                        Category = "nature",
                        CostPerPerson = 0.0m,
                        DurationMinutes = 120,
                        OpeningTime = new TimeSpan(6, 0, 0),
                        ClosingTime = new TimeSpan(18, 0, 0)
                    },
                    new()
                    {
                        Id = "act-adams-peak",
                        Name = "Little Adam's Peak Mountain Trek",
                        Description = "Gentle mountain trail with 360-degree views across Ella Gap.",
                        Category = "nature",
                        CostPerPerson = 0.0m,
                        DurationMinutes = 150,
                        OpeningTime = new TimeSpan(6, 0, 0),
                        ClosingTime = new TimeSpan(18, 0, 0)
                    }
                ]
            };

            db.Destinations.AddRange(sigiriya, kandy, ella);
            await db.SaveChangesAsync();
        }
    }
}
