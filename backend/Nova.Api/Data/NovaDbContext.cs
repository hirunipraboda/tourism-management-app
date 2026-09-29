using Microsoft.EntityFrameworkCore;
using Nova.Api.Entities;

namespace Nova.Api.Data;

public class NovaDbContext : DbContext
{
    public NovaDbContext(DbContextOptions<NovaDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Destination> Destinations => Set<Destination>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<Itinerary> Itineraries => Set<Itinerary>();
    public DbSet<ItineraryDay> ItineraryDays => Set<ItineraryDay>();
    public DbSet<ItineraryItem> ItineraryItems => Set<ItineraryItem>();
    public DbSet<ItineraryGenerationWorkflow> Workflows => Set<ItineraryGenerationWorkflow>();
    public DbSet<WorkflowAuditLog> AuditLogs => Set<WorkflowAuditLog>();
    public DbSet<ItineraryApproval> Approvals => Set<ItineraryApproval>();
    public DbSet<TransportOption> TransportOptions => Set<TransportOption>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Enum string conversions
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<Trip>()
            .Property(t => t.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Itinerary>()
            .Property(i => i.Status)
            .HasConversion<string>();

        modelBuilder.Entity<ItineraryGenerationWorkflow>()
            .Property(w => w.Status)
            .HasConversion<string>();

        modelBuilder.Entity<ItineraryApproval>()
            .Property(a => a.Action)
            .HasConversion<string>();

        modelBuilder.Entity<ItineraryApproval>()
            .Property(a => a.PreviousStatus)
            .HasConversion<string>();

        modelBuilder.Entity<ItineraryApproval>()
            .Property(a => a.NewStatus)
            .HasConversion<string>();

        // Indexes
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Destination>()
            .HasIndex(d => d.Slug)
            .IsUnique();

        modelBuilder.Entity<Trip>()
            .HasIndex(t => t.UserId);

        modelBuilder.Entity<Itinerary>()
            .HasIndex(i => i.TripId);

        modelBuilder.Entity<ItineraryGenerationWorkflow>()
            .HasIndex(w => w.TripId);

        modelBuilder.Entity<WorkflowAuditLog>()
            .HasIndex(a => a.WorkflowId);

        modelBuilder.Entity<TransportOption>()
            .HasIndex(t => t.TripId);

        modelBuilder.Entity<TransportOption>()
            .HasIndex(t => new { t.Origin, t.Destination, t.TravelDate });

        // Cascade delete configurations
        modelBuilder.Entity<Trip>()
            .HasMany(t => t.Itineraries)
            .WithOne(i => i.Trip)
            .HasForeignKey(i => i.TripId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Trip>()
            .HasMany(t => t.TransportOptions)
            .WithOne(to => to.Trip)
            .HasForeignKey(to => to.TripId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Itinerary>()
            .HasMany(i => i.Days)
            .WithOne(d => d.Itinerary)
            .HasForeignKey(d => d.ItineraryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ItineraryDay>()
            .HasMany(d => d.Items)
            .WithOne(item => item.ItineraryDay)
            .HasForeignKey(item => item.ItineraryDayId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ItineraryItem>()
            .HasOne(item => item.SelectedTransport)
            .WithOne(t => t.ItineraryItem)
            .HasForeignKey<TransportOption>(t => t.ItineraryItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ItineraryGenerationWorkflow>()
            .HasMany(w => w.AuditLogs)
            .WithOne(a => a.Workflow)
            .HasForeignKey(a => a.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
