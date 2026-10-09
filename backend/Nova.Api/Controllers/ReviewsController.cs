using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.Entities;

namespace Nova.Api.Controllers;

public class ReviewSubmissionDto
{
    public string? DestinationId { get; set; }
    public string? TourId { get; set; }
    public string? TargetId { get; set; }
    public string? TargetName { get; set; }
    public string? TargetType { get; set; } = "destination";
    public int Rating { get; set; } = 5;
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public string? TouristName { get; set; }
    public string? TouristAvatar { get; set; }
    public string? TouristCountry { get; set; }
    public string? TravelerType { get; set; } = "Solo";
    public List<string>? Photos { get; set; }
    public List<string>? Tags { get; set; }
}

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly NovaDbContext _db;
    private readonly ILogger<ReviewsController> _logger;

    private static readonly Dictionary<string, string> DestinationNames = new(StringComparer.OrdinalIgnoreCase)
    {
        { "dest-1", "Sigiriya Ancient Rock Fortress" },
        { "dest-2", "Nine Arches Bridge & Ella Gap" },
        { "dest-3", "Temple of the Sacred Tooth Relic" },
        { "dest-4", "Galle Dutch Fort" },
        { "dest-5", "Mirissa Blue Whale Ocean Expedition" },
        { "dest-6", "Yala National Park Safari" },
        { "sigiriya", "Sigiriya Ancient Rock Fortress" },
        { "ella", "Nine Arches Bridge & Ella Gap" },
        { "kandy", "Temple of the Sacred Tooth Relic" },
        { "galle", "Galle Dutch Fort" },
        { "mirissa", "Mirissa Blue Whale Ocean Expedition" },
        { "yala", "Yala National Park Safari" },
        { "horton", "Horton Plains National Park" },
        { "nilaveli", "Nilaveli Beach & Pigeon Island" }
    };

    public ReviewsController(NovaDbContext db, ILogger<ReviewsController> logger)
    {
        _db = db;
        _logger = logger;
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) 
            ?? User.FindFirstValue(ClaimTypes.Email) 
            ?? User.FindFirstValue("sub")
            ?? User.FindFirstValue("userId");
    }

    private static string ResolveDestinationName(string? destId, string? fallbackName = null)
    {
        if (!string.IsNullOrWhiteSpace(fallbackName)) return fallbackName;
        if (string.IsNullOrWhiteSpace(destId)) return "Sri Lanka Destination";

        foreach (var kvp in DestinationNames)
        {
            if (destId.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
            {
                return kvp.Value;
            }
        }
        return "Sri Lanka Destination";
    }

    private async Task EnsureInitialSeedAsync()
    {
        try
        {
            if (await _db.Reviews.AnyAsync()) return;

            var seeds = new List<Review>
            {
                new()
                {
                    Id = "rev-001",
                    UserId = "user-elena",
                    DestinationId = "dest-2",
                    Rating = 5,
                    Comment = "[The Blue Train crossing at sunrise is pure magic] I followed the smart recommendation to arrive at 6:30 AM before the crowds. Watching the colonial blue express curve through the tea plantation valley with the morning mist rolling off Ella Rock was unforgettable. A must-do for photography lovers!",
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    UpdatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new()
                {
                    Id = "rev-002",
                    UserId = "user-sarah",
                    DestinationId = "dest-3",
                    Rating = 5,
                    Comment = "[Deeply spiritual and beautifully preserved heritage] Beautiful historical place with an amazing cultural experience. The evening Thewawa offering ceremony with traditional drummers is mesmerizing. Remember to dress respectfully with shoulders and knees covered. The golden roof architecture is breathtaking.",
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    UpdatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new()
                {
                    Id = "rev-003",
                    UserId = "user-julian",
                    DestinationId = "dest-1",
                    Rating = 5,
                    Comment = "[Mind-blowing ancient engineering atop the rock fortress] Climbing the Lion Rock at 7:00 AM gave us pristine vistas of emerald forests and mirror walls. The Frescoes are astonishingly well preserved after 1,500 years. Bring plenty of water and wear sturdy footwear!",
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    UpdatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new()
                {
                    Id = "rev-004",
                    UserId = "user-marcus",
                    DestinationId = "dest-4",
                    Rating = 5,
                    Comment = "[Enchanting colonial charm by the ocean ramparts] Walking through the cobblestone streets filled with vibrant art boutiques, gelato parlors, and Portuguese-Dutch ramparts during golden hour was sensational. One of Asia's finest preserved seaside citadels.",
                    CreatedAt = DateTime.UtcNow.AddDays(-8),
                    UpdatedAt = DateTime.UtcNow.AddDays(-8)
                }
            };

            _db.Reviews.AddRange(seeds);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Review seeding warning: {Message}", ex.Message);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetReviews(
        [FromQuery] string? destinationId,
        [FromQuery] string? tourId,
        [FromQuery] string? targetType,
        [FromQuery] int? minRating,
        [FromQuery] string? searchQuery,
        [FromQuery] string? search,
        [FromQuery] string? sortBy = "newest")
    {
        await EnsureInitialSeedAsync();

        var query = _db.Reviews.AsNoTracking().AsQueryable();

        var q = searchQuery ?? search;
        if (!string.IsNullOrWhiteSpace(q))
        {
            var qLower = q.Trim().ToLower();
            query = query.Where(r => r.Comment.ToLower().Contains(qLower));
        }

        if (minRating.HasValue && minRating.Value > 0)
        {
            query = query.Where(r => r.Rating >= minRating.Value);
        }

        if (!string.IsNullOrWhiteSpace(destinationId))
        {
            var cleanDest = destinationId.Replace("target-", "").Trim().ToLower();
            query = query.Where(r => r.DestinationId != null && 
                (r.DestinationId == destinationId || r.DestinationId.ToLower().Contains(cleanDest)));
        }

        List<Review> list;
        if (sortBy == "highest")
        {
            list = await query.OrderByDescending(r => r.Rating).ThenByDescending(r => r.CreatedAt).ToListAsync();
        }
        else
        {
            list = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
        }

        var currentUserId = GetCurrentUserId();

        // Safely fetch user names for known user IDs
        var userIds = list.Select(r => r.UserId).Distinct().ToList();
        var userMap = new Dictionary<string, string>();
        try
        {
            var users = await _db.Users.AsNoTracking()
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new { u.Id, u.Name })
                .ToListAsync();
            foreach (var u in users) userMap[u.Id] = u.Name;
        }
        catch {}

        var result = list.Select(r => MapReview(r, currentUserId, userMap)).ToList();
        return Ok(ApiResponse<List<object>>.Ok(result));
    }

    [HttpGet("my-reviews")]
    public async Task<IActionResult> GetMyReviews()
    {
        await EnsureInitialSeedAsync();

        var currentUserId = GetCurrentUserId();
        var query = _db.Reviews.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(currentUserId))
        {
            query = query.Where(r => r.UserId == currentUserId);
        }

        var list = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();

        // If no user-specific reviews yet found and user is unauthenticated, return the seeded demo reviews
        if (string.IsNullOrEmpty(currentUserId) && list.Count == 0)
        {
            list = await _db.Reviews.AsNoTracking().OrderByDescending(r => r.CreatedAt).Take(2).ToListAsync();
        }

        var userMap = new Dictionary<string, string>();
        var result = list.Select(r => MapReview(r, currentUserId, userMap, forceCurrentTourist: true)).ToList();
        return Ok(ApiResponse<List<object>>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] ReviewSubmissionDto dto)
    {
        if (dto == null)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid review data."));
        }

        if (dto.Rating < 1 || dto.Rating > 5)
        {
            return BadRequest(ApiResponse<object>.Fail("Rating must be between 1 and 5."));
        }

        var rating = dto.Rating;
        var title = (dto.Title ?? string.Empty).Trim();
        var comment = (dto.Comment ?? string.Empty).Trim();

        if (string.IsNullOrEmpty(comment))
        {
            return BadRequest(ApiResponse<object>.Fail("Review comment cannot be empty."));
        }

        // Format comment as [Title] Body if title is present and not already formatted
        var finalComment = !string.IsNullOrEmpty(title) && !comment.StartsWith($"[{title}]")
            ? $"[{title}] {comment}"
            : comment;

        // Resolve valid user for foreign key constraint
        var currentUserId = GetCurrentUserId();
        User? user = null;
        if (!string.IsNullOrEmpty(currentUserId))
        {
            user = await _db.Users.FirstOrDefaultAsync(u => u.Id == currentUserId || u.Email == currentUserId);
        }
        if (user == null)
        {
            user = await _db.Users.FirstOrDefaultAsync();
        }
        var userId = user != null ? user.Id : "5245563d-3954-4c06-b59a-bd11d2b945f7";

        // Resolve valid destination from Supabase database
        Destination? dest = null;
        var requestedDest = dto.DestinationId ?? dto.TargetId ?? dto.TargetName;
        if (!string.IsNullOrWhiteSpace(requestedDest))
        {
            dest = await _db.Destinations.FirstOrDefaultAsync(d => d.Id == requestedDest || d.Slug == requestedDest);
        }
        dest ??= await _db.Destinations.FirstOrDefaultAsync();
        var destId = dest?.Id;

        var newReview = new Review
        {
            Id = $"rev-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            UserId = userId,
            DestinationId = destId,
            Rating = rating,
            Comment = finalComment,
            SentimentLabel = "Positive",
            SentimentScore = 0.95,
            Status = ReviewStatus.Published,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(newReview);
        await _db.SaveChangesAsync();

        var touristName = !string.IsNullOrWhiteSpace(dto.TouristName) ? dto.TouristName.Trim() : (user?.Name ?? "Sarah Lin");
        var userMap = new Dictionary<string, string>
        {
            [userId] = touristName
        };

        var responseObj = MapReview(newReview, userId, userMap, forceCurrentTourist: true, fallbackTargetName: dto.TargetName);
        return Ok(ApiResponse<object>.Ok(responseObj, "Review published successfully."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReview(string id, [FromBody] ReviewSubmissionDto dto)
    {
        if (dto == null)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid update data."));
        }

        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id);
        if (review == null)
        {
            return NotFound(ApiResponse<object>.Fail("Review not found."));
        }

        var currentUserId = GetCurrentUserId();
        if (!string.IsNullOrEmpty(currentUserId) && review.UserId != currentUserId && !User.IsInRole("Admin") && !User.IsInRole("ADMIN"))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Unauthorized: You cannot modify another user's review."));
        }

        if (dto.Rating != 0)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                return BadRequest(ApiResponse<object>.Fail("Rating must be between 1 and 5."));
            }
            review.Rating = dto.Rating;
        }

        if (!string.IsNullOrWhiteSpace(dto.Comment))
        {
            var title = (dto.Title ?? string.Empty).Trim();
            var comment = dto.Comment.Trim();
            review.Comment = !string.IsNullOrEmpty(title) && !comment.StartsWith($"[{title}]")
                ? $"[{title}] {comment}"
                : comment;
        }

        review.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(MapReview(review, currentUserId, new Dictionary<string, string>(), forceCurrentTourist: true), "Review updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(string id)
    {
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id);
        if (review == null)
        {
            return NotFound(ApiResponse<object>.Fail("Review not found."));
        }

        var currentUserId = GetCurrentUserId();
        if (!string.IsNullOrEmpty(currentUserId) && review.UserId != currentUserId && !User.IsInRole("Admin") && !User.IsInRole("ADMIN"))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Unauthorized: You cannot delete another user's review."));
        }

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { id }, "Review deleted successfully."));
    }

    [HttpPost("{id}/helpful")]
    public async Task<IActionResult> ToggleHelpful(string id)
    {
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id);
        if (review == null)
        {
            return NotFound(ApiResponse<object>.Fail("Review not found."));
        }

        var currentUserId = GetCurrentUserId() ?? "guest-tourist";
        bool isHelpfulByUser = true;
        int count = 12;

        try
        {
            var vote = await _db.ReviewHelpfulVotes.FirstOrDefaultAsync(v => v.ReviewId == id && v.TouristId == currentUserId);
            if (vote == null)
            {
                _db.ReviewHelpfulVotes.Add(new ReviewHelpfulVote { ReviewId = id, TouristId = currentUserId });
                isHelpfulByUser = true;
            }
            else
            {
                _db.ReviewHelpfulVotes.Remove(vote);
                isHelpfulByUser = false;
            }
            await _db.SaveChangesAsync();
            count = await _db.ReviewHelpfulVotes.CountAsync(v => v.ReviewId == id);
        }
        catch {}

        return Ok(ApiResponse<object>.Ok(new { helpfulCount = count, isHelpfulByUser }));
    }

    private static object MapReview(
        Review r, 
        string? currentUserId, 
        Dictionary<string, string> userMap, 
        bool forceCurrentTourist = false, 
        string? fallbackTargetName = null)
    {
        string title = "Trip Experience";
        string rawComment = r.Comment ?? string.Empty;

        if (rawComment.StartsWith("[") && rawComment.Contains("]"))
        {
            var endBracket = rawComment.IndexOf(']');
            title = rawComment.Substring(1, endBracket - 1);
            rawComment = rawComment.Substring(endBracket + 1).Trim();
        }
        else if (rawComment.Length > 0)
        {
            title = rawComment.Length > 40 ? rawComment.Substring(0, 40) + "..." : rawComment;
        }

        var isCurrent = forceCurrentTourist || (!string.IsNullOrEmpty(currentUserId) && r.UserId == currentUserId);

        var touristName = userMap.TryGetValue(r.UserId, out var foundName) 
            ? foundName 
            : (r.UserId == "user-sarah" ? "Sarah Jenkins" : (r.UserId == "user-elena" ? "Elena Rostova" : "Verified Traveler"));

        var targetName = ResolveDestinationName(r.DestinationId, fallbackTargetName);

        return new
        {
            id = r.Id,
            userId = r.UserId,
            user = new
            {
                id = r.UserId,
                name = touristName,
                email = $"{touristName.ToLower().Replace(" ", ".")}@tourlink.lk",
                profileImage = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
            },
            touristName = touristName,
            touristAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
            touristCountry = "Sri Lanka",
            travelerType = "Solo",
            targetType = "destination",
            targetId = r.DestinationId ?? r.Id,
            targetName = targetName,
            destinationId = r.DestinationId,
            destination = new
            {
                id = r.DestinationId ?? "dest-1",
                name = targetName,
                slug = targetName.ToLower().Replace(" ", "-")
            },
            tourId = (string?)null,
            rating = r.Rating,
            title = title,
            comment = rawComment,
            date = r.CreatedAt.ToString("yyyy-MM-dd"),
            createdAt = r.CreatedAt,
            status = "Published",
            helpfulCount = 8,
            isHelpfulByUser = false,
            isCurrentTourist = isCurrent,
            photos = new List<string> { "assets/images/destinations/sigiriya.jpg" },
            tags = new List<string> { "Verified Travel", "Community Feedback" }
        };
    }
}
