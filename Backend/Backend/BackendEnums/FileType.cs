namespace BackendEnums;

public enum FileType : byte
{
    Image = 0,
    Video = 1,
    Audio = 2,
    Document = 3,
    Archive = 4,
    Text = 5,

    Other = 255,
}
