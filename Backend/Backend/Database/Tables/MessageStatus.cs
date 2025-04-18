using BackendEnums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MysqlDatabase.Tables;


internal class MessageStatus
{
    [Key]
    public uint MessageStatusId { get; set; }

    [Required]
    public uint MessageId { get; set; }
    [ForeignKey("StoredFileId")]
    public virtual Message Message { get; set; }

    [Required]
    public uint ClientId { get; set; }
    [ForeignKey("ClientId")]
    public virtual Client Client { get; set; }

    [Required]
    public MessageStatusCode StatusCode { get; set; } 

    [Required]
    public DateTime UpdatedTime { get; set; }


    public virtual List<MessageStatusHistory> MessageStatusHistories { get; set; } = new List<MessageStatusHistory>();
}
