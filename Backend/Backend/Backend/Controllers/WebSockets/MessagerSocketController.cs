using Backend.Controllers.WebSockets.Management;
using BackendInterface;

namespace Backend.Controllers.WebSockets;

[Socket("/messager")]
public class MessagerSocketController : SocketController
{
    private readonly IDatabaseServiceProvider _serviceProvider;
    private readonly Dictionary<string, Func<string, Task>> _callbackMap;
    public MessagerSocketController(IDatabaseServiceProvider provider)
    {
        _serviceProvider = provider;
        _callbackMap = new()
        {
            { "typing-start", InformAboutStartTypingAsync },
            { "typing-stop", InformAboutStopTypingAsync },
        };
    }

    protected override async Task OnTextReceivedAsync(string message)
    {
        var splited = message.Split(' ', 2);
        if (_callbackMap.TryGetValue(splited[0], out var func))
        {
            await func(splited[1]);
        }
    }
    private async Task InformAboutStartTypingAsync(string data)
    {
        using var service = _serviceProvider.GetGroupService();
        var splited = data.Split('&');

        if (splited.Length is not 2) return;

        var groupId = uint.Parse(splited[0]);
        var userName = splited[1];

        var logins = await service
            .GetCurrentGroupUsersAsync(groupId)
            .ConfigureAwait(false);

        if (logins is null) return;

        foreach (var login in logins)
        {
            if (UserContext.UserIdentification == login.Identification) continue;


            if (!TryGetController(login.Identification,
                out MessagerSocketController? ctrl)) continue;

            if (ctrl is MessagerSocketController controller)
            {
                var text = $"start-typing {userName}";
                await controller.WriteTextAsync(text);
            }
        }
    }
    private async Task InformAboutStopTypingAsync(string data)
    {
        using var service = _serviceProvider.GetGroupService();
        var splited = data.Split('&');

        if (splited.Length is not 2) return;

        var groupId = uint.Parse(splited[0]);
        var userName = splited[1];

        var logins = await service
            .GetCurrentGroupUsersAsync(groupId)
            .ConfigureAwait(false);

        if (logins is null) return;

        foreach (var login in logins)
        {
            if (UserContext.UserIdentification == login.Identification) continue;

            if (!TryGetController(login.Identification,
                out MessagerSocketController? ctrl)) continue;

            if (ctrl is MessagerSocketController controller)
            {
                var text = $"stop-typing {userName}";
                await controller.WriteTextAsync(text);
            }
        }
    }

}
