using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartTourism.API.DTOs;
using SmartTourism.API.Domain.Entities;
using SmartTourism.API.Domain.Entities.Infrastructure;

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

    // GET /api/v1/users — oldest first, so newly registered users land at the bottom
    [HttpGet]
    public async Task<ActionResult<List<UserResponse>>> GetAll()
    {
        var users = await _db.Users
            .OrderBy(u => u.CreatedAt)
            .ToListAsync();

        var responses = users.Select(u =>
            new UserResponse(u.Id, u.FullName, u.Email, u.Phone, u.Role.ToString(), u.CreatedAt)
        ).ToList();

        return Ok(responses);
    }
}
