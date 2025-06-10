using BackendInterface.Models;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace BackendInterface;

public interface IReservedDomainService: IDisposable
{
    Task<UserLoginResponseModel?> RegisterOrCreateDomainUser(DomainLoginCreation model);
    Task<RequestResultModel> EnsureUserConnectionAsync(DomainUserConnectionModel connection);
}