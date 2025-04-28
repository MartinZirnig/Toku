using System.ComponentModel.DataAnnotations;
using BackendEnums;

namespace MysqlDatabase.Tables;

internal class StoredFile
{
    [Key]
    public uint StoredFileId { get; set; }

    [Required]
    public FileType TypeCode { get; set; }

    [Required]
    public string Description { get; set; }

    [Required]
    public string FilePath { get; set; }
    [Required]
    public bool IsEncrypted { get; set; }
    public string? EncryptionKey { get; set; }

}
