namespace BackendEnums;

public enum MessageOperation : byte
{
    reply = 0,
    react = 1,
    copy = 2,
    delete = 3,
    edit = 4,
}
