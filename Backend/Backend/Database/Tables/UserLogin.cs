using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables;
public class UserLogin
{
    [Key, Column(Order = 0)]
    public Guid SessionId { get; set; }

    [Key, Column(Order = 1)]
    public uint UserId { get; set; }

    [ForeignKey("UserId")]
    public virtual User User { get; set; }

    [Required]
    public DateTime LoggedIn { get; set; }
    public DateTime? LoggedOut { get; set; }
}