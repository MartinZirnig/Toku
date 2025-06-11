using Backend.Attributes;
using BackendEnums;
using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Bcpg;
using System.Net.WebSockets;

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

        [HttpPut("set-profile")]
        public async Task<IActionResult> SetProfilePictureAsync([FromQuery] uint fileId)
        {
            using var service = _serviceProvider.GetUserService();
            var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

            var result = await service.SetProfileImageAsync(executor, fileId);

            return Ok(result);
        }
        [HttpGet("get-profile")]
        public async Task<IActionResult> GetProfilePictureAsync([FromQuery] uint UserId)
        {
            using var service = _serviceProvider.GetUserService();

            var result = await service.GetProfileImageAsync(UserId);

            return Ok(result);
        }
        [HttpGet("search-user")]
        public async Task<IActionResult> SearchProofileAsync([FromQuery] string query)
        {
            using var service = _serviceProvider.GetUserService();

            var result = await service.SearchUserAsync(query);
            return Ok(result);
        }
        [HttpPatch("update-contact")]
        public async Task<IActionResult> UpdateContactAsync([FromBody] ContactEditModel model)
        {
            using var service = _serviceProvider.GetUserService();

            var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
            var result = await service.UpdateContactAsync(model, executor)
                .ConfigureAwait(false);

            return Ok(result);
        }
        [HttpGet("get-swipes")]
        public async Task<IActionResult> GetSwipeActionsAsync()
        {
            using var service = _serviceProvider.GetUserService();
            var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

            var result = await service.GetSwipesAsync(executor)
                .ConfigureAwait(false);
            if (result is null)
                return Unauthorized();

            return Ok(result);
        }
        [HttpPatch("set-swipes")]
        public async Task<IActionResult> SetSwipeActionsAsync([FromBody] SwipeInfoModel model)
        {
            using var service = _serviceProvider.GetUserService();
            var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

            var result = await service.SetSwipesAsync(executor, model)
                .ConfigureAwait(false);

            return Ok(result);
        }
        [HttpPatch("update-colors")]
        public async Task<IActionResult> UpdateColorsAsync()
        {
            using var service = _serviceProvider.GetUserService();
            var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

            var reader = new StreamReader(Request.Body);
            var data = await reader.ReadToEndAsync()
                .ConfigureAwait(false);

            var result = await service
                .SetColorsAsync(data, executor);
            return Ok(result);
        }
        [HttpGet("get-colors")]
        public async Task<IActionResult> GetColorsAsync()
        {
            using var service = _serviceProvider.GetUserService();

            var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

            var result = await service
                .GetColorsAsync(executor);
            if (result == string.Empty)
                return NotFound();

            return Content(result, "application/json");
        }
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteUserAsync()
        {
            using var service = _serviceProvider.GetUserService();
            var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

            var result = await service.DeleteUserAsync(executor)
                .ConfigureAwait(false);

            return Ok(result);
        }
    }
}
