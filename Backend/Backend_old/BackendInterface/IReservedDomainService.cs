using BackendInterface.Models;

namespace BackendInterface;

public interface IReservedDomainService
{
    Task<RequestResultModel> RegisterOrCreateDomainUser(DomainLoginCreation model);
}