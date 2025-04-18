using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BackendEnums;

namespace MysqlDatabase.Tables;

internal class GroupOperation
{
    [Key]
    public uint GroupOperationId { get; set; }

    [Required]
    public uint GroupId { get; set; }
    [ForeignKey("GroupId")]
    public virtual Group Group { get; set; }

    [Required]
    public uint EditorId { get; set; }
    [ForeignKey("EditorId")]
    public virtual Client Editor { get; set; }

    [Required]
    public uint TargetUserId { get; set; }
    [ForeignKey("TargetUserId")]
    public virtual Client TargetUser { get; set; }

    [Required]
    public string Description { get; set; }

    [Required]
    public OperationCode OperationCode { get; set; } 

    [Required]
    public DateTime CreatedTime { get; set; }
}
