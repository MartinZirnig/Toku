using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;

internal class Notification
{
    [Key]
    public uint NotificationId { get; set; }

    [Required]
    public uint UserId { get; set; }
    [ForeignKey("UserId")]
    public virtual User User { get; set; }

    [Required]
    public string Message { get; set; }

    public DateTime? ReceivedTime { get; set; }

    [Required]
    public DateTime CreatedTime { get; set; }
}
