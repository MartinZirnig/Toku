using BackendInterface;
using BackendInterface.Models;
using Microsoft.EntityFrameworkCore;
using MysqlDatabase.Tables;

namespace MysqlDatabase;

internal class ReservedDomainService : DatabaseServisLifecycle, IReservedDomainService
{
    public ReservedDomainService(MysqlDatabaseManager creator) : base(creator)
    {
    }

    public async Task<RequestResultModel> RegisterOrCreateDomainUser(DomainLoginCreation model)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);

        try
        {
            var domain = await Context.RegisteredDomains
                .FirstOrDefaultAsync(rd => rd.DomainName == model.DomainName)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();


            var user = Context.Users
                .FirstOrDefaultAsync(u =>
                    u.Name == model.UserName
                    && u.DomainId == domain.Id)
                .ConfigureAwait(false);




        }
        catch (Exception ex)
        {

        }
    }
    private async Task<RequestResultModel> RegisterDomainUser(DomainLoginCreation model, RegisteredDomain domain, User user)
    {

    }
    private async Task<RequestResultModel> CreateDomainUser(DomainLoginCreation model, RegisteredDomain domain)
    {

    }
}
