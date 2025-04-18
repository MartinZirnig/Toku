using BackendEnums;
using BackendInterface;
using BackendInterface.Models;
using MysqlDatabase.Tables;
using Crypto;
using BackendInterface.DataObjects;
using System.Net.Http.Headers;
using Microsoft.EntityFrameworkCore;

namespace MysqlDatabase;
internal class GroupService : DatabaseServisLifecycle, IGroupService
{
    public async Task<RequestResultModel> CreateGroupAsync(GroupCreationModel model)
    {
        var transaction = await Context.Database.BeginTransactionAsync();
        using var off = new ConstraintOff(Context);
        try
        {
            var user = GetLoggedUserDataAsync(model.Creator);
            await InsertNewGroupAsync(model, await user);

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
    private async Task InsertNewGroupAsync(
        GroupCreationModel model, LoggedUserData user)
    {
        var group = new Group()
        {
            CreatorId = user.UserId,
            Name = model.Name,
            Description = model.Description,
            GroupType = GroupType.General,
            TwoUserIdentifier = null,
            Password = HashedValue.HashPassword(model.Password),
            CreatedTime = DateTime.UtcNow,
        };

        await Context.Groups.AddAsync(group);
        await Context.SaveChangesAsync();
    }

    public async Task<RequestResultModel> AddUserToGroupAsync(GroupAddUserModel model)
    {
        using var off = new ConstraintOff(Context);
        var transaction = await Context.Database.BeginTransactionAsync();
        try
        {
            var clinetId = InsertNewClientAsync(model);
            await InsertClientGroupRelation(model, await clinetId);

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

    public async Task<IEnumerable<GroupClientPermission>> GetUsersPermissions(Guid userId, uint groupId)
    {
        try
        {
            var user = await SupportService.GetUserDataAsync(
                userId, Context);
            if (user is null)
                return [];

            var group = await Context.Groups
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.GroupId == groupId);
            if (group is null) return [];

            if (group.CreatorId == user.UserId
                && group.GroupClients.Count == 0)
                return [GroupClientPermission.Admin];

            var relations = await Context.Clients
                .AsNoTracking()
                .Include(c => c.GroupRelations)
                .FirstOrDefaultAsync(c => c.UserId == user.UserId);
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
}

