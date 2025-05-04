using Backend.Attributes;
using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("[controller]")]
[ApiController]
public sealed class LoginController : ControllerBase
{
    private readonly ILogger<LoginController> _logger;
    private readonly IDatabaseServiceProvider _serviceProvider;
    public LoginController(
        IDatabaseServiceProvider serviceProvider,
        ILogger<LoginController> logger)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }


    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] UserLoginModel model)
    {
        using var service = _serviceProvider.GetUserService();

        var loginData = await service.LoginUserAsync(model);

        if (loginData.UserIdentification.Length == 0)
            return BadRequest("Invalid username or password");
        return Ok(loginData);

    }
    [HttpPost("login-google")]
    public async Task<IActionResult> GoogleLoginAsync([FromBody] GmailAuthorizationModel model)
    {
        using var service = _serviceProvider.GetUserService();

        var loginData = await service.LoginGoogleUserAsync(model);

        if (loginData.UserIdentification.Length == 0)
            return BadRequest("Invalid username or password");
        return Ok(loginData);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> LogoutAsync()
    {
        using var service = _serviceProvider.GetUserService();
        var uid = (string)HttpContext.Items[AuthorizationAttribute.UserIdentificationKey]!;
        Guid uIdentification = Guid.Parse(uid);
        await service.LogoutUserAsync(uIdentification);
        return Ok();
    }

}
