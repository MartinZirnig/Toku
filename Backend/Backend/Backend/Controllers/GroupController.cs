using Backend.Attributes;
using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Mvc;
using BackendEnums;

namespace Backend.Controllers;

[ApiController]
[Route("[controller]")]
[Authorization]
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

    [HttpPost("create-group")]
    public async Task<IActionResult> CreateGroup([FromBody] GroupCreationModel model)
    {
        using var service = _serviceProvider.GetGroupService();
        var result = await service.CreateGroupAsync(model);

        return Ok(result);
    }

    [HttpPost("add-group-user")]
    public async Task<IActionResult> AddGroupUser([FromBody] GroupAddUserModel model)
    {
        using var service = _serviceProvider.GetGroupService();

        var executor = Guid.Parse(HttpContext.Items[AuthorizationAttribute.UserIdentificationKey]!.ToString()!);

        var permission = await service.GetUsersPermissions(executor, model.groupId);
        if (!permission.Contains(GroupClientPermission.Admin))
            return Unauthorized();

        var result = await service.AddUserToGroupAsync(model);
        return Ok(result);
    }


    [HttpPost("send-message")]
    public async Task<IActionResult> SendMessage([FromBody] MessageModel model)
    {
        using var service = _serviceProvider.GetDataService();
        var id = await service.ReceiveMessageAsync(model);
        if (id == 0)
            return BadRequest("Message cannot be saved");
        return Ok(id.ToString());
    }

    [HttpGet("get-messages")]
    public async Task<IActionResult> GetMessages
        ([FromQuery] string identification, [FromQuery] uint groupId, [FromQuery] uint count)
    {
        using var service = _serviceProvider.GetDataService();

        var uIdentification = Guid.Parse(identification);
        var data = await service.GetGroupMessagesAsync(uIdentification, groupId, count);
        if (data is null)
            return BadRequest("No accessible messages");
        return Ok(data);
    }


}

