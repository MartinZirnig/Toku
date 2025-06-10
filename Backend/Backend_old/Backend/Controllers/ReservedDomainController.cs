using BackendInterface.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReservedDomainController : Controller
    {
        [HttpPost("create-or-login-user")]
        public async Task<IActionResult> CreateOrLoginUserAsync([FromBody] DomainLoginCreation model)
        {
            
        }


    }
}
