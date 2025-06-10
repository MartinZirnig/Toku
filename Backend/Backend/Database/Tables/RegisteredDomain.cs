using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;

[Table("RegisteredDomains")]
internal class RegisteredDomain
{
    [Key]
    public uint Id { get; set; }
    [Required]
    public string DomainName { get; set; }
    [Required]
    public DateTime Registered { get; set; }
    public DateTime? Unregistered {  get; set; }

    [Required]
    public bool LimitsUsers { get; set; }
    [Required]
    public uint PreselectedColorSettingsId { get; set; }
    [ForeignKey("PreselectedColorSettingsId")]
    public virtual ColorSetting PreselectedColorSettings { get; set; }
}