using BackendEnums;
using Microsoft.EntityFrameworkCore.ValueGeneration.Internal;

namespace BackendInterface.Models;
public record StoredMessageModel(
    uint MessageId,
    string MessageContent,
    uint[]? AttachedFilesId,
    uint? PinnedMessageId,
    uint GroupId,
    byte Status,
    string Time,
    string? TimeStamp,
    string? PinnedMessagePreview,
    string? SenderPictureId,
    bool HasPinnedFile,
    ulong FilesSize,
    uint? PngId,
    string Reactions
    );