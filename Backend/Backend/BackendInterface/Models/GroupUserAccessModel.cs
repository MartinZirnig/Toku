using BackendEnums;

namespace BackendInterface.Models;

public record GroupUserAccessModel(
    uint UserId,
    uint GroupId,
    GroupClientPermission[] Permissions
    )
{
    public string? Name { get; set; }
}