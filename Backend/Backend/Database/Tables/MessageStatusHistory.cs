using BackendEnums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;
internal class MessageStatusHistory
{
    [Key]
    public uint RecordId { get; set; }

    [Required]
    public uint MessageStatuseId { get; set; }
    [ForeignKey("MessageStatuseId")]
    public virtual MessageStatus MessageStatus { get; set; }

    [Required]
    public MessageStatusCode StatusCode { get; set; } 

    [Required]
    public DateTime Time { get; set; }
}
