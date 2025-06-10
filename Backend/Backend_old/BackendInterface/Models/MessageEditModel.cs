namespace BackendInterface.Models;
public record MessageEditModel(
    Guid EditorContext,
    uint MessageId,
    string NewContent
    );
