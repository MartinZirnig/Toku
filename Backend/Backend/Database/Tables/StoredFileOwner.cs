using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables;
public class StoredFileOwner
{
    [Key]
    [Column(Order = 0)]
    public uint FileId { get; set; }
    [ForeignKey("FileId")]
    public virtual StoredFile StoredFile { get; set; }

    public uint? UserOwner { get; set; }
    [ForeignKey("UserOwner")]
    public virtual User UserOwnerNavigation { get; set; }

    public uint? ClientOwner { get; set; }
    [ForeignKey("ClientOwner")]
    public virtual Client ClientOwnerNavigation { get; set; }

    public uint? GroupOwner { get; set; }
    [ForeignKey("GroupOwner")]
    public virtual Group GroupOwnerNavigation { get; set; }
}
