using Microsoft.EntityFrameworkCore;
using Nova.Api.Models;

namespace Nova.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Destination> Destinations { get; set; }
        public DbSet<Attraction> Attractions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Destination>()
                .HasMany(d => d.Attractions)
                .WithOne(a => a.Destination)
                .HasForeignKey(a => a.DestinationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}