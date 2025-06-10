namespace Backend.Controllers.WebSockets.Management;

[AttributeUsage(AttributeTargets.Class)]
public class SocketAttribute(string url) : Attribute
{
    public readonly string Url = url;
}
