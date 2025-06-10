using BackendEnums;

namespace BackendInterface.Models;
public record GroupAddUserModel(
    uint userId,
    uint groupId,
    GroupClientPermission Permission
    );
