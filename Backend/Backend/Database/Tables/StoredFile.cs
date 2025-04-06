using Database.BackendEnums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables;

public class StoredFile
{
    [Key]
    public uint FileId { get; set; }

    [Required]
    public FileType TypeCode { get; set; } 

    [Required]
    public string Description { get; set; }

    [Required]
    public string FilePath { get; set; }
}
