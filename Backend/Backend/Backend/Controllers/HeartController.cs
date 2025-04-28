using Backend.Attributes;
using BackendInterface;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Authorization]
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
        public async Task<IActionResult> BeatAsync()
        {
            var service = _serviceProvider.GetUserService();

            var uid = HttpContext.Items[AuthorizationAttribute.UserIdentificationKey]!.ToString()!;
            await service.HeartbeatAsync(Guid.Parse(uid));

            return Ok();
        }
    }
}
