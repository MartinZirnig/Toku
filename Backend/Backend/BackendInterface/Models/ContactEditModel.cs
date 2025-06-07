namespace BackendInterface.Models;

public record ContactEditModel(
        uint TargetUserId,
        bool Visible
    );