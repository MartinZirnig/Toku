namespace BackendInterface.Models;
public record MessageModel(

    string MessageContent,
    uint[]? AttachedFilesId,
    uint? PinnedMessageId,
    Guid SenderContext,
    uint GroupId
    );


