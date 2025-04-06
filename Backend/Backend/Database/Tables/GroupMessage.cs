using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables;

public class GroupMessage
{
    [Key, Column(Order = 0)]
    public uint GroupId { get; set; }
    [Key, Column(Order = 1)]
    public uint MessageId { get; set; }

    [ForeignKey("GroupId")]
    public virtual Group Group { get; set; }
    [ForeignKey("MessageId")]
    public virtual Message Message { get; set; }
}
