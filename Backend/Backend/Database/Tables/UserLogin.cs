using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;
[PrimaryKey(nameof(SessionId), nameof(UserId))]
internal class UserLogin
{
    [Column(Order = 0)]
    public Guid SessionId { get; set; }

    [Column(Order = 1)]
    public uint UserId { get; set; }

    [ForeignKey("UserId")]
    public virtual User User { get; set; }
    [Required]
    public string DecryptedKey { get; set; }


    [Required]
    public DateTime LoggedIn { get; set; }
    [Required]
    public DateTime LashHearthBeat { get; set; }
    public DateTime? LoggedOut { get; set; }
    [Required]
    public int TimeZoneOffset { get; set; }
}