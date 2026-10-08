using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Nova.Api.Data;
using Nova.Api.Entities;

namespace Nova.ApiTests;

public class MyFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = "api-tests-" + Guid.NewGuid();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        // TODO 1: swap PostgreSQL for the in-memory database
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<NovaDbContext>>();
            services.RemoveAll<DbContextOptions>();
            services.AddDbContext<NovaDbContext>(o => o.UseInMemoryDatabase(_dbName));
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        // TODO 2: seed destinations with ids you control
        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NovaDbContext>();
        db.Database.EnsureCreated();

        if (!db.Destinations.Any(d => d.Id == "test-dest-galle"))
        {
            db.Destinations.Add(new Destination
            {
                Id = "test-dest-galle",
                Name = "Galle Fort",
                Slug = "galle-fort",
                Description = "Dutch colonial fort on the southern coast.",
                Location = "Galle District",
                Province = "Southern"
            });
            db.SaveChanges();
        }

        return host;
    }

    // TODO 3: create a JWT for a role, signed like AuthController does
    public string CreateToken(string role, string userId = "test-user-1")
    {
        var secret = Services.GetRequiredService<IConfiguration>()["Jwt:Secret"]
                     ?? "SuperSecretNovaEnterpriseTourismKey2026!#$";

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Name, "Test " + role),
                new Claim(ClaimTypes.Email, role.ToLower() + "@example.com"),
                new Claim(ClaimTypes.Role, role)
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var handler = new JwtSecurityTokenHandler();
        return handler.WriteToken(handler.CreateToken(descriptor));
    }
}