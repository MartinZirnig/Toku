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
    public async Task<IActionResult> CreateGroupAsync([FromBody] GroupCreationModel model)
    {
        using var service = _serviceProvider.GetGroupService();
        var result = await service.CreateGroupAsync(model)
            .ConfigureAwait(false);

        return Ok(result);
    }

    [HttpPost("add-group-user")]
    public async Task<IActionResult> AddGroupUserAsync([FromBody] GroupAddUserModel model)
    {
        using var service = _serviceProvider.GetGroupService();

        var executor = Guid.Parse(HttpContext.Items[AuthorizationAttribute.UserIdentificationKey]!.ToString()!);

        var permission = await service.GetUsersPermissionsAsync(executor, model.groupId)
            .ConfigureAwait(false);
        if (!permission.Contains(GroupClientPermission.Admin))
            return Unauthorized();

        var result = await service.AddUserToGroupAsync(model)
            .ConfigureAwait(false);
        return Ok(result);
    }
    [HttpGet("get-user-groups")]
    public async Task<IActionResult> GetUserGroupsAsync()
    {
        using var service = _serviceProvider.GetGroupService();
        var user = Guid.Parse(HttpContext.Items[AuthorizationAttribute.UserIdentificationKey]!.ToString()!);

        var result = await service.GetAvailableGroupsAsync(user)
            .ConfigureAwait(false);
        return Ok(result);
    }
    [HttpPatch("update-last-group")]
    public async Task<IActionResult> UpdateLastGroupAsync([FromBody] UserGroupModel model)
    {
        using var service = _serviceProvider.GetGroupService();

        var result = await service.UpdateLastGroupAsync(model)
            .ConfigureAwait(false);
        return Ok(result);
    }
    [HttpPatch("read-group")]
    public async Task<IActionResult> ReadGroupAsync([FromBody] UserGroupModel model)
    {
        using var service = _serviceProvider.GetGroupService();

        var result = await service.ReadGroupAsync(model)
            .ConfigureAwait(false);

        return Ok(result);
    }

    [HttpDelete("remove-user")]
    public async Task<IActionResult> RemoveUserAsync([FromQuery] GroupRemoveUserModel model)
    {
        using var service = _serviceProvider.GetGroupService();
        var result = await service.RemoveUserFromGroupAsync(model)
            .ConfigureAwait(false);
        return Ok(result);
    }







    [HttpPost("send-message")]
    public async Task<IActionResult> SendMessageAsync([FromBody] MessageModel model)
    {
        using var service = _serviceProvider.GetDataService();
        var id = await service.ReceiveMessageAsync(model)
            .ConfigureAwait(false);
        if (id == 0)
            return BadRequest("Message cannot be saved");
        return Ok(id.ToString());
    }

    [HttpGet("get-messages")]
    public async Task<IActionResult> GetMessagesAsync
        ([FromQuery] string identification, [FromQuery] uint groupId, [FromQuery] uint? count)
    {
        using var service = _serviceProvider.GetDataService();

        var uIdentification = Guid.Parse(identification);
        var data = await service.GetGroupMessagesAsync(uIdentification, groupId, count)
            .ConfigureAwait(false);
        if (data is null)
            return BadRequest("No accessible messages");
        return Ok(data);
    }
    [HttpGet("get-message")]
    public async Task<IActionResult> GetMessageAsync([FromQuery] uint messageId)
    {
        using var service = _serviceProvider.GetDataService();
        var user = Guid.Parse(HttpContext.Items[AuthorizationAttribute.UserIdentificationKey]!.ToString()!);

        var result = await service.GetMessageAsync(user, messageId)
            .ConfigureAwait(false);
        return Ok(result);
    }

    [HttpPatch("update-message")]
    public async Task<IActionResult> UpdateMessageAsync([FromBody] MessageEditModel model)
    {
        using var service = _serviceProvider.GetDataService();
        var result = await service.UpdateMessageAsync(model)
            .ConfigureAwait(false);
        return Ok(result);
    }
    [HttpDelete("remove-message")]
    public async Task<IActionResult> RemoveMessageAsync([FromQuery] MessageRemoveModel model)
    {
        using var service = _serviceProvider.GetDataService();

        var result = await service
            .RemoveMessageAsync(model)
            .ConfigureAwait(false);

        return Ok(result);
    }

}
