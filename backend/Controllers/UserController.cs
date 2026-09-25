using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartTourism.API.DTOs;
using SmartTourism.API.Domain.Entities;
using SmartTourism.API.Domain.Entities.Enums;
using SmartTourism.API.Domain.Entities.Infrastructure;
using BCrypt.Net;

namespace SmartTourism.API.Controllers;

[ApiController]
[Route("api/v1/users")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/v1/users — list all users sorted by Creation date
    [HttpGet]
    public async Task<ActionResult<List<UserResponse>>> GetAll()
    {
        var users = await _db.Users
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        var responses = users.Select(u => new UserResponse(
            u.Id,
            u.FullName,
            u.Email,
            u.Phone,
            AuthController.FormatRole(u.Role),
            u.Status.ToString(),
            u.CreatedAt
        )).ToList();

        return Ok(responses);
    }

    // GET /api/v1/users/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserResponse>> GetById(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {id} not found." });
        }

        return Ok(new UserResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.Phone,
            AuthController.FormatRole(user.Role),
            user.Status.ToString(),
            user.CreatedAt
        ));
    }

    // POST /api/v1/users — Create User (Admin CRUD)
    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create([FromBody] CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new { message = "Full name, email, and password are required." });
        }

        var normalizedEmail = request.Email.Trim().ToLower();
        var existing = await _db.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail);
        if (existing)
        {
            return BadRequest(new { message = "A user with this email address already exists." });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = AuthController.ParseRole(request.Role),
            Status = UserStatus.Active,
            Phone = request.Phone?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var response = new UserResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.Phone,
            AuthController.FormatRole(user.Role),
            user.Status.ToString(),
            user.CreatedAt
        );

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, response);
    }

    // PUT /api/v1/users/{id} — Update User (Admin CRUD)
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserResponse>> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {id} not found." });
        }

        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email.Trim().ToLower() != user.Email.ToLower())
        {
            var emailTaken = await _db.Users.AnyAsync(u => u.Id != id && u.Email.ToLower() == request.Email.Trim().ToLower());
            if (emailTaken)
            {
                return BadRequest(new { message = "Email address is already in use by another account." });
            }
            user.Email = request.Email.Trim().ToLower();
        }

        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            user.FullName = request.FullName.Trim();
        }

        user.Role = AuthController.ParseRole(request.Role);

        if (Enum.TryParse<UserStatus>(request.Status, true, out var parsedStatus))
        {
            user.Status = parsedStatus;
        }

        user.Phone = request.Phone?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new UserResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.Phone,
            AuthController.FormatRole(user.Role),
            user.Status.ToString(),
            user.CreatedAt
        ));
    }

    // DELETE /api/v1/users/{id} — Delete User (Admin CRUD)
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {id} not found." });
        }

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "User deleted successfully." });
    }

    // PATCH /api/v1/users/{id}/toggle-status — Toggle Active/Inactive Status
    [HttpPatch("{id:guid}/toggle-status")]
    public async Task<ActionResult<UserResponse>> ToggleStatus(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {id} not found." });
        }

        user.Status = user.Status == UserStatus.Active ? UserStatus.Inactive : UserStatus.Active;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new UserResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.Phone,
            AuthController.FormatRole(user.Role),
            user.Status.ToString(),
            user.CreatedAt
        ));
    }
}
