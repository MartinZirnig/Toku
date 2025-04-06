using Database.BackendEnums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables;


public class MessageStatus
{
    [Key]
    public uint MessageStatusId { get; set; }

    [Required]
    public uint MessageId { get; set; }
    [ForeignKey("MessageId")]
    public virtual Message Message { get; set; }

    [Required]
    public uint ClientId { get; set; }
    [ForeignKey("ClientId")]
    public virtual Client Client { get; set; }

    [Required]
    public MessageStatusCode StatusCode { get; set; } 

    [Required]
    public DateTime UpdatedTime { get; set; }


    public virtual ICollection<MessageStatusHistory> MessageStatusHistories { get; set; } = new List<MessageStatusHistory>();
}
