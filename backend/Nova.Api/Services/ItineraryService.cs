using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Itineraries;
using Nova.Api.Entities;

namespace Nova.Api.Services;

public interface IItineraryService
{
    Task<ApiResponse<ItineraryResponse>> CreateItineraryAsync(string tripId, string userId, string userRole, CreateItineraryRequest request);
    Task<ApiResponse<ItineraryResponse>> GetItineraryByTripIdAsync(string tripId, string userId, string userRole);
    Task<ApiResponse<ItineraryResponse>> GetItineraryByIdAsync(string itineraryId, string userId, string userRole);
    Task<ApiResponse<bool>> DeleteItineraryAsync(string itineraryId, string userId, string userRole);

    Task<ApiResponse<ItineraryDayResponse>> AddItineraryDayAsync(string itineraryId, string userId, string userRole, CreateItineraryDayRequest request);
    Task<ApiResponse<List<ItineraryDayResponse>>> GetItineraryDaysAsync(string itineraryId, string userId, string userRole);

    Task<ApiResponse<ItineraryItemResponse>> AddItineraryItemAsync(string dayId, string userId, string userRole, CreateItineraryItemRequest request);
    Task<ApiResponse<ItineraryItemResponse>> UpdateItineraryItemAsync(string itemId, string userId, string userRole, UpdateItineraryItemRequest request);
    Task<ApiResponse<bool>> DeleteItineraryItemAsync(string itemId, string userId, string userRole);
}

public class ItineraryService : IItineraryService
{
    private readonly NovaDbContext _db;

    public ItineraryService(NovaDbContext db)
    {
        _db = db;
    }

    public async Task<ApiResponse<ItineraryResponse>> CreateItineraryAsync(string tripId, string userId, string userRole, CreateItineraryRequest request)
    {
        var trip = await _db.Trips.FirstOrDefaultAsync(t => t.Id == tripId);
        if (trip == null) return ApiResponse<ItineraryResponse>.Fail("Trip not found.");

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && trip.UserId != userId)
        {
            return ApiResponse<ItineraryResponse>.Fail("You are not authorized to create itineraries for this trip.");
        }

        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var itinerary = new Itinerary
            {
                TripId = tripId,
                Title = string.IsNullOrWhiteSpace(request.Title) ? $"{trip.Destination} Itinerary" : request.Title.Trim(),
                Status = ItineraryStatus.Draft,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            foreach (var d in request.Days)
            {
                var day = new ItineraryDay
                {
                    Date = d.Date.ToUniversalTime(),
                    DayNumber = d.DayNumber,
                    Title = d.Title,
                    Location = d.Location
                };

                foreach (var i in d.Items)
                {
                    day.Items.Add(new ItineraryItem
                    {
                        ActivityId = i.ActivityId,
                        ActivityName = i.ActivityName,
                        Location = i.Location,
                        StartTime = TimeSpan.TryParse(i.StartTime, out var st) ? st : new TimeSpan(9, 0, 0),
                        EndTime = TimeSpan.TryParse(i.EndTime, out var et) ? et : new TimeSpan(11, 0, 0),
                        DurationMinutes = i.DurationMinutes,
                        EstimatedCost = i.EstimatedCost,
                        TravelTimeMinutes = i.TravelTimeMinutes,
                        Notes = i.Notes,
                        SequenceOrder = i.SequenceOrder
                    });
                }

                itinerary.Days.Add(day);
            }

            itinerary.TotalEstimatedCost = itinerary.Days.SelectMany(d => d.Items).Sum(i => i.EstimatedCost);

            _db.Itineraries.Add(itinerary);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return ApiResponse<ItineraryResponse>.Ok(MapToResponse(itinerary), "Itinerary created successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return ApiResponse<ItineraryResponse>.Fail($"Failed to create itinerary: {ex.Message}");
        }
    }

    public async Task<ApiResponse<ItineraryResponse>> GetItineraryByTripIdAsync(string tripId, string userId, string userRole)
    {
        var trip = await _db.Trips.FirstOrDefaultAsync(t => t.Id == tripId);
        if (trip == null) return ApiResponse<ItineraryResponse>.Fail("Trip not found.");

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && trip.UserId != userId)
        {
            return ApiResponse<ItineraryResponse>.Fail("You are not authorized to access itineraries for this trip.");
        }

        var itinerary = await _db.Itineraries
            .Include(i => i.Days)
                .ThenInclude(d => d.Items)
            .OrderByDescending(i => i.CreatedAt)
            .FirstOrDefaultAsync(i => i.TripId == tripId);

        if (itinerary == null) return ApiResponse<ItineraryResponse>.Fail("No itinerary found for this trip.");

        return ApiResponse<ItineraryResponse>.Ok(MapToResponse(itinerary));
    }

    public async Task<ApiResponse<ItineraryResponse>> GetItineraryByIdAsync(string itineraryId, string userId, string userRole)
    {
        var itinerary = await _db.Itineraries
            .Include(i => i.Trip)
            .Include(i => i.Days)
                .ThenInclude(d => d.Items)
            .FirstOrDefaultAsync(i => i.Id == itineraryId);

        if (itinerary == null) return ApiResponse<ItineraryResponse>.Fail("Itinerary not found.");

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && itinerary.Trip?.UserId != userId)
        {
            return ApiResponse<ItineraryResponse>.Fail("You are not authorized to access this itinerary.");
        }

        return ApiResponse<ItineraryResponse>.Ok(MapToResponse(itinerary));
    }

    public async Task<ApiResponse<bool>> DeleteItineraryAsync(string itineraryId, string userId, string userRole)
    {
        var itinerary = await _db.Itineraries.Include(i => i.Trip).FirstOrDefaultAsync(i => i.Id == itineraryId);
        if (itinerary == null) return ApiResponse<bool>.Fail("Itinerary not found.");

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && itinerary.Trip?.UserId != userId)
        {
            return ApiResponse<bool>.Fail("You are not authorized to delete this itinerary.");
        }

        _db.Itineraries.Remove(itinerary);
        await _db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Itinerary deleted successfully.");
    }

    public async Task<ApiResponse<ItineraryDayResponse>> AddItineraryDayAsync(string itineraryId, string userId, string userRole, CreateItineraryDayRequest request)
    {
        var itinerary = await _db.Itineraries.Include(i => i.Trip).Include(i => i.Days).FirstOrDefaultAsync(i => i.Id == itineraryId);
        if (itinerary == null) return ApiResponse<ItineraryDayResponse>.Fail("Itinerary not found.");

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && itinerary.Trip?.UserId != userId)
        {
            return ApiResponse<ItineraryDayResponse>.Fail("You are not authorized to modify this itinerary.");
        }

        var day = new ItineraryDay
        {
            ItineraryId = itineraryId,
            Date = request.Date.ToUniversalTime(),
            DayNumber = request.DayNumber > 0 ? request.DayNumber : itinerary.Days.Count + 1,
            Title = request.Title,
            Location = request.Location
        };

        foreach (var i in request.Items)
        {
            day.Items.Add(new ItineraryItem
            {
                ActivityId = i.ActivityId,
                ActivityName = i.ActivityName,
                Location = i.Location,
                StartTime = TimeSpan.TryParse(i.StartTime, out var st) ? st : new TimeSpan(9, 0, 0),
                EndTime = TimeSpan.TryParse(i.EndTime, out var et) ? et : new TimeSpan(11, 0, 0),
                DurationMinutes = i.DurationMinutes,
                EstimatedCost = i.EstimatedCost,
                TravelTimeMinutes = i.TravelTimeMinutes,
                Notes = i.Notes,
                SequenceOrder = i.SequenceOrder
            });
        }

        _db.ItineraryDays.Add(day);
        itinerary.TotalEstimatedCost += day.Items.Sum(item => item.EstimatedCost);
        itinerary.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return ApiResponse<ItineraryDayResponse>.Ok(MapToDayResponse(day), "Itinerary day added successfully.");
    }

    public async Task<ApiResponse<List<ItineraryDayResponse>>> GetItineraryDaysAsync(string itineraryId, string userId, string userRole)
    {
        var itinerary = await _db.Itineraries.Include(i => i.Trip).FirstOrDefaultAsync(i => i.Id == itineraryId);
        if (itinerary == null) return ApiResponse<List<ItineraryDayResponse>>.Fail("Itinerary not found.");

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && itinerary.Trip?.UserId != userId)
        {
            return ApiResponse<List<ItineraryDayResponse>>.Fail("You are not authorized to access this itinerary.");
        }

        var days = await _db.ItineraryDays
            .Include(d => d.Items)
            .Where(d => d.ItineraryId == itineraryId)
            .OrderBy(d => d.DayNumber)
            .ToListAsync();

        return ApiResponse<List<ItineraryDayResponse>>.Ok(days.Select(MapToDayResponse).ToList());
    }

    public async Task<ApiResponse<ItineraryItemResponse>> AddItineraryItemAsync(string dayId, string userId, string userRole, CreateItineraryItemRequest request)
    {
        var day = await _db.ItineraryDays
            .Include(d => d.Itinerary)
                .ThenInclude(i => i!.Trip)
            .Include(d => d.Items)
            .FirstOrDefaultAsync(d => d.Id == dayId);

        if (day == null) return ApiResponse<ItineraryItemResponse>.Fail("Itinerary day not found.");

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && day.Itinerary?.Trip?.UserId != userId)
        {
            return ApiResponse<ItineraryItemResponse>.Fail("You are not authorized to modify this itinerary.");
        }

        var item = new ItineraryItem
        {
            ItineraryDayId = dayId,
            ActivityId = request.ActivityId,
            ActivityName = request.ActivityName,
            Location = request.Location,
            StartTime = TimeSpan.TryParse(request.StartTime, out var st) ? st : new TimeSpan(9, 0, 0),
            EndTime = TimeSpan.TryParse(request.EndTime, out var et) ? et : new TimeSpan(11, 0, 0),
            DurationMinutes = request.DurationMinutes,
            EstimatedCost = request.EstimatedCost,
            TravelTimeMinutes = request.TravelTimeMinutes,
            Notes = request.Notes,
            SequenceOrder = request.SequenceOrder > 0 ? request.SequenceOrder : day.Items.Count + 1
        };

        _db.ItineraryItems.Add(item);

        if (day.Itinerary != null)
        {
            day.Itinerary.TotalEstimatedCost += item.EstimatedCost;
            day.Itinerary.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return ApiResponse<ItineraryItemResponse>.Ok(MapToItemResponse(item), "Activity item added successfully.");
    }

    public async Task<ApiResponse<ItineraryItemResponse>> UpdateItineraryItemAsync(string itemId, string userId, string userRole, UpdateItineraryItemRequest request)
    {
        var item = await _db.ItineraryItems
            .Include(i => i.ItineraryDay)
                .ThenInclude(d => d!.Itinerary)
                    .ThenInclude(it => it!.Trip)
            .FirstOrDefaultAsync(i => i.Id == itemId);

        if (item == null) return ApiResponse<ItineraryItemResponse>.Fail("Itinerary item not found.");

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && item.ItineraryDay?.Itinerary?.Trip?.UserId != userId)
        {
            return ApiResponse<ItineraryItemResponse>.Fail("You are not authorized to modify this item.");
        }

        if (!string.IsNullOrWhiteSpace(request.ActivityName)) item.ActivityName = request.ActivityName.Trim();
        if (!string.IsNullOrWhiteSpace(request.Location)) item.Location = request.Location.Trim();
        if (!string.IsNullOrWhiteSpace(request.StartTime) && TimeSpan.TryParse(request.StartTime, out var st)) item.StartTime = st;
        if (!string.IsNullOrWhiteSpace(request.EndTime) && TimeSpan.TryParse(request.EndTime, out var et)) item.EndTime = et;
        if (request.DurationMinutes.HasValue) item.DurationMinutes = request.DurationMinutes.Value;
        if (request.EstimatedCost.HasValue) item.EstimatedCost = request.EstimatedCost.Value;
        if (request.TravelTimeMinutes.HasValue) item.TravelTimeMinutes = request.TravelTimeMinutes.Value;
        if (request.Notes != null) item.Notes = request.Notes;
        if (request.SequenceOrder.HasValue) item.SequenceOrder = request.SequenceOrder.Value;

        if (item.ItineraryDay?.Itinerary != null)
        {
            var dayItems = await _db.ItineraryItems.Where(i => i.ItineraryDay!.ItineraryId == item.ItineraryDay.ItineraryId).ToListAsync();
            item.ItineraryDay.Itinerary.TotalEstimatedCost = dayItems.Sum(i => i.EstimatedCost);
            item.ItineraryDay.Itinerary.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return ApiResponse<ItineraryItemResponse>.Ok(MapToItemResponse(item), "Itinerary item updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteItineraryItemAsync(string itemId, string userId, string userRole)
    {
        var item = await _db.ItineraryItems
            .Include(i => i.ItineraryDay)
                .ThenInclude(d => d!.Itinerary)
                    .ThenInclude(it => it!.Trip)
            .FirstOrDefaultAsync(i => i.Id == itemId);

        if (item == null) return ApiResponse<bool>.Fail("Itinerary item not found.");

        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && item.ItineraryDay?.Itinerary?.Trip?.UserId != userId)
        {
            return ApiResponse<bool>.Fail("You are not authorized to delete this item.");
        }

        var cost = item.EstimatedCost;
        var itinerary = item.ItineraryDay?.Itinerary;

        _db.ItineraryItems.Remove(item);

        if (itinerary != null)
        {
            itinerary.TotalEstimatedCost = Math.Max(0, itinerary.TotalEstimatedCost - cost);
            itinerary.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Itinerary item deleted successfully.");
    }

    public static ItineraryResponse MapToResponse(Itinerary itinerary)
    {
        return new ItineraryResponse
        {
            Id = itinerary.Id,
            TripId = itinerary.TripId,
            Title = itinerary.Title,
            Status = itinerary.Status.ToString(),
            TotalEstimatedCost = itinerary.TotalEstimatedCost,
            FeasibilityScore = itinerary.FeasibilityScore,
            ApprovedByUserId = itinerary.ApprovedByUserId,
            ApprovedAt = itinerary.ApprovedAt,
            ApprovalComments = itinerary.ApprovalComments,
            CreatedAt = itinerary.CreatedAt,
            UpdatedAt = itinerary.UpdatedAt,
            Days = itinerary.Days?.OrderBy(d => d.DayNumber).Select(MapToDayResponse).ToList() ?? []
        };
    }

    public static ItineraryDayResponse MapToDayResponse(ItineraryDay day)
    {
        return new ItineraryDayResponse
        {
            Id = day.Id,
            Date = day.Date,
            DayNumber = day.DayNumber,
            Title = day.Title,
            Location = day.Location,
            Items = day.Items?.OrderBy(i => i.SequenceOrder).ThenBy(i => i.StartTime).Select(MapToItemResponse).ToList() ?? []
        };
    }

    public static ItineraryItemResponse MapToItemResponse(ItineraryItem item)
    {
        return new ItineraryItemResponse
        {
            Id = item.Id,
            ActivityId = item.ActivityId,
            ActivityName = item.ActivityName,
            Location = item.Location,
            StartTime = item.StartTime.ToString(@"hh\:mm"),
            EndTime = item.EndTime.ToString(@"hh\:mm"),
            DurationMinutes = item.DurationMinutes,
            EstimatedCost = item.EstimatedCost,
            TravelTimeMinutes = item.TravelTimeMinutes,
            Notes = item.Notes,
            SequenceOrder = item.SequenceOrder
        };
    }
}
