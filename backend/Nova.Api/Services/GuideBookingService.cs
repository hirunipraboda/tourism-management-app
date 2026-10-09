using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Guides;
using Nova.Api.Entities;

namespace Nova.Api.Services;

public class GuideBookingService : IGuideBookingService
{
    private readonly NovaDbContext _db;

    public GuideBookingService(NovaDbContext db)
    {
        _db = db;
    }

    private static int CalculateAge(DateOnly? dob)
    {
        if (dob == null) return 0;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var age = today.Year - dob.Value.Year;
        if (dob.Value > today.AddYears(-age)) age--;
        return Math.Max(0, age);
    }

    private static string DayName(int dow) => dow switch
    {
        0 => "Sunday",
        1 => "Monday",
        2 => "Tuesday",
        3 => "Wednesday",
        4 => "Thursday",
        5 => "Friday",
        6 => "Saturday",
        _ => "Unknown"
    };

    private static GuideProfileDetailDto MapToProfileDto(Guide g)
    {
        var age = CalculateAge(g.DateOfBirth);
        return new GuideProfileDetailDto(
            g.Id,
            g.UserId,
            g.Name,
            g.Email,
            g.Phone,
            g.Bio,
            g.Languages ?? [],
            g.Specialties ?? [],
            g.YearsExperience,
            g.ShowAgePublicly && age > 0 ? age : null,
            g.Gender,
            g.ShowAgePublicly,
            g.Qualifications,
            g.HourlyRate > 0 ? g.HourlyRate : 20.0m,
            g.HalfDayRate > 0 ? g.HalfDayRate : 65.0m,
            g.FullDayRate > 0 ? g.FullDayRate : 110.0m,
            g.RatingAvg > 0 ? g.RatingAvg : 4.9m,
            g.RatingCount,
            g.ToursCompleted,
            g.AvatarUrl,
            g.VerificationStatus.ToString(),
            g.IsActive,
            g.AcceptingBookings,
            g.IsArchived,
            g.CoveredDestinations.Select(cd => new CoveredDestinationDto(cd.DestinationId, cd.Destination?.Name ?? cd.DestinationId)).ToList(),
            g.WorkingHours.OrderBy(wh => wh.DayOfWeek).Select(wh => new WorkingHourDto(wh.DayOfWeek, DayName(wh.DayOfWeek), wh.StartTime.ToString("HH:mm"), wh.EndTime.ToString("HH:mm"))).ToList(),
            g.BlockedDates.OrderBy(bd => bd.StartDate).Select(bd => new BlockedDateDto(bd.Id, bd.StartDate, bd.EndDate, bd.Reason)).ToList(),
            g.CreatedAt
        );
    }

    private static GuideBookingResponse MapToBookingResponse(GuideBooking b)
    {
        var primaryPayment = b.Payments.OrderByDescending(p => p.CreatedAt).FirstOrDefault();
        return new GuideBookingResponse(
            b.Id,
            b.GuideId,
            b.Guide?.Name ?? "Licensed Tour Guide",
            b.Guide?.AvatarUrl,
            b.Guide?.Phone,
            b.Guide?.Email,
            b.CustomerId,
            b.CustomerName,
            b.CustomerEmail,
            b.CustomerPhone,
            b.StartDate,
            b.EndDate,
            b.StartTime.ToString("HH:mm"),
            b.EndTime.ToString("HH:mm"),
            b.Travelers,
            b.PickupLocation,
            b.PreferredLanguage,
            b.SpecialRequests,
            b.Status.ToString(),
            b.Subtotal,
            b.ServiceFee,
            b.TotalAmount,
            b.CommissionAmount,
            b.GuideNetAmount,
            b.Currency,
            b.BillableDays,
            b.Destinations.Select(d => new CoveredDestinationDto(d.DestinationId, d.DestinationName)).ToList(),
            b.CreatedAt,
            b.ConfirmedAt,
            b.CompletedAt,
            b.CancelledAt,
            b.CancellationReason,
            b.CancelledBy,
            b.RefundStatus.ToString(),
            b.RefundAmount,
            primaryPayment != null ? new GuidePaymentSummaryDto(
                primaryPayment.Id,
                primaryPayment.Provider,
                primaryPayment.TransactionReference,
                primaryPayment.PaymentMethod,
                primaryPayment.Amount,
                primaryPayment.Currency,
                primaryPayment.Status.ToString(),
                primaryPayment.PaidAt
            ) : null,
            b.Payout != null ? new GuidePayoutSummaryDto(
                b.Payout.Id,
                b.Payout.GrossAmount,
                b.Payout.CommissionAmount,
                b.Payout.NetAmount,
                b.Payout.Currency,
                b.Payout.Status.ToString(),
                b.Payout.PayoutReference,
                b.Payout.PayoutMethod,
                b.Payout.PaidAt
            ) : null
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public / Customer Guide Browsing & Booking
    // ─────────────────────────────────────────────────────────────────────────

    public async Task<List<GuideProfileDetailDto>> GetActiveGuidesAsync(
        string? destinationId, DateOnly? travelDate, string? language, decimal? maxPrice, string? specialty)
    {
        var query = _db.Guides
            .Include(g => g.CoveredDestinations)
                .ThenInclude(cd => cd.Destination)
            .Include(g => g.WorkingHours)
            .Include(g => g.BlockedDates)
            .Where(g => g.IsActive && !g.IsArchived && g.AcceptingBookings);

        if (!string.IsNullOrWhiteSpace(destinationId))
        {
            query = query.Where(g => g.CoveredDestinations.Any(cd => cd.DestinationId == destinationId || (cd.Destination != null && cd.Destination.Name.ToLower().Contains(destinationId.ToLower()))));
        }

        if (!string.IsNullOrWhiteSpace(language))
        {
            query = query.Where(g => g.Languages != null && g.Languages.Any(l => l.ToLower().Contains(language.ToLower())));
        }

        if (!string.IsNullOrWhiteSpace(specialty))
        {
            query = query.Where(g => g.Specialties != null && g.Specialties.Any(s => s.ToLower().Contains(specialty.ToLower())));
        }

        if (maxPrice.HasValue && maxPrice.Value > 0)
        {
            query = query.Where(g => (g.FullDayRate > 0 ? g.FullDayRate : 110m) <= maxPrice.Value);
        }

        var list = await query.ToListAsync();

        if (travelDate.HasValue)
        {
            var date = travelDate.Value;
            var dow = (int)date.DayOfWeek;
            list = list.Where(g =>
            {
                var isBlocked = g.BlockedDates.Any(bd => bd.StartDate <= date && bd.EndDate >= date);
                if (isBlocked) return false;
                if (g.WorkingHours.Any())
                {
                    return g.WorkingHours.Any(wh => wh.DayOfWeek == dow);
                }
                return true;
            }).ToList();
        }

        return list.Select(MapToProfileDto).ToList();
    }

    public async Task<GuideProfileDetailDto?> GetGuideProfileAsync(int guideId)
    {
        var guide = await _db.Guides
            .Include(g => g.CoveredDestinations)
                .ThenInclude(cd => cd.Destination)
            .Include(g => g.WorkingHours)
            .Include(g => g.BlockedDates)
            .FirstOrDefaultAsync(g => g.Id == guideId);

        return guide != null ? MapToProfileDto(guide) : null;
    }

    public async Task<BookingQuoteResponse> CalculateQuoteAsync(CalculateQuoteRequest request)
    {
        var guide = await _db.Guides
            .Include(g => g.WorkingHours)
            .Include(g => g.BlockedDates)
            .FirstOrDefaultAsync(g => g.Id == request.GuideId);

        if (guide == null || !guide.IsActive || guide.IsArchived)
        {
            return new BookingQuoteResponse(
                request.GuideId,
                guide?.Name ?? "Guide",
                0, 0, 0, 0, 0, 0, 0, "USD",
                false,
                "Guide is currently not available for bookings."
            );
        }

        if (request.EndDate < request.StartDate)
        {
            return new BookingQuoteResponse(
                request.GuideId, guide.Name, 0, 0, 0, 0, 0, 0, 0, "USD",
                false, "End date must be greater than or equal to start date."
            );
        }

        var billableDays = (request.EndDate.DayNumber - request.StartDate.DayNumber) + 1;
        var dailyRate = guide.FullDayRate > 0 ? guide.FullDayRate : 110.0m;
        var subtotal = dailyRate * billableDays;
        var serviceFee = Math.Round(subtotal * 0.05m, 2);
        var totalAmount = subtotal + serviceFee;
        var commission = Math.Round(subtotal * 0.15m, 2);
        var netEarnings = subtotal - commission;

        // Check availability
        var isBlocked = guide.BlockedDates.Any(b => b.StartDate <= request.EndDate && b.EndDate >= request.StartDate);
        if (isBlocked)
        {
            return new BookingQuoteResponse(
                guide.Id, guide.Name, billableDays, dailyRate, subtotal, serviceFee, totalAmount, netEarnings, commission, "USD",
                false, "Guide has blocked dates within the selected date range."
            );
        }

        var hasConflict = await _db.GuideBookings.AnyAsync(b =>
            b.GuideId == guide.Id &&
            (b.Status == GuideBookingStatus.Confirmed ||
             b.Status == GuideBookingStatus.PendingGuideApproval ||
             (b.Status == GuideBookingStatus.PendingPayment && b.HoldExpiresAt > DateTime.UtcNow)) &&
            b.StartDate <= request.EndDate && b.EndDate >= request.StartDate);

        return new BookingQuoteResponse(
            guide.Id, guide.Name, billableDays, dailyRate, subtotal, serviceFee, totalAmount, netEarnings, commission, "USD",
            !hasConflict,
            hasConflict ? "Guide already has a confirmed booking for the selected dates." : null
        );
    }

    public async Task<GuideBookingResponse> CreateBookingAsync(string customerUserId, CreateGuideBookingRequest request)
    {
        if (request.EndDate < request.StartDate)
            throw new ArgumentException("End date cannot precede start date.");

        var guide = await _db.Guides
            .Include(g => g.WorkingHours)
            .Include(g => g.BlockedDates)
            .FirstOrDefaultAsync(g => g.Id == request.GuideId);

        if (guide == null || !guide.IsActive || guide.IsArchived || !guide.AcceptingBookings)
            throw new InvalidOperationException("Guide is unavailable.");

        // Check blocked dates
        var isBlocked = guide.BlockedDates.Any(b => b.StartDate <= request.EndDate && b.EndDate >= request.StartDate);
        if (isBlocked)
            throw new InvalidOperationException("Guide is not available on the requested dates.");

        // Concurrency check inside execution strategy / transaction
        var conflict = await _db.GuideBookings.AnyAsync(b =>
            b.GuideId == guide.Id &&
            (b.Status == GuideBookingStatus.Confirmed ||
             b.Status == GuideBookingStatus.PendingGuideApproval ||
             (b.Status == GuideBookingStatus.PendingPayment && b.HoldExpiresAt > DateTime.UtcNow)) &&
            b.StartDate <= request.EndDate && b.EndDate >= request.StartDate);

        if (conflict)
            throw new InvalidOperationException("The requested dates are no longer available. Please select different dates.");

        var customer = await _db.Users.FindAsync(customerUserId);
        var billableDays = (request.EndDate.DayNumber - request.StartDate.DayNumber) + 1;
        var dailyRate = guide.FullDayRate > 0 ? guide.FullDayRate : 110.0m;
        var subtotal = dailyRate * billableDays;
        var serviceFee = Math.Round(subtotal * 0.05m, 2);
        var totalAmount = subtotal + serviceFee;
        var commission = Math.Round(subtotal * 0.15m, 2);
        var netEarnings = subtotal - commission;

        var bookingId = $"GB-{Guid.NewGuid():N}"[..11].ToUpper();

        var booking = new GuideBooking
        {
            Id = bookingId,
            GuideId = guide.Id,
            CustomerId = customerUserId,
            CustomerName = !string.IsNullOrWhiteSpace(request.ContactName) ? request.ContactName : (customer?.Name ?? "Valued Traveler"),
            CustomerEmail = !string.IsNullOrWhiteSpace(request.ContactEmail) ? request.ContactEmail : (customer?.Email ?? "traveler@example.com"),
            CustomerPhone = !string.IsNullOrWhiteSpace(request.ContactPhone) ? request.ContactPhone : customer?.Phone,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Travelers = request.Travelers,
            PickupLocation = request.PickupLocation,
            PreferredLanguage = request.PreferredLanguage ?? "English",
            SpecialRequests = request.SpecialRequests,
            Status = GuideBookingStatus.PendingPayment,
            Subtotal = subtotal,
            ServiceFee = serviceFee,
            TotalAmount = totalAmount,
            CommissionAmount = commission,
            GuideNetAmount = netEarnings,
            Currency = "USD",
            BillableDays = billableDays,
            HoldExpiresAt = DateTime.UtcNow.AddMinutes(20),
            IdempotencyKey = request.IdempotencyKey,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Attach destinations
        var destNames = await _db.Destinations
            .Where(d => request.DestinationIds.Contains(d.Id))
            .ToDictionaryAsync(d => d.Id, d => d.Name);

        foreach (var dId in request.DestinationIds)
        {
            booking.Destinations.Add(new GuideBookingDestination
            {
                BookingId = booking.Id,
                DestinationId = dId,
                DestinationName = destNames.TryGetValue(dId, out var name) ? name : dId
            });
        }

        _db.GuideBookings.Add(booking);

        _db.GuideBookingEvents.Add(new GuideBookingEvent
        {
            BookingId = booking.Id,
            GuideId = guide.Id,
            ActorId = customerUserId,
            ActorRole = "Tourist",
            EventType = "BookingCreated",
            Details = $"Booking hold created for {billableDays} days at {totalAmount} USD."
        });

        await _db.SaveChangesAsync();

        booking.Guide = guide;
        return MapToBookingResponse(booking);
    }

    public async Task<PaymentInitiationResponse> InitiatePaymentAsync(
        string bookingId, string customerUserId, InitiateGuidePaymentRequest request)
    {
        var booking = await _db.GuideBookings
            .Include(b => b.Guide)
            .Include(b => b.Payments)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null) throw new KeyNotFoundException("Booking not found.");
        if (booking.CustomerId != customerUserId) throw new UnauthorizedAccessException("Not authorized to pay for this booking.");

        if (booking.Status == GuideBookingStatus.Confirmed)
            throw new InvalidOperationException("Booking is already paid and confirmed.");

        if (booking.Status == GuideBookingStatus.Cancelled || booking.Status == GuideBookingStatus.Expired)
            throw new InvalidOperationException("Booking is cancelled or expired.");

        var txRef = $"pi_TL_{Guid.NewGuid():N}"[..18];
        var payment = new GuidePayment
        {
            BookingId = booking.Id,
            Provider = "Stripe",
            TransactionReference = txRef,
            PaymentMethod = request.PaymentMethod ?? "Card (Visa)",
            Amount = booking.TotalAmount,
            Currency = booking.Currency,
            Status = GuidePaymentStatus.Succeeded,
            PaidAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _db.GuidePayments.Add(payment);

        booking.Status = GuideBookingStatus.Confirmed;
        booking.ConfirmedAt = DateTime.UtcNow;
        booking.UpdatedAt = DateTime.UtcNow;

        // Automatically create the Guide Payout record in Pending state
        var payout = new GuidePayout
        {
            BookingId = booking.Id,
            GuideId = booking.GuideId,
            GrossAmount = booking.Subtotal,
            CommissionAmount = booking.CommissionAmount,
            NetAmount = booking.GuideNetAmount,
            Currency = booking.Currency,
            Status = GuidePayoutStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.GuidePayouts.Add(payout);

        // Notify Guide and Customer
        _db.Notifications.Add(new Notification
        {
            UserId = booking.Guide?.UserId ?? booking.GuideId.ToString(),
            Type = "GuideBookingConfirmed",
            Title = "New Confirmed Tour Guide Booking",
            Message = $"You have a confirmed booking with {booking.CustomerName} for {booking.StartDate:MMM dd} - {booking.EndDate:MMM dd}.",
            RelatedBookingId = booking.Id
        });

        _db.Notifications.Add(new Notification
        {
            UserId = customerUserId,
            Type = "CustomerBookingConfirmed",
            Title = "Tour Guide Booking Confirmed",
            Message = $"Your booking with guide {booking.Guide?.Name} has been confirmed. Ref: {booking.Id}.",
            RelatedBookingId = booking.Id
        });

        _db.GuideBookingEvents.Add(new GuideBookingEvent
        {
            BookingId = booking.Id,
            GuideId = booking.GuideId,
            ActorId = customerUserId,
            ActorRole = "Tourist",
            EventType = "PaymentCompleted",
            Details = $"Payment of {booking.TotalAmount} USD succeeded via {payment.PaymentMethod}. TxRef: {txRef}"
        });

        await _db.SaveChangesAsync();

        return new PaymentInitiationResponse(
            booking.Id,
            payment.Id,
            booking.TotalAmount,
            booking.Currency,
            "Succeeded",
            txRef,
            null
        );
    }

    public async Task<GuideBookingResponse?> GetBookingDetailsAsync(string bookingId, string userId, bool isAdmin)
    {
        var booking = await _db.GuideBookings
            .Include(b => b.Guide)
            .Include(b => b.Destinations)
            .Include(b => b.Payments)
            .Include(b => b.Payout)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null) return null;

        if (!isAdmin && booking.CustomerId != userId && booking.Guide?.UserId != userId)
        {
            throw new UnauthorizedAccessException("Forbidden.");
        }

        return MapToBookingResponse(booking);
    }

    public async Task<List<GuideBookingResponse>> GetCustomerBookingsAsync(string customerUserId)
    {
        var bookings = await _db.GuideBookings
            .Include(b => b.Guide)
            .Include(b => b.Destinations)
            .Include(b => b.Payments)
            .Include(b => b.Payout)
            .Where(b => b.CustomerId == customerUserId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return bookings.Select(MapToBookingResponse).ToList();
    }

    public async Task<GuideBookingResponse> CancelBookingAsync(
        string bookingId, string userId, bool isAdmin, string? reason)
    {
        var booking = await _db.GuideBookings
            .Include(b => b.Guide)
            .Include(b => b.Destinations)
            .Include(b => b.Payments)
            .Include(b => b.Payout)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null) throw new KeyNotFoundException("Booking not found.");

        if (!isAdmin && booking.CustomerId != userId && booking.Guide?.UserId != userId)
            throw new UnauthorizedAccessException("Forbidden.");

        if (booking.Status == GuideBookingStatus.Cancelled || booking.Status == GuideBookingStatus.Completed)
            throw new InvalidOperationException("Booking cannot be cancelled.");

        booking.Status = GuideBookingStatus.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;
        booking.CancelledBy = isAdmin ? "Administrator" : (booking.Guide?.UserId == userId ? "Guide" : "Customer");
        booking.CancellationReason = reason ?? "User requested cancellation.";
        booking.UpdatedAt = DateTime.UtcNow;

        if (booking.Payments.Any(p => p.Status == GuidePaymentStatus.Succeeded))
        {
            booking.RefundStatus = GuideRefundStatus.Completed;
            booking.RefundAmount = booking.TotalAmount;
        }

        if (booking.Payout != null)
        {
            booking.Payout.Status = GuidePayoutStatus.Voided;
            booking.Payout.Notes = $"Cancelled by {booking.CancelledBy}. Reason: {booking.CancellationReason}";
        }

        _db.GuideBookingEvents.Add(new GuideBookingEvent
        {
            BookingId = booking.Id,
            GuideId = booking.GuideId,
            ActorId = userId,
            ActorRole = booking.CancelledBy,
            EventType = "BookingCancelled",
            Details = $"Booking cancelled. Reason: {booking.CancellationReason}"
        });

        await _db.SaveChangesAsync();
        return MapToBookingResponse(booking);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Dedicated Guide Portal
    // ─────────────────────────────────────────────────────────────────────────

    public async Task<GuideProfileDetailDto?> GetGuideForUserAsync(string guideUserId, string? guideEmail = null)
    {
        var guide = await _db.Guides
            .Include(g => g.CoveredDestinations)
                .ThenInclude(cd => cd.Destination)
            .Include(g => g.WorkingHours)
            .Include(g => g.BlockedDates)
            .FirstOrDefaultAsync(g => g.UserId == guideUserId 
                || g.Email.ToLower() == guideUserId.ToLower()
                || (!string.IsNullOrEmpty(guideEmail) && g.Email.ToLower() == guideEmail.ToLower()));

        return guide != null ? MapToProfileDto(guide) : null;
    }

    public async Task<GuideDashboardMetrics> GetGuideDashboardMetricsAsync(int guideId)
    {
        var guide = await _db.Guides.FindAsync(guideId);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var bookings = await _db.GuideBookings
            .Where(b => b.GuideId == guideId)
            .ToListAsync();

        var upcoming = bookings.Count(b => (b.Status == GuideBookingStatus.Confirmed) && b.StartDate > today);
        var pendingApproval = bookings.Count(b => b.Status == GuideBookingStatus.PendingGuideApproval);
        var todayCount = bookings.Count(b => (b.Status == GuideBookingStatus.Confirmed) && b.StartDate <= today && b.EndDate >= today);
        var completed = bookings.Count(b => b.Status == GuideBookingStatus.Completed || (b.Status == GuideBookingStatus.Confirmed && b.EndDate < today));

        var payouts = await _db.GuidePayouts
            .Where(p => p.GuideId == guideId)
            .ToListAsync();

        var totalEarned = payouts.Where(p => p.Status == GuidePayoutStatus.Paid || p.Status == GuidePayoutStatus.Pending).Sum(p => p.NetAmount);
        var pendingPayouts = payouts.Where(p => p.Status == GuidePayoutStatus.Pending).Sum(p => p.NetAmount);
        var completedPayouts = payouts.Where(p => p.Status == GuidePayoutStatus.Paid).Sum(p => p.NetAmount);

        return new GuideDashboardMetrics(
            upcoming,
            pendingApproval,
            todayCount,
            completed,
            pendingPayouts,
            totalEarned,
            completedPayouts,
            guide?.RatingAvg ?? 4.9m,
            guide?.RatingCount ?? 0
        );
    }

    public async Task<List<GuideBookingResponse>> GetGuideBookingsAsync(int guideId, string? statusFilter)
    {
        var query = _db.GuideBookings
            .Include(b => b.Guide)
            .Include(b => b.Destinations)
            .Include(b => b.Payments)
            .Include(b => b.Payout)
            .Where(b => b.GuideId == guideId);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (!string.IsNullOrWhiteSpace(statusFilter))
        {
            var filter = statusFilter.Trim().ToLowerInvariant();
            query = filter switch
            {
                "upcoming" => query.Where(b => b.Status == GuideBookingStatus.Confirmed && b.StartDate > today),
                "today" => query.Where(b => b.Status == GuideBookingStatus.Confirmed && b.StartDate <= today && b.EndDate >= today),
                "pending" => query.Where(b => b.Status == GuideBookingStatus.PendingGuideApproval || b.Status == GuideBookingStatus.PendingPayment),
                "completed" => query.Where(b => b.Status == GuideBookingStatus.Completed || (b.Status == GuideBookingStatus.Confirmed && b.EndDate < today)),
                "cancelled" => query.Where(b => b.Status == GuideBookingStatus.Cancelled || b.Status == GuideBookingStatus.Rejected),
                _ => query
            };
        }

        var list = await query.OrderByDescending(b => b.StartDate).ToListAsync();
        return list.Select(MapToBookingResponse).ToList();
    }

    public async Task<GuideBookingResponse> RespondToBookingAsync(string bookingId, int guideId, bool accept, string? reason)
    {
        var booking = await _db.GuideBookings
            .Include(b => b.Guide)
            .Include(b => b.Destinations)
            .Include(b => b.Payments)
            .Include(b => b.Payout)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.GuideId == guideId);

        if (booking == null) throw new KeyNotFoundException("Booking not found.");

        if (accept)
        {
            booking.Status = GuideBookingStatus.Confirmed;
            booking.GuideDecisionAt = DateTime.UtcNow;
            booking.ConfirmedAt = DateTime.UtcNow;
        }
        else
        {
            booking.Status = GuideBookingStatus.Rejected;
            booking.GuideDecisionAt = DateTime.UtcNow;
            booking.CancellationReason = reason ?? "Guide is unable to accept this request.";
            booking.RefundStatus = GuideRefundStatus.Completed;
            booking.RefundAmount = booking.TotalAmount;
            if (booking.Payout != null) booking.Payout.Status = GuidePayoutStatus.Voided;
        }

        booking.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return MapToBookingResponse(booking);
    }

    public async Task<GuideProfileDetailDto> UpdateGuideProfileAsync(int guideId, UpdateGuideBioRequest request)
    {
        var guide = await _db.Guides
            .Include(g => g.CoveredDestinations)
            .Include(g => g.WorkingHours)
            .Include(g => g.BlockedDates)
            .FirstOrDefaultAsync(g => g.Id == guideId);

        if (guide == null) throw new KeyNotFoundException("Guide not found.");

        if (request.Bio != null) guide.Bio = request.Bio;
        if (request.Phone != null) guide.Phone = request.Phone;
        if (request.Languages != null) guide.Languages = request.Languages;
        if (request.Specialties != null) guide.Specialties = request.Specialties;
        if (request.AvatarUrl != null) guide.AvatarUrl = request.AvatarUrl;
        if (request.HourlyRate.HasValue && request.HourlyRate > 0) guide.HourlyRate = request.HourlyRate.Value;
        if (request.HalfDayRate.HasValue && request.HalfDayRate > 0) guide.HalfDayRate = request.HalfDayRate.Value;
        if (request.FullDayRate.HasValue && request.FullDayRate > 0) guide.FullDayRate = request.FullDayRate.Value;
        if (request.AcceptingBookings.HasValue) guide.AcceptingBookings = request.AcceptingBookings.Value;
        if (request.PayoutAccountNote != null) guide.PayoutAccountNote = request.PayoutAccountNote;

        if (request.CoveredDestinationIds != null)
        {
            _db.GuideDestinations.RemoveRange(guide.CoveredDestinations);
            foreach (var dId in request.CoveredDestinationIds)
            {
                guide.CoveredDestinations.Add(new GuideDestination { GuideId = guide.Id, DestinationId = dId });
            }
        }

        guide.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return MapToProfileDto(guide);
    }

    public async Task SetWorkingHoursAsync(int guideId, SetWorkingHoursRequest request)
    {
        var guide = await _db.Guides.Include(g => g.WorkingHours).FirstOrDefaultAsync(g => g.Id == guideId);
        if (guide == null) throw new KeyNotFoundException("Guide not found.");

        _db.GuideWorkingHours.RemoveRange(guide.WorkingHours);
        foreach (var wh in request.WorkingHours)
        {
            _db.GuideWorkingHours.Add(new GuideWorkingHours
            {
                GuideId = guideId,
                DayOfWeek = wh.DayOfWeek,
                StartTime = wh.StartTime,
                EndTime = wh.EndTime
            });
        }
        await _db.SaveChangesAsync();
    }

    public async Task<BlockedDateDto> AddBlockedDateAsync(int guideId, AddBlockedDateRequest request)
    {
        if (request.EndDate < request.StartDate) throw new ArgumentException("End date cannot precede start date.");

        // Check if there are confirmed bookings in that range
        var hasBooking = await _db.GuideBookings.AnyAsync(b =>
            b.GuideId == guideId &&
            b.Status == GuideBookingStatus.Confirmed &&
            b.StartDate <= request.EndDate && b.EndDate >= request.StartDate);

        if (hasBooking)
            throw new InvalidOperationException("Cannot block dates that overlap with existing confirmed customer bookings.");

        var bd = new GuideBlockedDate
        {
            GuideId = guideId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Reason = request.Reason,
            CreatedAt = DateTime.UtcNow
        };
        _db.GuideBlockedDates.Add(bd);
        await _db.SaveChangesAsync();
        return new BlockedDateDto(bd.Id, bd.StartDate, bd.EndDate, bd.Reason);
    }

    public async Task RemoveBlockedDateAsync(int guideId, int blockedDateId)
    {
        var bd = await _db.GuideBlockedDates.FirstOrDefaultAsync(b => b.GuideId == guideId && b.Id == blockedDateId);
        if (bd != null)
        {
            _db.GuideBlockedDates.Remove(bd);
            await _db.SaveChangesAsync();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin Console Guide Management
    // ─────────────────────────────────────────────────────────────────────────

    public async Task<AdminGuideStatsResponse> GetAdminStatsAsync()
    {
        var guides = await _db.Guides.ToListAsync();
        var bookings = await _db.GuideBookings.ToListAsync();
        var payments = await _db.GuidePayments.ToListAsync();
        var payouts = await _db.GuidePayouts.ToListAsync();

        var totalGuides = guides.Count;
        var activeGuides = guides.Count(g => g.IsActive && !g.IsArchived);
        var inactiveGuides = guides.Count(g => !g.IsActive || g.IsArchived);
        var availableGuides = guides.Count(g => g.IsActive && !g.IsArchived && g.AcceptingBookings);

        var totalBookings = bookings.Count;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var upcoming = bookings.Count(b => b.Status == GuideBookingStatus.Confirmed && b.StartDate > today);
        var completed = bookings.Count(b => b.Status == GuideBookingStatus.Completed || (b.Status == GuideBookingStatus.Confirmed && b.EndDate < today));
        var cancelled = bookings.Count(b => b.Status == GuideBookingStatus.Cancelled || b.Status == GuideBookingStatus.Rejected);

        var totalRevenue = payments.Where(p => p.Status == GuidePaymentStatus.Succeeded).Sum(p => p.Amount);
        var pendingCustomerPayments = bookings.Where(b => b.Status == GuideBookingStatus.PendingPayment).Sum(b => b.TotalAmount);
        var completedCustomerPayments = payments.Where(p => p.Status == GuidePaymentStatus.Succeeded).Sum(p => p.Amount);

        var guideEarningsAccrued = payouts.Sum(p => p.NetAmount);
        var guidePayoutsPending = payouts.Where(p => p.Status == GuidePayoutStatus.Pending).Sum(p => p.NetAmount);
        var guidePayoutsCompleted = payouts.Where(p => p.Status == GuidePayoutStatus.Paid).Sum(p => p.NetAmount);

        return new AdminGuideStatsResponse(
            totalGuides,
            activeGuides,
            inactiveGuides,
            availableGuides,
            totalBookings,
            upcoming,
            completed,
            cancelled,
            totalRevenue,
            pendingCustomerPayments,
            completedCustomerPayments,
            guideEarningsAccrued,
            guidePayoutsPending,
            guidePayoutsCompleted
        );
    }

    public async Task<List<GuideProfileDetailDto>> GetAllGuidesAdminAsync(
        string? search, string? language, string? status, int page, int pageSize)
    {
        var query = _db.Guides
            .Include(g => g.CoveredDestinations)
                .ThenInclude(cd => cd.Destination)
            .Include(g => g.WorkingHours)
            .Include(g => g.BlockedDates)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower().Trim();
            query = query.Where(g => g.Name.ToLower().Contains(s) || g.Email.ToLower().Contains(s) || g.Id.ToString() == s);
        }

        if (!string.IsNullOrWhiteSpace(language))
        {
            query = query.Where(g => g.Languages != null && g.Languages.Any(l => l.ToLower().Contains(language.ToLower())));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var st = status.Trim().ToLower();
            if (st == "active") query = query.Where(g => g.IsActive && !g.IsArchived);
            else if (st == "inactive") query = query.Where(g => !g.IsActive && !g.IsArchived);
            else if (st == "archived") query = query.Where(g => g.IsArchived);
        }

        var list = await query
            .OrderByDescending(g => g.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return list.Select(MapToProfileDto).ToList();
    }

    public async Task<GuideProfileDetailDto> CreateGuideAdminAsync(CreateGuideRequest request)
    {
        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        User user;
        if (existingUser != null)
        {
            user = existingUser;
            user.Role = UserRole.Guide;
        }
        else
        {
            user = new User
            {
                Id = $"guide-{Guid.NewGuid():N}"[..16],
                Name = request.Name.Trim(),
                Email = request.Email.Trim().ToLowerInvariant(),
                Role = UserRole.Guide,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("guide123"),
                MustChangePassword = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Users.Add(user);
        }

        var guide = new Guide
        {
            UserId = user.Id,
            Name = request.Name.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone,
            Bio = request.Bio,
            Languages = request.Languages ?? ["English"],
            Specialties = request.Specialties ?? ["Cultural Heritage"],
            YearsExperience = request.YearsExperience ?? 2,
            HourlyRate = 20.0m,
            HalfDayRate = 65.0m,
            FullDayRate = 110.0m,
            AvatarUrl = request.AvatarUrl,
            VerificationStatus = GuideVerificationStatus.Verified,
            RatingAvg = 4.9m,
            IsActive = true,
            AcceptingBookings = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Guides.Add(guide);
        await _db.SaveChangesAsync();

        return MapToProfileDto(guide);
    }

    public async Task<GuideProfileDetailDto> UpdateGuideAdminAsync(int guideId, UpdateGuideRequest request)
    {
        var guide = await _db.Guides
            .Include(g => g.CoveredDestinations)
            .Include(g => g.WorkingHours)
            .Include(g => g.BlockedDates)
            .FirstOrDefaultAsync(g => g.Id == guideId);

        if (guide == null) throw new KeyNotFoundException("Guide not found.");

        guide.Name = request.Name.Trim();
        guide.Email = request.Email.Trim().ToLowerInvariant();
        guide.Phone = request.Phone;
        guide.Bio = request.Bio;
        guide.Languages = request.Languages;
        guide.Specialties = request.Specialties;
        guide.YearsExperience = request.YearsExperience;
        guide.AvatarUrl = request.AvatarUrl;
        guide.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return MapToProfileDto(guide);
    }

    public async Task<bool> SetGuideActiveStatusAsync(int guideId, bool isActive)
    {
        var guide = await _db.Guides.FindAsync(guideId);
        if (guide == null) return false;
        guide.IsActive = isActive;
        guide.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ArchiveGuideAsync(int guideId)
    {
        var guide = await _db.Guides.FindAsync(guideId);
        if (guide == null) return false;

        // Protect existing booking records
        guide.IsArchived = true;
        guide.ArchivedAt = DateTime.UtcNow;
        guide.IsActive = false;
        guide.AcceptingBookings = false;
        guide.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<GuideBookingResponse>> GetBookingLogsAdminAsync(
        string? status, string? paymentStatus, int? guideId, string? customerId, DateOnly? fromDate, DateOnly? toDate)
    {
        var query = _db.GuideBookings
            .Include(b => b.Guide)
            .Include(b => b.Destinations)
            .Include(b => b.Payments)
            .Include(b => b.Payout)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<GuideBookingStatus>(status, true, out var st))
        {
            query = query.Where(b => b.Status == st);
        }

        if (guideId.HasValue && guideId > 0)
        {
            query = query.Where(b => b.GuideId == guideId.Value);
        }

        if (!string.IsNullOrWhiteSpace(customerId))
        {
            query = query.Where(b => b.CustomerId == customerId || b.CustomerEmail.ToLower().Contains(customerId.ToLower()));
        }

        if (fromDate.HasValue)
        {
            query = query.Where(b => b.StartDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(b => b.EndDate <= toDate.Value);
        }

        var list = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
        return list.Select(MapToBookingResponse).ToList();
    }

    public async Task<GuidePayoutSummaryDto> ProcessPayoutAsync(
        string bookingId, ProcessPayoutRequest request, string adminUserId)
    {
        var booking = await _db.GuideBookings
            .Include(b => b.Payout)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null) throw new KeyNotFoundException("Booking not found.");

        var payout = booking.Payout;
        if (payout == null)
        {
            payout = new GuidePayout
            {
                BookingId = booking.Id,
                GuideId = booking.GuideId,
                GrossAmount = booking.Subtotal,
                CommissionAmount = booking.CommissionAmount,
                NetAmount = booking.GuideNetAmount,
                Currency = booking.Currency,
                CreatedAt = DateTime.UtcNow
            };
            _db.GuidePayouts.Add(payout);
        }

        payout.Status = GuidePayoutStatus.Paid;
        payout.PayoutReference = request.PayoutReference;
        payout.PayoutMethod = request.PayoutMethod;
        payout.Notes = request.Notes;
        payout.ProcessedByUserId = adminUserId;
        payout.PaidAt = DateTime.UtcNow;
        payout.UpdatedAt = DateTime.UtcNow;

        _db.GuideBookingEvents.Add(new GuideBookingEvent
        {
            BookingId = booking.Id,
            GuideId = booking.GuideId,
            ActorId = adminUserId,
            ActorRole = "Administrator",
            EventType = "GuidePayoutCompleted",
            Details = $"Payout of {payout.NetAmount} {payout.Currency} completed. Ref: {request.PayoutReference}"
        });

        await _db.SaveChangesAsync();

        return new GuidePayoutSummaryDto(
            payout.Id,
            payout.GrossAmount,
            payout.CommissionAmount,
            payout.NetAmount,
            payout.Currency,
            payout.Status.ToString(),
            payout.PayoutReference,
            payout.PayoutMethod,
            payout.PaidAt
        );
    }
}
