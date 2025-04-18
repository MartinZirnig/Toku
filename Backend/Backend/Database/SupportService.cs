using BackendInterface.DataObjects;
using Microsoft.EntityFrameworkCore;
using MysqlDatabase.Tables;
using System.Security.Cryptography;

namespace MysqlDatabase;
internal static class SupportService
{
    public static async Task<LoggedUserData?> GetUserDataAsync(Guid identification, DatabaseContext context)
    {
        var user = await context.UserLogins
            .AsNoTracking()
            .Include(x => x.User)
            .ThenInclude(x => x.Key)
            .FirstOrDefaultAsync(x => x.SessionId == identification);

        if (user is null) return null;
        return new LoggedUserData()
        {
            UserId = user.UserId,
            Identification = user.SessionId,
            Name = user.User.Name,
            Email = user.User.Email,
            DecryptedPrivateKey = user.DecryptedKey,
            PublicKey = user.User.Key.PublicKey,
            LastHeartbeat = user.LashHearthBeat
        };
    }
    public static async Task<User?> GetUserById
        (uint userId, DatabaseContext context)
    {
        return await context.Users
            .AsNoTracking()
            .Include(u => u.Key)
            .ThenInclude(k => k.PublicKey)
            .Include(u => u.Picture)
            .FirstOrDefaultAsync(u => u.UserId == userId);
    }

    public static async Task<IEnumerable<User>> GetGroupUsersAsync
        (uint groupId, DatabaseContext context)
    {
        var temp = await context.Groups
            .AsNoTracking()
            .Include(g => g.GroupClients)
            .ThenInclude(gc => gc.Client)
            .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(x => x.GroupId == groupId);
        if (temp is null) return [];

        return temp.GroupClients
            .Select(gc => gc.Client.User)
            .ToList();
    }


}

