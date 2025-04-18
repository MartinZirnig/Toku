using Crypto;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;

internal class Message
{
    [Key]
    public uint MessageId { get; set; }

    [Required]
    public string Content { get; set; }

    public uint? StoredFileId { get; set; }
    [ForeignKey("StoredFileId")]
    public virtual StoredFile StoredFile { get; set; }

    [Required]
    public uint SenderId { get; set; }
    [ForeignKey("SenderId")]
    public virtual User Sender { get; set; }

    public uint? PinnedMessageId { get; set; }
    [ForeignKey("PinnedMessageId")]
    public virtual Message PinnedMessage { get; set; }

    [Required]
    public DateTime CreatedTime { get; set; }
    public DateTime? DeletedTime { get; set; }
    [Required]
    public uint GroupId { get; set; }

    public virtual List<MessageStatus> MessageStatuses { get; set; } = new List<MessageStatus>();
    public virtual List<MessageReaction> MessageReactions { get; set; } = new List<MessageReaction>();
}
