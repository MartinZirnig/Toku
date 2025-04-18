namespace BackendInterface.Models;
public record MessageModel(

    string MessageContent,
    uint? AttachedFileId,
    uint? PinnedMessageId,
    Guid SenderContext,
    uint GroupId
    );


