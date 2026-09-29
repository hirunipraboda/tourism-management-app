using Nova.Api.DTOs.Common;
using Nova.Api.DTOs.Transport;

namespace Nova.Api.Services;

public interface ITransportService
{
    Task<ApiResponse<PublicTransportResponse>> SearchPublicTransportAsync(PublicTransportSearchRequest request);
    Task<ApiResponse<BusTransportResponse>> SearchBusesAsync(PublicTransportSearchRequest request);
    Task<ApiResponse<TrainTransportResponse>> SearchTrainsAsync(PublicTransportSearchRequest request);
    Task<ApiResponse<SelectedTransportResponse>> SelectTransportForItineraryItemAsync(string itemId, string userId, string userRole, SelectTransportRequest request);
    Task<ApiResponse<SelectedTransportResponse>> GetSelectedTransportAsync(string itemId, string userId, string userRole);
    Task<ApiResponse<bool>> RemoveSelectedTransportAsync(string itemId, string userId, string userRole);
}
