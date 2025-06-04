using Backend.Attributes;
using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Authorization]
    [Route("[controller]")]
    [ApiController]
    public class AiController : Controller
    {
        private readonly ILogger<AiController> _logger;
        private readonly IDatabaseServiceProvider _serviceProvider;
        public AiController(
            IDatabaseServiceProvider serviceProvider,
            ILogger<AiController> logger)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> CreateAsync([FromBody] AiQueryModel query)
        {
            using var service = _serviceProvider.GetDataService();

            var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

            var response = await service.AskAiAsync(query, executor);
            return Ok(response);
        }

        [HttpDelete("clean")]
        public async Task<IActionResult> CleanAsync()
        {
            using var service = _serviceProvider.GetDataService();

            var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

            var response = await service.ClearAiAsync(executor);
            return Ok(response);
        }

    }
}
