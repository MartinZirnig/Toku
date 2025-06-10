using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Crypto;

namespace MysqlDatabase.Tables;

internal class Client
{

    [Key]
    public uint ClientId { get; set; }

    [Required]
    public uint UserId { get; set; }
    [ForeignKey("UserId")]
    public virtual User User { get; set; }

    public uint? LocalPicture { get; set; }
    [ForeignKey("LocalPictureId")]
    public virtual StoredFile LocalPictureStoredFile { get; set; }

    public string LocalName { get; set; }
    public HashedValue LocalPassword { get; set; }

    public virtual List<GroupClient> GroupRelations { get; set; }
    public virtual List<MessageReaction> MessageReactions { get; set; } = [];
    public virtual List<Message> Messages { get; set; } = [];
}