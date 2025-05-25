namespace BackendEnums;

public enum GroupClientPermission : byte
{
    DenyAll = 0,
    ReadMessages = 1,
    EditMessages = 2,
    EditSettings = 3,
    Admin = 255
}
