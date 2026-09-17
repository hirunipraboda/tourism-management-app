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

        var trip = new Trip
        {
            UserId = userId,
            Destination = request.Destination.Trim(),
            DestinationId = request.DestinationId,
            StartDate = request.StartDate.ToUniversalTime(),
            EndDate = request.EndDate.ToUniversalTime(),
            NumberOfTravelers = request.NumberOfTravelers,
            Budget = request.Budget,
            Interests = request.Interests ?? [],
            TripStyle = string.IsNullOrWhiteSpace(request.TripStyle) ? "standard" : request.TripStyle.Trim().ToLowerInvariant(),
            Status = TripStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Trips.Add(trip);
        await _db.SaveChangesAsync();

        return ApiResponse<TripResponse>.Ok(MapToResponse(trip), "Trip created successfully.");
    }

    public async Task<ApiResponse<PagedResult<TripResponse>>> GetTripsAsync(string userId, string userRole, TripFilterParameters filter)
    {
        var query = _db.Trips.Include(t => t.Itineraries).AsQueryable();

        // RBAC: Tourists can only see their own trips
        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase))
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
            query = query.Where(t => t.Destination.ToLower().Contains(destLower));
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
        var trip = await _db.Trips.Include(t => t.Itineraries).FirstOrDefaultAsync(t => t.Id == tripId);
        if (trip == null)
        {
            return ApiResponse<TripResponse>.Fail("Trip not found.");
        }

        // Ownership check
        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && trip.UserId != userId)
        {
            return ApiResponse<TripResponse>.Fail("You are not authorized to access this trip.");
        }

        return ApiResponse<TripResponse>.Ok(MapToResponse(trip));
    }

    public async Task<ApiResponse<TripResponse>> UpdateTripAsync(string tripId, string userId, string userRole, UpdateTripRequest request)
    {
        var trip = await _db.Trips.Include(t => t.Itineraries).FirstOrDefaultAsync(t => t.Id == tripId);
        if (trip == null)
        {
            return ApiResponse<TripResponse>.Fail("Trip not found.");
        }

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && trip.UserId != userId)
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

        if (!string.IsNullOrWhiteSpace(request.Destination)) trip.Destination = request.Destination.Trim();
        if (request.StartDate.HasValue) trip.StartDate = request.StartDate.Value.ToUniversalTime();
        if (request.EndDate.HasValue) trip.EndDate = request.EndDate.Value.ToUniversalTime();
        if (request.NumberOfTravelers.HasValue) trip.NumberOfTravelers = request.NumberOfTravelers.Value;
        if (request.Budget.HasValue) trip.Budget = request.Budget.Value;
        if (request.Interests != null) trip.Interests = request.Interests;
        if (!string.IsNullOrWhiteSpace(request.TripStyle)) trip.TripStyle = request.TripStyle.Trim().ToLowerInvariant();
        if (request.Status.HasValue) trip.Status = request.Status.Value;

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

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && trip.UserId != userId)
        {
            return ApiResponse<bool>.Fail("You are not authorized to delete this trip.");
        }

        _db.Trips.Remove(trip);
        await _db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Trip deleted successfully.");
    }

    private static TripResponse MapToResponse(Trip trip)
    {
        return new TripResponse
        {
            Id = trip.Id,
            UserId = trip.UserId,
            Destination = trip.Destination,
            DestinationId = trip.DestinationId,
            StartDate = trip.StartDate,
            EndDate = trip.EndDate,
            NumberOfTravelers = trip.NumberOfTravelers,
            Budget = trip.Budget,
            Interests = trip.Interests,
            TripStyle = trip.TripStyle,
            Status = trip.Status.ToString(),
            CreatedAt = trip.CreatedAt,
            UpdatedAt = trip.UpdatedAt,
            ItinerariesCount = trip.Itineraries?.Count ?? 0
        };
    }
}
