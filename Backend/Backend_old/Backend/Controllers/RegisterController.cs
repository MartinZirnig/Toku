﻿using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("[controller]")]
public sealed class RegisterController : ControllerBase
{
    private readonly ILogger<RegisterController> _logger;
    private readonly IDatabaseServiceProvider _serviceProvider;
    public RegisterController(
        IDatabaseServiceProvider serviceProvider,
        ILogger<RegisterController> logger)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }


    [HttpPost("register")]
    public async Task<IActionResult> RegisterAsync([FromBody] UserRegistrationModel userDat)
    {
        using var service = _serviceProvider.GetUserService();

        var loginData = await service.RegisterUserAsync(userDat);
        if (loginData is null)
            return BadRequest("User already exists");

        return Ok(loginData);
    }
}
