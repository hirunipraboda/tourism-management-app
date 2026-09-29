using Nova.Api.Entities;

namespace Nova.Api.Services;

public static class TripTimelineCalculator
{
    /// <summary>
    /// Calculates dynamic status and timeline badge based on current system date/time.
    /// </summary>
    public static (string Status, string TimelineLabel) CalculateTripTimeline(DateTime startDate, DateTime endDate, TripStatus? explicitStatus)
    {
        if (explicitStatus == TripStatus.Cancelled)
        {
            return ("Cancelled", "Trip Cancelled");
        }

        var now = DateTime.UtcNow;
        var today = now.Date;
        var start = startDate.Date;
        var end = endDate.Date;

        if (today < start)
        {
            var daysUntil = (int)(start - today).TotalDays;
            var label = daysUntil == 1 ? "Starts tomorrow" : $"Starts in {daysUntil} days";
            return ("Upcoming", label);
        }
        else if (today <= end)
        {
            var currentDay = (int)(today - start).TotalDays + 1;
            var totalDays = Math.Max(1, (int)(end - start).TotalDays + 1);
            var remainingDays = (int)(end - today).TotalDays;

            string label;
            if (remainingDays == 0)
            {
                label = "Ongoing · Ends today";
            }
            else if (remainingDays == 1)
            {
                label = $"Ongoing · Day {currentDay} of {totalDays} (1 day remaining)";
            }
            else
            {
                label = $"Ongoing · Day {currentDay} of {totalDays} ({remainingDays} days remaining)";
            }
            return ("Ongoing", label);
        }
        else
        {
            var daysAgo = (int)(today - end).TotalDays;
            var label = daysAgo == 0 ? "Completed today" : daysAgo == 1 ? "Completed yesterday" : $"Completed {daysAgo} days ago";
            return ("Completed", label);
        }
    }

    /// <summary>
    /// Calculates the day status relative to current calendar date.
    /// </summary>
    public static string CalculateDayStatus(DateTime dayDate)
    {
        var today = DateTime.UtcNow.Date;
        var day = dayDate.Date;
        if (day < today) return "Completed";
        if (day == today) return "Today";
        return "Upcoming";
    }

    /// <summary>
    /// Calculates activity status relative to current date and time.
    /// </summary>
    public static string CalculateItemStatus(DateTime dayDate, TimeSpan startTime, TimeSpan endTime)
    {
        var now = DateTime.UtcNow;
        var today = now.Date;
        var day = dayDate.Date;

        if (day < today) return "Completed";
        if (day > today) return "Upcoming";

        var currentTime = now.TimeOfDay;
        if (currentTime < startTime) return "Upcoming";
        if (currentTime >= startTime && currentTime <= endTime) return "In Progress";
        return "Completed";
    }

    /// <summary>
    /// Calculates transit status relative to current date and departure/arrival times.
    /// </summary>
    public static string CalculateTransportStatus(DateTime travelDate, TimeSpan departureTime, TimeSpan arrivalTime)
    {
        var now = DateTime.UtcNow;
        var today = now.Date;
        var day = travelDate.Date;

        if (day < today) return "Completed";
        if (day > today) return "Upcoming";

        var currentTime = now.TimeOfDay;
        if (currentTime < departureTime) return "Upcoming";
        if (currentTime >= departureTime && currentTime <= arrivalTime) return "In Transit";
        return "Completed";
    }
}
