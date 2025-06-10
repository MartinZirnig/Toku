using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Crypto;
using BackendEnums;

namespace MysqlDatabase.Tables;
internal class Group
{
    [Key]
    public uint GroupId { get; set; }

    [Required]
    public uint CreatorId { get; set; }
    [ForeignKey("CreatorId")]
    public virtual Client Creator { get; set; }

    [Required]
    public uint PictureId { get; set; }
    [ForeignKey("PictureId")]
    public virtual StoredFile PictureStoredFile { get; set; }

    [Required]
    public string Name { get; set; }
    [Required]
    public string Description { get; set; }

    [Required]
    public GroupType GroupType { get; set; }

    public HashedValue? TwoUserIdentifier { get; set; }
    public HashedValue? Password { get; set; }

    [Required]
    public DateTime CreatedTime { get; set; }
    [Required]
    public DateTime LastOperation { get; set; }
    public DateTime? DeletedTime { get; set; }


    public virtual List<Message> Messages { get; set; } = new List<Message>();
    public virtual List<GroupInvite> GroupInvites { get; set; } = new List<GroupInvite>();
    public virtual List<GroupOperation> GroupOperations { get; set; } = new List<GroupOperation>();
    public virtual List<GroupClient> GroupClients { get; set; } = new List<GroupClient>();
}