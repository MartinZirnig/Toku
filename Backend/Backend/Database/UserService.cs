using BackendInterface;
using BackendInterface.DataObjects;
using BackendInterface.Models;
using Crypto;
using Microsoft.EntityFrameworkCore;
using MysqlDatabase.Tables;

namespace MysqlDatabase;
internal class UserService : DatabaseServisLifecycle, IUserService
{
    public UserService(MysqlDatabaseManager creator)
        : base(creator) { }

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
            .ConfigureAwait(false)
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
            Phone = string.Empty,
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
                    string.Empty, 0, 0);

            var logged = await FinishUserLoggingAsync(model, user);

            await transaction.CommitAsync();
            return logged;
        }
        catch
        {
            await transaction.RollbackAsync();
            return new UserLoginResponseModel(
                string.Empty, 0, 0);
        }
        ;


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
            LashHearthBeat = DateTime.Now,
            TimeZoneOffset = model.TimeZone
        };
        await Context.UserLogins.AddAsync(login);
        await Context.SaveChangesAsync();

        return new UserLoginResponseModel(login.SessionId.ToString(), user.LastGroupId, user.UserId);
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
                string.Empty, 0, 0);
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
            await this.Creator.UserWatcher.LogoutAsync(identification, Context);

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
            await Creator.UserWatcher.LogoutAll(Context);

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

    public async Task<RequestResultModel> EditUserAsync(UserDataModel model, Guid identification)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var user = await SupportService
                .GetUserDataAsync(identification, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var userData = await Context.Users
                .FirstOrDefaultAsync(u => u.UserId == user.UserId)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            userData.Name = model.Name;
            userData.Email = model.Email;
            userData.Phone = model.PhoneNumber;
            userData.PictureId = model.Picture is not null
                ? uint.Parse(model.Picture): 1;

            await Context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new RequestResultModel(true, string.Empty);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new RequestResultModel(false, ex.Message);
        }
    }

    public async Task<UserDataModel?> GetUserDataAsync(Guid identification)
    {
        try
        {
            var user = await SupportService
                .GetUserDataAsync(identification, Context)
                .ConfigureAwait(false);

            if (user is null) return null;

            var result = new UserDataModel(
            user.Name, user.Email, user.Phone,
            user.CreatedTime.ToString("dd.MMMM yyyy"),
            user.PictureId.ToString()
            );
            return result;
        }
        catch
        {
            return null;
        }
    }


    public async Task<IEnumerable<KnownUserDataModel>> GetKnownUserAsync(Guid identification)
    {
        try
        {
            var login = await SupportService
                .GetUserDataAsync(identification, Context)
                .ConfigureAwait(false);
            if (login is null) return [];

            var groups = await Context.Clients
                .Include(c => c.GroupRelations)
                    .ThenInclude(g => g.Group)
                        .ThenInclude(g => g.GroupClients)
                            .ThenInclude(gc => gc.Client)
                                .ThenInclude(c => c.User)
                .Where(c => c.UserId == login.UserId)
                .Select(c => c.GroupRelations[0].Group)
                .ToListAsync()
                .ConfigureAwait(false);

            var result = new List<KnownUserDataModel>();
            foreach (var group in groups)
            {
                foreach(var client in group.GroupClients)
                {
                    var user = client.Client.User;
                    var userData = new KnownUserDataModel(
                        user.Name, user.UserId);

                    if (!result.Contains(userData))
                        result.Add(userData);
                }
            }

            return result;
        }
        catch
        {
            return [];
        }
    }

    public async Task<RequestResultModel> SetProfileImageAsync(Guid executor, uint fileId)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);

        try
        {
            var login = await SupportService
                .GetUserDataAsync(executor, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var owner = await Context.StoredFileOwners
                .FirstOrDefaultAsync(sfw => sfw.FileId == fileId)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException(); ;

            if (owner.UserOwnerId != login.UserId)
                throw new UnauthorizedAccessException();

            await Context.Users
                .Where(u => u.UserId == login.UserId)
                .ExecuteUpdateAsync(u =>
                    u.SetProperty(up => up.PictureId, fileId))
                .ConfigureAwait(false);

            await Context.SaveChangesAsync()
                .ConfigureAwait(false);
            await transaction.CommitAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(
                true, string.Empty);
        }
        catch (UnauthorizedAccessException)
        {
            await transaction.RollbackAsync()
                .ConfigureAwait(false);
            throw;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync()
                .ConfigureAwait(false);
            return new RequestResultModel(
                false, ex.Message);
        }

    }

    public async Task<RequestResultModel> GetProfileImageAsync(uint userId)
    {
        try
        {
            var user = await Context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == userId)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            return new RequestResultModel(
                true, user.PictureId.ToString());
        }
        catch (Exception ex)
        {
            return new RequestResultModel(
                false, ex.Message);
        }
    }

    public async Task<bool> IsExecutorUserAsync(Guid executor, uint user)
    {
        try
        {
            var login = await SupportService
                .GetUserDataAsync(executor, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            return login.UserId == user;
        }
        catch
        {
            return false;
        }
    }
}