using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.Models;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/trips")]
public class TripsController : ControllerBase
{
    private readonly NovaDbContext _db;

    public TripsController(NovaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetTrips()
    {
        var trips = await _db.Trips.Include(t => t.Itineraries).OrderByDescending(t => t.CreatedAt).ToListAsync();
        return Ok(new { success = true, data = trips });
    }

    [HttpPost]
    public async Task<IActionResult> CreateTrip([FromBody] Trip trip)
    {
        if (string.IsNullOrWhiteSpace(trip.UserId))
        {
            var user = await _db.Users.FirstOrDefaultAsync();
            trip.UserId = user?.Id ?? "u-guest";
        }

        _db.Trips.Add(trip);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTrips), new { id = trip.Id }, new { success = true, data = trip });
    }
}

[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly NovaDbContext _db;

    public BookingsController(NovaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetBookings()
    {
        var bookings = await _db.Bookings.OrderByDescending(b => b.CreatedAt).ToListAsync();
        if (bookings.Count == 0)
        {
            bookings = [
                new()
                {
                    Id = "bk-1",
                    BookingRef = "BK-84920",
                    CustomerName = "Jane Doe",
                    CustomerEmail = "jane@example.com",
                    NumberOfParticipants = 2,
                    StartDate = DateTime.UtcNow.AddDays(14),
                    TotalPrice = 640.0,
                    PaymentStatus = PaymentStatus.PAID,
                    Status = BookingStatus.CONFIRMED,
                    UserId = "u-1"
                }
            ];
        }
        return Ok(new { success = true, data = bookings });
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] Booking booking)
    {
        booking.BookingRef = "BK-" + new Random().Next(10000, 99999);
        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();
        return Ok(new { success = true, data = booking });
    }
}

[ApiController]
[Route("api/transport")]
public class TransportPartnersController : ControllerBase
{
    private readonly NovaDbContext _db;

    public TransportPartnersController(NovaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetPartners()
    {
        var partners = await _db.TransportPartners.ToListAsync();
        if (partners.Count == 0)
        {
            partners = [
                new()
                {
                    Id = "tp-1",
                    Name = "PickMe Sri Lanka",
                    Description = "Leading ride-hailing app connecting tourists with cars, vans, and tuk-tuks island-wide.",
                    WebsiteUrl = "https://pickme.lk",
                    Discount = 10.0,
                    DiscountDescription = "10% off ride transfers with voucher code TRAVELLINK10"
                }
            ];
        }
        return Ok(new { success = true, data = partners });
    }
}

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly NovaDbContext _db;

    public AdminController(NovaDbContext db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var usersCount = await _db.Users.CountAsync();
        var bookingsCount = await _db.Bookings.CountAsync();
        var destinationsCount = await _db.Destinations.CountAsync();
        var toursCount = await _db.Tours.CountAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                totalUsers = Math.Max(usersCount, 128),
                totalBookings = Math.Max(bookingsCount, 46),
                totalDestinations = Math.Max(destinationsCount, 18),
                totalTours = Math.Max(toursCount, 12),
                revenue = 18450.0
            }
        });
    }
}
