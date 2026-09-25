using SmartTourism.API.Domain.Entities.Enums;

namespace SmartTourism.API.Domain.Entities;

public enum UserStatus
{
    Active,
    Inactive,
    Pending
}

public class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Tourist;
    public UserStatus Status { get; set; } = UserStatus.Active;
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
