using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Trips;
using Nova.Api.Entities;

namespace Nova.Api.Services;

public interface ITripService
{
    Task<ApiResponse<TripResponse>> CreateTripAsync(string userId, CreateTripRequest request);
    Task<ApiResponse<PagedResult<TripResponse>>> GetTripsAsync(string userId, string userRole, TripFilterParameters filter);
    Task<ApiResponse<TripResponse>> GetTripByIdAsync(string tripId, string userId, string userRole);
    Task<ApiResponse<List<TripResponse>>> GetTripsByUserIdAsync(string userId);
    Task<ApiResponse<TripResponse>> UpdateTripAsync(string tripId, string userId, string userRole, UpdateTripRequest request);
    Task<ApiResponse<bool>> DeleteTripAsync(string tripId, string userId, string userRole);
}

public class TripService : ITripService
{
    private readonly NovaDbContext _db;

    public TripService(NovaDbContext db)
    {
        _db = db;
    }

    public async Task<ApiResponse<TripResponse>> CreateTripAsync(string userId, CreateTripRequest request)
    {
        // Validation rules
        if (request.StartDate == default || request.EndDate == default)
        {
            return ApiResponse<TripResponse>.Fail("Trip start date and end date are required.");
        }

        if (request.StartDate > request.EndDate)
        {
            return ApiResponse<TripResponse>.Fail("Trip start date cannot be after end date.");
        }

        if (request.Budget <= 0)
        {
            return ApiResponse<TripResponse>.Fail("Budget must be greater than zero.");
        }

        if (request.NumberOfTravelers <= 0)
        {
            return ApiResponse<TripResponse>.Fail("Number of travelers must be greater than zero.");
        }

        var tripId = await IdGenerator.GenerateTripIdAsync(_db);

        var trip = new Trip
        {
            Id = tripId,
            UserId = userId,
            TripName = !string.IsNullOrWhiteSpace(request.TripName) ? request.TripName.Trim() : $"{request.Destination.Trim()} Trip",
            Destination = request.Destination.Trim(),
            DestinationId = request.DestinationId,
            StartDate = request.StartDate.ToUniversalTime(),
            EndDate = request.EndDate.ToUniversalTime(),
            NumberOfTravelers = request.NumberOfTravelers,
            Budget = request.Budget,
            Interests = request.Interests ?? [],
            TripStyle = string.IsNullOrWhiteSpace(request.TripStyle) ? "standard" : request.TripStyle.Trim(),
            Status = TripStatus.Draft,
            CreatedSource = !string.IsNullOrWhiteSpace(request.CreatedSource) ? request.CreatedSource.Trim().ToUpperInvariant() : "USER",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Trips.Add(trip);

        if (!string.IsNullOrWhiteSpace(request.DestinationId))
        {
            _db.TripDestinations.Add(new TripDestination { TripId = tripId, DestinationId = request.DestinationId });
        }
        else if (!string.IsNullOrWhiteSpace(request.Destination))
        {
            var matchDest = await _db.Destinations.FirstOrDefaultAsync(d => d.Name.ToLower() == request.Destination.Trim().ToLower() || d.Slug.ToLower() == request.Destination.Trim().ToLower());
            if (matchDest != null)
            {
                _db.TripDestinations.Add(new TripDestination { TripId = tripId, DestinationId = matchDest.Id });
            }
        }

        await _db.SaveChangesAsync();

        return ApiResponse<TripResponse>.Ok(MapToResponse(trip), "Trip created successfully.");
    }

    public async Task<ApiResponse<PagedResult<TripResponse>>> GetTripsAsync(string userId, string userRole, TripFilterParameters filter)
    {
        var query = _db.Trips
            .Include(t => t.TripDestinations)
                .ThenInclude(td => td.Destination)
            .Include(t => t.Itineraries)
                .ThenInclude(i => i.Days)
                    .ThenInclude(d => d.Items)
            .Include(t => t.Bookings)
            .AsQueryable();

        // RBAC: Tourists/regular users can only see their own trips
        if (IsRestrictedUser(userRole))
        {
            query = query.Where(t => t.UserId == userId);
        }

        // Filtering
        if (!string.IsNullOrWhiteSpace(filter.Status) && Enum.TryParse<TripStatus>(filter.Status, true, out var status))
        {
            query = query.Where(t => t.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Destination))
        {
            var destLower = filter.Destination.Trim().ToLower();
            query = query.Where(t => t.TripName.ToLower().Contains(destLower) || t.TripDestinations.Any(td => td.Destination != null && td.Destination.Name.ToLower().Contains(destLower)));
        }

        if (filter.StartDate.HasValue)
        {
            var startUtc = filter.StartDate.Value.ToUniversalTime();
            query = query.Where(t => t.StartDate >= startUtc);
        }

        if (filter.EndDate.HasValue)
        {
            var endUtc = filter.EndDate.Value.ToUniversalTime();
            query = query.Where(t => t.EndDate <= endUtc);
        }

        int totalCount = await query.CountAsync();

        int pageNumber = filter.PageNumber > 0 ? filter.PageNumber : 1;
        int pageSize = filter.PageSize > 0 ? Math.Min(filter.PageSize, 50) : 10;

        var trips = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new PagedResult<TripResponse>
        {
            Items = trips.Select(MapToResponse).ToList(),
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };

        return ApiResponse<PagedResult<TripResponse>>.Ok(result);
    }

    public async Task<ApiResponse<TripResponse>> GetTripByIdAsync(string tripId, string userId, string userRole)
    {
        var trip = await _db.Trips
            .Include(t => t.TripDestinations)
                .ThenInclude(td => td.Destination)
            .Include(t => t.Itineraries)
                .ThenInclude(i => i.Days)
                    .ThenInclude(d => d.Items)
            .Include(t => t.Bookings)
            .FirstOrDefaultAsync(t => t.Id == tripId);

        if (trip == null)
        {
            return ApiResponse<TripResponse>.Fail("Trip not found.");
        }

        // Ownership check
        if (IsRestrictedUser(userRole) && trip.UserId != userId)
        {
            return ApiResponse<TripResponse>.Fail("You are not authorized to access this trip.");
        }

        return ApiResponse<TripResponse>.Ok(MapToResponse(trip));
    }

    public async Task<ApiResponse<List<TripResponse>>> GetTripsByUserIdAsync(string userId)
    {
        var trips = await _db.Trips
            .Include(t => t.TripDestinations)
                .ThenInclude(td => td.Destination)
            .Include(t => t.Itineraries)
                .ThenInclude(i => i.Days)
                    .ThenInclude(d => d.Items)
            .Include(t => t.Bookings)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return ApiResponse<List<TripResponse>>.Ok(trips.Select(MapToResponse).ToList());
    }

    public async Task<ApiResponse<TripResponse>> UpdateTripAsync(string tripId, string userId, string userRole, UpdateTripRequest request)
    {
        var trip = await _db.Trips
            .Include(t => t.TripDestinations)
                .ThenInclude(td => td.Destination)
            .Include(t => t.Itineraries)
                .ThenInclude(i => i.Days)
                    .ThenInclude(d => d.Items)
            .Include(t => t.Bookings)
            .FirstOrDefaultAsync(t => t.Id == tripId);

        if (trip == null)
        {
            return ApiResponse<TripResponse>.Fail("Trip not found.");
        }

        if (IsRestrictedUser(userRole) && trip.UserId != userId)
        {
            return ApiResponse<TripResponse>.Fail("You are not authorized to modify this trip.");
        }

        if (request.StartDate.HasValue && request.EndDate.HasValue && request.StartDate.Value > request.EndDate.Value)
        {
            return ApiResponse<TripResponse>.Fail("Trip start date cannot be after end date.");
        }

        if (request.Budget.HasValue && request.Budget.Value <= 0)
        {
            return ApiResponse<TripResponse>.Fail("Budget must be greater than zero.");
        }

        if (request.NumberOfTravelers.HasValue && request.NumberOfTravelers.Value <= 0)
        {
            return ApiResponse<TripResponse>.Fail("Number of travelers must be greater than zero.");
        }

        if (!string.IsNullOrWhiteSpace(request.TripName)) trip.TripName = request.TripName.Trim();
        if (!string.IsNullOrWhiteSpace(request.Destination)) trip.Destination = request.Destination.Trim();

        bool datesChanged = false;
        if (request.StartDate.HasValue && request.StartDate.Value.ToUniversalTime() != trip.StartDate)
        {
            trip.StartDate = request.StartDate.Value.ToUniversalTime();
            datesChanged = true;
        }
        if (request.EndDate.HasValue && request.EndDate.Value.ToUniversalTime() != trip.EndDate)
        {
            trip.EndDate = request.EndDate.Value.ToUniversalTime();
            datesChanged = true;
        }

        // Shift dependent itinerary dates appropriately when trip dates change
        if (datesChanged && trip.Itineraries != null)
        {
            foreach (var itin in trip.Itineraries)
            {
                if (itin.Days != null)
                {
                    foreach (var day in itin.Days)
                    {
                        day.Date = trip.StartDate.AddDays(day.DayNumber - 1);
                    }
                }
            }
        }

        if (request.NumberOfTravelers.HasValue) trip.NumberOfTravelers = request.NumberOfTravelers.Value;
        if (request.Budget.HasValue) trip.Budget = request.Budget.Value;
        if (request.Interests != null) trip.Interests = request.Interests;
        if (!string.IsNullOrWhiteSpace(request.TripStyle)) trip.TripStyle = request.TripStyle.Trim();
        if (request.Status.HasValue) trip.Status = request.Status.Value;
        if (!string.IsNullOrWhiteSpace(request.CreatedSource)) trip.CreatedSource = request.CreatedSource.Trim().ToUpperInvariant();

        trip.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return ApiResponse<TripResponse>.Ok(MapToResponse(trip), "Trip updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteTripAsync(string tripId, string userId, string userRole)
    {
        var trip = await _db.Trips.FirstOrDefaultAsync(t => t.Id == tripId);
        if (trip == null)
        {
            return ApiResponse<bool>.Fail("Trip not found.");
        }

        if (IsRestrictedUser(userRole) && trip.UserId != userId)
        {
            return ApiResponse<bool>.Fail("You are not authorized to delete this trip.");
        }

        _db.Trips.Remove(trip);
        await _db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Trip deleted successfully.");
    }

    private static bool IsRestrictedUser(string userRole) =>
        !userRole.Equals(UserRole.Admin.ToString(), StringComparison.OrdinalIgnoreCase) &&
        !userRole.Equals("ADMIN", StringComparison.OrdinalIgnoreCase);

    private static TripResponse MapToResponse(Trip trip)
    {
        var (timelineStatus, timelineLabel) = TripTimelineCalculator.CalculateTripTimeline(trip.StartDate, trip.EndDate, trip.Status);

        return new TripResponse
        {
            Id = trip.Id,
            UserId = trip.UserId,
            TripName = trip.TripName ?? $"{trip.Destination} Trip",
            Destination = trip.Destination,
            DestinationId = trip.DestinationId,
            StartDate = trip.StartDate,
            EndDate = trip.EndDate,
            NumberOfTravelers = trip.NumberOfTravelers,
            Budget = trip.Budget,
            Interests = trip.Interests,
            TripStyle = trip.TripStyle,
            Status = timelineStatus,
            CalculatedStatus = timelineStatus,
            TimelineLabel = timelineLabel,
            CreatedSource = trip.CreatedSource ?? "USER",
            CreatedAt = trip.CreatedAt,
            UpdatedAt = trip.UpdatedAt,
            ItinerariesCount = trip.Itineraries?.Count ?? 0,
            Itineraries = trip.Itineraries?.Select(i => new ItineraryResponseDto
            {
                Id = i.Id,
                TripId = i.TripId,
                Title = i.Title,
                Status = i.Status.ToString(),
                FeasibilityScore = i.FeasibilityScore,
                TotalEstimatedCost = i.TotalEstimatedCost,
                CreatedSource = i.CreatedSource ?? "AI",
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt,
                Days = i.Days?.OrderBy(d => d.DayNumber).Select(d => new ItineraryDayResponseDto
                {
                    Id = d.Id,
                    ItineraryId = d.ItineraryId,
                    DayNumber = d.DayNumber,
                    Date = d.Date,
                    Location = d.Location,
                    Title = d.Title,
                    Status = TripTimelineCalculator.CalculateDayStatus(d.Date),
                    Items = d.Items?.OrderBy(it => it.SequenceOrder).Select(it => new ItineraryItemResponseDto
                    {
                        Id = it.Id,
                        ItineraryDayId = it.ItineraryDayId,
                        SequenceOrder = it.SequenceOrder,
                        ActivityName = it.ActivityName,
                        Location = it.Location,
                        StartTime = it.StartTime.ToString(@"hh\:mm"),
                        EndTime = it.EndTime.ToString(@"hh\:mm"),
                        DurationMinutes = it.DurationMinutes,
                        EstimatedCost = it.EstimatedCost,
                        TravelTimeMinutes = it.TravelTimeMinutes,
                        Notes = it.Notes,
                        Status = TripTimelineCalculator.CalculateItemStatus(d.Date, it.StartTime, it.EndTime)
                    }).ToList() ?? []
                }).ToList() ?? []
            }).ToList() ?? [],
            Bookings = trip.Bookings?.Select(b => new BookingSummaryDto
            {
                Id = b.Id,
                UserId = b.UserId,
                TripId = b.TripId,
                ServiceType = b.ServiceType,
                ServiceName = b.ServiceName,
                TotalAmount = b.Amount,
                Status = b.Status.ToString(),
                BookingDate = b.BookingDate
            }).ToList() ?? []
        };
    }
}

