using BackendInterfaces;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables;


public class User
{
    [Key]
    public uint UserId { get; set; }

    [Required]
    public uint Picture { get; set; }

    [ForeignKey("Picture")]
    public virtual StoredFile PictureStoredFile { get; set; }

    [Required]
    public string Name { get; set; }

    [Required]
    public HashedValue Password { get; set; } 

    [Required]
    public string Email { get; set; }

    [Required]
    public DateTime CreatedTime { get; set; }
    public DateTime? DeletedTime { get; set; }


    public virtual ICollection<UserLogin> UserLogins { get; set; } = new List<UserLogin>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<Client> Clients { get; set; } = new List<Client>();
}
