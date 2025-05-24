using Backend.Attributes;
using System.Net.WebSockets;
using System.Reflection;
using System.Text;

namespace Backend.Controllers.WebSockets.Management;

public abstract class SocketController
{
    #region StaticManagement

    private readonly static IReadOnlyDictionary<string, Type> _controllerMap;
    private readonly static Dictionary<(Guid, Type), SocketController> _controllers;

    static SocketController()
    {
        var dic = new Dictionary<string, Type>();

        var controllers = Assembly
            .GetExecutingAssembly()
            .GetTypes()
            .Where(t =>
                t.IsSubclassOf(typeof(SocketController))
                && !t.IsAbstract
                 );

        foreach (var controller in controllers)
        {
            var attributeType = typeof(SocketAttribute);
            var attribute = controller
                .GetCustomAttribute(attributeType);

            if (attribute is null) continue;
            var castedAttribute = ((SocketAttribute)attribute);
            var url = castedAttribute.Url;

            dic[url] = controller;
        }

        _controllerMap = dic;
        _controllers = new();
    }




    public static async Task ServiceSocketRequest
        (HttpContext context, Func<Task> next)
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            var url = context.Request.Path;

            if (!_controllerMap.TryGetValue(url, out var controller))
            {
                await next();
                return;
            }

            if (!TryAuthorize(context, out var login))
            {
                context.Response.StatusCode = 401;
                return;
            }

            var socket = await context.WebSockets.AcceptWebSocketAsync();

            var key = (login, controller);

            if (Activator.CreateInstance(controller) is not SocketController instance)
            {
                context.Response.StatusCode = 500;
                return;
            }

            RegisterController(key, instance);

            instance.New(context, socket, key);

            try
            {
                await instance.Start();
            }
            catch
            {
                return;
            }

            return;
        }

        await next();
    }

    private static bool TryAuthorize(HttpContext context, out Guid uid)
    {
        if (context.Request.Query.TryGetValue("uid", out var result))
        {
            uid = Guid.Parse(result!);
            return true;
        }

        uid = Guid.Empty;
        return false;
    }


    private static void RegisterController(
        (Guid, Type) keys,
        SocketController controller)
    {
        _controllers[keys] = controller;
    }
    private static void DeregisterController(SocketController controller)
    {
        _controllers.Remove(controller.UserContext);
    }

    public static bool TryGetController<T>(Guid user, out T? controller)
        where T: SocketController
    {
        var key = (user, typeof(T));
        var result = _controllers.TryGetValue(key, out var control);
        controller = (T?)control;
        return result;
    }

    #endregion





    protected HttpContext HttpContext { get; private set; }
    protected WebSocket Socket { get; private set; }

    protected (Guid UserIdentification, Type ControllerType) UserContext;


    private void New(
        HttpContext context,
        WebSocket socket,
        (Guid, Type) user)
    {
        HttpContext = context;
        Socket = socket;
        UserContext = user;
    }
    private async Task Start()
    {
        await OnInit();
        await Read();
    }

    private async Task Read()
    {
        var buffer = new byte[1024];
        var segment = new ArraySegment<byte>(buffer);

        try
        {
            while (true)
            {
                var result = await Socket.ReceiveAsync(segment, CancellationToken.None);
                if (result == null) continue;

                await OnDataReceived(result);

                Span<byte> data = buffer.AsSpan(0, result.Count);

                await (result.MessageType switch
                {
                    WebSocketMessageType.Text => OnTextReceived(Encoding.UTF8.GetString(data)),
                    WebSocketMessageType.Binary => OnBinaryReceived(data.ToArray()),
                    WebSocketMessageType.Close => OnCloseReceived(data.ToArray()),
                    _ => Task.CompletedTask
                });

                if (result.CloseStatus.HasValue)
                {
                    await OnClose();
                    break;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Receive loop failed: {ex}");
            await Close();
        }
    }

    public async Task Close(
        WebSocketCloseStatus status = WebSocketCloseStatus.NormalClosure,
        string? description = null)
    {
        DeregisterController(this);
        await Socket.CloseAsync(status, description, CancellationToken.None);
    }

    private async Task Write(byte[] content, WebSocketMessageType type, bool endOfMessage)
    {
        await Socket.SendAsync(
            new ArraySegment<byte>(content, 0, content.Length),
            type,
            endOfMessage,
            CancellationToken.None);
    }
    public async Task WriteText(string msg)
    {
        var data = Encoding.UTF8.GetBytes(msg);
        var type = WebSocketMessageType.Text;

        await Write(data, type, true);
    }
    public async Task WriteBinary(byte[] msg)
    {
        var type = WebSocketMessageType.Binary;

        await Write(msg, type, true);
    }
    public async Task WriteClose(byte[] msg)
    {
        var type = WebSocketMessageType.Close;

        await Write(msg, type, true);
    }

    protected virtual Task OnInit() { return Task.CompletedTask; }
    protected virtual Task OnTextReceived(string message) { return Task.CompletedTask; }
    protected virtual Task OnBinaryReceived(byte[] message) { return Task.CompletedTask; }
    protected virtual Task OnCloseReceived(byte[] message) { return Task.CompletedTask; }
    protected virtual Task OnDataReceived(WebSocketReceiveResult data) { return Task.CompletedTask; }
    protected virtual Task OnClose() { return Task.CompletedTask; }
}
