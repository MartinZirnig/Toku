using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BackendInterfaces;
using Database.BackendEnums;

namespace Database.Tables;
public class Group
{
    [Key]
    public uint GroupId { get; set; }

    [Required]
    public uint CreatorId { get; set; }
    [ForeignKey("CreatorId")]
    public virtual Client Creator { get; set; }

    [Required]
    public uint Picture { get; set; }
    [ForeignKey("Picture")]
    public virtual StoredFile PictureStoredFile { get; set; }

    [Required]
    public string Name { get; set; }
    [Required]
    public string Description { get; set; }

    [Required]
    public GroupType GroupType { get; set; } 

    public HashedValue TwoUserIdentifier { get; set; } 
    public HashedValue Password { get; set; }

    [Required]
    public DateTime CreatedTime { get; set; }
    public DateTime? DeletedTime { get; set; }


    public virtual ICollection<GroupInvite> GroupInvites { get; set; } = new List<GroupInvite>();
    public virtual ICollection<GroupOperation> GroupOperations { get; set; } = new List<GroupOperation>();
    public virtual ICollection<GroupMessage> GroupMessages { get; set; } = new List<GroupMessage>();
    public virtual ICollection<GroupClient> GroupClients { get; set; } = new List<GroupClient>();
}