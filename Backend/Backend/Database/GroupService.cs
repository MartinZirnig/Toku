using BackendEnums;
using BackendInterface;
using BackendInterface.DataObjects;
using BackendInterface.Models;
using ConfigurationParsing;
using Crypto;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using MysqlDatabase.Tables;
using System.Collections;
using System.Collections.Concurrent;
using System.Configuration;
using System.Runtime.CompilerServices;
using System.Runtime.Intrinsics.X86;
using System.Text;
using System.Threading.Tasks;

namespace MysqlDatabase;
internal class GroupService : DatabaseServisLifecycle, IGroupService
{
    public GroupService(MysqlDatabaseManager creator)
    : base(creator) { }

    public async Task<RequestResultModel> CreateGroupAsync(GroupCreationModel model)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        using var off = new ConstraintOff(Context);
        try
        {
            var user = await GetLoggedUserDataAsync(model.Creator);
            var group = await InsertNewGroupAsync(model, user);
            await InsertGroupOperation(
                user.UserId, group.GroupId,
                "group", OperationCode.Create);


            await transaction.CommitAsync();

            return new RequestResultModel(
                true, group.GroupId.ToString());
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new RequestResultModel(
                false, ex.Message);
        }
    }
    internal async Task<LoggedUserData> GetLoggedUserDataAsync(Guid userId)
    {
        var user = await SupportService.GetUserDataAsync(
            userId, Context);
        if (user is null)
            throw new UnauthorizedAccessException();
        return user;
    }
    internal async Task<Group> InsertNewGroupAsync(
        GroupCreationModel model, LoggedUserData user)
    {
        var group = new Group()
        {
            CreatorId = user.UserId,
            Name = model.Name,
            PictureId = 1,
            Description = model.Description,
            GroupType = GroupType.Private,
            TwoUserIdentifier = null,
            Password = HashedValue.HashPassword(model.Password),
            CreatedTime = DateTime.UtcNow,
            LastOperation = DateTime.UtcNow
        };

        await Context.Groups.AddAsync(group);
        await Context.SaveChangesAsync();

        return group;
    }


    public async Task<RequestResultModel> AddUserToGroupAsync(GroupAddUserModel model)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        using var off = new ConstraintOff(Context);
        try
        {
            if (await ExistsClient(model))
            {
                Console.WriteLine("user in group");
                return new RequestResultModel(true, "User in group");
            }

            var user = await Context.Users.FirstOrDefaultAsync(u => u.UserId == model.userId)
                ?? throw new UnauthorizedAccessException();

            var clinetId = InsertNewClientAsync(model);
            await InsertClientGroupRelation(model, await clinetId);

            await InsertGroupOperation(
                model.userId, model.groupId,
                user.Name, OperationCode.Add,
                model.userId);

            await transaction.CommitAsync();
            return new RequestResultModel(
                true, string.Empty);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new RequestResultModel(
                false, ex.Message);
        }
    }
    internal async Task<uint> InsertNewClientAsync(GroupAddUserModel model)
    {
        var user = await SupportService
            .GetUserById(model.userId, Context)!
            .ConfigureAwait(false)
            ?? throw new UnauthorizedAccessException();

        var client = new Client()
        {
            UserId = model.userId,
            LocalName = user.Name,
            LocalPicture = user.PictureId,
            LocalPassword = user.Password,

        };
        await Context.Clients.AddAsync(client);
        await Context.SaveChangesAsync();

        return client.ClientId;
    }
    private async Task<bool> ExistsClient(GroupAddUserModel model)
    {
        return await Context.Clients
            .AnyAsync(c =>
                c.UserId == model.userId &&
                c.GroupRelations.Any(gr => gr.GroupId == model.groupId));
    }

    private async Task<uint> InsertClientGroupRelation(GroupAddUserModel model, uint clientId)
    {
        var groupClient = new GroupClient()
        {
            ClientId = clientId,
            GroupId = model.groupId,
            Permission = model.Permission,
        };
        await Context.GroupClients.AddAsync(groupClient);
        await Context.SaveChangesAsync();

        return groupClient.ClientId;
    }

    public async Task<IEnumerable<GroupClientPermission>> GetUsersPermissionsAsync(Guid userId, uint groupId)
    {
        try
        {
            var login = await SupportService
                .GetUserDataAsync(userId, Context)
                .ConfigureAwait(false);
            if (login is null) return [];

            var client = await SupportService
                .GetGroupClientAsync(login.UserId, groupId, Context)
                .ConfigureAwait(false);
            if (client is null) return [];

            return client
                .GroupRelations
                .Select(gr => gr.Permission);
        }
        catch
        {
            return [];
        }
    }

    public async Task<IEnumerable<AvailableGroupsModel>> GetAvailableGroupsAsync(Guid userId)
    {
        try
        {
            var user = await SupportService.GetUserDataAsync(userId, Context).ConfigureAwait(false);
            if (user is null) return [];

            var clientIds = (await Context.Clients
                .AsNoTracking()
                .Where(c => c.UserId == user.UserId)
                .ToListAsync()
                .ConfigureAwait(false))
                .Select(c => c.ClientId);

            if (!clientIds.Any()) return [];

            var groups = await Context.GroupClients
                .AsNoTracking()
                .Include(gc => gc.Group)
                    .ThenInclude(g => g.PictureStoredFile)
                .Where(gc => clientIds.Contains(gc.ClientId))
                .Select(gc => gc.Group)
                .Distinct()
                .OrderByDescending(g => g.LastOperation)
                .ToListAsync()
                .ConfigureAwait(false);

            var tasks = groups.Select(async g =>
            {
                var lastMessage = await DecryptLastMessageAsync(userId, g.GroupId).ConfigureAwait(false);
                return new AvailableGroupsModel(
                    g.GroupId, g.Name, lastMessage, g.PictureStoredFile.FilePath, GetCorrectTimeFormat(g.LastOperation));
            });

            return await Task.WhenAll(tasks).ConfigureAwait(false);

        }
        catch
        {
            return [];
        }
    }
    private static async Task<string> DecryptLastMessageAsync(Guid uid, uint groupId)
    {
        var dataService = new DataService(null!);
        var context = dataService.GetContextAsync();

        var last = await context.Messages
                .Where(m => m.DeletedTime == null)
                .OrderByDescending(m => m.CreatedTime)
                .FirstOrDefaultAsync(m => m.GroupId == groupId)
                .ConfigureAwait(false);

        if (last is null) return string.Empty;

        var msg = await dataService.GetMessageAsync(uid, last.MessageId);
        return msg?.MessageContent ?? "";
    }
    public static string GetCorrectTimeFormat(DateTime time)
    {
        var now = DateTime.UtcNow;
        return time switch
        {
            DateTime t when t.Day == now.Day => t.ToString("HH:mm"),
            DateTime t when t.AddYears(2) < now => $"{(now.Year - t.Year)} years",
            DateTime t when t.AddYears(1) < now => "1 year",
            DateTime t when GetMonthsDifference(t, now) > 0 =>
                $"{GetMonthsDifference(t, now)} months",
            _ => $"{now.Subtract(time).TotalDays:N0} days",
        };
    }
    private static int GetMonthsDifference(DateTime from, DateTime to)
    {

        int months = (to.Year - from.Year) * 12 + to.Month - from.Month;

        if (to.Day < from.Day)
            months--;

        return months;
    }

    public async Task<RequestResultModel> UpdateLastGroupAsync(UserGroupModel model)
    {
        if (model.GroupId == 0)
            return new RequestResultModel(true, "cannot set zero as last");

        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var login = await SupportService.GetUserDataAsync(model.User, Context);
            if (login is null)
                throw new UnauthorizedAccessException();

            var user = await Context.Users
             .FirstOrDefaultAsync(u => u.UserId == login.UserId)
             .ConfigureAwait(false);
            if (user is null)
                throw new UnauthorizedAccessException();

            user.LastGroupId = model.GroupId;
            await Context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new RequestResultModel(
                true, string.Empty);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new RequestResultModel(
                false, ex.Message);
        }
    }

    public async Task<RequestResultModel> ReadGroupAsync(UserGroupModel model)
    {
        if (model.GroupId == 0)
            return new RequestResultModel(true, string.Empty);

        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);

        try
        {
            var login = await SupportService
                .GetUserDataAsync(model.User, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException("User not found or unauthorized.");

            var client = await SupportService
                .GetGroupClientAsync(login.UserId, model.GroupId, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException("Client not a member of the specified group.");

            var statusesToUpdate = await Context.MessageStatuses
                .Include(ms => ms.Message)
                .Where(ms => ms.ClientId == client.ClientId
                             && ms.Message.SenderId != login.UserId
                             && ms.Message.GroupId == model.GroupId
                             && ms.StatusCode != MessageStatusCode.Read)
                .ToListAsync()
                .ConfigureAwait(false);

            if (statusesToUpdate.Count > 0)
            {
                var now = DateTime.UtcNow;
                foreach (var status in statusesToUpdate)
                {
                    status.MessageStatusHistories.Add(new MessageStatusHistory
                    {
                        MessageStatuseId = status.MessageStatusId,
                        StatusCode = MessageStatusCode.Read,
                        Time = now
                    });

                    status.StatusCode = MessageStatusCode.Read;
                }

                await Context.SaveChangesAsync()
                    .ConfigureAwait(false);
            }

            await transaction.CommitAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(true, string.Empty);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(false, ex.Message);
        }
    }

    public async Task<RequestResultModel> RemoveUserFromGroupAsync(GroupRemoveUserModel model)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);

        try
        {
            var login = await SupportService
                .GetUserDataAsync(model.ExecutorContext, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            //if (login.UserId != model.TargetUser)
            //{
            //    var acces = await GetUsersPermissionsAsync(model.ExecutorContext, model.TargetGroup);
            //    if (!acces.Contains(GroupClientPermission.Admin))
            //        throw new UnauthorizedAccessException("Must be group admin");
            //}

            var client = await Context.Clients
                .Include(c => c.GroupRelations)
                    .ThenInclude(rg => rg.Group)
                .FirstOrDefaultAsync(c =>
                    c.UserId == model.TargetUser
                    && c.GroupRelations.Any(gr =>
                        gr.GroupId == model.TargetGroup))
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            await InsertGroupOperation(
                login.UserId, model.TargetGroup,
                client.LocalName, OperationCode.Remove);

            Context.Clients.Remove(client);

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



    private async Task InsertGroupOperation
        (uint executor, uint group, string description, OperationCode operation, uint? target = null)
    {
        var groupOperation = new GroupOperation()
        {
            GroupId = group,
            EditorId = executor,
            TargetUserId = target,
            Description = description,
            OperationCode = operation,
            CreatedTime = DateTime.UtcNow
        };
        await Context.GroupOperations
            .AddAsync(groupOperation)
            .ConfigureAwait(false);
        await Context.SaveChangesAsync()
            .ConfigureAwait(false);
    }

    public async Task<RequestResultModel> UpdatePermissionAsync(GroupUserAccessModel model, Guid executor)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        using var off = new ConstraintOff(Context);
        try
        {
            var login = await SupportService
                .GetUserDataAsync(executor, Context)
                .ConfigureAwait(false);



            var client = await Context.Clients
                .Include(c => c.GroupRelations)
                    .ThenInclude(gr => gr.Group)
                .FirstOrDefaultAsync(c =>
                    c.UserId == model.UserId
                    && c.GroupRelations.Any(gr => gr.GroupId == model.GroupId))
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var selected = await Context.GroupClients
                .Where(gc => gc.GroupId == model.GroupId
                    && gc.ClientId == client.ClientId)
                .ToListAsync();

            Context.GroupClients.RemoveRange(selected);
            await Context.SaveChangesAsync().ConfigureAwait(false);



            foreach (var permission in model.Permissions)
            {
                await InsertGroupOperation(
                    login.UserId, model.GroupId,
                    $"{client.LocalName} granted {permission}", OperationCode.Update
                    );

                var groupClient = new GroupClient()
                {
                    ClientId = client.ClientId,
                    GroupId = model.GroupId,
                    Permission = permission
                };
                await Context.GroupClients
                    .AddAsync(groupClient)
                    .ConfigureAwait(false);
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
            await transaction.RollbackAsync();
            return new RequestResultModel(
                false, ex.Message);
        }
    }

    public async Task<RequestResultModel> UpdateGroupAsync(GroupUpdateModel model, Guid executor)
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

            var group = await Context.Groups
                .FirstOrDefaultAsync(g => g.GroupId == model.GroupId)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            group.Name = model.Name;
            group.Description = model.Description;
            group.Password = HashedValue.HashPassword(model.Password);
            group.GroupType = (GroupType)model.GroupType;
            if (model.FileId is uint picture)
                group.PictureId = picture;

            await InsertGroupOperation(
                login.UserId, model.GroupId,
                "group", OperationCode.Update);

            await Context.SaveChangesAsync()
                .ConfigureAwait(false);
            await transaction.CommitAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(
                true, string.Empty);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new RequestResultModel(
                false, ex.Message);
        }
    }

    public async Task<IEnumerable<GroupUserAccessModel>> GetGroupMembersAsync(Guid executor, uint groupId)
    {
        try
        {
            var clients = await Context.GroupClients
                .Include(gc => gc.Client)
                    .ThenInclude(c => c.User)
                .Where(gc => gc.GroupId == groupId)
                .OrderBy(gc => gc.ClientId)
                .ToListAsync()
                .ConfigureAwait(false);
            if (clients.Count == 0) return [];

            var ids = clients
                .Select(c => new { c.ClientId, c.Client.UserId, c.Client.User.Name })
                .ToHashSet();

            var result = new List<GroupUserAccessModel>();
            foreach (var id in ids)
            {
                var permissions = clients
                    .Where(c => c.ClientId == id.ClientId)
                    .Select(c => c.Permission)
                    .ToArray();

                result.Add(new GroupUserAccessModel(
                    id.UserId, groupId, permissions)
                { Name = id.Name });


            }

            return result;
        }
        catch
        {
            return [];
        }
    }

    public async Task<GroupDataModel?> GetGroupAsync(Guid userId, uint id)
    {
        try
        {
            var group = await Context.Groups
                .Include(g => g.PictureStoredFile)
                .FirstOrDefaultAsync(g => g.GroupId == id)
                .ConfigureAwait(false);
            if (group is null) return null;

            return new GroupDataModel(
                group.Name, group.Description,
                (!group.Password?.VerifyPassword(string.Empty)) ?? false);
        }
        catch
        {
            return null;
        }

    }

    public async Task<IEnumerable<LoggedUserData>> GetActiveGroupUsersAsync(uint groupId)
    {
        var list = new List<LoggedUserData>();
        try
        {
            var users = await SupportService
                .GetGroupUsersAsync(groupId, Context)
                .ConfigureAwait(false);

            foreach (var user in users)
            {
                var logins = SupportService
                    .GetUserLoginsAsync(user.UserId, Context)
                    .ConfigureAwait(false);

                await foreach (var login in logins)
                    list.Add(login);
            }
        }
        catch
        {
            return [];
        }
        return list;
    }

    public async Task<RequestResultModel> GetGroupLogAsync(uint groupId)
    {
        try
        {
            var records = await Context.GroupOperations
                .Include(go => go.Editor)
                .Where(go => go.GroupId == groupId)
                .OrderBy(go => go.CreatedTime)
                .ToArrayAsync()
                .ConfigureAwait(false)
                ?? [];

            var sb = new StringBuilder();
            foreach (var record in records)
            {
                sb.AppendLine(BuildLogLine(record));
            }

            return new RequestResultModel(
                true, sb.ToString());
        }
        catch (Exception ex)
        {
            return new RequestResultModel(
                false, ex.Message);
        }
    }
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private string BuildLogLine(GroupOperation operation)
    {
        var builder = new StringBuilder();
        builder.Append('[');
        builder.Append(operation.CreatedTime.ToString("dd.MM.yyyy HH:mm ss.ff"));
        builder.Append("]: ");
        builder.Append("User '");
        builder.Append(operation.Editor.LocalName);
        builder.Append("' ");
        builder.Append(operation.OperationCode.ToString());
        builder.Append(' ');
        builder.Append(operation.Description);
        return builder.ToString();
    }

    public async Task<RequestResultModel> SetGroupPictureAsync(uint groupId, uint fileId)
    {
        var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var group = await Context.Groups
                .FirstOrDefaultAsync(g => g.GroupId == groupId)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException("Group not found.");

            group.PictureId = fileId;

            await Context.SaveChangesAsync()
                .ConfigureAwait(false);

            await transaction.CommitAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(true, string.Empty);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(false, ex.Message);
        }
    }

    public async Task<RequestResultModel> GetGroupPicture(uint groupId)
    {
        try
        {
            var group = await Context.Groups
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.GroupId == groupId)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            return new RequestResultModel(
                true, group.PictureId.ToString());
        }
        catch (Exception ex)
        {
            return new RequestResultModel(
                false, ex.Message);
        }
    }

    public async Task<RequestResultModel> JoinGroupAsync(GroupJoinModel model, Guid executor)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        using var off = new ConstraintOff(Context);

        try
        {
            var login = await SupportService
                .GetUserDataAsync(executor, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException("User not found or unauthorized.");

            var group = await Context.Groups
                .FirstOrDefaultAsync(g => g.GroupId == model.GroupId)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException("Group not found.");

            if (!group.Password?.VerifyPassword(model.Password ?? string.Empty) ?? false)
                return new RequestResultModel(false, "Incorrect password.");

            var newUserModel = new GroupAddUserModel(
               login.UserId, model.GroupId, GroupClientPermission.IsAllowedToWrite);


            if (await ExistsClient(newUserModel))
                return new RequestResultModel(true, "Already a member of the group.");

            var clientId = await InsertNewClientAsync(newUserModel)
                .ConfigureAwait(false);

            await InsertClientGroupRelation(newUserModel, clientId)
                .ConfigureAwait(false);

            await InsertGroupOperation(
                login.UserId, model.GroupId,
                login.Name, OperationCode.Join);

            await Context.SaveChangesAsync()
                .ConfigureAwait(false);

            await transaction.CommitAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(true, string.Empty);
        }
        catch (Exception ex)
        {
            return new RequestResultModel(
                false, ex.Message);
        }
    }

    public async Task<IEnumerable<PublicGroupInfoModel>> GetPublicGroupsAsync(Guid executor)
    {
        try
        {
            var login = await SupportService
                .GetUserDataAsync(executor, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException("User not found or unauthorized.");

            return await Context.Groups
                .AsNoTracking()
                .Where(g => g.GroupType == GroupType.Public)
                .Where(g => !g.GroupClients
                    .Any(gc =>
                        gc.Client.UserId == login.UserId))
                .Select(g =>
                    new PublicGroupInfoModel(
                        g.Name, g.GroupId, g.PictureId)
                    )
                .ToListAsync()
                .ConfigureAwait(false);
        }
        catch
        {
            return [];
        }
    }

    public async Task<IEnumerable<GroupClientPermission>> GetUserPermissionsAsync(Guid executor, uint group)
    {
        try
        {
            var login = await SupportService
                .GetUserDataAsync(executor, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();


            return await Context.GroupClients
                .AsNoTracking()
                .Where(gc => gc.Client.UserId == login.UserId)
                .Where(gc => gc.GroupId == group)
                .Select(gc => gc.Permission)
                .ToArrayAsync()
                .ConfigureAwait(false);
        }
        catch
        {
            return [];
        }
    }

    public async Task<IEnumerable<LoggedUserData>> GetCurrentGroupUsersAsync(uint groupId)
    {
        var list = new List<LoggedUserData>();
        try
        {
            var users = await SupportService
                .GetGroupUsersAsync(groupId, Context)
                .ConfigureAwait(false);

            foreach (var user in users.Where(u => u.LastGroupId == groupId))
            {
                var logins = SupportService
                    .GetUserLoginsAsync(user.UserId, Context)
                    .ConfigureAwait(false);

                await foreach (var login in logins)
                    list.Add(login);
            }
        }
        catch
        {
            return [];
        }
        return list;
    }

    public async Task<RequestResultModel> ReceiveMessagesAsync(Guid executor)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var login = await SupportService
                 .GetUserDataAsync(executor, Context)
                 .ConfigureAwait(false)
                 ?? throw new UnauthorizedAccessException("User not found or unauthorized.");
            var groups = await SupportService
                .GetUserGroups(login.UserId, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var now = DateTime.UtcNow;
            foreach (var group in groups)
            {
                var client = await SupportService
                    .GetGroupClientAsync(login.UserId, group.GroupId, Context)
                    .ConfigureAwait(false)
                    ?? throw new UnauthorizedAccessException("Client not a member of the specified group.");

                var statusesToUpdate = await Context.MessageStatuses
                    .Include(ms => ms.Message)
                    .Where(ms => ms.ClientId == client.ClientId
                                 && ms.Message.GroupId == group.GroupId
                                 && ms.Message.SenderId != login.UserId
                                 && ms.StatusCode == MessageStatusCode.Sent)
                    .ToListAsync()
                    .ConfigureAwait(false);

                if (statusesToUpdate.Count > 0)
                {
                    foreach (var status in statusesToUpdate)
                    {
                        status.MessageStatusHistories.Add(new MessageStatusHistory
                        {
                            MessageStatuseId = status.MessageStatusId,
                            StatusCode = MessageStatusCode.Delivered,
                            Time = now
                        });

                        status.StatusCode = MessageStatusCode.Delivered;
                    }

                    await Context.SaveChangesAsync()
                        .ConfigureAwait(false);
                }
            }

            await Context.SaveChangesAsync()
                .ConfigureAwait(false);

            await transaction.CommitAsync()
                .ConfigureAwait(false);

            Console.WriteLine("receive done");
            return new RequestResultModel(true, string.Empty);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(
                false, ex.Message);
        }
    }

    public async Task<IEnumerable<Guid>> GetConnectedCoGroupersAsync(Guid executor)
    {
        try
        {
            var login = await SupportService
                .GetUserDataAsync(executor, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var groups = await SupportService
                .GetUserGroups(login.UserId, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var clients = groups
                .Select(g => g.GroupClients
                    .Select(gc => gc.Client.UserId))
                .SelectMany(c => c);

            return await Context.UserLogins
                .Where(ul =>
                    clients.Contains(ul.UserId)
                    && ul.LoggedOut == null
                    && ul.SessionId != executor)
                .Select(ul => ul.SessionId)
                .ToArrayAsync()
                .ConfigureAwait(false);
        }
        catch
        {
            return [];
        }
    }

    public async Task<IEnumerable<Guid>> GetConnectedUsersInGroup(uint groupId)
    {
        try
        {
            var users = (await SupportService
                .GetGroupUsersAsync(groupId, Context)
                .ConfigureAwait(false))
                .Select(u => u.UserId);

            return await Context.UserLogins
                .Where(ul =>
                    users.Contains(ul.UserId)
                    && ul.LoggedOut == null)
                .Select(ul => ul.SessionId)
                .ToArrayAsync()
                .ConfigureAwait(false);
        }
        catch
        {
            return [];
        }
    }
}

