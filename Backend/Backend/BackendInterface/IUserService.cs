using BackendInterface.DataObjects;
using BackendInterface.Models;

namespace BackendInterface;
public interface IUserService : IDisposable
{
    Task<RequestResultModel> RegisterUserAsync(UserRegistrationModel model);
    Task<UserLoginResponseModel> LoginUserAsync(UserLoginModel model);
    Task<bool> IsLoggedInAsync(Guid identification);
    Task HeartbeatAsync(Guid identification);
    Task LogoutUserAsync(Guid identification);
    Task LogoutAllUsersAsync();

    Task<LoggedUserData?> GetLoggedUserDataAsync(Guid identification);
}
