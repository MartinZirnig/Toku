using Backend.Attributes;
using BackendInterface;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HeartController : ControllerBase
    {
        private readonly ILogger<HeartController> _logger;
        private readonly IDatabaseServiceProvider _serviceProvider;
        public HeartController(
            IDatabaseServiceProvider serviceProvider,
            ILogger<HeartController> logger)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }


        [HttpPost("beat")]
        [Authorization]
        public async Task<IActionResult> Beat()
        {
            var service = _serviceProvider.GetUserService();

            var uid = (string)HttpContext.Items[AuthorizationAttribute.UserIdentificationKey]!;
            await service.HeartbeatAsync(Guid.Parse(uid));

            return Ok();
        }
    }
}
