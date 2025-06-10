namespace BackendInterface.Models;
public record UserLoginResponseModel(
    string UserIdentification,
    uint LastGroupId,
    uint UserId
    );
