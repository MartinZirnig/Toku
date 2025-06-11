using BackendEnums;
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
            {
                var user = await Context.Users
                    .FirstOrDefaultAsync(user => user.Name == model.Name);

                return new RequestResultModel(true, user!.UserId.ToString());
            }

            var KeyId = await InsertNewUserKeyAsync(model);
            var UserId = await InsertNewUserAsync(model, KeyId);
            await CopyDomainColorSettingsAsync(UserId);

            await transaction.CommitAsync();

            return new RequestResultModel(true, UserId.ToString());
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
            LastGroupId = 0,
            DomainId = model.DomainId
        };
        await Context.Users.AddAsync(user);
        await Context.SaveChangesAsync();

        return user.UserId;
    }
    private async Task CopyDomainColorSettingsAsync(uint userId)
    {
        var user = await Context.Users
            .Include(u => u.Domain)
                .ThenInclude(d => d.PreselectedColorSettings)
            .FirstOrDefaultAsync(u => u.UserId == userId)
            ?? throw new ArgumentException(nameof(userId));

        var newColors = new ColorSetting()
        { Colors = user.Domain.PreselectedColorSettings.Colors };

        await Context.ColorSettings
            .AddAsync(newColors)
            .ConfigureAwait(false);

        await Context.SaveChangesAsync()
            .ConfigureAwait(false);

        user.ColorSettingsId = newColors.Id;

        await Context.SaveChangesAsync()
            .ConfigureAwait(false);
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
    }
    private async Task<User?> FindUserAsync(UserLoginModel model)
    {
        var user = await Context.Users
            .AsNoTracking()
            .Include(u => u.Key)
            .FirstOrDefaultAsync(
                u => u.Name == model.UserName
                && u.DeletedTime == null);

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
                ? uint.Parse(model.Picture) : 1;

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
            var login = await SupportService
                .GetUserDataAsync(identification, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var user = await Context.Users
                .AsNoTracking()
                .Include(u => u.Domain)
                .FirstOrDefaultAsync(u =>
                    u.UserId == login.UserId)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();


            if (login is null) return null;

            var result = new UserDataModel(
            login.Name, login.Email, login.Phone,
            login.CreatedTime.ToString("dd.MMMM yyyy"),
            user.Domain.DomainName,
            user.Domain.LimitsUsers,
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

            var contacts = await Context.ExplicitContacts
                .Where(ec => ec.AffectedUserId == login.UserId)
                .ToListAsync()
                .ConfigureAwait(false);


            var result = new List<KnownUserDataModel>();
            foreach (var group in groups)
            {
                if (group?.GroupClients is null) continue;

                foreach (var client in group.GroupClients)
                {
                    var user = client.Client.User;
                    var userData = new KnownUserDataModel(
                        user.Name, user.UserId, user.Email);

                    if (!result.Contains(userData))
                        result.Add(userData);
                }
            }

            foreach (var contact in contacts)
            {
                if (contact.Visible)
                {
                    if (result.Any(r => r.UserId == contact.TargetUserId))
                        continue;

                    var user = await Context.Users
                        .FirstOrDefaultAsync(u =>
                            u.UserId == contact.TargetUserId)
                        .ConfigureAwait(false)
                        ?? throw new UnauthorizedAccessException();

                    result.Add(new KnownUserDataModel(
                        user.Name, user.UserId, user.Email));
                }
                else
                {
                    var found = result.FirstOrDefault(u =>
                        u.UserId == contact.TargetUserId);
                    if (found is not null)
                        result.Remove(found);
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

    public async Task<IEnumerable<KnownUserDataModel>> SearchUserAsync(string part)
    {
        part = part.Trim().ToLower();
        try
        {
            if (part.Contains('#'))
            {
                var parts = part.Split('#', 2);
                var name = parts[0].Trim();
                var userId = parts[1].Trim();

                if (uint.TryParse(userId, out var integralId))
                {
                    if (string.IsNullOrWhiteSpace(name))
                    {
                        return await Context.Users
                            .AsNoTracking()
                            .Where(u => u.UserId == integralId)
                            .Select(u => new KnownUserDataModel(
                                u.Name, u.UserId, u.Email))
                            .ToListAsync()
                            .ConfigureAwait(false);
                    }
                    else
                    {
                        var users = await Context.Users
                            .AsNoTracking()
                            .Where(u =>
                                u.Name.ToLower()
                                .Contains(name))
                            .ToListAsync();


                        return users
                            .Where(u => u.UserId
                                .ToString()
                                .Contains(userId))
                            .Select(u => new KnownUserDataModel(
                                u.Name, u.UserId, u.Email))
                            .ToArray();
                    }
                }
            }

            return await Context.Users
                .AsNoTracking()
                .Where(u => u.Name
                    .ToLower()
                    .Contains(part))
                .Select(u => new KnownUserDataModel(
                    u.Name, u.UserId, u.Email))
                .ToListAsync()
                .ConfigureAwait(false);
        }
        catch
        {
            return [];
        }
    }

    public async Task<RequestResultModel> UpdateContactAsync(ContactEditModel model, Guid executor)
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

            var contact = await Context.ExplicitContacts
                .FirstOrDefaultAsync(ec =>
                    ec.AffectedUserId == login.UserId
                    && ec.TargetUserId == model.TargetUserId)
                .ConfigureAwait(false);

            if (contact is null)
            {
                contact = new ExplicitContact()
                {
                    AffectedUserId = login.UserId,
                    TargetUserId = model.TargetUserId,
                    Visible = model.Visible
                };

                await Context.ExplicitContacts
                    .AddAsync(contact)
                    .ConfigureAwait(false);
            }
            else contact.Visible = model.Visible;

            await Context.SaveChangesAsync()
                .ConfigureAwait(false);
            await transaction.CommitAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(
                true, string.Empty);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(
                false, ex.Message);
        }
    }

    public async Task<SwipeInfoModel?> GetSwipesAsync(Guid executor)
    {
        try
        {
            var login = await SupportService
                .GetUserDataAsync(executor, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var user = await Context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u =>
                    u.UserId == login.UserId)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            return new SwipeInfoModel(
               user.LeftSweep.ToString(), user.RightSweep.ToString());
        }
        catch
        {
            return null;
        }
    }

    public async Task<RequestResultModel> SetSwipesAsync(Guid executor, SwipeInfoModel model)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);

        try
        {
            await Context.Users
                .ExecuteUpdateAsync(u =>
                    u.SetProperty(x => x.LeftSweep, Enum.Parse<MessageOperation>(model.Left))
                    .SetProperty(x => x.RightSweep, Enum.Parse<MessageOperation>(model.Right)))
                .ConfigureAwait(false);

            await Context.SaveChangesAsync()
                .ConfigureAwait(false);
            await transaction.CommitAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(
                true, string.Empty);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(
                false, ex.Message);
        }
    }

    public async Task<RequestResultModel> SetColorsAsync(string value, Guid executor)
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


            var usrs = await Context.Users
                .FirstOrDefaultAsync(u => u.UserId == login.UserId)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var setting = (await Context.Users
                .Include(u => u.Picture)
                .FirstOrDefaultAsync(u => u.UserId == login.UserId)
                .ConfigureAwait(false))
                ?.ColorSettings;
            if (setting is null)
            {
                var cs = new ColorSetting()
                {
                    Colors = value
                };

                await Context.ColorSettings.AddAsync(cs)
                    .ConfigureAwait(false);
                await Context.SaveChangesAsync()
                    .ConfigureAwait(false);

                usrs.ColorSettingsId = cs.Id;
            }
            else
            {
                setting.Colors = value;
            }

            await Context.SaveChangesAsync()
                .ConfigureAwait(false);
            await transaction.CommitAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(
                true, string.Empty);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(
                false, ex.Message);
        }
    }

    public async Task<string> GetColorsAsync(Guid executor)
    {
        try
        {
            var login = await SupportService
                .GetUserDataAsync(executor, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var usrs = await Context.Users
                .Include(u => u.ColorSettings)
                .FirstOrDefaultAsync(u => u.UserId == login.UserId)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            return usrs.ColorSettings.Colors;
        }
        catch
        {
            return string.Empty;
        }
    }

    public async Task<RequestResultModel> DeleteUserAsync(Guid executor)
    {
        using var off = new ConstraintOff(Context);

        await using var transaction = await Context.Database
             .BeginTransactionAsync()
             .ConfigureAwait(false);

        try
        {
            var login = await SupportService
                .GetUserDataAsync(executor, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var user = await Context.Users
                .FirstOrDefaultAsync(u =>
                    u.UserId == login.UserId)
                ?? throw new UnauthorizedAccessException();

            user.DeletedTime = DateTime.UtcNow;

            var clients = await Context.Clients
                .Where(c => c.UserId == login.UserId)
                .Select(c => c.ClientId)
                .ToArrayAsync()
                .ConfigureAwait(false);

            var ids = string.Join(",", clients.Select(id => $"'{id}'"));
            await Context.Database.ExecuteSqlAsync($@"
                DELETE FROM GroupClients
                WHERE ClientId IN ({ids})
                ")
                .ConfigureAwait(false);


            await Context.SaveChangesAsync()
                .ConfigureAwait(false);
            await transaction.CommitAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(
                true, string.Empty);
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