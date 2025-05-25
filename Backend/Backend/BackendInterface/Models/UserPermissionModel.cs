
namespace BackendInterface.Models;

public record UserPermissionModel(byte Code, string Alias)
{
    public static explicit operator UserPermissionModel((byte, string) value)
    {
        return new UserPermissionModel(value.Item1, value.Item2);
    }
    public static explicit operator (byte, string)(UserPermissionModel value)
    {
        return (value.Code, value.Alias);
    }
}