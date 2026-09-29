using Nova.Api.DTOs.Transport;

namespace Nova.Api.Services;

public class TransportServiceException : Exception
{
    public string Code { get; }

    public TransportServiceException(string code, string message) : base(message)
    {
        Code = code;
    }
}

public interface IGoogleTransportService
{
    Task<List<TransportOptionDto>> GetTransitDirectionsAsync(
        string origin, 
        string destination, 
        DateTime travelDate, 
        string? preferredDepartureTime = null, 
        string? transitMode = null);
}
