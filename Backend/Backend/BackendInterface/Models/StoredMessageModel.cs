using BackendEnums;

namespace BackendInterface.Models;
public record StoredMessageModel(
    string MessageContent,
    uint? AttachedFileId,
    uint? PinnedMessageId,
    uint GroupId,
    MessageStatusCode Status
    );