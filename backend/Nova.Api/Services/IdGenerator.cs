using Microsoft.EntityFrameworkCore;
using Nova.Api.Data;

namespace Nova.Api.Services;

public static class IdGenerator
{
    public static async Task<string> GenerateTripIdAsync(NovaDbContext db)
    {
        var existingIds = await db.Trips
            .Select(t => t.Id)
            .Where(id => id.StartsWith("T"))
            .ToListAsync();

        int maxNum = 0;
        foreach (var id in existingIds)
        {
            if (id.Length > 1 && int.TryParse(id.Substring(1), out var n) && n > maxNum)
            {
                maxNum = n;
            }
        }

        return $"T{(maxNum + 1):D3}";
    }

    public static async Task<string> GenerateItineraryIdAsync(NovaDbContext db)
    {
        var existingIds = await db.Itineraries
            .Select(i => i.Id)
            .Where(id => id.StartsWith("I"))
            .ToListAsync();

        int maxNum = 0;
        foreach (var id in existingIds)
        {
            if (id.Length > 1 && int.TryParse(id.Substring(1), out var n) && n > maxNum)
            {
                maxNum = n;
            }
        }

        return $"I{(maxNum + 1):D3}";
    }

    public static async Task<string> GenerateUserIdAsync(NovaDbContext db)
    {
        var existingIds = await db.Users
            .Select(u => u.Id)
            .Where(id => id.StartsWith("U"))
            .ToListAsync();

        int maxNum = 0;
        foreach (var id in existingIds)
        {
            if (id.Length > 1 && int.TryParse(id.Substring(1), out var n) && n > maxNum)
            {
                maxNum = n;
            }
        }

        return $"U{(maxNum + 1):D3}";
    }
}
