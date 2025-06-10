namespace BackendInterface.Models;
public record GroupCreationModel(
    Guid Creator,
    string Name,
    string Description,
    byte GroupType,
    string Password
    );