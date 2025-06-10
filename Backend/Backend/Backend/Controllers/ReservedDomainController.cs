using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Mvc;
namespace Backend.Controllers
{
    [ApiController]
    [Route("reserved-domain")]
    public class ReservedDomainController : Controller
    {
        private readonly ILogger<ReservedDomainController> _logger;
        private readonly IDatabaseServiceProvider _serviceProvider;
        public ReservedDomainController(
            IDatabaseServiceProvider serviceProvider,
            ILogger<ReservedDomainController> logger)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        [HttpPost("create-or-login-user")]
        public async Task<IActionResult> CreateOrLoginUserAsync([FromBody] DomainLoginCreation model)
        {
            using var service = _serviceProvider.GetReservedDomainService();
            var result = await service.RegisterOrCreateDomainUser(model)
                .ConfigureAwait(false);
            return Ok(result);
        }
        [HttpPost("connect-users")]
        public async Task<IActionResult> ConnectUsersAsync([FromBody] UserConnectionModel model)
        {
            using var service = _serviceProvider.GetReservedDomainService();
            return Ok(string.Empty);
        }

        [HttpPost("echo")]
        public async Task<IActionResult> EchoAsync()
        {
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();

            /*
            var dbContext = new DatabaseContext();
            var setting = new ColorSetting()
            {
                Colors = body
            };

            dbContext.ColorSettings.Add(setting);
            dbContext.SaveChanges();
            dbContext.Dispose();
            */

            return Content(body, "application/json");
        }

        [HttpPost("ensure-connection")]
        public async Task<IActionResult> EnsureConnectionAsync([FromBody] DomainUserConnectionModel model)
        {
            using var service = _serviceProvider.GetReservedDomainService();

            var result = await service.EnsureUserConnectionAsync(model)
                .ConfigureAwait(false);

            return Ok(result);

        }
    }
}
