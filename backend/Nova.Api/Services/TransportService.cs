using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Transport;
using Nova.Api.Entities;

namespace Nova.Api.Services;

public class TransportService : ITransportService
{
    private readonly NovaDbContext _db;
    private readonly IGoogleTransportService _googleTransportService;
    private readonly ILogger<TransportService> _logger;

    public TransportService(
        NovaDbContext db, 
        IGoogleTransportService googleTransportService,
        ILogger<TransportService> logger)
    {
        _db = db;
        _googleTransportService = googleTransportService;
        _logger = logger;
    }

    public async Task<ApiResponse<PublicTransportResponse>> SearchPublicTransportAsync(PublicTransportSearchRequest request)
    {
        var validationError = ValidateSearchRequest(request);
        if (validationError != null) return validationError;

        var origin = request.Origin.Trim();
        var destination = request.Destination.Trim();
        var travelDate = DateTime.SpecifyKind(request.Date!.Value.Date, DateTimeKind.Utc);

        try
        {
            // 1. Check database cache (fresh within 24 hours and unattached)
            var cached = await GetCachedOptionsAsync(origin, destination, travelDate, null);
            if (cached.Count > 0)
            {
                var cachedResponse = new PublicTransportResponse
                {
                    Origin = origin,
                    Destination = destination,
                    TravelDate = travelDate.ToString("yyyy-MM-dd"),
                    Buses = cached.Where(c => c.TransportType == "BUS").ToList(),
                    Trains = cached.Where(c => c.TransportType == "TRAIN").ToList()
                };
                return ApiResponse<PublicTransportResponse>.Ok(cachedResponse, "Public transport retrieved from cache.");
            }

            // 2. Fetch fresh from Google Maps Platform
            var liveOptions = await _googleTransportService.GetTransitDirectionsAsync(
                origin, 
                destination, 
                travelDate, 
                request.PreferredDepartureTime, 
                null);

            // 3. Cache retrieved options in PostgreSQL
            await SaveRetrievedOptionsToCacheAsync(liveOptions, origin, destination, travelDate);

            var response = new PublicTransportResponse
            {
                Origin = origin,
                Destination = destination,
                TravelDate = travelDate.ToString("yyyy-MM-dd"),
                Buses = liveOptions.Where(c => c.TransportType == "BUS").ToList(),
                Trains = liveOptions.Where(c => c.TransportType == "TRAIN").ToList()
            };

            return ApiResponse<PublicTransportResponse>.Ok(response, "Public transport options retrieved successfully.");
        }
        catch (TransportServiceException ex)
        {
            _logger.LogWarning("Transport service error: {Message}", ex.Message);
            return ApiResponse<PublicTransportResponse>.Fail(
                "Public transport information is temporarily unavailable.", 
                [ex.Code, ex.Message]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error retrieving public transport for {Origin} -> {Destination}", origin, destination);
            return ApiResponse<PublicTransportResponse>.Fail(
                "Public transport information is temporarily unavailable.", 
                ["TRANSPORT_SERVICE_UNAVAILABLE", ex.Message]);
        }
    }

    public async Task<ApiResponse<BusTransportResponse>> SearchBusesAsync(PublicTransportSearchRequest request)
    {
        var validationError = ValidateSearchRequest(request);
        if (validationError != null)
        {
            return ApiResponse<BusTransportResponse>.Fail(validationError.Message ?? "Validation failed.", validationError.Errors);
        }

        var origin = request.Origin.Trim();
        var destination = request.Destination.Trim();
        var travelDate = DateTime.SpecifyKind(request.Date!.Value.Date, DateTimeKind.Utc);

        try
        {
            var cached = await GetCachedOptionsAsync(origin, destination, travelDate, "BUS");
            if (cached.Count > 0)
            {
                return ApiResponse<BusTransportResponse>.Ok(new BusTransportResponse
                {
                    TransportType = "BUS",
                    Options = cached
                }, "Bus options retrieved from cache.");
            }

            var liveOptions = await _googleTransportService.GetTransitDirectionsAsync(
                origin, 
                destination, 
                travelDate, 
                request.PreferredDepartureTime, 
                "bus");

            await SaveRetrievedOptionsToCacheAsync(liveOptions, origin, destination, travelDate);

            return ApiResponse<BusTransportResponse>.Ok(new BusTransportResponse
            {
                TransportType = "BUS",
                Options = liveOptions.Where(o => o.TransportType == "BUS").ToList()
            }, "Bus options retrieved successfully.");
        }
        catch (TransportServiceException ex)
        {
            return ApiResponse<BusTransportResponse>.Fail(
                "Public transport information is temporarily unavailable.", 
                [ex.Code, ex.Message]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to search bus routes.");
            return ApiResponse<BusTransportResponse>.Fail(
                "Public transport information is temporarily unavailable.", 
                ["TRANSPORT_SERVICE_UNAVAILABLE", ex.Message]);
        }
    }

    public async Task<ApiResponse<TrainTransportResponse>> SearchTrainsAsync(PublicTransportSearchRequest request)
    {
        var validationError = ValidateSearchRequest(request);
        if (validationError != null)
        {
            return ApiResponse<TrainTransportResponse>.Fail(validationError.Message ?? "Validation failed.", validationError.Errors);
        }

        var origin = request.Origin.Trim();
        var destination = request.Destination.Trim();
        var travelDate = DateTime.SpecifyKind(request.Date!.Value.Date, DateTimeKind.Utc);

        try
        {
            var cached = await GetCachedOptionsAsync(origin, destination, travelDate, "TRAIN");
            if (cached.Count > 0)
            {
                return ApiResponse<TrainTransportResponse>.Ok(new TrainTransportResponse
                {
                    TransportType = "TRAIN",
                    Options = cached
                }, "Train options retrieved from cache.");
            }

            var liveOptions = await _googleTransportService.GetTransitDirectionsAsync(
                origin, 
                destination, 
                travelDate, 
                request.PreferredDepartureTime, 
                "train");

            await SaveRetrievedOptionsToCacheAsync(liveOptions, origin, destination, travelDate);

            return ApiResponse<TrainTransportResponse>.Ok(new TrainTransportResponse
            {
                TransportType = "TRAIN",
                Options = liveOptions.Where(o => o.TransportType == "TRAIN").ToList()
            }, "Train options retrieved successfully.");
        }
        catch (TransportServiceException ex)
        {
            return ApiResponse<TrainTransportResponse>.Fail(
                "Public transport information is temporarily unavailable.", 
                [ex.Code, ex.Message]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to search train routes.");
            return ApiResponse<TrainTransportResponse>.Fail(
                "Public transport information is temporarily unavailable.", 
                ["TRANSPORT_SERVICE_UNAVAILABLE", ex.Message]);
        }
    }

    public async Task<ApiResponse<SelectedTransportResponse>> SelectTransportForItineraryItemAsync(
        string itemId, 
        string userId, 
        string userRole, 
        SelectTransportRequest request)
    {
        var item = await _db.ItineraryItems
            .Include(i => i.SelectedTransport)
            .Include(i => i.ItineraryDay)
                .ThenInclude(d => d!.Itinerary)
                    .ThenInclude(it => it!.Trip)
            .FirstOrDefaultAsync(i => i.Id == itemId);

        if (item == null)
        {
            return ApiResponse<SelectedTransportResponse>.Fail(
                "Itinerary item not found.", 
                ["ITEM_NOT_FOUND", "The requested itinerary item does not exist."]);
        }

        var trip = item.ItineraryDay?.Itinerary?.Trip;
        if (trip == null)
        {
            return ApiResponse<SelectedTransportResponse>.Fail(
                "Associated trip not found for this itinerary item.", 
                ["TRIP_NOT_FOUND"]);
        }

        // Authorization check: Only trip owner or Admin/Operator
        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && trip.UserId != userId)
        {
            return ApiResponse<SelectedTransportResponse>.Fail(
                "You are not authorized to modify transport for this itinerary.", 
                ["UNAUTHORIZED_ACCESS", "User does not own the associated trip."]);
        }

        // Validate transport date matches itinerary day date
        var itemDayDate = DateTime.SpecifyKind(item.ItineraryDay!.Date.Date, DateTimeKind.Utc);
        var requestedDate = DateTime.SpecifyKind((request.TravelDate ?? itemDayDate).Date, DateTimeKind.Utc);

        if (requestedDate != itemDayDate)
        {
            return ApiResponse<SelectedTransportResponse>.Fail(
                $"Transport date ({requestedDate:yyyy-MM-dd}) must match itinerary date ({itemDayDate:yyyy-MM-dd}).",
                ["TRANSPORT_DATE_MISMATCH", "Selected transport travel date does not match the itinerary day date."]);
        }

        // Validate time feasibility: transport arrival cannot be after activity starts
        if (!string.IsNullOrWhiteSpace(request.ArrivalTime) && TimeSpan.TryParse(request.ArrivalTime, out var parsedArrival))
        {
            if (parsedArrival > item.StartTime)
            {
                return ApiResponse<SelectedTransportResponse>.Fail(
                    $"Transport arrival time ({request.ArrivalTime}) is after activity '{item.ActivityName}' starts ({item.StartTime:hh\\:mm}).",
                    ["TRANSPORT_ARRIVAL_AFTER_ACTIVITY", "Transport arrives after activity scheduled start time."]);
            }
        }

        // If selecting an existing cached transport option
        TransportOption transportEntity;
        if (!string.IsNullOrWhiteSpace(request.TransportOptionId))
        {
            var existingOption = await _db.TransportOptions.FirstOrDefaultAsync(t => t.Id == request.TransportOptionId);
            if (existingOption != null && string.IsNullOrEmpty(existingOption.ItineraryItemId))
            {
                // Clone cached template option for this itinerary item
                transportEntity = new TransportOption
                {
                    TripId = trip.Id,
                    ItineraryItemId = item.Id,
                    TransportType = existingOption.TransportType,
                    Origin = existingOption.Origin,
                    Destination = existingOption.Destination,
                    TravelDate = requestedDate,
                    DepartureTime = existingOption.DepartureTime,
                    ArrivalTime = existingOption.ArrivalTime,
                    DurationMinutes = existingOption.DurationMinutes,
                    RouteNumber = existingOption.RouteNumber,
                    RouteName = existingOption.RouteName,
                    Direction = existingOption.Direction,
                    IntermediateStops = new List<string>(existingOption.IntermediateStops),
                    TrainName = existingOption.TrainName,
                    TrainNumber = existingOption.TrainNumber,
                    DepartureStation = existingOption.DepartureStation,
                    ArrivalStation = existingOption.ArrivalStation,
                    TrainType = existingOption.TrainType,
                    EstimatedFare = existingOption.EstimatedFare,
                    Source = existingOption.Source,
                    RetrievedAt = existingOption.RetrievedAt,
                    IsSelected = true,
                    CreatedAt = DateTime.UtcNow
                };
            }
            else
            {
                transportEntity = CreateEntityFromRequest(request, trip.Id, item.Id, requestedDate);
            }
        }
        else
        {
            transportEntity = CreateEntityFromRequest(request, trip.Id, item.Id, requestedDate);
        }

        // If item already has a transport option, replace it
        if (item.SelectedTransport != null)
        {
            _db.TransportOptions.Remove(item.SelectedTransport);
        }

        _db.TransportOptions.Add(transportEntity);

        // Update travel time on itinerary item
        item.TravelTimeMinutes = transportEntity.DurationMinutes;
        await _db.SaveChangesAsync();

        var response = new SelectedTransportResponse
        {
            ItineraryItemId = item.Id,
            TripId = trip.Id,
            TransportOption = MapToDto(transportEntity),
            SelectedAt = DateTime.UtcNow
        };

        return ApiResponse<SelectedTransportResponse>.Ok(response, "Transport option selected and attached successfully.");
    }

    public async Task<ApiResponse<SelectedTransportResponse>> GetSelectedTransportAsync(
        string itemId, 
        string userId, 
        string userRole)
    {
        var item = await _db.ItineraryItems
            .Include(i => i.SelectedTransport)
            .Include(i => i.ItineraryDay)
                .ThenInclude(d => d!.Itinerary)
                    .ThenInclude(it => it!.Trip)
            .FirstOrDefaultAsync(i => i.Id == itemId);

        if (item == null)
        {
            return ApiResponse<SelectedTransportResponse>.Fail(
                "Itinerary item not found.", 
                ["ITEM_NOT_FOUND"]);
        }

        var trip = item.ItineraryDay?.Itinerary?.Trip;
        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && trip != null && trip.UserId != userId)
        {
            return ApiResponse<SelectedTransportResponse>.Fail(
                "You are not authorized to view this itinerary item's transport.", 
                ["UNAUTHORIZED_ACCESS"]);
        }

        if (item.SelectedTransport == null)
        {
            return ApiResponse<SelectedTransportResponse>.Fail(
                "No transport option has been selected for this itinerary item.", 
                ["NO_TRANSPORT_SELECTED"]);
        }

        var response = new SelectedTransportResponse
        {
            ItineraryItemId = item.Id,
            TripId = trip?.Id,
            TransportOption = MapToDto(item.SelectedTransport),
            SelectedAt = item.SelectedTransport.CreatedAt
        };

        return ApiResponse<SelectedTransportResponse>.Ok(response, "Selected transport retrieved successfully.");
    }

    public async Task<ApiResponse<bool>> RemoveSelectedTransportAsync(
        string itemId, 
        string userId, 
        string userRole)
    {
        var item = await _db.ItineraryItems
            .Include(i => i.SelectedTransport)
            .Include(i => i.ItineraryDay)
                .ThenInclude(d => d!.Itinerary)
                    .ThenInclude(it => it!.Trip)
            .FirstOrDefaultAsync(i => i.Id == itemId);

        if (item == null)
        {
            return ApiResponse<bool>.Fail(
                "Itinerary item not found.", 
                ["ITEM_NOT_FOUND"]);
        }

        var trip = item.ItineraryDay?.Itinerary?.Trip;
        if (userRole.Equals(UserRole.Tourist.ToString(), StringComparison.OrdinalIgnoreCase) && trip != null && trip.UserId != userId)
        {
            return ApiResponse<bool>.Fail(
                "You are not authorized to modify this itinerary item.", 
                ["UNAUTHORIZED_ACCESS"]);
        }

        if (item.SelectedTransport != null)
        {
            _db.TransportOptions.Remove(item.SelectedTransport);
            item.TravelTimeMinutes = 0;
            await _db.SaveChangesAsync();
        }

        return ApiResponse<bool>.Ok(true, "Selected transport removed successfully.");
    }

    // Helper: validate search request fields
    private static ApiResponse<PublicTransportResponse>? ValidateSearchRequest(PublicTransportSearchRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Origin))
        {
            return ApiResponse<PublicTransportResponse>.Fail(
                "Origin is required.", 
                ["ORIGIN_REQUIRED", "Origin cannot be empty."]);
        }

        if (string.IsNullOrWhiteSpace(request.Destination))
        {
            return ApiResponse<PublicTransportResponse>.Fail(
                "Destination is required.", 
                ["DESTINATION_REQUIRED", "Destination cannot be empty."]);
        }

        if (request.Origin.Trim().Equals(request.Destination.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<PublicTransportResponse>.Fail(
                "Origin and destination cannot be identical.", 
                ["IDENTICAL_ORIGIN_DESTINATION", "Origin and destination cannot be identical."]);
        }

        if (!request.Date.HasValue || request.Date.Value == default)
        {
            return ApiResponse<PublicTransportResponse>.Fail(
                "Travel date is required.", 
                ["INVALID_DATE", "A valid travel date must be specified."]);
        }

        if (request.NumberOfTravelers <= 0)
        {
            return ApiResponse<PublicTransportResponse>.Fail(
                "Number of travelers must be greater than zero.", 
                ["INVALID_TRAVELER_COUNT", "Number of travelers must be at least 1."]);
        }

        return null;
    }

    private async Task<List<TransportOptionDto>> GetCachedOptionsAsync(string origin, string destination, DateTime travelDate, string? transportType)
    {
        var freshnessCutoff = DateTime.UtcNow.AddHours(-24);
        var startUtc = DateTime.SpecifyKind(travelDate.Date, DateTimeKind.Utc);
        var endUtc = startUtc.AddDays(1);

        var query = _db.TransportOptions
            .Where(t => t.ItineraryItemId == null
                        && t.Origin.ToLower() == origin.ToLower()
                        && t.Destination.ToLower() == destination.ToLower()
                        && t.TravelDate >= startUtc && t.TravelDate < endUtc
                        && t.RetrievedAt >= freshnessCutoff);

        if (!string.IsNullOrWhiteSpace(transportType))
        {
            query = query.Where(t => t.TransportType == transportType.ToUpper());
        }

        var entities = await query.ToListAsync();
        return entities.Select(MapToDto).ToList();
    }

    private async Task SaveRetrievedOptionsToCacheAsync(List<TransportOptionDto> options, string origin, string destination, DateTime travelDate)
    {
        if (options.Count == 0) return;

        try
        {
            var utcTravelDate = DateTime.SpecifyKind(travelDate.Date, DateTimeKind.Utc);
            foreach (var opt in options)
            {
                _db.TransportOptions.Add(new TransportOption
                {
                    Id = Guid.NewGuid().ToString(),
                    TripId = null,
                    ItineraryItemId = null,
                    TransportType = opt.TransportType,
                    Origin = origin,
                    Destination = destination,
                    TravelDate = utcTravelDate,
                    DepartureTime = opt.DepartureTime,
                    ArrivalTime = opt.ArrivalTime,
                    DurationMinutes = opt.DurationMinutes,
                    RouteNumber = opt.RouteNumber,
                    RouteName = opt.RouteName,
                    Direction = opt.Direction,
                    IntermediateStops = opt.IntermediateStops,
                    TrainName = opt.TrainName,
                    TrainNumber = opt.TrainNumber,
                    DepartureStation = opt.DepartureStation,
                    ArrivalStation = opt.ArrivalStation,
                    TrainType = opt.TrainType,
                    EstimatedFare = opt.EstimatedFare,
                    Source = opt.Source,
                    RetrievedAt = DateTime.SpecifyKind(opt.RetrievedAt == default ? DateTime.UtcNow : opt.RetrievedAt, DateTimeKind.Utc),
                    IsSelected = false,
                    CreatedAt = DateTime.UtcNow
                });
            }
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to persist transport cache.");
        }
    }

    private static TransportOption CreateEntityFromRequest(SelectTransportRequest request, string tripId, string itemId, DateTime travelDate)
    {
        return new TransportOption
        {
            Id = Guid.NewGuid().ToString(),
            TripId = tripId,
            ItineraryItemId = itemId,
            TransportType = !string.IsNullOrWhiteSpace(request.TransportType) ? request.TransportType.ToUpper() : "BUS",
            Origin = request.Origin ?? "",
            Destination = request.Destination ?? "",
            TravelDate = DateTime.SpecifyKind(travelDate.Date, DateTimeKind.Utc),
            DepartureTime = request.DepartureTime ?? "08:00",
            ArrivalTime = request.ArrivalTime ?? "10:30",
            DurationMinutes = request.DurationMinutes ?? 150,
            RouteNumber = request.RouteNumber,
            RouteName = request.RouteName,
            Direction = request.Direction,
            IntermediateStops = request.IntermediateStops ?? [],
            TrainName = request.TrainName,
            TrainNumber = request.TrainNumber,
            DepartureStation = request.DepartureStation,
            ArrivalStation = request.ArrivalStation,
            TrainType = request.TrainType,
            EstimatedFare = request.EstimatedFare,
            Source = request.Source ?? "UserSelection",
            RetrievedAt = DateTime.UtcNow,
            IsSelected = true,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static TransportOptionDto MapToDto(TransportOption entity)
    {
        return new TransportOptionDto
        {
            Id = entity.Id,
            TransportType = entity.TransportType,
            Origin = entity.Origin,
            Destination = entity.Destination,
            TravelDate = entity.TravelDate.ToString("yyyy-MM-dd"),
            DepartureTime = entity.DepartureTime,
            ArrivalTime = entity.ArrivalTime,
            DurationMinutes = entity.DurationMinutes,
            RouteNumber = entity.RouteNumber,
            RouteName = entity.RouteName,
            Direction = entity.Direction,
            IntermediateStops = entity.IntermediateStops,
            TrainName = entity.TrainName,
            TrainNumber = entity.TrainNumber,
            DepartureStation = entity.DepartureStation,
            ArrivalStation = entity.ArrivalStation,
            TrainType = entity.TrainType,
            EstimatedFare = entity.EstimatedFare,
            Source = entity.Source,
            RetrievedAt = entity.RetrievedAt,
            IsSelected = entity.IsSelected
        };
    }
}
