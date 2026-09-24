namespace tourism_management_app.Api.DTOs
{
    /// <summary>Query-string parameters for the /personalized endpoint.</summary>
    public class PersonalizedQueryParams
    {
        /// <summary>Interest/theme filters e.g. Culture, History, Nature.</summary>
        public List<string>? Interests { get; set; }

        /// <summary>Maximum daily budget in USD. Default 100.</summary>
        public double MaxBudget { get; set; } = 100;

        /// <summary>Maximum distance from base location in kilometres. Default 200 (island-wide).</summary>
        public double MaxDistanceKm { get; set; } = 200;

        /// <summary>Minimum average review rating (0 = any).</summary>
        public double MinRating { get; set; } = 0;

        /// <summary>Activity type filter: "All", "attraction", "tour".</summary>
        public string ActivityType { get; set; } = "All";

        /// <summary>Base location latitude. Defaults to Colombo.</summary>
        public double UserLat { get; set; } = 6.9271;

        /// <summary>Base location longitude. Defaults to Colombo.</summary>
        public double UserLng { get; set; } = 79.8612;

        /// <summary>Maximum number of results to return. Default 10.</summary>
        public int Limit { get; set; } = 10;
    }
}
