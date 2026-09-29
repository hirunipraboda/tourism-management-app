using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Nova.Api.Data;
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

    /// <summary>
    /// User Registration (Sign Up)
    /// Enforces USER role, valid email format, minimum password requirements,
    /// password confirmation, and email uniqueness (409 Conflict).
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // 1. Validate required fields
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { success = false, message = "Name is required." });
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { success = false, message = "Email is required." });
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { success = false, message = "Password is required." });
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        // 2. Validate email format
        var emailValidator = new EmailAddressAttribute();
        if (!emailValidator.IsValid(normalizedEmail) || !normalizedEmail.Contains('@') || !normalizedEmail.Contains('.'))
        {
            return BadRequest(new { success = false, message = "Please enter a valid email address." });
        }

        // 3. Validate password length / requirements
        if (request.Password.Length < 6)
        {
            return BadRequest(new { success = false, message = "Password must be at least 6 characters long." });
        }

        // 4. Validate password confirmation
        if (!string.IsNullOrEmpty(request.ConfirmPassword) && request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { success = false, message = "Passwords do not match." });
        }

        // 5. Check email uniqueness (409 Conflict)
        var emailExists = await _db.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail);
        if (emailExists)
        {
            return StatusCode(StatusCodes.Status409Conflict, new
            {
                success = false,
                message = "An account with this email address already exists."
            });
        }

        // 6. Security: Users cannot register as ADMIN. Always assign USER role.
        var user = new User
        {
            Id = $"user-{Guid.NewGuid():N}"[..18],
            Name = request.Name.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Tourist, // Represented as USER in the public contract
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = GenerateJwtToken(user);

        return StatusCode(StatusCodes.Status201Created, new
        {
            success = true,
            message = "Registration successful",
            token,
            user = new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                role = "USER",
                status = "ACTIVE",
                createdAt = user.CreatedAt
            }
        });
    }

    /// <summary>
    /// User & Admin Login
    /// Verifies BCrypt hashed password, checks active account status,
    /// determines role (USER vs ADMIN), and returns JWT.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { success = false, message = "Email and password are required." });
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        // Ensure fixed/configured default admin exists in the database
        await EnsureAdminAccountAsync(normalizedEmail);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { success = false, message = "Invalid email or password." });
        }

        // Check account activation status
        if (!user.IsActive)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                success = false,
                message = "Your account has been deactivated. Please contact an administrator."
            });
        }

        var roleStr = user.Role == UserRole.Admin ? "ADMIN" : "USER";
        var token = GenerateJwtToken(user);

        return Ok(new
        {
            success = true,
            message = "Login successful",
            token,
            user = new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                role = roleStr,
                status = user.Status,
                createdAt = user.CreatedAt
            }
        });
    }

    /// <summary>
    /// Returns the currently authenticated user's profile based on the JWT token.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email);

        User? user = null;
        if (!string.IsNullOrEmpty(userId))
        {
            user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }
        else if (!string.IsNullOrEmpty(email))
        {
            user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        if (user == null)
        {
            return Unauthorized(new { success = false, message = "Authenticated user not found." });
        }

        if (!user.IsActive)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                success = false,
                message = "Your account has been deactivated. Please contact an administrator."
            });
        }

        var roleStr = user.Role == UserRole.Admin ? "ADMIN" : "USER";

        return Ok(new
        {
            success = true,
            user = new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                role = roleStr,
                status = user.Status,
                createdAt = user.CreatedAt
            }
        });
    }

    private string GenerateJwtToken(User user)
    {
        var secret = _config["Jwt:Secret"] ?? "travel_link_super_secret_jwt_key_2026_enterprise_production_secure_key";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var roleStr = user.Role == UserRole.Admin ? "ADMIN" : "USER";

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, roleStr),
            new("role", roleStr),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        var expiryDays = int.TryParse(_config["Jwt:ExpiryDays"], out var days) ? days : 7;
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "TravelLink",
            audience: _config["Jwt:Audience"] ?? "TravelLinkApp",
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddDays(expiryDays),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task EnsureAdminAccountAsync(string requestedEmail)
    {
        var adminEmail = _config["AdminCredentials:Email"] ?? "admin@travellink.com";
        var adminPassword = _config["AdminCredentials:Password"] ?? "admin123";
        var adminName = _config["AdminCredentials:Name"] ?? "TravelLink Administrator";

        if (requestedEmail.Equals(adminEmail, StringComparison.OrdinalIgnoreCase))
        {
            var adminUser = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == adminEmail.ToLower());
            if (adminUser == null)
            {
                adminUser = new User
                {
                    Id = "admin-travellink-01",
                    Name = adminName,
                    Email = adminEmail.ToLower(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                    Role = UserRole.Admin,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.Users.Add(adminUser);
                await _db.SaveChangesAsync();
            }
            else if (adminUser.Role != UserRole.Admin)
            {
                adminUser.Role = UserRole.Admin;
                adminUser.IsActive = true;
                adminUser.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }
    }
}

public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? ConfirmPassword { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
