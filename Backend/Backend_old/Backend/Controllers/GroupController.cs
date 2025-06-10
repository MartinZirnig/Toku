using Backend.Attributes;
using Backend.Controllers.WebSockets;
using Backend.Controllers.WebSockets.Management;
using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Mvc;
using Mysqlx.Prepare;

namespace Backend.Controllers;

[ApiController]
[Route("[controller]")]
[Authorization]
public sealed class GroupController : ControllerBase
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

    [HttpPost("create")]
    public async Task<IActionResult> CreateGroupAsync([FromBody] GroupCreationModel model)
    {
        using var service = _serviceProvider.GetGroupService();
        var result = await service.CreateGroupAsync(model)
            .ConfigureAwait(false);

        return Ok(result);
    }
    [HttpPatch("update")]
    public async Task<IActionResult> UpdateGroupAsync([FromBody] GroupUpdateModel model)
    {
        using var service = _serviceProvider.GetGroupService();

        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
        var result = await service
            .UpdateGroupAsync(model, executor)
            .ConfigureAwait(false);

        return Ok(result);
    }

    [HttpPost("add-user")]
    public async Task<IActionResult> AddGroupUserAsync([FromBody] GroupAddUserModel model)
    {
        using var service = _serviceProvider.GetGroupService();

        var executor = AuthorizationAttribute.GetUID(HttpContext);
        if (executor is null)
            return Unauthorized();

        //var permission = await service
        //    .GetUsersPermissionsAsync((Guid)executor, model.groupId)
        //    .ConfigureAwait(false);

        //if (!permission.Contains(GroupClientPermission.Admin))
        //    return Unauthorized();

        var result = await service.AddUserToGroupAsync(model)
            .ConfigureAwait(false);
        return Ok(result);
    }
    [HttpGet("get-user-groups")]
    public async Task<IActionResult> GetUserGroupsAsync()
    {
        using var service = _serviceProvider.GetGroupService();

        var executor = AuthorizationAttribute.GetUID(HttpContext);
        if (executor is null)
            return Unauthorized();

        var result = await service.GetAvailableGroupsAsync((Guid)executor)
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

        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
        var result = await service.ReadGroupAsync(model)
            .ConfigureAwait(false);

        var pings = await service
           .GetConnectedUsersInGroup(model.GroupId)
           .ConfigureAwait(false);

        var sockets = pings
            .Select(p =>
            {
                if (SocketController.TryGetController(p, out MessagerSocketController sock))
                    return sock;
                return null;
            });

        foreach (var socket in sockets)
            if (socket is not null)
                await socket.WriteTextAsync("refresh-statuses " + executor.ToString());



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

    [HttpPatch("update-access")]
    public async Task<IActionResult> UpdateAccessAsync([FromBody] GroupUserAccessModel model)
    {
        using var service = _serviceProvider.GetGroupService();

        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
        var result = await service.UpdatePermissionAsync(model, executor)
            .ConfigureAwait(false);

        return Ok(result);
    }
    [HttpGet("get-members")]
    public async Task<IActionResult> GetMembersAsync([FromQuery] uint groupId)
    {
        using var service = _serviceProvider.GetGroupService();

        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
        var result = await service.GetGroupMembersAsync(executor, groupId);

        return Ok(result);
    }
    [HttpGet("get-data")]
    public async Task<IActionResult> GetGroupDataAsync([FromQuery] uint groupId)
    {
        using var service = _serviceProvider.GetGroupService();

        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
        var result = await service.GetGroupAsync(executor, groupId);

        if (result is null)
            return BadRequest();
        return Ok(result);
    }

    [HttpGet("get-log")]
    public async Task<IActionResult> GetGroupLogAsync([FromQuery] uint groupId)
    {
        using var service = _serviceProvider.GetGroupService();

        var log = await service.GetGroupLogAsync(groupId)
            .ConfigureAwait(false);

        return Ok(log);
    }

    [HttpPatch("set-picure")]
    public async Task<IActionResult> SetGroupPicture([FromBody] GroupPictureModel model)
    {
        using var service = _serviceProvider.GetGroupService();

        var result = await service.SetGroupPictureAsync(model.GroupId, model.FileId)
            .ConfigureAwait(false);

        return Ok(result);
    }
    [HttpGet("get-picture")]
    public async Task<IActionResult> GetGroupPicture([FromQuery] uint groupId)
    {
        using var service = _serviceProvider.GetGroupService();
        var result = await service.GetGroupPicture(groupId)
            .ConfigureAwait(false);

        return Ok(result);
    }
    [HttpPost("join")]
    public async Task<IActionResult> JoinGroupAsync([FromBody] GroupJoinModel model)
    {
        using var service = _serviceProvider.GetGroupService();
        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
        var result = await service.JoinGroupAsync(model, executor)
            .ConfigureAwait(false);
        return Ok(result);
    }
    [HttpGet("get-public-groups")]
    public async Task<IActionResult> GetPublicGroupsAsync()
    {
        using var service = _serviceProvider.GetGroupService();
        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;


        var result = await service.GetPublicGroupsAsync(executor)
            .ConfigureAwait(false);

        return Ok(result);
    }
    [HttpGet("get-permissions")]
    public async Task<IActionResult> GetPermissionsAsync([FromQuery] uint groupId)
    {
        using var service = _serviceProvider.GetGroupService();
        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

        var result = await service
            .GetUserPermissionsAsync(executor, groupId)
            .ConfigureAwait(false);
        return Ok(result);
    }
    [HttpPatch("receive-messages")]
    public async Task<IActionResult> ReceiveMessagesAsync()
    {
        using var service = _serviceProvider.GetGroupService();
        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

        var result = await service
            .ReceiveMessagesAsync(executor)
            .ConfigureAwait(false);

        var pings = await service
            .GetConnectedCoGroupersAsync(executor)
            .ConfigureAwait(false);

        var sockets = pings
            .Select(p =>
            {
                if (SocketController.TryGetController(p, out MessagerSocketController sock))
                    return sock;
                return null;
            });

        foreach (var socket in sockets)
            if (socket is not null)
                await socket.WriteTextAsync("refresh-statuses " + executor.ToString());




        return Ok(result);
    }

}
