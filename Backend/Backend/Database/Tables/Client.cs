using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BackendInterfaces;

namespace Database.Tables;

public class Client
{

    [Key]
    public uint ClientId { get; set; }

    [Required]
    public uint UserId { get; set; }
    [ForeignKey("UserId")]
    public virtual User User { get; set; }

    public uint? LocalPicture { get; set; }
    [ForeignKey("LocalPicture")]
    public virtual StoredFile LocalPictureStoredFile { get; set; }

    public string LocalName { get; set; }
    public string LocalPassword { get; set; }


    public virtual List<GroupOperation> GroupOperationsEdited { get; set; } = [];
    public virtual List<GroupOperation> GroupOperationsTarget { get; set; } = [];
    public virtual List<MessageStatus> MessageStatuses { get; set; } = [];
    public virtual List<MessageReaction> MessageReactions { get; set; } = [];
    public virtual List<GroupClient> GroupClients { get; set; } = [];
}