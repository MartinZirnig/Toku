using Backend.Attributes;
using System.Net.WebSockets;
using System.Reflection;
using System.Text;

namespace Backend.Controllers.WebSockets.Management;

public abstract class SocketController
{
    private const int _expectedPingSize = 15;
    private const int _keepAliveSeconds = 62;

    #region StaticManagement

    private readonly static IReadOnlyDictionary<string, Type> _controllerMap;
    private readonly static Dictionary<(Guid, Type), SocketController> _controllers;
    private readonly static List<object> _toInject;


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
        _toInject = new();
    }

    public static void Inject<T>(T obj)
    {
        _toInject.Add(obj);
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

            object[] args = [.. _toInject];
            var instance = Activator.CreateInstance(controller, args);

            if (instance is not SocketController socketController)
            {
                context.Response.StatusCode = 500;
                return;
            }

            RegisterController(key, socketController);
            socketController.New(context, socket, key);

            try
            {
                await socketController.Start();
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




    private DateTime _lastPing = DateTime.UtcNow;
    protected HttpContext HttpContext { get; private set; }
    protected WebSocket Socket { get; private set; }
    protected readonly CancellationTokenSource _cancel = new CancellationTokenSource();

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
        await OnInitAsync();
        Task[] operations = [ReadAsync(), KeepAliveAsync()];
        await Task.WhenAll(operations);
    }

    private async Task KeepAliveAsync()
    {
        while (!_cancel.IsCancellationRequested)
        {
            await Task.Delay(30 * 1000);

            var testOffset = DateTime.UtcNow - _lastPing;
            var seconds = testOffset.TotalSeconds;

            if (seconds > _keepAliveSeconds)
            {
                Console.WriteLine("disconnected: " + seconds.ToString());
                Console.WriteLine("last ping:" + _lastPing.ToString("mm.ss:ff"));

                await CloseAsync();
            }
        }
    }

    private async Task ReadAsync()
    {
        var buffer = new byte[1024];
        var segment = new ArraySegment<byte>(buffer);

        try
        {
            while (!_cancel.IsCancellationRequested)
            {
                var result = await Socket.ReceiveAsync(segment, CancellationToken.None);
                if (result == null) continue;

                await OnDataReceivedAsync(result);

                Span<byte> data = buffer.AsSpan(0, result.Count);

                await (result.MessageType switch
                {
                    WebSocketMessageType.Text => OnTextReceivedAsync(Encoding.UTF8.GetString(data)),
                    WebSocketMessageType.Binary => ManageBinaryInputAsync(data.ToArray()),
                    WebSocketMessageType.Close => OnCloseReceivedAsync(data.ToArray()),
                    _ => Task.CompletedTask
                });

                if (result.CloseStatus.HasValue)
                {
                    await OnCloseAsync();
                    break;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Receive loop failed: {ex}");
            await CloseAsync();
        }
    }
    private Task ManageBinaryInputAsync(byte[] data)
    {
        if (IsPing(data))
        {
            _lastPing = DateTime.UtcNow;
            Console.WriteLine("updating last ping");
            return Task.CompletedTask;
        }

        return OnBinaryReceivedAsync(data);
    }
    private static bool IsPing(byte[] data)
    {
        if (data.Length is not _expectedPingSize) return false;

        for (int i = 0; i < _expectedPingSize; i++)
            if (data[i] != i)
                return false;
        return true;
    }

    public async Task CloseAsync(
        WebSocketCloseStatus status = WebSocketCloseStatus.NormalClosure,
        string? description = null)
    {
        await _cancel.CancelAsync();
        await Socket.CloseAsync(status, description, CancellationToken.None);
        DeregisterController(this);
    }

    private async Task WriteAsync(byte[] content, WebSocketMessageType type, bool endOfMessage)
    {
        await Socket.SendAsync(
            new ArraySegment<byte>(content, 0, content.Length),
            type,
            endOfMessage,
            CancellationToken.None);
    }
    public async Task WriteTextAsync(string msg)
    {
        Console.WriteLine("writting " + msg);
        var data = Encoding.UTF8.GetBytes(msg);
        var type = WebSocketMessageType.Text;

        await WriteAsync(data, type, true);
    }
    public async Task WriteBinaryAsync(byte[] msg)
    {
        var type = WebSocketMessageType.Binary;

        await WriteAsync(msg, type, true);
    }
    public async Task WriteCloseAsync(byte[] msg)
    {
        var type = WebSocketMessageType.Close;

        await WriteAsync(msg, type, true);
    }

    protected virtual Task OnInitAsync() { return Task.CompletedTask; }
    protected virtual Task OnTextReceivedAsync(string message) { return Task.CompletedTask; }
    protected virtual Task OnBinaryReceivedAsync(byte[] message) { return Task.CompletedTask; }
    protected virtual Task OnCloseReceivedAsync(byte[] message) { return Task.CompletedTask; }
    protected virtual Task OnDataReceivedAsync(WebSocketReceiveResult data) { return Task.CompletedTask; }
    protected virtual Task OnCloseAsync() { return Task.CompletedTask; }
}
