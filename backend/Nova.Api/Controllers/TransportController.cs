using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Transport;
using Nova.Api.Services;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/transport")]
public class TransportController : ControllerBase
{
    private readonly ITransportService _transportService;
    private readonly ILogger<TransportController> _logger;

    public TransportController(ITransportService transportService, ILogger<TransportController> logger)
    {
        _transportService = transportService;
        _logger = logger;
    }

    /// <summary>
    /// Search available public transportation options (both Bus and Train) between origin and destination.
    /// </summary>
    /// <param name="origin">Origin station or city (e.g. Colombo Fort)</param>
    /// <param name="destination">Destination station or city (e.g. Kandy)</param>
    /// <param name="date">Travel date (yyyy-MM-dd)</param>
    /// <param name="preferredDepartureTime">Optional preferred departure time (HH:mm)</param>
    /// <param name="numberOfTravelers">Number of travelers (minimum 1)</param>
    /// <returns>Categorized public transport response distinguishing Bus and Train</returns>
    [HttpGet("public")]
    [ProducesResponseType(typeof(ApiResponse<PublicTransportResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PublicTransportResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<PublicTransportResponse>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> SearchPublicTransport(
        [FromQuery] string origin,
        [FromQuery] string destination,
        [FromQuery] DateTime? date,
        [FromQuery] string? preferredDepartureTime = null,
        [FromQuery] int numberOfTravelers = 1)
    {
        var request = new PublicTransportSearchRequest
        {
            Origin = origin,
            Destination = destination,
            Date = date,
            PreferredDepartureTime = preferredDepartureTime,
            NumberOfTravelers = numberOfTravelers,
            TransportType = "PUBLIC_TRANSPORT"
        };

        var result = await _transportService.SearchPublicTransportAsync(request);
        if (!result.Success)
        {
            if (result.Errors?.Contains("TRANSPORT_SERVICE_UNAVAILABLE") == true)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, result);
            }
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Retrieve available bus transportation options between origin and destination.
    /// </summary>
    [HttpGet("bus")]
    [ProducesResponseType(typeof(ApiResponse<BusTransportResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<BusTransportResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<BusTransportResponse>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> SearchBuses(
        [FromQuery] string origin,
        [FromQuery] string destination,
        [FromQuery] DateTime? date,
        [FromQuery] string? preferredDepartureTime = null,
        [FromQuery] int numberOfTravelers = 1)
    {
        var request = new PublicTransportSearchRequest
        {
            Origin = origin,
            Destination = destination,
            Date = date,
            PreferredDepartureTime = preferredDepartureTime,
            NumberOfTravelers = numberOfTravelers,
            TransportType = "BUS"
        };

        var result = await _transportService.SearchBusesAsync(request);
        if (!result.Success)
        {
            if (result.Errors?.Contains("TRANSPORT_SERVICE_UNAVAILABLE") == true)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, result);
            }
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Retrieve available train transportation options between origin and destination.
    /// </summary>
    [HttpGet("train")]
    [ProducesResponseType(typeof(ApiResponse<TrainTransportResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<TrainTransportResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<TrainTransportResponse>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> SearchTrains(
        [FromQuery] string origin,
        [FromQuery] string destination,
        [FromQuery] DateTime? date,
        [FromQuery] string? preferredDepartureTime = null,
        [FromQuery] int numberOfTravelers = 1)
    {
        var request = new PublicTransportSearchRequest
        {
            Origin = origin,
            Destination = destination,
            Date = date,
            PreferredDepartureTime = preferredDepartureTime,
            NumberOfTravelers = numberOfTravelers,
            TransportType = "TRAIN"
        };

        var result = await _transportService.SearchTrainsAsync(request);
        if (!result.Success)
        {
            if (result.Errors?.Contains("TRANSPORT_SERVICE_UNAVAILABLE") == true)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, result);
            }
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Search public transportation using structured request body.
    /// </summary>
    [HttpPost("search")]
    [ProducesResponseType(typeof(ApiResponse<PublicTransportResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PublicTransportResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<PublicTransportResponse>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> SearchTransportByBody([FromBody] PublicTransportSearchRequest request)
    {
        var result = await _transportService.SearchPublicTransportAsync(request);
        if (!result.Success)
        {
            if (result.Errors?.Contains("TRANSPORT_SERVICE_UNAVAILABLE") == true)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, result);
            }
            return BadRequest(result);
        }

        return Ok(result);
    }
}
