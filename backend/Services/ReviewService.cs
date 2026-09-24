using Microsoft.EntityFrameworkCore;
using tourism_management_app.Api.Data;
using tourism_management_app.Api.DTOs;
using tourism_management_app.Api.Models;

namespace tourism_management_app.Api.Services
{
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ReviewResponseDto> CreateReviewAsync(int touristId, ReviewCreateDto reviewDto)
        {
            var entityId = reviewDto.EntityId;
            if (entityId <= 0 && !string.IsNullOrWhiteSpace(reviewDto.EntityName))
            {
                entityId = reviewDto.EntityType.ToLowerInvariant() switch
                {
                    "attraction" => (await _context.Attractions.FirstOrDefaultAsync(a => a.Name == reviewDto.EntityName))?.Id ?? 0,
                    "destination" => (await _context.Destinations.FirstOrDefaultAsync(d => d.Name == reviewDto.EntityName))?.Id ?? 0,
                    "tourpackage" => (await _context.TourPackages.FirstOrDefaultAsync(t => t.Name == reviewDto.EntityName))?.Id ?? 0,
                    _ => 0
                };
            }

            if (entityId <= 0)
            {
                entityId = 1;
            }

            var review = new Review
            {
                TouristId = touristId,
                EntityId = entityId,
                EntityType = reviewDto.EntityType,
                Rating = reviewDto.Rating,
                Title = reviewDto.Title ?? string.Empty,
                Comment = reviewDto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return await MapToResponseDto(review);
        }

        public async Task<bool> DeleteReviewAsync(int id, int touristId)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id);
            if (review == null)
            {
                return false;
            }

            // Allow if current tourist is author or admin/default user (touristId 1)
            if (touristId > 0 && review.TouristId != touristId && touristId != 1)
            {
                return false;
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<(int HelpfulCount, bool IsHelpfulByUser)?> ToggleHelpfulAsync(int id, int touristId)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(review => review.Id == id);
            if (review == null) return null;

            var vote = await _context.ReviewHelpfulVotes
                .FirstOrDefaultAsync(existing => existing.ReviewId == id && existing.TouristId == touristId);
            var isHelpfulByUser = vote == null;

            if (vote == null)
            {
                _context.ReviewHelpfulVotes.Add(new ReviewHelpfulVote
                {
                    ReviewId = id,
                    TouristId = touristId
                });
            }
            else
            {
                _context.ReviewHelpfulVotes.Remove(vote);
            }

            await _context.SaveChangesAsync();

            var newVoteCount = await _context.ReviewHelpfulVotes.CountAsync(existing => existing.ReviewId == id);
            return (review.HelpfulCount + newVoteCount, isHelpfulByUser);
        }

        public async Task<AnalyticsDto> GetAnalyticsAsync()
        {
            var totalReviews = await _context.Reviews.CountAsync();
            var averageRating = totalReviews > 0 ? await _context.Reviews.AverageAsync(r => r.Rating) : 0;
            
            var positiveReviews = await _context.Reviews.CountAsync(r => r.Rating >= 4);
            var customerSatisfaction = totalReviews > 0 ? (positiveReviews * 100.0 / totalReviews) : 0;

            var allAttractions = await _context.Attractions.ToListAsync();
            
            var attractionsWithStats = new List<object>();
            foreach (var attr in allAttractions)
            {
                var attrReviews = await _context.Reviews
                    .Where(r => r.EntityType == "Attraction" && r.EntityId == attr.Id)
                    .ToListAsync();

                if (attrReviews.Any())
                {
                    attractionsWithStats.Add(new { 
                        attr.Id, 
                        attr.Name, 
                        TotalReviews = attrReviews.Count, 
                        AverageRating = attrReviews.Average(r => r.Rating) 
                    });
                }
            }

            var popular = attractionsWithStats
                .OrderByDescending(a => ((dynamic)a).AverageRating)
                .ThenByDescending(a => ((dynamic)a).TotalReviews)
                .Take(5);

            var lowRated = attractionsWithStats
                .Where(a => ((dynamic)a).AverageRating <= 2.5)
                .OrderBy(a => ((dynamic)a).AverageRating)
                .Take(5);

            var recentReviews = await _context.Reviews
                .Include(r => r.Tourist)
                .OrderByDescending(r => r.CreatedAt)
                .Take(10)
                .ToListAsync();

            var recentReviewDtos = new List<ReviewResponseDto>();
            foreach(var r in recentReviews)
            {
                recentReviewDtos.Add(await MapToResponseDto(r));
            }

            return new AnalyticsDto
            {
                TotalReviews = totalReviews,
                AverageRating = averageRating,
                CustomerSatisfactionPercentage = customerSatisfaction,
                PopularAttractions = popular,
                LowRatedAttractions = lowRated,
                RecentReviews = recentReviewDtos
            };
        }

        public async Task<ReviewSummaryDto> GetEntityReviewSummaryAsync(string entityType, int entityId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.EntityType == entityType && r.EntityId == entityId)
                .ToListAsync();

            var summary = new ReviewSummaryDto
            {
                EntityId = entityId,
                EntityType = entityType,
                TotalReviews = reviews.Count,
                AverageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0
            };

            for (int i = 1; i <= 5; i++)
            {
                summary.RatingDistribution[i] = reviews.Count(r => r.Rating == i);
            }

            return summary;
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetAllReviewsAsync(string? entityType, int? minRating, string? search)
        {
            var query = _context.Reviews.Include(r => r.Tourist).AsQueryable();

            if (!string.IsNullOrWhiteSpace(entityType))
                query = query.Where(r => r.EntityType.ToLower() == entityType.ToLower());

            if (minRating.HasValue && minRating > 0)
                query = query.Where(r => r.Rating >= minRating.Value);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(r => (r.Title != null && r.Title.Contains(search)) || r.Comment.Contains(search));

            var reviews = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();

            var dtos = new List<ReviewResponseDto>();
            foreach (var review in reviews)
                dtos.Add(await MapToResponseDto(review));

            return dtos;
        }

        public async Task<ReviewResponseDto?> GetReviewByIdAsync(int id)
        {
            var review = await _context.Reviews.Include(r => r.Tourist).FirstOrDefaultAsync(r => r.Id == id);
            if (review == null) return null;
            return await MapToResponseDto(review);
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetReviewsByEntityAsync(string entityType, int entityId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Tourist)
                .Where(r => r.EntityType == entityType && r.EntityId == entityId)
                .ToListAsync();

            var dtos = new List<ReviewResponseDto>();
            foreach (var review in reviews)
            {
                dtos.Add(await MapToResponseDto(review));
            }
            return dtos;
        }

        public async Task<ReviewResponseDto?> UpdateReviewAsync(int id, int touristId, ReviewUpdateDto reviewDto)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id && r.TouristId == touristId);
            if (review == null) return null;

            review.Rating = reviewDto.Rating;
            if (reviewDto.Title != null)
            {
                review.Title = reviewDto.Title;
            }
            review.Comment = reviewDto.Comment;

            await _context.SaveChangesAsync();
            return await MapToResponseDto(review);
        }

        public async Task<ReviewResponseDto?> UpdateReviewStatusAsync(int id, string? status, string? operatorNotes)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id);
            if (review == null) return null;

            if (!string.IsNullOrWhiteSpace(status))
            {
                review.Status = status;
            }
            if (operatorNotes != null)
            {
                review.OperatorNotes = operatorNotes;
            }

            await _context.SaveChangesAsync();
            return await MapToResponseDto(review);
        }

        private async Task<ReviewResponseDto> MapToResponseDto(Review review)
        {
            var tourist = review.Tourist ?? await _context.Tourists.FindAsync(review.TouristId);
            var entityName = review.EntityType switch
            {
                "Attraction" => (await _context.Attractions.FindAsync(review.EntityId))?.Name,
                "Destination" => (await _context.Destinations.FindAsync(review.EntityId))?.Name,
                "TourPackage" => (await _context.TourPackages.FindAsync(review.EntityId))?.Name,
                _ => null
            };
            
            return new ReviewResponseDto
            {
                Id = review.Id,
                TouristId = review.TouristId,
                TouristName = tourist?.Name ?? "Unknown",
                EntityId = review.EntityId,
                EntityType = review.EntityType,
                EntityName = entityName ?? string.Empty,
                Rating = review.Rating,
                Title = review.Title ?? string.Empty,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                Status = review.Status ?? "Published",
                OperatorNotes = review.OperatorNotes,
                HelpfulCount = review.HelpfulCount
            };
        }
    }
}
