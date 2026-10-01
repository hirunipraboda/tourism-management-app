using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using tourism_management_app.Api.Data;
using tourism_management_app.Api.DTOs;
using tourism_management_app.Api.Models;

namespace tourism_management_app.Api.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly ScoringOptions _opts;

        private const string PopularCacheKey = "popular_recommendations";
        private const string InsightsCacheKey = "recommendation_insights";

        public RecommendationService(AppDbContext context, IMemoryCache cache, IOptions<ScoringOptions> opts)
        {
            _context = context;
            _cache = cache;
            _opts = opts.Value;
        }

        // ── Haversine Distance (km) ────────────────────────────────────────────
        public static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
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

        // ── Bayesian weighted rating (smooths low-review-count attractions) ────
        public static double ComputeBayesianRating(double avgRating, int reviewCount, double priorCount = 10, double priorMean = 3.5)
        {
            if (reviewCount == 0) return priorMean;
            return (reviewCount * avgRating + priorCount * priorMean) / (reviewCount + priorCount);
        }

        private double BayesianRating(double avgRating, int reviewCount)
        {
            return ComputeBayesianRating(avgRating, reviewCount, _opts.BayesianPriorCount, _opts.BayesianGlobalMean);
        }

        // ── Load all attraction review stats in a single query (thread-safe) ────
        private async Task<Dictionary<int, (double AvgRating, int ReviewCount)>> GetAllReviewStatsMapAsync()
        {
            var reviews = await _context.Reviews
                .Where(r => r.EntityType == "Attraction")
                .Select(r => new { r.EntityId, r.Rating })
                .ToListAsync();

            return reviews
                .GroupBy(r => r.EntityId)
                .ToDictionary(
                    g => g.Key,
                    g => (g.Average(r => r.Rating), g.Count())
                );
        }

        // ── Score a single attraction against filters + user history (Synchronous / In-Memory) ───
        public PersonalizedRecommendationDto? ScoreAttraction(
            Models.Attraction attr,
            PersonalizedQueryParams q,
            HashSet<string> userCategories,
            double userLat,
            double userLng,
            (double AvgRating, int ReviewCount) stats)
            => ScoreAttraction(attr, q, userCategories, userLat, userLng, stats, _opts);

        public static PersonalizedRecommendationDto? ScoreAttraction(
            Models.Attraction attr,
            PersonalizedQueryParams q,
            HashSet<string> userCategories,
            double userLat,
            double userLng,
            (double AvgRating, int ReviewCount) stats,
            ScoringOptions? opts)
        {
            var scoringOpts = opts ?? new ScoringOptions();

            // Hard filter: excluded by admin from recommendations
            if (attr.IsExcludedFromRecommendations)
                return null;

            var (avgRating, reviewCount) = stats;

            // Hard filter: minimum rating (0 = any rating; unrated attractions pass if MinRating == 0)
            if (q.MinRating > 0 && (reviewCount == 0 || avgRating < q.MinRating))
                return null;

            // Hard filter: activity type (case-insensitive, "All" means no filter)
            if (!string.IsNullOrWhiteSpace(q.ActivityType) && !q.ActivityType.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                if (!attr.ActivityType.Equals(q.ActivityType, StringComparison.OrdinalIgnoreCase))
                    return null;
            }

            // Hard filter: budget (support both USD e.g. <= 200 and LKR e.g. >= 500)
            double effectiveBudgetUsd = q.MaxBudget;
            if (q.MaxBudget >= 500)
            {
                // Converted from LKR (Rs) to USD
                effectiveBudgetUsd = q.MaxBudget / 300.0;
            }
            if (effectiveBudgetUsd > 0 && attr.EstimatedCostUsd > effectiveBudgetUsd)
                return null;

            // Haversine distance
            var distanceKm = HaversineKm(userLat, userLng, attr.Latitude, attr.Longitude);
            // In UI, 200km is "Island-wide (200 km)" so don't exclude valid island destinations when >= 200 or <= 0
            if (q.MaxDistanceKm > 0 && q.MaxDistanceKm < 200 && distanceKm > q.MaxDistanceKm)
                return null;

            // Hard filter: interest overlap
            // If empty, null, or contains "All" / "All Interests", no filter is applied.
            var activeInterests = (q.Interests ?? new List<string>())
                .Where(i => !string.IsNullOrWhiteSpace(i) &&
                            !i.Equals("All", StringComparison.OrdinalIgnoreCase) &&
                            !i.Equals("All Interests", StringComparison.OrdinalIgnoreCase))
                .ToList();

            bool hasInterestFilter = activeInterests.Any();
            bool matchesInterest = hasInterestFilter && activeInterests.Any(i => i.Equals(attr.Category, StringComparison.OrdinalIgnoreCase));

            // Hard filter: if specific interests are selected, require at least one match (overlap)
            if (hasInterestFilter && !matchesInterest)
                return null;

            // ── Component Scores (0-100) ────────────────────────────────────────

            // 1. Interest match (30%)
            double interestScore;
            if (!hasInterestFilter)
                interestScore = 80; // neutral baseline when "All Interests" selected
            else
                interestScore = matchesInterest ? 95 : 25;

            // 2. Bayesian rating score (25%)
            var bayesian = ComputeBayesianRating(reviewCount > 0 ? avgRating : scoringOpts.BayesianGlobalMean, reviewCount, scoringOpts.BayesianPriorCount, scoringOpts.BayesianGlobalMean);
            var ratingScore = Math.Min(100, Math.Max(0, (bayesian / 5.0) * 100));

            // 3. Budget fit (15%) — closer to budget cap or free = higher score
            double budgetScore;
            if (effectiveBudgetUsd <= 0 || attr.EstimatedCostUsd <= 0)
            {
                budgetScore = 90; // Free entry is an excellent fit
            }
            else
            {
                var budgetRatio = attr.EstimatedCostUsd / effectiveBudgetUsd;
                budgetScore = budgetRatio <= 0.5 ? 95
                            : budgetRatio <= 0.8 ? 85
                            : budgetRatio <= 1.0 ? 70
                            : 25;
            }

            // 4. Distance score (15%) — closer = higher
            double distanceScore;
            if (distanceKm <= 5) distanceScore = 100;
            else if (distanceKm <= 50) distanceScore = 90;
            else if (distanceKm <= 100) distanceScore = 80;
            else if (distanceKm <= 150) distanceScore = 70;
            else if (distanceKm <= 200) distanceScore = 60;
            else distanceScore = 50;

            // 5. Popularity score (10%) — review count as proxy
            var popularityScore = Math.Min(100, reviewCount * 10.0);

            // 6. User history affinity (5%) — if user reviewed this category before
            bool hasHistory = userCategories != null && userCategories.Count > 0;
            bool historyMatch = hasHistory && userCategories!.Contains(attr.Category);
            var historyScore = historyMatch ? 90.0 : 40.0;

            // Cold-start redistribution: if user has no review history, redistribute 5% history weight into rating (+2.5%) and popularity (+2.5%)
            double interestWeight = 0.30;
            double ratingWeight = hasHistory ? 0.25 : 0.275;
            double budgetWeight = 0.15;
            double distanceWeight = 0.15;
            double popularityWeight = hasHistory ? 0.10 : 0.125;
            double historyWeight = hasHistory ? 0.05 : 0.0;

            var composite = interestScore * interestWeight
                          + ratingScore   * ratingWeight
                          + budgetScore   * budgetWeight
                          + distanceScore * distanceWeight
                          + popularityScore * popularityWeight
                          + (hasHistory ? historyScore * historyWeight : 0);

            // If featured by admin, give significant match boost
            if (attr.IsFeatured)
            {
                composite = Math.Min(100, Math.Max(composite + 20, 92));
            }

            var matchScore = Math.Clamp(Math.Round(composite, 1), 0, 100);

            // ── Dynamic Match reasons based on actual contributing factors ───────
            var reasons = new List<string>();
            if (attr.IsFeatured)
            {
                reasons.Add("Featured & curated landmark");
            }

            if (matchesInterest || (!hasInterestFilter && interestScore >= 75))
            {
                reasons.Add($"Top-rated {attr.Category} destination");
            }

            if (effectiveBudgetUsd > 0 && attr.EstimatedCostUsd <= effectiveBudgetUsd)
            {
                var effectiveBudgetLkr = Math.Round(effectiveBudgetUsd * 300);
                reasons.Add($"Within your Rs {effectiveBudgetLkr:N0}/day budget");
            }
            else if (attr.EstimatedCostUsd == 0)
            {
                reasons.Add("Free entry destination");
            }

            if (distanceKm <= 5)
            {
                reasons.Add("0 km away");
            }
            else if (distanceKm <= 120)
            {
                reasons.Add($"{Math.Round(distanceKm):F0} km away");
            }

            if (historyMatch)
            {
                reasons.Add("Aligns with places you've loved");
            }

            if (avgRating >= 4.0 && reviewCount > 0)
            {
                reasons.Add($"{avgRating:F1}★ across {reviewCount} reviews");
            }
            else if (popularityScore >= 50 && reviewCount >= 5)
            {
                reasons.Add("Popular with travellers");
            }

            if (!reasons.Any())
            {
                reasons.Add("Recommended based on overall suitability");
            }

            return new PersonalizedRecommendationDto
            {
                AttractionId = attr.Id,
                Name = attr.Name,
                Category = attr.Category,
                ActivityType = attr.ActivityType,
                ImageUrl = attr.ImageUrl,
                Location = attr.Destination?.Name ?? "Sri Lanka",
                AvgRating = reviewCount > 0 ? Math.Round(avgRating, 2) : 0,
                ReviewCount = reviewCount,
                EstimatedCost = attr.EstimatedCostUsd,
                EstimatedCostUSD = attr.EstimatedCostUsd,
                EstimatedCostLKR = (int)Math.Round(attr.EstimatedCostUsd * 300.0),
                DistanceKm = Math.Round(distanceKm, 1),
                MatchScore = matchScore,
                MatchReasons = reasons,
                InterestScore = Math.Round(interestScore, 1),
                RatingScore = Math.Round(ratingScore, 1),
                InterestMatchPercent = Math.Round(interestScore, 1),
                RatingMatchPercent = Math.Round(ratingScore, 1),
                BudgetScore = Math.Round(budgetScore, 1),
                DistanceScore = Math.Round(distanceScore, 1),
                PopularityScore = Math.Round(popularityScore, 1),
                HistoryAffinityScore = Math.Round(historyScore, 1),
                Description = attr.Description,
                OpeningHours = attr.OpeningHours,
                BestTimeToVisit = attr.BestTimeToVisit,
                Duration = attr.Duration,
            };
        }

        // ── User category affinity from review history ────────────────────────
        private async Task<HashSet<string>> GetUserCategoriesAsync(int touristId)
        {
            if (touristId <= 0) return new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            var reviewedIds = await _context.Reviews
                .Where(r => r.TouristId == touristId && r.EntityType == "Attraction" && r.Rating >= 4)
                .Select(r => r.EntityId)
                .Distinct()
                .ToListAsync();

            var categories = await _context.Attractions
                .Where(a => reviewedIds.Contains(a.Id))
                .Select(a => a.Category)
                .ToListAsync();

            return new HashSet<string>(categories, StringComparer.OrdinalIgnoreCase);
        }

        // ── Public API ─────────────────────────────────────────────────────────

        public async Task<IEnumerable<PersonalizedRecommendationDto>> GetPersonalizedRecommendationsAsync(
            PersonalizedQueryParams q, int touristId)
        {
            var attractions = await _context.Attractions.Include(a => a.Destination).ToListAsync();

            // Cold-start: no attractions yet → empty list (Program.cs seeds on startup)
            if (!attractions.Any()) return Enumerable.Empty<PersonalizedRecommendationDto>();

            var userCategories = await GetUserCategoriesAsync(touristId);
            var statsMap = await GetAllReviewStatsMapAsync();

            var scored = attractions
                .Select(a =>
                {
                    statsMap.TryGetValue(a.Id, out var stats);
                    return ScoreAttraction(a, q, userCategories, q.UserLat, q.UserLng, stats);
                })
                .Where(r => r != null)
                .Cast<PersonalizedRecommendationDto>()
                .OrderByDescending(r => r.MatchScore)
                .Take(q.Limit)
                .ToList();

            // Cold start: no scored results → fall back to popular
            if (!scored.Any())
                return await GetPopularRecommendationsAsync(q.Limit);

            return scored;
        }

        public async Task<IEnumerable<PersonalizedRecommendationDto>> GetPopularRecommendationsAsync(int limit = 10)
        {
            if (_cache.TryGetValue(PopularCacheKey, out IEnumerable<PersonalizedRecommendationDto>? cached) && cached != null)
                return cached.Take(limit);

            var neutralParams = new PersonalizedQueryParams
            {
                MaxBudget = 9999,
                MaxDistanceKm = 9999,
                MinRating = 0,
                ActivityType = "All",
                Limit = 50
            };

            var attractions = await _context.Attractions.Include(a => a.Destination).ToListAsync();
            var emptyHistory = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var statsMap = await GetAllReviewStatsMapAsync();

            var scored = attractions
                .Select(a =>
                {
                    statsMap.TryGetValue(a.Id, out var stats);
                    return ScoreAttraction(a, neutralParams, emptyHistory, neutralParams.UserLat, neutralParams.UserLng, stats);
                })
                .Where(r => r != null)
                .Cast<PersonalizedRecommendationDto>()
                // For popular: rank by Bayesian rating * log(review count + 1)
                .OrderByDescending(r => r.RatingScore * Math.Log(r.ReviewCount + 1 + 1))
                .ThenByDescending(r => r.MatchScore)
                .ToList();

            _cache.Set(PopularCacheKey, scored, TimeSpan.FromMinutes(_opts.PopularCacheMinutes));
            return scored.Take(limit);
        }

        public async Task<InsightsDto> GetInsightsAsync()
        {
            if (_cache.TryGetValue(InsightsCacheKey, out InsightsDto? cached) && cached != null)
                return cached;

            var result = await ComputeInsightsAsync();
            _cache.Set(InsightsCacheKey, result, TimeSpan.FromMinutes(_opts.InsightsCacheMinutes));
            return result;
        }

        private async Task<InsightsDto> ComputeInsightsAsync()
        {
            var attractions = await _context.Attractions.Include(a => a.Destination).ToListAsync();

            var statsMap = await GetAllReviewStatsMapAsync();
            var attrStats = new List<(Models.Attraction Attr, double AvgRating, int ReviewCount)>();
            foreach (var attr in attractions)
            {
                statsMap.TryGetValue(attr.Id, out var stats);
                attrStats.Add((attr, stats.AvgRating, stats.ReviewCount));
            }

            var withReviews = attrStats.Where(x => x.ReviewCount > 0).ToList();

            // Top recommended attraction
            var top = withReviews
                .OrderByDescending(x => BayesianRating(x.AvgRating, x.ReviewCount))
                .ThenByDescending(x => x.ReviewCount)
                .FirstOrDefault();

            // Most popular category (by review count)
            var categoryGroups = withReviews
                .GroupBy(x => x.Attr.Category)
                .Select(g => (Category: g.Key, Count: g.Sum(x => x.ReviewCount), AvgRating: g.Average(x => x.AvgRating)))
                .OrderByDescending(x => x.Count)
                .ToList();

            var mostPopularCategory = categoryGroups.FirstOrDefault().Category ?? "Attractions";

            // Trending destination (most recent review activity)
            var recentAttractionId = await _context.Reviews
                .Where(r => r.EntityType == "Attraction")
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => r.EntityId)
                .FirstOrDefaultAsync();

            var trendingAttr = attractions.FirstOrDefault(a => a.Id == recentAttractionId);
            var trendingDestination = trendingAttr?.Destination?.Name ?? trendingAttr?.Name ?? "Sri Lanka";

            // Average recommendation match (average Bayesian score / 5 * 100)
            var avgMatch = withReviews.Any()
                ? withReviews.Average(x => BayesianRating(x.AvgRating, x.ReviewCount) / 5.0 * 100)
                : 0;

            // Most popular activities
            var popularActivities = withReviews
                .OrderByDescending(x => x.ReviewCount)
                .Take(5)
                .Select(x => new ActivityInsightItem
                {
                    Name = x.Attr.Name,
                    Count = x.ReviewCount,
                    Category = x.Attr.Category
                })
                .ToList();

            // Highest rated
            var highestRated = withReviews
                .OrderByDescending(x => BayesianRating(x.AvgRating, x.ReviewCount))
                .Take(5)
                .Select(x => new AttractionInsightItem
                {
                    Name = x.Attr.Name,
                    Rating = Math.Round(x.AvgRating, 1),
                    Reviews = x.ReviewCount,
                    Badge = x.AvgRating >= 4.8 ? "Top Rated" : x.AvgRating >= 4.5 ? "Highly Rated" : "Well Rated"
                })
                .ToList();

            // Category distribution
            var totalReviews = attrStats.Sum(x => x.ReviewCount);
            var frequentCategories = categoryGroups
                .Take(6)
                .Select(g => new CategoryInsightItem
                {
                    Name = g.Category,
                    Count = g.Count,
                    Percentage = totalReviews > 0 ? Math.Round(g.Count * 100.0 / totalReviews, 1) : 0
                })
                .ToList();

            // If no data, add placeholder categories
            if (!frequentCategories.Any())
            {
                var allCategories = new[] { "Culture", "History", "Nature", "Adventure", "Beaches", "Wildlife" };
                frequentCategories = allCategories.Select((c, i) => new CategoryInsightItem
                {
                    Name = c, Count = 0, Percentage = 0
                }).ToList();
            }

            // Average suitability by category
            var avgSuitability = attrStats
                .GroupBy(x => x.Attr.Category)
                .Select(g => new SuitabilityScoreItem
                {
                    Category = g.Key,
                    Score = g.Any(x => x.ReviewCount > 0)
                        ? Math.Round(g.Where(x => x.ReviewCount > 0).Average(x => BayesianRating(x.AvgRating, x.ReviewCount) / 5.0 * 100), 1)
                        : 60
                })
                .ToList();

            return new InsightsDto
            {
                TopRecommendedAttraction = withReviews.Any() ? top.Attr.Name : "No data yet",
                MostPopularCategory = mostPopularCategory,
                TrendingDestination = trendingDestination,
                AverageRecommendationMatch = Math.Round(avgMatch, 1),
                MostPopularActivities = popularActivities,
                HighestRatedAttractions = highestRated,
                FrequentlySelectedCategories = frequentCategories,
                AverageSuitabilityScores = avgSuitability
            };
        }

        public async Task<SuitabilityDto> GetSuitabilityAsync(int attractionId, PersonalizedQueryParams q, int touristId)
        {
            var attr = await _context.Attractions.Include(a => a.Destination)
                .FirstOrDefaultAsync(a => a.Id == attractionId);

            if (attr == null)
                return new SuitabilityDto { AttractionId = attractionId, Verdict = "Not found", OverallScore = 0 };

            var userCategories = await GetUserCategoriesAsync(touristId);
            var statsMap = await GetAllReviewStatsMapAsync();
            statsMap.TryGetValue(attr.Id, out var stats);
            var scored = ScoreAttraction(attr, q, userCategories, q.UserLat, q.UserLng, stats);

            if (scored == null)
                return new SuitabilityDto { AttractionId = attractionId, Name = attr.Name, Verdict = "Filtered out by your criteria", OverallScore = 0 };

            var verdict = scored.MatchScore >= 80 ? "Excellent Match"
                        : scored.MatchScore >= 65 ? "Good Match"
                        : scored.MatchScore >= 50 ? "Moderate Match"
                        : "Low Match";

            return new SuitabilityDto
            {
                AttractionId = attractionId,
                Name = attr.Name,
                OverallScore = scored.MatchScore,
                Verdict = verdict,
                Criteria = new List<SuitabilityCriterion>
                {
                    new() { Name = "Interest Match", Score = scored.InterestScore, Weight = _opts.InterestWeight,
                        Reason = $"Category '{attr.Category}' vs your interests" },
                    new() { Name = "Rating Quality", Score = scored.RatingScore, Weight = _opts.RatingWeight,
                        Reason = scored.ReviewCount > 0 ? $"{scored.AvgRating:F1}★ from {scored.ReviewCount} reviews" : "No reviews yet" },
                    new() { Name = "Budget Fit", Score = scored.BudgetScore, Weight = _opts.BudgetWeight,
                        Reason = $"${attr.EstimatedCostUsd} estimated vs ${q.MaxBudget} max budget" },
                    new() { Name = "Distance", Score = scored.DistanceScore, Weight = _opts.DistanceWeight,
                        Reason = $"{scored.DistanceKm} km from your base location" },
                    new() { Name = "Popularity", Score = scored.PopularityScore, Weight = _opts.PopularityWeight,
                        Reason = $"{scored.ReviewCount} reviews from travellers" },
                    new() { Name = "Your History Affinity", Score = scored.HistoryAffinityScore, Weight = _opts.HistoryAffinityWeight,
                        Reason = scored.HistoryAffinityScore >= 80 ? "You've enjoyed similar categories before" : "New category for you" },
                }
            };
        }

        // ── Agent Tool Backends ────────────────────────────────────────────────

        public Task<IEnumerable<PersonalizedRecommendationDto>> SearchAttractionsAsync(PersonalizedQueryParams q)
            => GetPersonalizedRecommendationsAsync(q, 0);

        public Task<IEnumerable<PersonalizedRecommendationDto>> GetPopularAttractionsForAgentAsync()
            => GetPopularRecommendationsAsync(6);

        public Task<InsightsDto> GetReviewInsightsAsync(int? attractionId = null)
            => GetInsightsAsync();

        public Task<SuitabilityDto?> GetSuitabilityForAgentAsync(int attractionId, PersonalizedQueryParams q, int touristId)
            => GetSuitabilityAsync(attractionId, q, touristId)!;

        public async Task<IEnumerable<UserHistoryItem>> GetUserReviewHistoryAsync(int touristId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.TouristId == touristId && r.EntityType == "Attraction")
                .OrderByDescending(r => r.CreatedAt)
                .Take(20)
                .ToListAsync();

            var result = new List<UserHistoryItem>();
            foreach (var r in reviews)
            {
                var attr = await _context.Attractions.FindAsync(r.EntityId);
                if (attr != null)
                    result.Add(new UserHistoryItem(attr.Id, attr.Name, attr.Category, r.Rating, r.CreatedAt));
            }
            return result;
        }

        public async Task<bool> AttractionExistsAsync(int attractionId)
            => await _context.Attractions.AnyAsync(a => a.Id == attractionId);

        public async Task<PersonalizedRecommendationDto> CreateRecommendationAsync(CreateRecommendationDto dto)
        {
            var destName = string.IsNullOrWhiteSpace(dto.DestinationName) ? "Sri Lanka" : dto.DestinationName.Trim();
            var destination = await _context.Destinations.FirstOrDefaultAsync(d => d.Name.ToLower() == destName.ToLower());
            if (destination == null)
            {
                destination = new Destination { Name = destName };
                _context.Destinations.Add(destination);
                await _context.SaveChangesAsync();
            }

            var attraction = new Attraction
            {
                Name = dto.Name.Trim(),
                DestinationId = destination.Id,
                Category = string.IsNullOrWhiteSpace(dto.Category) ? "Nature" : dto.Category.Trim(),
                ActivityType = string.IsNullOrWhiteSpace(dto.ActivityType) ? "attraction" : dto.ActivityType.Trim().ToLower(),
                ImageUrl = string.IsNullOrWhiteSpace(dto.ImageUrl)
                    ? "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80"
                    : dto.ImageUrl.Trim(),
                EstimatedCostUsd = dto.EstimatedCostUsd,
                Latitude = dto.Latitude != 0 ? dto.Latitude : 7.8731,
                Longitude = dto.Longitude != 0 ? dto.Longitude : 80.7718,
                Description = dto.Description ?? string.Empty,
                OpeningHours = dto.OpeningHours ?? "Open Daily",
                BestTimeToVisit = dto.BestTimeToVisit ?? "Year-round",
                Duration = dto.Duration ?? "2 - 4 hours",
                IsFeatured = dto.IsFeatured,
                IsExcludedFromRecommendations = false
            };

            _context.Attractions.Add(attraction);
            await _context.SaveChangesAsync();

            // Seed an initial official 5-star review so it immediately ranks with glowing metrics
            var tourist = await _context.Tourists.FirstOrDefaultAsync();

            if (tourist != null)
            {
                var initialReview = new Review
                {
                    EntityType = "Attraction",
                    EntityId = attraction.Id,
                    TouristId = tourist.Id,
                    Rating = dto.InitialRating > 0 ? (int)Math.Clamp(Math.Round(dto.InitialRating), 1, 5) : 5,
                    Comment = "Hand-picked and curated top recommendation by the Sri Lanka Tourism Administration.",
                    Title = "Admin Curated Pick",
                    HelpfulCount = 3,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Reviews.Add(initialReview);
                await _context.SaveChangesAsync();
            }

            // Invalidate recommendation caches so new item appears instantly
            _cache.Remove(PopularCacheKey);
            _cache.Remove(InsightsCacheKey);

            return new PersonalizedRecommendationDto
            {
                AttractionId = attraction.Id,
                Name = attraction.Name,
                Category = attraction.Category,
                ActivityType = attraction.ActivityType,
                ImageUrl = attraction.ImageUrl,
                Location = destination.Name,
                AvgRating = dto.InitialRating > 0 ? dto.InitialRating : 5.0,
                ReviewCount = 1,
                EstimatedCost = attraction.EstimatedCostUsd,
                DistanceKm = 10.0,
                MatchScore = 98.0,
                MatchReasons = new List<string> { "⭐ Featured & Curated Landmark", $"Top-rated {attraction.Category} destination" },
                InterestScore = 98.0,
                RatingScore = 98.0,
                BudgetScore = 95.0,
                DistanceScore = 90.0,
                PopularityScore = 90.0,
                Description = attraction.Description,
                OpeningHours = attraction.OpeningHours,
                BestTimeToVisit = attraction.BestTimeToVisit,
                Duration = attraction.Duration
            };
        }
    }
}
