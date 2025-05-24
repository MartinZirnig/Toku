using Backend.Attributes;
using Backend.Controllers.WebSockets;
using Backend.Controllers.WebSockets.Management;
using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Authorization]
[Route("[controller]")]
[ApiController]
public sealed class MessageController : ControllerBase
{

    private readonly ILogger<MessageController> _logger;
    private readonly IDatabaseServiceProvider _serviceProvider;
    public MessageController(
        IDatabaseServiceProvider serviceProvider,
        ILogger<MessageController> logger)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }


    [HttpPost("send-message")]
    public async Task<IActionResult> SendMessageAsync([FromBody] MessageModel model)
    {
        using var service = _serviceProvider.GetDataService();
        using var groupService = _serviceProvider.GetGroupService();
        using var userService = _serviceProvider.GetUserService();

        var id = await service.ReceiveMessageAsync(model)
            .ConfigureAwait(false);

        if (id == 0)
            return BadRequest("Message cannot be saved");

        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
        var executorContext = await userService.GetUserDataAsync(executor);
        var addresators = await groupService.GetActiveGroupUsersAsync(model.GroupId);

        foreach (var addresator in addresators)
        {
            if (addresator.Identification == executor) continue;
            if (SocketController.TryGetController<MessagerSocketController>(
                addresator.Identification, out var controller))
            {
                var message = await service.GetMessageAsync(executor, id)
                    .ConfigureAwait(false);

                var files = message?.AttachedFilesId is null
                    ? string.Empty
                    : string.Join('$', message.AttachedFilesId);

                var socketMessage = $"new-message {executorContext.Name}#{model.GroupId}#" +
                    $"{message!.MessageId}" +
                    $"&{message.MessageContent}" +
                    $"&{message.GroupId}" +
                    $"&{message.Status}" +
                    $"&{message.time}" +
                    $"&{message.PinnedMessagePreview}" +
                    $"&{message.timeStamp}" +
                    $"&{files}" +
                    $"&{message.PinnedMessageId}";

                await controller!.WriteText(socketMessage);
            }
        }





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
        var user = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

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
