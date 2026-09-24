using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.Entities;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/admin/transportation")]
[Authorize(Roles = "Admin")]
public class AdminTransportationController : ControllerBase
{
    private readonly NovaDbContext _db;

    public AdminTransportationController(NovaDbContext db)
    {
        _db = db;
    }

    // ==========================================
    // 1. STATS / OVERVIEW
    // ==========================================
    [HttpGet("stats")]
    public async Task<IActionResult> GetTransportationStats()
    {
        var totalBuses = await _db.BusRoutes.CountAsync();
        var activeBuses = await _db.BusRoutes.CountAsync(b => b.Status == TransportServiceStatus.Active);
        var totalTrains = await _db.TrainSchedules.CountAsync();
        var activeTrains = await _db.TrainSchedules.CountAsync(t => t.Status == TransportServiceStatus.Active);

        return Ok(ApiResponse<object>.Ok(new
        {
            totalBusRoutes = totalBuses,
            activeBusRoutes = activeBuses,
            totalTrainSchedules = totalTrains,
            activeTrainSchedules = activeTrains,
            totalRoutes = totalBuses + totalTrains
        }));
    }

    // ==========================================
    // 2. BUS ROUTES CRUD
    // ==========================================
    [HttpGet("bus-routes")]
    public async Task<IActionResult> GetBusRoutes([FromQuery] string? search)
    {
        var query = _db.BusRoutes.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLowerInvariant();
            query = query.Where(b => b.BusNumber.ToLower().Contains(s) ||
                                     b.Origin.ToLower().Contains(s) ||
                                     b.Destination.ToLower().Contains(s) ||
                                     b.RouteName.ToLower().Contains(s));
        }

        var list = await query.OrderBy(b => b.BusNumber).ToListAsync();
        return Ok(ApiResponse<List<BusRoute>>.Ok(list));
    }

    [HttpGet("bus-routes/{id}")]
    public async Task<IActionResult> GetBusRouteById(string id)
    {
        var bus = await _db.BusRoutes.FirstOrDefaultAsync(b => b.Id == id);
        if (bus == null) return NotFound(ApiResponse<object>.Fail("Bus route not found."));

        return Ok(ApiResponse<BusRoute>.Ok(bus));
    }

    [HttpPost("bus-routes")]
    public async Task<IActionResult> CreateBusRoute([FromBody] BusRoute input)
    {
        input.Id = $"bus-{Guid.NewGuid().ToString()[..8]}";
        input.CreatedAt = DateTime.UtcNow;
        _db.BusRoutes.Add(input);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<BusRoute>.Ok(input, "Bus route added successfully."));
    }

    [HttpPut("bus-routes/{id}")]
    public async Task<IActionResult> UpdateBusRoute(string id, [FromBody] BusRoute input)
    {
        var bus = await _db.BusRoutes.FirstOrDefaultAsync(b => b.Id == id);
        if (bus == null) return NotFound(ApiResponse<object>.Fail("Bus route not found."));

        bus.BusNumber = input.BusNumber;
        bus.RouteName = input.RouteName;
        bus.Origin = input.Origin;
        bus.Destination = input.Destination;
        bus.DepartureTime = input.DepartureTime;
        bus.ArrivalTime = input.ArrivalTime;
        bus.OperatingDays = input.OperatingDays;
        bus.Fare = input.Fare;
        bus.Status = input.Status;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<BusRoute>.Ok(bus, "Bus route updated successfully."));
    }

    [HttpDelete("bus-routes/{id}")]
    public async Task<IActionResult> DeleteBusRoute(string id)
    {
        var bus = await _db.BusRoutes.FirstOrDefaultAsync(b => b.Id == id);
        if (bus == null) return NotFound(ApiResponse<object>.Fail("Bus route not found."));

        _db.BusRoutes.Remove(bus);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Bus route deleted successfully."));
    }

    // ==========================================
    // 3. TRAIN SCHEDULES CRUD
    // ==========================================
    [HttpGet("train-schedules")]
    public async Task<IActionResult> GetTrainSchedules([FromQuery] string? search)
    {
        var query = _db.TrainSchedules.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLowerInvariant();
            query = query.Where(t => t.TrainNumber.ToLower().Contains(s) ||
                                     t.TrainName.ToLower().Contains(s) ||
                                     t.Origin.ToLower().Contains(s) ||
                                     t.Destination.ToLower().Contains(s));
        }

        var list = await query.OrderBy(t => t.TrainNumber).ToListAsync();
        return Ok(ApiResponse<List<TrainSchedule>>.Ok(list));
    }

    [HttpGet("train-schedules/{id}")]
    public async Task<IActionResult> GetTrainScheduleById(string id)
    {
        var train = await _db.TrainSchedules.FirstOrDefaultAsync(t => t.Id == id);
        if (train == null) return NotFound(ApiResponse<object>.Fail("Train schedule not found."));

        return Ok(ApiResponse<TrainSchedule>.Ok(train));
    }

    [HttpPost("train-schedules")]
    public async Task<IActionResult> CreateTrainSchedule([FromBody] TrainSchedule input)
    {
        input.Id = $"train-{Guid.NewGuid().ToString()[..8]}";
        input.CreatedAt = DateTime.UtcNow;
        _db.TrainSchedules.Add(input);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<TrainSchedule>.Ok(input, "Train schedule added successfully."));
    }

    [HttpPut("train-schedules/{id}")]
    public async Task<IActionResult> UpdateTrainSchedule(string id, [FromBody] TrainSchedule input)
    {
        var train = await _db.TrainSchedules.FirstOrDefaultAsync(t => t.Id == id);
        if (train == null) return NotFound(ApiResponse<object>.Fail("Train schedule not found."));

        train.TrainNumber = input.TrainNumber;
        train.TrainName = input.TrainName;
        train.Origin = input.Origin;
        train.Destination = input.Destination;
        train.DepartureTime = input.DepartureTime;
        train.ArrivalTime = input.ArrivalTime;
        train.TrainType = input.TrainType;
        train.OperatingDays = input.OperatingDays;
        train.Fare = input.Fare;
        train.Status = input.Status;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<TrainSchedule>.Ok(train, "Train schedule updated successfully."));
    }

    [HttpDelete("train-schedules/{id}")]
    public async Task<IActionResult> DeleteTrainSchedule(string id)
    {
        var train = await _db.TrainSchedules.FirstOrDefaultAsync(t => t.Id == id);
        if (train == null) return NotFound(ApiResponse<object>.Fail("Train schedule not found."));

        _db.TrainSchedules.Remove(train);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Train schedule deleted successfully."));
    }
}
