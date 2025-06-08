using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

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
    public bool IsSender { get; set; }
}
