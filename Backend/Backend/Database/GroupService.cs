using BackendEnums;
using BackendInterface;
using BackendInterface.DataObjects;
using BackendInterface.Models;
using ConfigurationParsing;
using Crypto;
using Microsoft.EntityFrameworkCore;
using MysqlDatabase.Tables;
using System.Runtime.CompilerServices;

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
                string.Empty, OperationCode.Create);


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
    private async Task<LoggedUserData> GetLoggedUserDataAsync(Guid userId)
    {
        var user = await SupportService.GetUserDataAsync(
            userId, Context);
        if (user is null)
            throw new UnauthorizedAccessException();
        return user;
    }
    private async Task<Group> InsertNewGroupAsync(
        GroupCreationModel model, LoggedUserData user)
    {
        var group = new Group()
        {
            CreatorId = user.UserId,
            Name = model.Name,
            PictureId = 1,
            Description = model.Description,
            GroupType = GroupType.General,
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
        using var off = new ConstraintOff(Context);
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var clinetId = InsertNewClientAsync(model);
            await InsertClientGroupRelation(model, await clinetId);
            await InsertGroupOperation(
                model.userId, model.groupId,
                string.Empty, OperationCode.Add,
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
    private async Task<uint> InsertNewClientAsync(GroupAddUserModel model)
    {
        var user = (await SupportService.GetUserById(model.userId, Context))!;

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
            var user = await SupportService.GetUserDataAsync(
                userId, Context);
            if (user is null)
                return [];

            var group = await Context.Groups
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.GroupId == groupId)
                .ConfigureAwait(false);
            if (group is null) return [];

            if (group.CreatorId == user.UserId
                && group.GroupClients.Count == 0)
                return [GroupClientPermission.Admin];

            var relations = await Context.Clients
                .AsNoTracking()
                .Include(c => c.GroupRelations)
                .FirstOrDefaultAsync(c => c.UserId == user.UserId)
                .ConfigureAwait(false);
            if (relations == null) return [];

            return relations
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
                .OrderByDescending(gc => gc.Group.LastOperation)
                .Select(gc => gc.Group)
                .ToListAsync()
                .ConfigureAwait(false);

            var tasks = groups.Select(async g =>
            {
                var lastMessage = await DecryptLastMessageAsync(userId, g.GroupId).ConfigureAwait(false);
                return new AvailableGroupsModel(
                    g.GroupId, g.Name, lastMessage, g.PictureStoredFile.FilePath, GetCorrectTymeFormat(g.LastOperation));
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
        var context = dataService.GetContext();

        var last = await context.Messages
                .Where(m => m.DeletedTime == null)
                .OrderByDescending(m => m.CreatedTime)
                .FirstOrDefaultAsync(m => m.GroupId == groupId)
                .ConfigureAwait(false);

        if (last is null) return string.Empty;

        var msg = await dataService.GetMessageAsync(uid, last.MessageId);
        return msg?.MessageContent ?? "";
    }
    public static string GetCorrectTymeFormat(DateTime time)
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
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);

        try
        {
            var login = await SupportService.GetUserDataAsync(model.User, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException("User not found or unauthorized.");

            var client = await SupportService.GetGroupClientAsync(login.UserId, model.GroupId, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException("Client not a member of the specified group.");

            var statusesToUpdate = await Context.MessageStatuses
                .Include(ms => ms.Message)
                .Where(ms => ms.ClientId == client.ClientId
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

            if (login.UserId != model.TargetUser)
            {
                var acces = await GetUsersPermissionsAsync(model.ExecutorContext, model.TargetGroup);
                if (!acces.Contains(GroupClientPermission.Admin))
                    throw new UnauthorizedAccessException("Must be group admin");
            }

            var client = await Context.Clients
                .Include(c => c.GroupRelations)
                    .ThenInclude(rg => rg.Group)
                .FirstOrDefaultAsync(c =>
                    c.UserId == model.TargetUser
                    && c.GroupRelations.Any(gr =>
                        gr.GroupId == model.TargetGroup))
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();



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
            OperationCode = operation
        };
        await Context.GroupOperations
            .AddAsync(groupOperation)
            .ConfigureAwait(false);
        await Context.SaveChangesAsync()
            .ConfigureAwait(false);
    }
}

