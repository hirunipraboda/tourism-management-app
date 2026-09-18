namespace SmartTourism.API.DTOs;

public record UserResponse(Guid Id, string FullName, string Email, string? Phone, string Role, DateTime CreatedAt);
