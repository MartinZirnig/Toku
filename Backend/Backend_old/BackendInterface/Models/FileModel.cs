using BackendEnums;

namespace BackendInterface.Models;
public record FileModel(
    byte[] Data,
    string FileName,
    FileType fileType,
    Guid? UserOwner,
    uint? ClientOwner,
    uint? GroupOwner
);