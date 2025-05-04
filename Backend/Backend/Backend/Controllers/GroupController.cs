using Backend.Attributes;
using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Mvc;
using BackendEnums;

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

        var permission = await service
            .GetUsersPermissionsAsync((Guid)executor, model.groupId)
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

    [HttpPatch("update-access")]
    public async Task<IActionResult> UpdateAccessAsync([FromBody] GroupUserAccessModel model)
    {
        using var service = _serviceProvider.GetGroupService();

        var result = await service.UpdatePermissionAsync(model)
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
}
