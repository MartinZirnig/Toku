namespace BackendEnums;

public enum GroupClientPermission : byte
{
    IsAllowedToWrite = 0,
    IsAllowedToSendFiles = 1,
    CanRemoveMessages = 2,
    CanChangeInformations = 3,
    CanEditGroup = 4,
    CanEditGroupPicture = 5,
    CanAddMembers = 6,
    CanEditPermissions = 7,
    CanViewLog = 8,

    Admin = 255
}
