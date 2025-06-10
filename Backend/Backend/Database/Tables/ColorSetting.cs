using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;
[Table("ColorSettings")]
internal class ColorSetting
{
    [Key]
    public uint Id {  get; set; }
    [Required]
    public string Colors { get; set; }
}
