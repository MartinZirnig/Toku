namespace BackendInterface.Models;
public record GroupRemoveUserModel(
    Guid ExecutorContext,
    uint TargetUser,
    uint TargetGroup
    );
