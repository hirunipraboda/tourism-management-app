using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartTourism.API.DTOs;
using SmartTourism.API.Domain.Entities;
using SmartTourism.API.Domain.Entities.Enums;
using SmartTourism.API.Domain.Entities.Infrastructure;
using BCrypt.Net;

namespace SmartTourism.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    public static UserRole ParseRole(string? roleStr)
    {
        if (string.IsNullOrWhiteSpace(roleStr)) return UserRole.Tourist;
        var r = roleStr.Trim().ToLower();
        if (r == "administrator" || r == "admin") return UserRole.Admin;
        if (r == "tour operator" || r == "provider" || r == "operator") return UserRole.Provider;
        return UserRole.Tourist;
    }

    public static string FormatRole(UserRole role)
    {
        return role switch
        {
            UserRole.Admin => "Administrator",
            UserRole.Provider => "Tour Operator",
            _ => "Tourist"
        };
    }

    // POST /api/v1/auth/register
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new AuthResponse(false, "Email and password are required.", null, null));
        }

        var normalizedEmail = request.Email.Trim().ToLower();
        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (existingUser != null)
        {
            return BadRequest(new AuthResponse(false, "An account with this email address already exists.", null, null));
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var role = ParseRole(request.Role);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = passwordHash,
            Role = role,
            Status = UserStatus.Active,
            Phone = request.Phone?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var userResponse = new UserResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.Phone,
            FormatRole(user.Role),
            user.Status.ToString(),
            user.CreatedAt
        );

        return Ok(new AuthResponse(true, "Registration successful!", userResponse, user.Id.ToString()));
    }

    // POST /api/v1/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new AuthResponse(false, "Email and password are required.", null, null));
        }

        var normalizedEmail = request.Email.Trim().ToLower();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new AuthResponse(false, "Invalid email or password.", null, null));
        }

        if (user.Status == UserStatus.Inactive)
        {
            return Unauthorized(new AuthResponse(false, "Account is deactivated. Please contact support.", null, null));
        }

        var userResponse = new UserResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.Phone,
            FormatRole(user.Role),
            user.Status.ToString(),
            user.CreatedAt
        );

        return Ok(new AuthResponse(true, "Login successful!", userResponse, user.Id.ToString()));
    }

    // GET /api/v1/auth/me?email=...
    [HttpGet("me")]
    public async Task<ActionResult<AuthResponse>> GetCurrent([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new AuthResponse(false, "Email parameter is required.", null, null));
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.Trim().ToLower());
        if (user == null)
        {
            return NotFound(new AuthResponse(false, "User not found.", null, null));
        }

        var userResponse = new UserResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.Phone,
            FormatRole(user.Role),
            user.Status.ToString(),
            user.CreatedAt
        );

        return Ok(new AuthResponse(true, "User profile loaded", userResponse, user.Id.ToString()));
    }
}
