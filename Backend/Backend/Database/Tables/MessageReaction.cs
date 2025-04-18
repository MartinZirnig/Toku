using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;

[PrimaryKey(nameof(MessageId), nameof(ClientId))]
internal class MessageReaction
{
    [Column(Order = 0)]
    public uint MessageId { get; set; }
    [Column(Order = 1)]
    public uint ClientId { get; set; }

    [ForeignKey("StoredFileId")]
    public virtual Message Message { get; set; }
    [ForeignKey("ClientId")]
    public virtual Client Client { get; set; }

    [Required]
    public string Reaction { get; set; }

    [Required]
    public DateTime CreatedTime { get; set; }
}
