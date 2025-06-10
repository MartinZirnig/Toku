namespace BackendInterface.Models;

public record FileOwnerModel(
    uint FileId,
    uint UserOwner,
    uint ClientOwner,
    uint GroupOwner
    );