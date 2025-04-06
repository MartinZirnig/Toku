using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables;

public class Message
{
    [Key]
    public uint MessageId { get; set; }

    [Required]
    public string Content { get; set; }

    public uint? File { get; set; }
    [ForeignKey("StoredFile")]
    public virtual StoredFile StoredFile { get; set; }

    [Required]
    public uint SenderId { get; set; }
    [ForeignKey("SenderId")]
    public virtual User Sender { get; set; }

    public uint? PinnedMessage { get; set; }
    [ForeignKey("PinnedMessage")]
    public virtual Message PinnedMessageNavigation { get; set; }

    [Required]
    public DateTime CreatedTime { get; set; }
    public DateTime? DeletedTime { get; set; }


    public virtual ICollection<MessageStatus> MessageStatuses { get; set; } = new List<MessageStatus>();
    public virtual ICollection<MessageReaction> MessageReactions { get; set; } = new List<MessageReaction>();
    public virtual ICollection<GroupMessage> GroupMessages { get; set; } = new List<GroupMessage>();
}
