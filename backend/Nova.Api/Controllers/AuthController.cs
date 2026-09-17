using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Nova.Api.Data;
using Nova.Api.DTOs.Common;
using Nova.Api.Entities;

namespace Nova.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly NovaDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(NovaDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(ApiResponse<object>.Fail("Email and password are required."));
        }

        var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLowerInvariant());
        if (existing != null)
        {
            return BadRequest(ApiResponse<object>.Fail("Email already registered."));
        }

        var role = UserRole.Tourist;
        if (!string.IsNullOrWhiteSpace(request.Role) && Enum.TryParse<UserRole>(request.Role, true, out var parsedRole))
        {
            role = parsedRole;
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        return Ok(ApiResponse<object>.Ok(new
        {
            token,
            user = new { user.Id, user.Name, user.Email, Role = user.Role.ToString() }
        }, "User registered successfully."));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(ApiResponse<object>.Fail("Invalid email or password."));
        }

        var token = GenerateJwtToken(user);
        return Ok(ApiResponse<object>.Ok(new
        {
            token,
            user = new { user.Id, user.Name, user.Email, Role = user.Role.ToString() }
        }, "Login successful."));
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            var fallback = await _db.Users.FirstOrDefaultAsync();
            if (fallback != null)
            {
                return Ok(ApiResponse<object>.Ok(new { fallback.Id, fallback.Name, fallback.Email, Role = fallback.Role.ToString() }));
            }
            return Ok(ApiResponse<object>.Ok(new { Id = "u-guest", Name = "Guest Tourist", Email = "guest@example.com", Role = UserRole.Tourist.ToString() }));
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return NotFound(ApiResponse<object>.Fail("User not found."));

        return Ok(ApiResponse<object>.Ok(new { user.Id, user.Name, user.Email, Role = user.Role.ToString() }));
    }

    private string GenerateJwtToken(User user)
    {
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? "SuperSecretNovaEnterpriseTourismKey2026!#$");
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            ]),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var handler = new JwtSecurityTokenHandler();
        var token = handler.CreateToken(tokenDescriptor);
        return handler.WriteToken(token);
    }
}

public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Role { get; set; } // Tourist, TourismOperator, Admin
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
