using Backend.Attributes;
using BackendEnums;
using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Authorization]
    [Route("[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly IDatabaseServiceProvider _serviceProvider;
        public UserController(
            IDatabaseServiceProvider serviceProvider,
            ILogger<UserController> logger)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }


        [HttpPatch("update")]
        public async Task<IActionResult> UpdateUserAsync([FromBody] UserDataModel model)
        {
            using var service = _serviceProvider.GetUserService();

            var uid = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
            var result = await service.EditUserAsync(model, uid);

            return Ok(result);
        }

        [HttpGet("get")]
        public async Task<IActionResult> GetUserDataAsync()
        {
            using var service = _serviceProvider.GetUserService();

            var uid = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
            var result = await service.GetUserDataAsync(uid);

            if (result is null)
                return Unauthorized();

            return Ok(result);
        }

        [HttpGet("get-known-users")]
        public async Task<IActionResult> GetKnownUsersAsync()
        {
            using var service = _serviceProvider.GetUserService();
            var uid = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

            var result = await service.GetKnownUserAsync(uid);
            if (result is null)
                return Unauthorized();
            return Ok(result);
        }

        [HttpGet("get-acces-options")]
        public IActionResult GetAccessOptions()
        {
            var options = Enum.GetValues<GroupClientPermission>()
               .Select(e => ((byte)e, e.ToString()))
               .Select(gcp => (UserPermissionModel)gcp);

            return Ok(options);
        }
    }
}
