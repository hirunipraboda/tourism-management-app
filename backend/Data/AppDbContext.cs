using Microsoft.EntityFrameworkCore;
using tourism_management_app.Api.Models;

namespace tourism_management_app.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Tourist> Tourists { get; set; } = null!;
        public DbSet<Destination> Destinations { get; set; } = null!;
        public DbSet<Attraction> Attractions { get; set; } = null!;
        public DbSet<TourPackage> TourPackages { get; set; } = null!;
        public DbSet<Review> Reviews { get; set; } = null!;
        public DbSet<ReviewHelpfulVote> ReviewHelpfulVotes { get; set; } = null!;
        public DbSet<RecommendationSettings> RecommendationSettings { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ReviewHelpfulVote>()
                .HasKey(vote => new { vote.ReviewId, vote.TouristId });

            modelBuilder.Entity<ReviewHelpfulVote>()
                .HasOne(vote => vote.Review)
                .WithMany()
                .HasForeignKey(vote => vote.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ReviewHelpfulVote>()
                .HasOne(vote => vote.Tourist)
                .WithMany()
                .HasForeignKey(vote => vote.TouristId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure default values for Attraction flags
            modelBuilder.Entity<Attraction>()
                .Property(a => a.IsFeatured)
                .HasDefaultValue(false);

            modelBuilder.Entity<Attraction>()
                .Property(a => a.IsExcludedFromRecommendations)
                .HasDefaultValue(false);

            // Seed default row for RecommendationSettings (Id = 1)
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
        }
    }
}
