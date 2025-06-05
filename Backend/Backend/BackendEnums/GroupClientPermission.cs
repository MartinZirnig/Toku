namespace BackendEnums;

public enum GroupClientPermission : byte
{
    IsAllowedToWrite = 0,
    IsAllowedToSendFiles = 1,
    CanChangeInformations = 2,
    CanEditGroup = 3,
    CanEditGroupPicture = 4,
    CanAddMembers = 5,
    CanEditPermissions = 6,
    CanViewLog = 7,

    Admin = 255
}
