using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("[controller]")]
public class GroupController : ControllerBase
{
    private readonly ILogger<GroupController> _logger;
    private readonly IDatabaseServiceProvider _serviceProvider;
    public GroupController(
        IDatabaseServiceProvider serviceProvider,
        ILogger<GroupController> logger)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    [HttpPost("SendMessage")]
    public IActionResult SendMessage([FromBody] MessageModel model)
    {
        using var service = _serviceProvider.GetDataService();
        var id = service.ReceiveMessage(model);
        if (id == 0)
            return BadRequest("Message cannot be saved");
        return Ok(id.ToString());
    }

    [HttpGet("GetMessages")]
    public IActionResult GetMessages
        ([FromQuery] string identification, [FromQuery] uint groupId, [FromQuery] uint count)
    {
        using var service = _serviceProvider.GetDataService();

        var uIdentification = Guid.Parse(identification);
        var data = service.GetGroupMessages(uIdentification, groupId, count);
        if (data is null)
            return BadRequest("No accessible messages");
        return Ok(data);
    }


}

