using BackendInterface;
using BackendInterface.DataObjects;
using BackendInterface.Models;
using Crypto;
using Microsoft.EntityFrameworkCore;
using MysqlDatabase.Tables;
using Org.BouncyCastle.Pkcs;
using System.Diagnostics;
using YamlDotNet.Serialization.ObjectFactories;

namespace MysqlDatabase;
internal class UserService : DatabaseServisLifecycle, IUserService
{
    public async Task<RequestResultModel> RegisterUserAsync(UserRegistrationModel model)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);

        try
        {
            if (await ExistsUserAsync(model.Name))
                return new RequestResultModel(false, "User already exists!");

            var KeyId = await InsertNewUserKeyAsync(model);
            var UserId = await InsertNewUserAsync(model, KeyId);

            await transaction.CommitAsync();
            return new RequestResultModel(true, string.Empty);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new RequestResultModel(false, ex.Message);
        }

    }
    private async Task<bool> ExistsUserAsync(string userName)
    {
        return await Context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Name == userName)
            is not null;
    }
    private async Task<uint> InsertNewUserKeyAsync(UserRegistrationModel model)
    {
        var key = new PPKeyPair(model.Password);
        var keyRow = new CryptoKey()
        {
            PublicKey = key.PublicKey,
            EncryptedPrivateKey = key.EncryptedPrivateKey,
            Salt = key.Salt,
            IV = key.IV,
            IsSimple = false,
        };
        await Context.CryptoKeys.AddAsync(keyRow);
        await Context.SaveChangesAsync();

        return keyRow.KeyId;
    }
    private async Task<uint> InsertNewUserAsync(UserRegistrationModel model, uint keyId)
    {
        var user = new User()
        {
            Name = model.Name,
            Email = model.Email,
            Password = HashedValue.HashPassword(model.Password),
            CreatedTime = DateTime.Now,
            KeyId = keyId,
            PictureId = 1,
            LastGroupId = 0
        };
        await Context.Users.AddAsync(user);
        await Context.SaveChangesAsync();

        return user.UserId;
    }


    public async Task<UserLoginResponseModel> LoginUserAsync(UserLoginModel model)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var user = await FindUserAsync(model);
            if (user is null)
                return new UserLoginResponseModel(
                    string.Empty, 0);

            var logged = await FinishUserLoggingAsync(model, user);

            await transaction.CommitAsync();
            return logged;
        }
        catch
        {
            await transaction.RollbackAsync();
            return new UserLoginResponseModel(
                string.Empty, 0);
        };


    }
    private async Task<User?> FindUserAsync(UserLoginModel model)
    {
        var user = await Context.Users
            .AsNoTracking()
            .Include(u => u.Key)
            .FirstOrDefaultAsync(u => u.Name == model.UserName);

        if (user is null) return null;
        if (user.Password.VerifyPassword(model.Password))
            return user;
        return null;
    }
    private async Task<UserLoginResponseModel> FinishUserLoggingAsync(UserLoginModel model, User user)
    {
        var login = new UserLogin()
        {
            SessionId = Guid.NewGuid(),
            UserId = user.UserId,
            DecryptedKey = ((PPKeyPair)user.Key).DecryptPrivateKey(model.Password),
            LoggedIn = DateTime.Now,
            LashHearthBeat = DateTime.Now
        };
        await Context.UserLogins.AddAsync(login);
        await Context.SaveChangesAsync();

        return new UserLoginResponseModel(login.SessionId.ToString(), user.LastGroupId);
    }

    public async Task<UserLoginResponseModel> LoginGoogleUserAsync(GmailAuthorizationModel model)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var registration = model.DeriveRegistration()
                with
            { Name = $"google_{model.Name}" };


            if (!await ExistsUserAsync(registration.Name))
                await RegisterUserAsync(registration);

            var login = await LoginUserAsync(registration.DeriveUserLogin());

            await transaction.CommitAsync();
            return login;
        }
        catch
        {
            await transaction.RollbackAsync();
            return new UserLoginResponseModel(
                string.Empty, 0);
        }
    }

    public async Task<LoggedUserData?> GetLoggedUserDataAsync(Guid identification)
    {
        try
        {
            var login = await FindLoggedUserAsync(identification);

            if (login is null)
                return null;

            return new LoggedUserData()
            {
                UserId = login.UserId,
                Identification = login.SessionId,
                Name = login.User.Name,
                Email = login.User.Email,
                DecryptedPrivateKey = login.DecryptedKey,
                PublicKey = login.User.Key.PublicKey,
                LastHeartbeat = login.LashHearthBeat
            };
        }
        catch (Exception ex)
        {
            return null;
        }

    }
    private async Task<UserLogin?> FindLoggedUserAsync(Guid identification)
    {
        return await Context.UserLogins
                .AsNoTracking()
                .Include(x => x.User)
                .ThenInclude(x => x.Key)
                .FirstOrDefaultAsync(x => x.SessionId == identification);
    }

    public async Task HeartbeatAsync(Guid identification)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var user = await Context.UserLogins
                .FirstOrDefaultAsync(u => u.SessionId == identification);

            if (user is null) return;
            user.LashHearthBeat = DateTime.Now;

            await transaction.CommitAsync();
            await Context.SaveChangesAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
        }
    }


    public async Task LogoutUserAsync(Guid identification)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var user = await Context.UserLogins
                .FirstOrDefaultAsync(x => x.SessionId == identification);
            if (user is null) return;

            user.DecryptedKey = string.Empty;
            user.LoggedOut = DateTime.Now;
            await Context.SaveChangesAsync();
            await transaction.RollbackAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
        }
    }

    public async Task LogoutAllUsersAsync()
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            await Context.UserLogins
                .Where(x => x.LoggedOut == null)
                .ExecuteUpdateAsync(ul => ul
                    .SetProperty(x => x.DecryptedKey, string.Empty)
                    .SetProperty(x => x.LoggedOut, DateTime.Now));
            await Context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
        }
    }

    public async Task<bool> IsLoggedInAsync(Guid identification)
    {
        return await Context.UserLogins
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.SessionId == identification)
            is not null;
    }
}

