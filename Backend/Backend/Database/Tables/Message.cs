using MysqlDatabase.Tables;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

internal class Message
{
    [Key]
    public uint MessageId { get; set; }

    [Required]
    public string Content { get; set; }

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


    public virtual List<MessageStoredFile> MessageStoredFiles { get; set; } = new List<MessageStoredFile>();

    public virtual List<MessageStatus> MessageStatuses { get; set; } = new List<MessageStatus>();
    public virtual List<MessageReaction> MessageReactions { get; set; } = new List<MessageReaction>();
}