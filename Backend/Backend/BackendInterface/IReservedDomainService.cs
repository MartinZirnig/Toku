using BackendInterface.Models;

namespace BackendInterface;

public interface IReservedDomainService: IDisposable
{
    Task<UserLoginResponseModel?> RegisterOrCreateDomainUser(DomainLoginCreation model);
    Task<RequestResultModel> EnsureUserConnectionAsync(UserConnectionModel connection);
}