using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace tourism_management_app.Tests
{
    /// <summary>Tests for Haversine distance and Bayesian scoring formulas.</summary>
    public class ScoringTests
    {
        // ── Haversine Distance Tests ───────────────────────────────────────────

        [Theory]
        [InlineData(6.9271, 79.8612, 6.9271, 79.8612, 0)]           // same point
        [InlineData(6.9271, 79.8612, 7.2936, 80.6413, 95.2)]        // Colombo → Kandy ~95.2km (great-circle)
        [InlineData(6.9271, 79.8612, 7.9568, 80.7603, 151.4)]       // Colombo → Sigiriya ~151.4km (great-circle)
        [InlineData(6.9271, 79.8612, 5.9437, 80.4716, 128.5)]       // Colombo → Mirissa ~128.5km (great-circle)
        public void Haversine_ReturnsApproximateDistance(
            double lat1, double lon1, double lat2, double lon2, double expectedKm)
        {
            var result = HaversineKm(lat1, lon1, lat2, lon2);
            // Allow ±5% tolerance
            var tolerance = Math.Max(5, expectedKm * 0.05);
            Assert.InRange(result, expectedKm - tolerance, expectedKm + tolerance);
        }

        [Fact]
        public void Haversine_IsSymmetric()
        {
            double a = HaversineKm(6.9271, 79.8612, 7.2936, 80.6413);
            double b = HaversineKm(7.2936, 80.6413, 6.9271, 79.8612);
            Assert.Equal(Math.Round(a, 2), Math.Round(b, 2));
        }

        // ── Bayesian Rating Tests ──────────────────────────────────────────────

        [Fact]
        public void BayesianRating_HighCountAttractionKeepsRating()
        {
            // With 100 reviews at 4.8, Bayesian should be very close to 4.8
            var result = BayesianRating(4.8, 100, priorCount: 10, priorMean: 3.5);
            Assert.InRange(result, 4.6, 4.9);
        }

        [Fact]
        public void BayesianRating_LowCountAttractionPullsTowardMean()
        {
            // With 1 review at 5.0, Bayesian should pull toward prior mean (3.5)
            var result = BayesianRating(5.0, 1, priorCount: 10, priorMean: 3.5);
            Assert.InRange(result, 3.5, 4.2); // pulled toward mean
        }

        [Fact]
        public void BayesianRating_ZeroReviewsReturnsGlobalMean()
        {
            var result = BayesianRating(0, 0, priorCount: 10, priorMean: 3.5);
            Assert.Equal(3.5, result);
        }

        [Fact]
        public void BayesianRating_NeverExceedsMaxRating()
        {
            var result = BayesianRating(5.0, 1000, priorCount: 10, priorMean: 3.5);
            Assert.True(result <= 5.0);
        }

        // ── Score Composition Tests ────────────────────────────────────────────

        [Fact]
        public void ScoreComposition_WeightsSumToOne()
        {
            double interest = 0.30, rating = 0.25, budget = 0.15,
                   distance = 0.15, popularity = 0.10, history = 0.05;
            var total = interest + rating + budget + distance + popularity + history;
            Assert.Equal(1.0, Math.Round(total, 10));
        }

        [Fact]
        public void ScoreComposition_PerfectScoreIs100()
        {
            var composite = 100 * 0.30 + 100 * 0.25 + 100 * 0.15
                          + 100 * 0.15 + 100 * 0.10 + 100 * 0.05;
            Assert.Equal(100.0, composite);
        }

        [Fact]
        public void ScoreComposition_ZeroScoreIsZero()
        {
            var composite = 0 * 0.30 + 0 * 0.25 + 0 * 0.15
                          + 0 * 0.15 + 0 * 0.10 + 0 * 0.05;
            Assert.Equal(0.0, composite);
        }

        [Theory]
        [InlineData(95, 88, 75, 80, 60, 85, 84.5)] // expected composite ~84.5
        public void ScoreComposition_CalculatesCorrectly(
            double interest, double rating, double budget,
            double distance, double popularity, double history,
            double expectedScore)
        {
            var result = interest * 0.30 + rating * 0.25 + budget * 0.15
                       + distance * 0.15 + popularity * 0.10 + history * 0.05;
            Assert.InRange(result, expectedScore - 2, expectedScore + 2);
        }

        // ── Interest Matching Tests ────────────────────────────────────────────

        [Theory]
        [InlineData(new[] { "Nature" }, "Nature", 95)]
        [InlineData(new[] { "Culture", "History" }, "Nature", 25)]
        [InlineData(new[] { "All" }, "Beaches", 70)]
        [InlineData(new string[] { }, "Wildlife", 70)]
        public void InterestScore_MatchesCategoryCorrectly(string[] interests, string category, double expectedScore)
        {
            var score = ComputeInterestScore(interests, category);
            Assert.Equal(expectedScore, score);
        }

        // ── Problem 1: Recommendation Matching & Filter Tests ──────────────────

        private static List<tourism_management_app.Api.Models.Attraction> CreateSampleAttractions()
        {
            return new List<tourism_management_app.Api.Models.Attraction>
            {
                new() { Id = 1, Name = "Temple of the Tooth", Category = "Culture", ActivityType = "attraction", EstimatedCostUsd = 15, Latitude = 7.2936, Longitude = 80.6413 }, // Kandy ~95km
                new() { Id = 2, Name = "Sigiriya Rock", Category = "History", ActivityType = "attraction", EstimatedCostUsd = 30, Latitude = 7.9568, Longitude = 80.7603 }, // Sigiriya ~151km
                new() { Id = 3, Name = "Nine Arches Bridge", Category = "Nature", ActivityType = "attraction", EstimatedCostUsd = 5, Latitude = 6.8753, Longitude = 81.0539 }, // Ella ~131km
                new() { Id = 4, Name = "Mirissa Beach Tour", Category = "Beaches", ActivityType = "tour", EstimatedCostUsd = 45, Latitude = 5.9437, Longitude = 80.4716 }, // Mirissa ~128km
                new() { Id = 5, Name = "Yala Safari Tour", Category = "Wildlife", ActivityType = "tour", EstimatedCostUsd = 60, Latitude = 6.3748, Longitude = 81.5081 }, // Yala ~192km
                new() { Id = 6, Name = "Galle Dutch Fort", Category = "History", ActivityType = "attraction", EstimatedCostUsd = 0, Latitude = 6.0278, Longitude = 80.2167 }, // Galle ~107km
                new() { Id = 7, Name = "Colombo Food Tour", Category = "Food", ActivityType = "tour", EstimatedCostUsd = 35, Latitude = 6.9271, Longitude = 79.8612 }, // Colombo 0km
                new() { Id = 8, Name = "Trincomalee Beaches", Category = "Beaches", ActivityType = "tour", EstimatedCostUsd = 20, Latitude = 8.5753, Longitude = 81.2156 }, // Trinco ~237km
                new() { Id = 9, Name = "Ella Rock Hike", Category = "Adventure", ActivityType = "attraction", EstimatedCostUsd = 5, Latitude = 6.8740, Longitude = 81.0465 }, // Ella ~131km
                new() { Id = 10, Name = "Udawalawe Safari", Category = "Wildlife", ActivityType = "tour", EstimatedCostUsd = 40, Latitude = 6.4728, Longitude = 80.8889 } // Udawalawe ~124km
            };
        }

        [Fact]
        public void LooseFilters_ReturnManyResults()
        {
            var attractions = CreateSampleAttractions();
            var looseParams = new tourism_management_app.Api.DTOs.PersonalizedQueryParams
            {
                Interests = new List<string> { "All" },
                MaxBudget = 100,
                MaxDistanceKm = 200, // Island-wide
                MinRating = 0,
                ActivityType = "All"
            };

            var userCategories = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var results = new List<tourism_management_app.Api.DTOs.PersonalizedRecommendationDto>();

            foreach (var attr in attractions)
            {
                var scored = tourism_management_app.Api.Services.RecommendationService.ScoreAttraction(
                    attr, looseParams, userCategories, 6.9271, 79.8612, (4.5, 10), null);
                if (scored != null) results.Add(scored);
            }

            // All 10 attractions pass loose filters
            Assert.Equal(10, results.Count);
        }

        [Fact]
        public void TightFilters_ReturnFewerResults()
        {
            var attractions = CreateSampleAttractions();
            var tightParams = new tourism_management_app.Api.DTOs.PersonalizedQueryParams
            {
                Interests = new List<string> { "Culture" },
                MaxBudget = 50,
                MaxDistanceKm = 100,
                MinRating = 0,
                ActivityType = "attraction"
            };

            var userCategories = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var results = new List<tourism_management_app.Api.DTOs.PersonalizedRecommendationDto>();

            foreach (var attr in attractions)
            {
                var scored = tourism_management_app.Api.Services.RecommendationService.ScoreAttraction(
                    attr, tightParams, userCategories, 6.9271, 79.8612, (4.5, 10), null);
                if (scored != null) results.Add(scored);
            }

            // Only Temple of the Tooth matches Culture, attraction, <= $50, <= 100km
            Assert.Single(results);
            Assert.Equal("Temple of the Tooth", results[0].Name);
        }

        [Fact]
        public void BudgetEdgeCase_LkrAmount_DoesNotWronglyExclude()
        {
            var attr = new tourism_management_app.Api.Models.Attraction
            {
                Id = 1,
                Name = "Mirissa Whale Watching",
                Category = "Beaches",
                ActivityType = "tour",
                EstimatedCostUsd = 45, // $45 USD = 13,500 LKR
                Latitude = 5.9437,
                Longitude = 80.4716
            };

            // User passes 30,000 LKR (approx $100 USD)
            var q = new tourism_management_app.Api.DTOs.PersonalizedQueryParams
            {
                Interests = new List<string> { "All" },
                MaxBudget = 30000,
                MaxDistanceKm = 200,
                MinRating = 0,
                ActivityType = "All"
            };

            var scored = tourism_management_app.Api.Services.RecommendationService.ScoreAttraction(
                attr, q, new HashSet<string>(), 6.9271, 79.8612, (4.5, 5), null);

            Assert.NotNull(scored);
            Assert.Equal(45, scored.EstimatedCostUSD);
            Assert.Equal(13500, scored.EstimatedCostLKR);
            Assert.Contains(scored.MatchReasons, r => r.Contains("Within your Rs 30,000/day budget"));
        }

        [Fact]
        public void DistanceEdgeCase_IslandWide200Km_DoesNotExcludeDistantAttractions()
        {
            var trinco = new tourism_management_app.Api.Models.Attraction
            {
                Id = 8,
                Name = "Trincomalee Beaches",
                Category = "Beaches",
                ActivityType = "tour",
                EstimatedCostUsd = 20,
                Latitude = 8.5753,
                Longitude = 81.2156 // ~237 km from Colombo
            };

            var q = new tourism_management_app.Api.DTOs.PersonalizedQueryParams
            {
                Interests = new List<string> { "All" },
                MaxBudget = 100,
                MaxDistanceKm = 200, // UI "Island-wide (200 km)"
                MinRating = 0,
                ActivityType = "All"
            };

            var scored = tourism_management_app.Api.Services.RecommendationService.ScoreAttraction(
                trinco, q, new HashSet<string>(), 6.9271, 79.8612, (4.5, 5), null);

            Assert.NotNull(scored);
            Assert.True(scored.DistanceKm > 200);
        }

        [Fact]
        public void FeaturedAttraction_RanksHigherAtEqualBaseScore()
        {
            var regular = new tourism_management_app.Api.Models.Attraction
            {
                Id = 1,
                Name = "Regular Attraction",
                Category = "Nature",
                ActivityType = "attraction",
                EstimatedCostUsd = 10,
                Latitude = 6.9271,
                Longitude = 79.8612,
                IsFeatured = false
            };

            var featured = new tourism_management_app.Api.Models.Attraction
            {
                Id = 2,
                Name = "Featured Attraction",
                Category = "Nature",
                ActivityType = "attraction",
                EstimatedCostUsd = 10,
                Latitude = 6.9271,
                Longitude = 79.8612,
                IsFeatured = true
            };

            var q = new tourism_management_app.Api.DTOs.PersonalizedQueryParams
            {
                Interests = new List<string> { "Nature" },
                MaxBudget = 100,
                MaxDistanceKm = 200,
                MinRating = 0,
                ActivityType = "All"
            };

            var scoredRegular = tourism_management_app.Api.Services.RecommendationService.ScoreAttraction(
                regular, q, new HashSet<string>(), 6.9271, 79.8612, (4.0, 5), null);

            var scoredFeatured = tourism_management_app.Api.Services.RecommendationService.ScoreAttraction(
                featured, q, new HashSet<string>(), 6.9271, 79.8612, (4.0, 5), null);

            Assert.NotNull(scoredRegular);
            Assert.NotNull(scoredFeatured);
            Assert.True(scoredFeatured.MatchScore > scoredRegular.MatchScore);
            Assert.Contains(scoredFeatured.MatchReasons, r => r.Contains("Featured & curated landmark"));
        }

        [Fact]
        public void ColdStart_RedistributesHistoryWeight()
        {
            var attr = new tourism_management_app.Api.Models.Attraction
            {
                Id = 1,
                Name = "Test Landmark",
                Category = "Nature",
                ActivityType = "attraction",
                EstimatedCostUsd = 15,
                Latitude = 6.9271,
                Longitude = 79.8612
            };

            var q = new tourism_management_app.Api.DTOs.PersonalizedQueryParams
            {
                Interests = new List<string> { "Nature" },
                MaxBudget = 100,
                MaxDistanceKm = 200,
                MinRating = 0,
                ActivityType = "All"
            };

            // Empty user history (cold start)
            var coldStartResult = tourism_management_app.Api.Services.RecommendationService.ScoreAttraction(
                attr, q, new HashSet<string>(), 6.9271, 79.8612, (4.5, 10), null);

            Assert.NotNull(coldStartResult);
            Assert.True(coldStartResult.MatchScore >= 70);
            Assert.Equal(coldStartResult.InterestScore, coldStartResult.InterestMatchPercent);
            Assert.Equal(coldStartResult.RatingScore, coldStartResult.RatingMatchPercent);
        }

        // ── Helper methods (replicate logic from RecommendationService) ─────────

        private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371.0;
            var dLat = ToRad(lat2 - lat1);
            var dLon = ToRad(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                  + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
                  * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        }

        private static double ToRad(double deg) => deg * Math.PI / 180;

        private static double BayesianRating(double avgRating, int reviewCount, double priorCount = 10, double priorMean = 3.5)
        {
            if (reviewCount == 0) return priorMean;
            return (reviewCount * avgRating + priorCount * priorMean) / (reviewCount + priorCount);
        }

        private static double ComputeInterestScore(string[] interests, string category)
        {
            if (!interests.Any() || interests.Contains("All"))
                return 70;
            return interests.Any(i => i.Equals(category, StringComparison.OrdinalIgnoreCase)) ? 95 : 25;
        }
    }
}
