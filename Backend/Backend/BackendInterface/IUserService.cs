using BackendInterface.DataObjects;
using BackendInterface.Models;

namespace BackendInterface;
public interface IUserService : IDisposable
{
    Task<RequestResultModel> RegisterUserAsync(UserRegistrationModel model);
    Task<UserLoginResponseModel> LoginUserAsync(UserLoginModel model);
    Task<UserLoginResponseModel> LoginGoogleUserAsync(GmailAuthorizationModel model);
    Task<bool> IsLoggedInAsync(Guid identification);
    Task HeartbeatAsync(Guid identification);
    Task LogoutUserAsync(Guid identification);
    Task LogoutAllUsersAsync();

    Task<RequestResultModel> EditUserAsync(UserDataModel model, Guid identification);
    Task<UserDataModel?> GetUserDataAsync(Guid identification);

    Task<LoggedUserData?> GetLoggedUserDataAsync(Guid identification);
    Task<IEnumerable<KnownUserDataModel>> GetKnownUserAsync(Guid identification);
    Task<RequestResultModel> SetProfileImageAsync(Guid executor, uint fileId);
    Task<RequestResultModel> GetProfileImageAsync(uint userId);
    Task<bool> IsExecutorUserAsync(Guid executor, uint user);
}
