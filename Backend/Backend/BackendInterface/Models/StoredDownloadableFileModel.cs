namespace BackendInterface.Models;

public record StoredDownloadableFileModel(
    string Name,
    long Size,
    uint Id
    );