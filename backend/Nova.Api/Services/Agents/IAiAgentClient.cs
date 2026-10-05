namespace Nova.Api.Services.Agents
{
    /// <summary>
    /// Contract for the external AI agent client that communicates with the Python LangGraph service
    /// to research destination-specific activity candidates.
    /// </summary>
    public interface IAiAgentClient
    {
        /// <summary>
        /// Researches activities and candidates for a given destination based on user interests and trip style.
        /// </summary>
        /// <param name="destination">The destination name (e.g. "Kandy", "Sigiriya").</param>
        /// <param name="interests">List of interest categories (e.g. ["culture", "nature"]).</param>
        /// <param name="tripStyle">The trip style (e.g. "adventure", "relaxed", "cultural").</param>
        /// <returns>A list of ActivityCandidate objects, or null if the remote call fails.</returns>
        Task<List<ActivityCandidate>?> ResearchDestinationAsync(
            string destination,
            List<string> interests,
            string tripStyle);
    }
}
