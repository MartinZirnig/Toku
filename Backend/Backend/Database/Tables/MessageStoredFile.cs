using Microsoft.EntityFrameworkCore;

[PrimaryKey(nameof(StoredFileId), nameof(MessageId))]
internal class MessageStoredFile
{
    public uint StoredFileId { get; set; }
    public virtual StoredFile StoredFile { get; set; }

    public uint MessageId { get; set; }
    public virtual Message Message { get; set; }
}