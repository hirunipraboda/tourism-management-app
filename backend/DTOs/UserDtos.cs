namespace SmartTourism.API.DTOs;

public record UserResponse(
    Guid Id,
    string FullName,
    string Email,
    string? Phone,
    string Role,
    string Status,
    DateTime CreatedAt
);

public record CreateUserRequest(
    string FullName,
    string Email,
    string Password,
    string Role,
    string? Phone
);

public record UpdateUserRequest(
    string FullName,
    string Email,
    string Role,
    string Status,
    string? Phone
);

public record LoginRequest(
    string Email,
    string Password
);

public record RegisterRequest(
    string FullName,
    string Email,
    string Password,
    string? Role,
    string? Phone
);

public record AuthResponse(
    bool Success,
    string Message,
    UserResponse? User,
    string? Token
);
