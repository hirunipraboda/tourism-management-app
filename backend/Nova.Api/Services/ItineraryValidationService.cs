using Nova.Api.DTOs.AgenticAI;
using Nova.Api.Entities;

namespace Nova.Api.Services;

public interface IItineraryValidationService
{
    ValidationResultResponse Validate(Trip trip, List<ItineraryDay> days, GenerateItineraryRequest? constraints = null);
}

public class ItineraryValidationService : IItineraryValidationService
{
    public ValidationResultResponse Validate(Trip trip, List<ItineraryDay> days, GenerateItineraryRequest? constraints = null)
    {
        var errors = new List<ValidationErrorDto>();
        var advisories = new List<string>();

        // 1. Validate traveler count
        if (trip.NumberOfTravelers <= 0)
        {
            errors.Add(new ValidationErrorDto
            {
                Code = "INVALID_TRAVELERS",
                Message = "Number of travelers must be greater than zero.",
                Field = "NumberOfTravelers"
            });
        }

        // 2. Validate overall date range
        if (trip.StartDate > trip.EndDate)
        {
            errors.Add(new ValidationErrorDto
            {
                Code = "INVALID_DATE_RANGE",
                Message = "Trip start date cannot be after end date.",
                Field = "StartDate"
            });
        }

        // 3. Validate days belong to trip date range
        foreach (var day in days)
        {
            if (day.Date.Date < trip.StartDate.Date || day.Date.Date > trip.EndDate.Date)
            {
                errors.Add(new ValidationErrorDto
                {
                    Code = "DATE_OUT_OF_BOUNDS",
                    Message = $"Itinerary day date '{day.Date:yyyy-MM-dd}' is outside the trip range ({trip.StartDate:yyyy-MM-dd} to {trip.EndDate:yyyy-MM-dd}).",
                    Field = $"Day {day.DayNumber}"
                });
            }

            // Check maximum activities per day
            int maxActivities = constraints?.MaxActivitiesPerDay ?? 5;
            if (day.Items.Count > maxActivities)
            {
                errors.Add(new ValidationErrorDto
                {
                    Code = "MAX_ACTIVITIES_EXCEEDED",
                    Message = $"Day {day.DayNumber} contains {day.Items.Count} activities, exceeding the maximum limit of {maxActivities}.",
                    Field = $"Day {day.DayNumber}"
                });
            }

            // Check duplicate activities on the same day
            var activityNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var item in day.Items)
            {
                if (!activityNames.Add(item.ActivityName))
                {
                    errors.Add(new ValidationErrorDto
                    {
                        Code = "DUPLICATE_ACTIVITY",
                        Message = $"Duplicate activity '{item.ActivityName}' found on Day {day.DayNumber}.",
                        Field = item.ActivityName
                    });
                }
            }

            // Sort items by sequence order or start time
            var sortedItems = day.Items.OrderBy(i => i.SequenceOrder).ThenBy(i => i.StartTime).ToList();

            int totalDailyTravelMinutes = 0;

            for (int i = 0; i < sortedItems.Count; i++)
            {
                var item = sortedItems[i];
                totalDailyTravelMinutes += item.TravelTimeMinutes;

                // 4. Validate start time before end time
                if (item.StartTime >= item.EndTime)
                {
                    errors.Add(new ValidationErrorDto
                    {
                        Code = "INVALID_TIME_RANGE",
                        Message = $"Activity '{item.ActivityName}' on Day {day.DayNumber} has start time ({item.StartTime}) after or equal to end time ({item.EndTime}).",
                        Field = item.ActivityName
                    });
                }

                // Check transport feasibility if transport is selected
                if (item.SelectedTransport != null)
                {
                    // Date match
                    if (item.SelectedTransport.TravelDate.Date != day.Date.Date)
                    {
                        errors.Add(new ValidationErrorDto
                        {
                            Code = "TRANSPORT_DATE_MISMATCH",
                            Message = $"Transport travel date '{item.SelectedTransport.TravelDate:yyyy-MM-dd}' does not match itinerary day date '{day.Date:yyyy-MM-dd}' for activity '{item.ActivityName}'.",
                            Field = item.ActivityName
                        });
                    }

                    // Arrival before activity starts
                    if (TimeSpan.TryParse(item.SelectedTransport.ArrivalTime, out var transportArrival))
                    {
                        if (transportArrival > item.StartTime)
                        {
                            errors.Add(new ValidationErrorDto
                            {
                                Code = "TRANSPORT_ARRIVAL_AFTER_ACTIVITY",
                                Message = $"Transport arrival time ({item.SelectedTransport.ArrivalTime}) is after activity '{item.ActivityName}' starts ({item.StartTime:hh\\:mm}) on Day {day.DayNumber}.",
                                Field = item.ActivityName
                            });
                        }
                    }

                    // Departure after previous activity ends
                    if (i > 0 && TimeSpan.TryParse(item.SelectedTransport.DepartureTime, out var transportDep))
                    {
                        var prev = sortedItems[i - 1];
                        if (transportDep < prev.EndTime)
                        {
                            errors.Add(new ValidationErrorDto
                            {
                                Code = "TRANSPORT_DEPARTURE_BEFORE_PREVIOUS",
                                Message = $"Transport departure time ({item.SelectedTransport.DepartureTime}) is before previous activity '{prev.ActivityName}' ends ({prev.EndTime:hh\\:mm}) on Day {day.DayNumber}.",
                                Field = item.ActivityName
                            });
                        }
                    }
                }

                // 5. Check consecutive activity overlaps and travel feasibility
                if (i > 0)
                {
                    var previousItem = sortedItems[i - 1];

                    // Direct overlap check
                    if (item.StartTime < previousItem.EndTime)
                    {
                        errors.Add(new ValidationErrorDto
                        {
                            Code = "ACTIVITY_OVERLAP",
                            Message = $"Activity '{item.ActivityName}' overlaps with previous activity '{previousItem.ActivityName}' on Day {day.DayNumber}.",
                            Field = item.ActivityName
                        });
                    }
                    else
                    {
                        // Check if travel time from previous activity fits before start time
                        var requiredArrival = previousItem.EndTime.Add(TimeSpan.FromMinutes(previousItem.TravelTimeMinutes));
                        if (item.StartTime < requiredArrival)
                        {
                            errors.Add(new ValidationErrorDto
                            {
                                Code = "TRAVEL_TIME_INFEASIBLE",
                                Message = $"Travel time ({previousItem.TravelTimeMinutes} mins) from '{previousItem.ActivityName}' does not leave enough buffer before '{item.ActivityName}' starts on Day {day.DayNumber}.",
                                Field = item.ActivityName
                            });
                        }
                    }
                }
            }

            // 6. Check daily travel time constraints
            int maxDailyTravelMinutes = (constraints?.MaxDailyTravelHours ?? 3) * 60;
            if (totalDailyTravelMinutes > maxDailyTravelMinutes)
            {
                errors.Add(new ValidationErrorDto
                {
                    Code = "EXCESSIVE_DAILY_TRAVEL",
                    Message = $"Total travel time on Day {day.DayNumber} ({totalDailyTravelMinutes} mins) exceeds maximum allowed ({maxDailyTravelMinutes} mins).",
                    Field = $"Day {day.DayNumber}"
                });
            }
        }

        // 7. Validate budget constraint
        decimal totalItineraryCost = days.SelectMany(d => d.Items).Sum(i => i.EstimatedCost);
        if (trip.Budget > 0 && totalItineraryCost > trip.Budget)
        {
            errors.Add(new ValidationErrorDto
            {
                Code = "BUDGET_EXCEEDED",
                Message = $"Total estimated itinerary cost (${totalItineraryCost:F2}) exceeds trip budget (${trip.Budget:F2}).",
                Field = "Budget"
            });
        }

        // 8. Add weather / terrain advisories
        if (trip.Destination.Contains("Ella", StringComparison.OrdinalIgnoreCase) ||
            trip.Interests.Any(i => i.Contains("hiking", StringComparison.OrdinalIgnoreCase)))
        {
            advisories.Add("Hill Country microclimates: Rain gear and non-slip hiking footwear recommended for ridge trails.");
        }

        if (trip.Destination.Contains("Sigiriya", StringComparison.OrdinalIgnoreCase))
        {
            advisories.Add("Heat Advisory: Morning ascents (before 09:00 AM) strongly advised to avoid midday summit heat.");
        }

        double score = Math.Max(60.0, Math.Min(100.0, 100.0 - (errors.Count * 12.0)));

        return new ValidationResultResponse
        {
            IsValid = errors.Count == 0,
            FeasibilityScore = score,
            Errors = errors,
            Advisories = advisories
        };
    }
}
