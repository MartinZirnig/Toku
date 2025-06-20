﻿using BackendInterface.DataObjects;
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
            .FirstOrDefaultAsync(x => x.SessionId == identification)
            .ConfigureAwait(false);

        if (user is null) return null;
        return new LoggedUserData()
        {
            UserId = user.UserId,
            Identification = user.SessionId,
            Name = user.User.Name,
            Email = user.User.Email,
            Phone = user.User.Phone,
            DecryptedPrivateKey = user.DecryptedKey,
            PublicKey = user.User.Key.PublicKey,
            LastHeartbeat = user.LashHearthBeat,
            TimeZoneOffset = user.TimeZoneOffset,
            CreatedTime = user.User.CreatedTime,
            PictureId = user.User.PictureId
        };
    }
    public static async IAsyncEnumerable<LoggedUserData> GetUserLoginsAsync(uint identification, DatabaseContext context)
    {
        var users = await context.UserLogins
            .AsNoTracking()
            .Include(x => x.User)
            .ThenInclude(x => x.Key)
            .Where(x =>
                x.UserId == identification
                && x.LoggedOut == null)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var user in users)
        {
            if (user is null) continue;
            yield return new LoggedUserData()
            {
                UserId = user.UserId,
                Identification = user.SessionId,
                Name = user.User.Name,
                Email = user.User.Email,
                Phone = user.User.Phone,
                DecryptedPrivateKey = user.DecryptedKey,
                PublicKey = user.User.Key.PublicKey,
                LastHeartbeat = user.LashHearthBeat,
                TimeZoneOffset = user.TimeZoneOffset,
                CreatedTime = user.User.CreatedTime,
            };
        }

    }
    public static async Task<User?> GetUserById
        (uint userId, DatabaseContext context)
    {
        return await context.Users
            .AsNoTracking()
            .Include(u => u.Picture)
            .Include(u => u.Key)
            .Include(u => u.Domain)
            .Include(u => u.ColorSettings)
            .FirstOrDefaultAsync(u => u.UserId == userId)
            .ConfigureAwait(false);
    }

    public static async Task<IEnumerable<User>> GetGroupUsersAsync
        (uint groupId, DatabaseContext context)
    {
        return await context.Clients
            .AsNoTracking()
            .Distinct()
            .Include(c => c.User)
                .ThenInclude(u => u.Key)
            .Include(c => c.User)
                .ThenInclude(u => u.Picture)
            .Where(c => c.GroupRelations
                .Any(r => r.GroupId == groupId && !r.Muted))
            .Select(c => c.User)
            .ToListAsync()
            .ConfigureAwait(false);
    }

    public static async Task<Client?> GetGroupClientAsync(uint userId, uint groupId, DatabaseContext context)
    {
        return await context.Clients
            .AsNoTracking()
            .Include(c => c.GroupRelations)
            .Where(c => c.UserId == userId)
            .FirstOrDefaultAsync(c => c.GroupRelations.Any(gr => gr.GroupId == groupId))
            .ConfigureAwait(false);
    }


    public static async Task<IEnumerable<Group>> GetUserGroups(uint userId, DatabaseContext context)
    {
        return await context.Groups
            .AsNoTracking()
            .Include(g => g.GroupClients)
                .ThenInclude(gc => gc.Client)
                    .ThenInclude(c => c.User)
            .Where(g => g.GroupClients
                .Any(gc => gc.Client.UserId == userId))
            .ToArrayAsync();
    }
}

