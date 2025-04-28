using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;
[PrimaryKey(nameof(UserId), nameof(StoredFileId))]
internal class UserFileEncryption
{
    [Required]
    public uint UserId { get; set; }
    [ForeignKey("UserId")]
    public virtual User User { get; set; }
    [Required]
    public uint StoredFileId { get; set; }
    [ForeignKey("StoredFileId")]
    public virtual StoredFile StoredFile { get; set; }

    [Required]
    public string EncryptedFileKey { get; set; }


}

