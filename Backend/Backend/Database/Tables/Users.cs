using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.InteropServices;
using BackendInterface;
using Crypto;

namespace MysqlDatabase.Tables;


internal class User
{
    [Key]
    public uint UserId { get; set; }

    [Required]
    public uint PictureId { get; set; }

    [ForeignKey("PictureId")]
    public virtual StoredFile Picture { get; set; }

    [Required]
    public string Name { get; set; }

    [Required]
    public HashedValue Password { get; set; }

    [Required]
    public uint KeyId { get; set; }
    [ForeignKey("KeyId")]
    public virtual CryptoKey Key { get; set; }

    [Required]
    public uint LastGroupId { get; set; }


    [Required]
    public string Email { get; set; }

    [Required]
    public DateTime CreatedTime { get; set; }
    public DateTime? DeletedTime { get; set; }
    public string Phone { get; set; }


    public virtual List<UserLogin> UserLogins { get; set; } = new List<UserLogin>();
    public virtual List<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual List<Client> Clients { get; set; } = new List<Client>();
}
