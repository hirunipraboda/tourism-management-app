using Microsoft.EntityFrameworkCore;
using Npgsql;
using Nova.Api.Data;
using Nova.Api.Entities;

namespace Nova.Tests.TripItinerary.Support;

/// <summary>
/// Creates an isolated PostgreSQL database for a single test.
///
/// Safety: the development database ("travel_link") and the production Supabase database are NEVER touched.
/// A throw-away template database (nova_tripitin_tpl_*) is built once per test run from the real
/// <see cref="NovaDbContext"/> model (same provider, same snake_case naming convention as Program.cs).
/// Every test then gets its own clone (nova_tripitin_t_*) which is dropped on dispose.
///
/// Admin connection: env var NOVA_TEST_PG_ADMIN, defaulting to the local PostgreSQL server that
/// Program.cs already targets for local development (database "postgres" is only used to issue CREATE/DROP DATABASE).
/// </summary>
public sealed class PgTestDatabase : IAsyncDisposable
{
    public const string UserAId = "test-user-a";
    public const string UserBId = "test-user-b";
    public const string OperatorId = "test-operator";
    public const string AdminId = "test-admin";

    private static readonly object Gate = new();
    private static string? _templateName;

    public static string AdminConnectionString =>
        Environment.GetEnvironmentVariable("NOVA_TEST_PG_ADMIN")
        ?? "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=user123";

    public string DatabaseName { get; }
    public string ConnectionString { get; }

    private PgTestDatabase(string name)
    {
        DatabaseName = name;
        ConnectionString = new NpgsqlConnectionStringBuilder(AdminConnectionString) { Database = name, Pooling = false }.ConnectionString;
    }

    public static DbContextOptions<NovaDbContext> BuildOptions(string connectionString) =>
        new DbContextOptionsBuilder<NovaDbContext>()
            .UseNpgsql(connectionString)
            .UseSnakeCaseNamingConvention()
            .Options;

    public NovaDbContext CreateContext() => new(BuildOptions(ConnectionString));

    public static async Task<PgTestDatabase> CreateAsync()
    {
        var template = EnsureTemplate();
        var name = "nova_tripitin_t_" + Guid.NewGuid().ToString("N")[..16];
        await ExecAdminAsync($"CREATE DATABASE \"{name}\" TEMPLATE \"{template}\"");
        var db = new PgTestDatabase(name);
        await db.SeedBaselineUsersAsync();
        return db;
    }

    private static string EnsureTemplate()
    {
        lock (Gate)
        {
            if (_templateName != null) return _templateName;

            var name = "nova_tripitin_tpl_" + Guid.NewGuid().ToString("N")[..12];
            ExecAdminAsync($"CREATE DATABASE \"{name}\"").GetAwaiter().GetResult();

            var cs = new NpgsqlConnectionStringBuilder(AdminConnectionString) { Database = name, Pooling = false }.ConnectionString;
            using (var ctx = new NovaDbContext(BuildOptions(cs)))
            {
                // Schema is built from the real EF model (EnsureCreated). EF migrations are not part of the test project.
                ctx.Database.EnsureCreated();
            }

            AppDomain.CurrentDomain.ProcessExit += (_, _) =>
            {
                try { ExecAdminAsync($"DROP DATABASE IF EXISTS \"{name}\" WITH (FORCE)").GetAwaiter().GetResult(); } catch { /* best effort */ }
            };
            _templateName = name;
            return name;
        }
    }

    private static async Task ExecAdminAsync(string sql)
    {
        await using var conn = new NpgsqlConnection(new NpgsqlConnectionStringBuilder(AdminConnectionString) { Pooling = false }.ConnectionString);
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand(sql, conn);
        await cmd.ExecuteNonQueryAsync();
    }

    private async Task SeedBaselineUsersAsync()
    {
        await using var db = CreateContext();
        db.Users.AddRange(
            new User { Id = UserAId, Name = "Test User A", Email = "test-user-a@example.test", PasswordHash = "x", Role = UserRole.Tourist },
            new User { Id = UserBId, Name = "Test User B", Email = "test-user-b@example.test", PasswordHash = "x", Role = UserRole.Tourist },
            new User { Id = OperatorId, Name = "Test Operator", Email = "test-operator@example.test", PasswordHash = "x", Role = UserRole.TourismOperator },
            new User { Id = AdminId, Name = "Test Admin", Email = "test-admin@example.test", PasswordHash = "x", Role = UserRole.Admin },
            new User { Id = "user-elena", Name = "Elena Rostova", Email = "elena@example.test", PasswordHash = "x", Role = UserRole.Tourist },
            new User { Id = "user-sarah", Name = "Sarah Jenkins", Email = "sarah@example.test", PasswordHash = "x", Role = UserRole.Tourist },
            new User { Id = "user-julian", Name = "Julian Vance", Email = "julian@example.test", PasswordHash = "x", Role = UserRole.Tourist },
            new User { Id = "user-marcus", Name = "Marcus Brody", Email = "marcus@example.test", PasswordHash = "x", Role = UserRole.Tourist });

        db.Destinations.AddRange(
            new Destination { Id = "dest-1", Name = "Sigiriya Ancient Rock Fortress", Slug = "sigiriya", Description = "Ancient Rock Fortress", Location = "Sigiriya", Province = "Central" },
            new Destination { Id = "dest-2", Name = "Nine Arches Bridge & Ella Gap", Slug = "ella", Description = "Colonial viaduct and mountain hiking", Location = "Ella", Province = "Uva" },
            new Destination { Id = "dest-3", Name = "Temple of the Sacred Tooth Relic", Slug = "kandy", Description = "Sacred Buddhist heritage site", Location = "Kandy", Province = "Central" },
            new Destination { Id = "dest-4", Name = "Galle Dutch Fort", Slug = "galle", Description = "Colonial seaside fortress ramparts", Location = "Galle", Province = "Southern" });

        await db.SaveChangesAsync();
    }

    public async ValueTask DisposeAsync()
    {
        try { await ExecAdminAsync($"DROP DATABASE IF EXISTS \"{DatabaseName}\" WITH (FORCE)"); }
        catch { /* best effort cleanup */ }
    }
}
