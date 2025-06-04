namespace BackendInterface.DataObjects;
public class LoggedUserData
{
    public const int MinutesToRemove = 5;


    public Guid Identification { get; set; }
    public uint UserId { get; set; }
    public string PublicKey { get; set; } = string.Empty;
    public string DecryptedPrivateKey { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime LastHeartbeat { get; set; }
    public int TimeZoneOffset { get; set; }
    public DateTime CreatedTime { get; set; }

    public uint? PictureId { get; set; }

    public bool ShouldBeRemoved =>
        LastHeartbeat.AddMinutes(MinutesToRemove) < DateTime.Now;
}

