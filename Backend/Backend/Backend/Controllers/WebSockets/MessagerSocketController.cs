using Backend.Controllers.WebSockets.Management;

namespace Backend.Controllers.WebSockets;

[Socket("/messager")]
public class MessagerSocketController : SocketController
{
    protected override Task OnInit()
    {
        Console.WriteLine($"hello {UserContext.UserIdentification}");

        return Task.CompletedTask;
    }

    protected override Task OnTextReceived(string message)
    {
        Console.WriteLine(message);
        return Task.CompletedTask;
    }

    protected override Task OnClose()
    {
        Console.WriteLine($"bye {UserContext.UserIdentification}");

        return Task.CompletedTask;
    }

}
