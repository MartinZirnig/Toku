using BackendEnums;
using BackendInterface;
using BackendInterface.Models;
using Crypto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MysqlDatabase.Tables;
using Org.BouncyCastle.Tls.Crypto;

namespace MysqlDatabase;

internal class ReservedDomainService : DatabaseServisLifecycle, IReservedDomainService
{
    public ReservedDomainService(MysqlDatabaseManager creator) : base(creator)
    {
    }

    public async Task<UserLoginResponseModel?> RegisterOrCreateDomainUser(DomainLoginCreation model)
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


            var user = await Context.Users
                .FirstOrDefaultAsync(u =>
                    u.Name == model.UserName
                    && u.DomainId == domain.Id)
                .ConfigureAwait(false);

            if (user is null)
                return await this.RegisterDomainUser(model, domain);
            return await this.LoginDomainUser(model, domain, user);
        }
        catch (Exception ex)
        {
            return null;
        }
    }
    private async Task<UserLoginResponseModel> RegisterDomainUser(DomainLoginCreation model, RegisteredDomain domain)
    {
        var key = new PPKeyPair(model.UserPassword);
        var keyRow = new CryptoKey()
        {
            PublicKey = key.PublicKey,
            EncryptedPrivateKey = key.EncryptedPrivateKey,
            Salt = key.Salt,
            IV = key.IV,
            IsSimple = false,
        };
        await Context.CryptoKeys.AddAsync(keyRow)
            .ConfigureAwait(false);
        await Context.SaveChangesAsync()
            .ConfigureAwait(false);

        var user = new User()
        {
            Name = model.UserName,
            Email = model.Email,
            Phone = model.Phone,
            Password = HashedValue.HashPassword(model.UserPassword),
            CreatedTime = DateTime.Now,
            KeyId = keyRow.KeyId,
            PictureId = 1,
            LastGroupId = 0
        };
        await Context.Users.AddAsync(user)
            .ConfigureAwait(false);
        await Context.SaveChangesAsync()
            .ConfigureAwait(false);

        return await LoginDomainUser(model, domain, user);
    }
    private async Task<UserLoginResponseModel> LoginDomainUser(DomainLoginCreation model, RegisteredDomain domain, User user)
    {
        var login = new UserLogin()
        {
            SessionId = Guid.NewGuid(),
            UserId = user.UserId,
            DecryptedKey = ((PPKeyPair)user.Key).DecryptPrivateKey(model.UserPassword),
            LoggedIn = DateTime.Now,
            LashHearthBeat = DateTime.Now,
            TimeZoneOffset = model.TimeZoneOffset
        };
        await Context.UserLogins.AddAsync(login);
        await Context.SaveChangesAsync();

        return new UserLoginResponseModel(login.SessionId.ToString(), user.LastGroupId, user.UserId);
    }

    public async Task<RequestResultModel> EnsureUserConnectionAsync(DomainUserConnectionModel connection)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);

        try
        {
            var group = await Context.Groups
                .Include(g => g.GroupClients)
                    .ThenInclude(gc => gc.Client)
                .FirstOrDefaultAsync(g =>
                    g.GroupClients.Any(gc =>
                        gc.Client.UserId == connection.Usr1)
                    && g.GroupClients.Any(gc =>
                        gc.Client.UserId == connection.Usr2)
                    )
                .ConfigureAwait(false);

            var u1 = await Context.Users
                .FirstOrDefaultAsync(u => u.UserId == connection.Usr1)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var u2 = await Context.Users
                .FirstOrDefaultAsync(u => u.UserId == connection.Usr2)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            if (group is null)
            {
                var grpContext = (GroupService)(DatabaseServisLifecycle)this;
                string name = $"{u1.Name} -> {u2.Name}";

                group = new Group()
                {
                    CreatorId = 1,
                    Name = name,
                    PictureId = 1,
                    Description = name,
                    GroupType = GroupType.Private,
                    TwoUserIdentifier = null,
                    Password = HashedValue.HashPassword(string.Empty),
                    CreatedTime = DateTime.UtcNow,
                    LastOperation = DateTime.UtcNow
                };

                await Context.Groups.AddAsync(group);
                await Context.SaveChangesAsync();

                var usr1Add = new GroupAddUserModel(
                    u1.UserId, group.GroupId, GroupClientPermission.IsAllowedToWrite);
                await grpContext.AddUserToGroupAsync(usr1Add);

                var usr2Add = new GroupAddUserModel(
                    u2.UserId, group.GroupId, GroupClientPermission.IsAllowedToWrite);
                await grpContext.AddUserToGroupAsync(usr2Add);

                await transaction.CommitAsync();

            }

            return new RequestResultModel(
               true, group!.GroupId.ToString());

        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(
                false, ex.Message);
        }
    }
}
