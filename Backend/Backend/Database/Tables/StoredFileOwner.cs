using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;
internal class StoredFileOwner
{
    [Key]
    [Column(Order = 0)]
    public uint FileId { get; set; }
    [ForeignKey("FileId")]
    public virtual StoredFile StoredFile { get; set; }

    public uint? UserOwnerId { get; set; }
    [ForeignKey("UserId")]
    public virtual User UserOwner { get; set; }

    public uint? ClientOwnerId { get; set; }
    [ForeignKey("ClientOwnerId")]
    public virtual Client ClientOwner { get; set; }

    public uint? GroupOwnerId { get; set; }
    [ForeignKey("GroupOwnerId")]
    public virtual Group GroupOwner { get; set; }
}
