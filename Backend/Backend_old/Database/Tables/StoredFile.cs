using BackendEnums;
using MysqlDatabase.Tables;
using System.ComponentModel.DataAnnotations;

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

    public virtual List<MessageStoredFile> MessageStoredFiles { get; set; } = new List<MessageStoredFile>();
}