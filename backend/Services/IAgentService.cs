using tourism_management_app.Api.DTOs;

namespace tourism_management_app.Api.Services
{
    public interface IAgentService
    {
        Task<AgentResponseDto> RunAgentAsync(AgentRequestDto request, int touristId, CancellationToken ct = default);
    }
}
