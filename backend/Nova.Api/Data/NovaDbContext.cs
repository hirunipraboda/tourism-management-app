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
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<TripDestination> TripDestinations => Set<TripDestination>();
    public DbSet<Itinerary> Itineraries => Set<Itinerary>();
    public DbSet<ItineraryDay> ItineraryDays => Set<ItineraryDay>();
    public DbSet<ItineraryItem> ItineraryItems => Set<ItineraryItem>();
    public DbSet<ItineraryGenerationWorkflow> Workflows => Set<ItineraryGenerationWorkflow>();
    public DbSet<WorkflowAuditLog> AuditLogs => Set<WorkflowAuditLog>();
    public DbSet<ItineraryApproval> Approvals => Set<ItineraryApproval>();
    public DbSet<TransportOption> TransportOptions => Set<TransportOption>();
    public DbSet<TransportPartner> TransportPartners => Set<TransportPartner>();

    // Admin & Extended Entities
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<PromoCode> PromoCodes => Set<PromoCode>();
    public DbSet<PromoCodeUsage> PromoCodeUsages => Set<PromoCodeUsage>();
    public DbSet<BusRoute> BusRoutes => Set<BusRoute>();
    public DbSet<TrainSchedule> TrainSchedules => Set<TrainSchedule>();
    public DbSet<ChatbotPackage> ChatbotPackages => Set<ChatbotPackage>();
    public DbSet<ChatbotPackagePurchase> ChatbotPackagePurchases => Set<ChatbotPackagePurchase>();
    public DbSet<AIChatSession> AIChatSessions => Set<AIChatSession>();
    public DbSet<AIPhotoQuery> AIPhotoQueries => Set<AIPhotoQuery>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Attraction> Attractions => Set<Attraction>();
    public DbSet<ChatbotPayment> ChatbotPayments => Set<ChatbotPayment>();
    public DbSet<PromoPayment> PromoPayments => Set<PromoPayment>();
    public DbSet<SystemActivity> SystemActivities => Set<SystemActivity>();

    // Guide & Tour Operations Entities
    public DbSet<Guide> Guides => Set<Guide>();
    public DbSet<TourPackage> TourPackages => Set<TourPackage>();
    public DbSet<TourOperation> TourOperations => Set<TourOperation>();
    public DbSet<GuideAvailability> GuideAvailabilities => Set<GuideAvailability>();
    public DbSet<GuideDestination> GuideDestinations => Set<GuideDestination>();
    public DbSet<GuideWorkingHours> GuideWorkingHours => Set<GuideWorkingHours>();
    public DbSet<GuideBlockedDate> GuideBlockedDates => Set<GuideBlockedDate>();
    public DbSet<GuideBooking> GuideBookings => Set<GuideBooking>();
    public DbSet<GuideBookingDestination> GuideBookingDestinations => Set<GuideBookingDestination>();
    public DbSet<GuidePayment> GuidePayments => Set<GuidePayment>();
    public DbSet<GuidePayout> GuidePayouts => Set<GuidePayout>();
    public DbSet<GuideBookingEvent> GuideBookingEvents => Set<GuideBookingEvent>();
    public DbSet<PaymentWebhookEvent> PaymentWebhookEvents => Set<PaymentWebhookEvent>();
    public DbSet<Notification> Notifications => Set<Notification>();

    // Reviews & Recommendations Extended Entities
    public DbSet<ReviewHelpfulVote> ReviewHelpfulVotes => Set<ReviewHelpfulVote>();
    public DbSet<RecommendationSettings> RecommendationSettings => Set<RecommendationSettings>();

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

        modelBuilder.Entity<Booking>()
            .Property(b => b.Status)
            .HasConversion<string>();

        modelBuilder.Entity<PromoCode>()
            .Property(p => p.DiscountType)
            .HasConversion<string>();

        modelBuilder.Entity<BusRoute>()
            .Property(b => b.Status)
            .HasConversion<string>();

        modelBuilder.Entity<TrainSchedule>()
            .Property(t => t.Status)
            .HasConversion<string>();

        modelBuilder.Entity<ChatbotPackage>()
            .Property(c => c.Status)
            .HasConversion<string>();

        modelBuilder.Entity<ChatbotPackagePurchase>()
            .Property(c => c.Status)
            .HasConversion<string>();

        modelBuilder.Entity<AIChatSession>()
            .Property(c => c.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Review>()
            .Property(r => r.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Attraction>()
            .Property(a => a.Status)
            .HasConversion<string>();

        modelBuilder.Entity<ChatbotPayment>()
            .Property(c => c.Status)
            .HasConversion<string>();

        modelBuilder.Entity<PromoPayment>()
            .Property(p => p.Status)
            .HasConversion<string>();

        // Indexes
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<PromoCode>()
            .HasIndex(p => p.Code)
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

        modelBuilder.Entity<Trip>()
            .HasMany(t => t.Bookings)
            .WithOne(b => b.Trip)
            .HasForeignKey(b => b.TripId)
            .OnDelete(DeleteBehavior.SetNull);

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

        modelBuilder.Entity<TripDestination>()
            .HasKey(td => new { td.TripId, td.DestinationId });

        modelBuilder.Entity<ItineraryGenerationWorkflow>()
            .HasMany(w => w.AuditLogs)
            .WithOne(a => a.Workflow)
            .HasForeignKey(a => a.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Guide & Tour Operations Relationships ──────────────────────────────

        modelBuilder.Entity<GuideAvailability>()
            .HasOne(ga => ga.Guide)
            .WithMany(g => g.Availabilities)
            .HasForeignKey(ga => ga.GuideId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TourOperation>()
            .HasOne(to => to.Guide)
            .WithMany(g => g.TourOperations)
            .HasForeignKey(to => to.GuideId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TourOperation>()
            .HasOne(to => to.TourPackage)
            .WithMany(tp => tp.TourOperations)
            .HasForeignKey(to => to.TourPackageId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TourPackage>()
            .HasOne(tp => tp.Guide)
            .WithMany(g => g.TourPackages)
            .HasForeignKey(tp => tp.GuideId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Guide>()
            .Property(g => g.VerificationStatus)
            .HasConversion<string>();

        modelBuilder.Entity<TourOperation>()
            .Property(to => to.Status)
            .HasConversion<string>();

        // ── Guide Booking System Relationships & Keys ───────────────────────────
        modelBuilder.Entity<GuideDestination>()
            .HasKey(gd => new { gd.GuideId, gd.DestinationId });

        modelBuilder.Entity<GuideDestination>()
            .HasOne(gd => gd.Guide)
            .WithMany(g => g.CoveredDestinations)
            .HasForeignKey(gd => gd.GuideId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GuideWorkingHours>()
            .HasOne(gwh => gwh.Guide)
            .WithMany(g => g.WorkingHours)
            .HasForeignKey(gwh => gwh.GuideId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GuideBlockedDate>()
            .HasOne(gbd => gbd.Guide)
            .WithMany(g => g.BlockedDates)
            .HasForeignKey(gbd => gbd.GuideId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GuideBooking>()
            .Property(b => b.Status)
            .HasConversion<string>();

        modelBuilder.Entity<GuideBooking>()
            .Property(b => b.RefundStatus)
            .HasConversion<string>();

        modelBuilder.Entity<GuideBooking>()
            .HasOne(b => b.Guide)
            .WithMany()
            .HasForeignKey(b => b.GuideId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<GuideBooking>()
            .HasOne(b => b.Customer)
            .WithMany()
            .HasForeignKey(b => b.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<GuideBooking>()
            .HasIndex(b => new { b.GuideId, b.StartDate, b.EndDate });

        modelBuilder.Entity<GuideBooking>()
            .HasIndex(b => b.CustomerId);

        modelBuilder.Entity<GuideBooking>()
            .HasIndex(b => b.Status);

        modelBuilder.Entity<GuideBookingDestination>()
            .HasKey(gbd => new { gbd.BookingId, gbd.DestinationId });

        modelBuilder.Entity<GuideBookingDestination>()
            .HasOne(gbd => gbd.Booking)
            .WithMany(b => b.Destinations)
            .HasForeignKey(gbd => gbd.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GuidePayment>()
            .Property(p => p.Status)
            .HasConversion<string>();

        modelBuilder.Entity<GuidePayment>()
            .HasOne(p => p.Booking)
            .WithMany(b => b.Payments)
            .HasForeignKey(p => p.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GuidePayout>()
            .Property(p => p.Status)
            .HasConversion<string>();

        modelBuilder.Entity<GuidePayout>()
            .HasOne(p => p.Booking)
            .WithOne(b => b.Payout)
            .HasForeignKey<GuidePayout>(p => p.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PaymentWebhookEvent>()
            .HasIndex(w => new { w.Provider, w.ProviderEventId })
            .IsUnique();

        // ── Reviews & Recommendations Relationships ────────────────────────────

        modelBuilder.Entity<ReviewHelpfulVote>()
            .HasKey(v => new { v.ReviewId, v.TouristId });

        modelBuilder.Entity<ReviewHelpfulVote>()
            .HasOne(v => v.Review)
            .WithMany()
            .HasForeignKey(v => v.ReviewId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed default RecommendationSettings row
        modelBuilder.Entity<RecommendationSettings>().HasData(
            new RecommendationSettings
            {
                Id = 1,
                InterestWeight = 30m,
                RatingWeight = 25m,
                BudgetWeight = 15m,
                DistanceWeight = 15m,
                PopularityWeight = 10m,
                HistoryWeight = 5m,
                MinReviewCountToRank = 0,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedBy = "System"
            }
        );

        modelBuilder.Entity<Review>(entity =>
        {
            entity.ToTable("reviews");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.DestinationId).HasColumnName("destination_id");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
            entity.Property(e => e.SentimentLabel).HasColumnName("sentiment_label");
            entity.Property(e => e.SentimentScore).HasColumnName("sentiment_score");
        });

        modelBuilder.Entity<Attraction>(entity =>
        {
            entity.ToTable("attractions");
            entity.Property(e => e.DestinationId).HasColumnName("destination_id");
        });
    }
}
