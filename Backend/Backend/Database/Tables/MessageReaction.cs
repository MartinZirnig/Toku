using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables;
public class MessageReaction
{
    [Key, Column(Order = 0)]
    public uint MessageId { get; set; }
    [Key, Column(Order = 1)]
    public uint ClientId { get; set; }

    [ForeignKey("MessageId")]
    public virtual Message Message { get; set; }
    [ForeignKey("ClientId")]
    public virtual Client Client { get; set; }

    [Required]
    public string Reaction { get; set; }

    [Required]
    public DateTime CreatedTime { get; set; }
}
