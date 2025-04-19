using BackendEnums;

namespace BackendInterface.Models;
public record StoredMessageModel(
    string MessageContent,
    uint? AttachedFileId,
    uint? PinnedMessageId,
    uint GroupId,
    byte Status,
    string time,
    string? timeStamp,
    string? PinnedMessagePreview
    );