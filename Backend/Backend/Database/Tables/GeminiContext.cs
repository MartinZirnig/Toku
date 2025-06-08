using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;

internal class GeminiContext
{
    [Key]
    public uint Id { get; set; }
    [Required]
    public Guid SessionId {  get; set; }
    [Required]
    public DateTime Time {  get; set; }
    [Required]
    public string Content { get; set; }
    [Required]
    [Column(TypeName = "tinyint(1)")]
    public bool IsSender { get; set; }
}
