using System.Security.Cryptography.X509Certificates;

namespace BackendInterface.Models;

public record class StreamedFileModel(
    bool IsUser, Stream SourceStream, string DestinationPath
    );