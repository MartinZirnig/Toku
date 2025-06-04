using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace MysqlDatabase.Tables;

[PrimaryKey(nameof(SessionId), nameof(Time), nameof(IsSender))]
internal class GeminiContext
{
    [Required]
    public Guid SessionId {  get; set; }
    [Required]
    public DateTime Time {  get; set; }
    [Required]
    public string Content { get; set; }
    [Required]
    public bool IsSender { get; set; }
}
