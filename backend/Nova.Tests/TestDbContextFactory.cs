using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Entities;

namespace Nova.Tests;

public static class TestDbContextFactory
{
    public static NovaDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<NovaDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new NovaDbContext(options);

        // Seed default test users
        var tourist = new User
        {
            Id = "11111111-1111-1111-1111-111111111111",
            Email = "tourist@example.com",
            Name = "Test Tourist",
            PasswordHash = "hash",
            Role = UserRole.Tourist
        };

        var otherTourist = new User
        {
            Id = "22222222-2222-2222-2222-222222222222",
            Email = "othertourist@example.com",
            Name = "Other Tourist",
            PasswordHash = "hash",
            Role = UserRole.Tourist
        };

        var op = new User
        {
            Id = "33333333-3333-3333-3333-333333333333",
            Email = "operator@example.com",
            Name = "Tourism Operator",
            PasswordHash = "hash",
            Role = UserRole.TourismOperator
        };

        var admin = new User
        {
            Id = "44444444-4444-4444-4444-444444444444",
            Email = "admin@example.com",
            Name = "System Admin",
            PasswordHash = "hash",
            Role = UserRole.Admin
        };

        var destination = new Destination
        {
            Id = Guid.NewGuid().ToString(),
            Name = "Sigiriya",
            Slug = "sigiriya",
            Province = "Central Province",
            Location = "Central Province, Sri Lanka",
            Description = "Ancient rock fortress",
            Rating = 4.8
        };

        context.Users.AddRange(tourist, otherTourist, op, admin);
        context.Destinations.Add(destination);
        context.SaveChanges();

        return context;
    }
}
