using System.Threading.Tasks;
using Nova.Api.DTOs;

namespace Nova.Api.Services
{
    public interface IAttractionAiAgentService
    {
        Task<AttractionAiStateDto?> CurateAttractionsAsync(CurateAttractionsRequestDto request);
        Task<AttractionAiStateDto?> SubmitHumanApprovalAsync(HumanApprovalRequestDto request);
        Task<AttractionAiStateDto?> GetStateStatusAsync(string threadId);
    }
}
