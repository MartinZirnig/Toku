using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;
[PrimaryKey(nameof(UserId), nameof(MessageId))]
internal class UserMessage
{
    public uint UserId { get; set; }
    [ForeignKey("UserId")]
    public virtual User User { get; set; }

    public uint MessageId { get; set; }
    [ForeignKey("StoredFileId")]
    public virtual Message Message { get; set; }

    public string EncryptedKey { get; set; }
}

