using Nova.Api.DTOs.AgenticAI;
using Nova.Api.Entities;
using Nova.Api.Services;
using Xunit;

namespace Nova.Tests;

public class ItineraryValidationServiceTests
{
    private readonly ItineraryValidationService _validator = new();

    private Trip CreateSampleTrip(decimal budget = 1000)
    {
        return new Trip
        {
            Id = Guid.NewGuid().ToString(),
            UserId = "user-123",
            Destination = "Sigiriya",
            StartDate = new DateTime(2026, 10, 1, 0, 0, 0, DateTimeKind.Utc),
            EndDate = new DateTime(2026, 10, 3, 0, 0, 0, DateTimeKind.Utc),
            NumberOfTravelers = 2,
            Budget = budget,
            Interests = new List<string> { "Culture", "History" }
        };
    }

    [Fact]
    public void Validate_ValidItinerary_ReturnsSuccessWithHighQualityScore()
    {
        var trip = CreateSampleTrip(1000);
        var days = new List<ItineraryDay>
        {
            new ItineraryDay
            {
                DayNumber = 1,
                Date = trip.StartDate,
                Items = new List<ItineraryItem>
                {
                    new ItineraryItem
                    {
                        SequenceOrder = 1,
                        ActivityName = "Sigiriya Rock Climb",
                        StartTime = new TimeSpan(8, 0, 0),
                        EndTime = new TimeSpan(11, 0, 0),
                        TravelTimeMinutes = 20,
                        EstimatedCost = 60
                    },
                    new ItineraryItem
                    {
                        SequenceOrder = 2,
                        ActivityName = "Pidurangala Sunset View",
                        StartTime = new TimeSpan(15, 0, 0),
                        EndTime = new TimeSpan(17, 30, 0),
                        TravelTimeMinutes = 30,
                        EstimatedCost = 40
                    }
                }
            }
        };

        var result = _validator.Validate(trip, days);

        Assert.True(result.IsValid);
        Assert.Empty(result.Errors);
        Assert.True(result.FeasibilityScore >= 90);
    }

    [Fact]
    public void Validate_OverlappingActivities_ReturnsValidationError()
    {
        var trip = CreateSampleTrip(1000);
        var days = new List<ItineraryDay>
        {
            new ItineraryDay
            {
                DayNumber = 1,
                Date = trip.StartDate,
                Items = new List<ItineraryItem>
                {
                    new ItineraryItem
                    {
                        SequenceOrder = 1,
                        ActivityName = "Activity A",
                        StartTime = new TimeSpan(9, 0, 0),
                        EndTime = new TimeSpan(11, 30, 0)
                    },
                    new ItineraryItem
                    {
                        SequenceOrder = 2,
                        ActivityName = "Activity B",
                        StartTime = new TimeSpan(11, 0, 0), // Overlaps by 30 mins
                        EndTime = new TimeSpan(13, 0, 0)
                    }
                }
            }
        };

        var result = _validator.Validate(trip, days);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.Code == "ACTIVITY_OVERLAP");
    }

    [Fact]
    public void Validate_BudgetExceeded_ReturnsValidationError()
    {
        var trip = CreateSampleTrip(budget: 200);
        var days = new List<ItineraryDay>
        {
            new ItineraryDay
            {
                DayNumber = 1,
                Date = trip.StartDate,
                Items = new List<ItineraryItem>
                {
                    new ItineraryItem
                    {
                        SequenceOrder = 1,
                        ActivityName = "Luxury Tour",
                        StartTime = new TimeSpan(9, 0, 0),
                        EndTime = new TimeSpan(12, 0, 0),
                        EstimatedCost = 350 // Exceeds budget 200
                    }
                }
            }
        };

        var result = _validator.Validate(trip, days);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.Code == "BUDGET_EXCEEDED");
    }

    [Fact]
    public void Validate_ExcessiveDailyTravelTime_ReturnsValidationError()
    {
        var trip = CreateSampleTrip(2000);
        var constraints = new GenerateItineraryRequest { MaxDailyTravelHours = 2 }; // 120 mins max

        var days = new List<ItineraryDay>
        {
            new ItineraryDay
            {
                DayNumber = 1,
                Date = trip.StartDate,
                Items = new List<ItineraryItem>
                {
                    new ItineraryItem
                    {
                        SequenceOrder = 1,
                        ActivityName = "Distant Safari",
                        StartTime = new TimeSpan(7, 0, 0),
                        EndTime = new TimeSpan(10, 0, 0),
                        TravelTimeMinutes = 150 // Exceeds 120 mins
                    }
                }
            }
        };

        var result = _validator.Validate(trip, days, constraints);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.Code == "EXCESSIVE_DAILY_TRAVEL");
    }

    [Fact]
    public void Validate_DateOutOfBounds_ReturnsValidationError()
    {
        var trip = CreateSampleTrip(1000);
        var days = new List<ItineraryDay>
        {
            new ItineraryDay
            {
                DayNumber = 1,
                Date = trip.StartDate.AddDays(-2), // 2 days before trip starts
                Items = new List<ItineraryItem>()
            }
        };

        var result = _validator.Validate(trip, days);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.Code == "DATE_OUT_OF_BOUNDS");
    }
}
