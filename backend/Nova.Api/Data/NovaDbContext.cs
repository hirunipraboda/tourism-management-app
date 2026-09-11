using Microsoft.EntityFrameworkCore;
using Nova.Api.Models;

namespace Nova.Api.Data;

public class NovaDbContext : DbContext
{
    public NovaDbContext(DbContextOptions<NovaDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Destination> Destinations => Set<Destination>();
    public DbSet<Attraction> Attractions => Set<Attraction>();
    public DbSet<Tour> Tours => Set<Tour>();
    public DbSet<TourDestination> TourDestinations => Set<TourDestination>();
    public DbSet<TourItinerary> TourItineraries => Set<TourItinerary>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<TripDestination> TripDestinations => Set<TripDestination>();
    public DbSet<TripItinerary> TripItineraries => Set<TripItinerary>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<TransportPartner> TransportPartners => Set<TransportPartner>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Composite primary keys
        modelBuilder.Entity<TourDestination>()
            .HasKey(td => new { td.TourId, td.DestinationId });

        modelBuilder.Entity<TripDestination>()
            .HasKey(td => new { td.TripId, td.DestinationId });

        // Enums mapping to strings
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<User>()
            .Property(u => u.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Destination>()
            .Property(d => d.Province)
            .HasConversion<string>();

        modelBuilder.Entity<Destination>()
            .Property(d => d.Category)
            .HasConversion<string>();

        modelBuilder.Entity<Tour>()
            .Property(t => t.Category)
            .HasConversion<string>();

        modelBuilder.Entity<Trip>()
            .Property(t => t.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Booking>()
            .Property(b => b.TravelOption)
            .HasConversion<string>();

        modelBuilder.Entity<Booking>()
            .Property(b => b.PaymentStatus)
            .HasConversion<string>();

        modelBuilder.Entity<Booking>()
            .Property(b => b.Status)
            .HasConversion<string>();

        // Indexes & uniques
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Destination>()
            .HasIndex(d => d.Slug)
            .IsUnique();

        modelBuilder.Entity<Tour>()
            .HasIndex(t => t.Slug)
            .IsUnique();

        modelBuilder.Entity<Tour>()
            .HasIndex(t => t.Code)
            .IsUnique();

        modelBuilder.Entity<Booking>()
            .HasIndex(b => b.BookingRef)
            .IsUnique();
    }
}
