namespace BackendInterface.Models;
public record AvailableGroupsModel(
    uint GroupId,
    string GroupName,
    string LastDecryptedMessage,
    string PicturePath,
    string LastOperation
    );

