using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;

[Table("ExplicitContacts")]
[PrimaryKey(nameof(AffectedUserId), nameof(TargetUserId))]
internal class ExplicitContact
{
    [Required]
    public uint AffectedUserId { get; set; }
    [Required]
    public uint TargetUserId { get; set; }
    [Required]
    public bool Visible { get; set; }
}
