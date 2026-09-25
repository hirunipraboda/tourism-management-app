using Microsoft.EntityFrameworkCore;
using SmartTourism.API.Domain.Entities;

namespace SmartTourism.API.Domain.Entities.Infrastructure
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Guide> Guides { get; set; }
        public DbSet<TourPackage> TourPackages { get; set; }
        public DbSet<GuideAvailability> GuideAvailabilities { get; set; }
        public DbSet<TourOperation> TourOperations { get; set; }
        public DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Guide → GuideAvailability (one-to-many)
            modelBuilder.Entity<GuideAvailability>()
                .HasOne(ga => ga.Guide)
                .WithMany(g => g.Availabilities)
                .HasForeignKey(ga => ga.GuideId)
                .OnDelete(DeleteBehavior.Cascade);

            // Guide → TourOperation (one-to-many)
            modelBuilder.Entity<TourOperation>()
                .HasOne(to => to.Guide)
                .WithMany(g => g.TourOperations)
                .HasForeignKey(to => to.GuideId)
                .OnDelete(DeleteBehavior.Restrict);

            // TourPackage → TourOperation (one-to-many)
            modelBuilder.Entity<TourOperation>()
                .HasOne(to => to.TourPackage)
                .WithMany(tp => tp.TourOperations)
                .HasForeignKey(to => to.TourPackageId)
                .OnDelete(DeleteBehavior.Restrict);

            // Guide → TourPackage (one-to-many)
            modelBuilder.Entity<TourPackage>()
                .HasOne(tp => tp.Guide)
                .WithMany(g => g.TourPackages)
                .HasForeignKey(tp => tp.GuideId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        }
    }
}
