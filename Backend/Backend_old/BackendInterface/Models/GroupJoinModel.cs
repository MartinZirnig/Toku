namespace BackendInterface.Models;

public record GroupJoinModel(
    uint GroupId,
    string GroupName,
    string? Password = null
    );