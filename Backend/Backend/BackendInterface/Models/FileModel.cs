namespace BackendInterface.Models;
public record FileModel(
    byte[] Data,
    string FileName,
    byte fileType,
    Guid? UserOwner,
    uint? ClientOwner,
    uint? GroupOwner
);