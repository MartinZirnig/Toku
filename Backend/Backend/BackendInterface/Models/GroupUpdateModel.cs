namespace BackendInterface.Models;

public record GroupUpdateModel(
    string Name,
    string Description,
    byte GroupType,
    string Password,
    uint GroupId,
    uint? FileId = null
    );
