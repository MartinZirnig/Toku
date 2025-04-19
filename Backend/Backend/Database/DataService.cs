using BackendEnums;
using BackendInterface;
using BackendInterface.DataObjects;
using BackendInterface.Models;
using Crypto;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MysqlDatabase.Tables;
using MysqlDatabaseControl;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;

namespace MysqlDatabase;
internal class DataService : DatabaseServisLifecycle, IDataService
{

    public T ExecuteQuery<T>(IQuery<T> query)
    {
#if DEBUG
        return query.Execute(Context);
#else
        throw new InvalidOperationException("Only in debug mode!");
#endif
    }


    public async Task<uint> ReceiveMessageAsync(MessageModel message)
    {
        using var off = new ConstraintOff(Context);
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);

        try
        {
            var encrypted = new EncryptedMessage(message.MessageContent);
            var messageId = await StoreMessageAsync(encrypted, message);
            if (messageId == 0) return 0;

            var users = await SupportService.GetGroupUsersAsync(
                message.GroupId, Context);

            var tasks = users.Select(user =>
                StoreUserMessageRelationAndHistoryAsync(
                    encrypted, user, messageId, message));
            await Task.WhenAll(tasks);

            await UpdateGroupTimingAsync(message.GroupId);

            await transaction.CommitAsync();
            return messageId;
        }
        catch
        {
            await transaction.RollbackAsync();
            return 0;
        }
    }
    private async Task StoreUserMessageRelationAndHistoryAsync
        (EncryptedMessage msg, User usr, uint msgId, MessageModel model)
    {
        using var tempContext = new DatabaseContext();
        using var off = new ConstraintOff(tempContext);

        await StoreUserMessageRelationAsync(msg, usr, msgId, tempContext)
            .ConfigureAwait(false);
        await BoundRelations(msgId, model.GroupId, usr, tempContext);
    }

    private async Task<uint> StoreMessageAsync(
        EncryptedMessage message, MessageModel model)
    {
        var user = await SupportService.GetUserDataAsync(
            model.SenderContext, Context);

        if (user is null) return 0;

        var dbMessage = new Message
        {
            GroupId = model.GroupId,
            Content = message.Content,
            StoredFileId = model.AttachedFileId,
            SenderId = user.UserId,
            PinnedMessageId = model.PinnedMessageId,
            CreatedTime = DateTime.Now,
        };

        Context.Messages.Add(dbMessage);
        await Context.SaveChangesAsync();

        return dbMessage.MessageId;
    }
    private static async Task StoreUserMessageRelationAsync(
        EncryptedMessage msg, User usr, uint msgId, DatabaseContext tempContext)
    {
        var message = msg.EncryptKey(((PPKeyPair)usr.Key).PublicKeyPem);
        var userMessage = new UserMessage
        {
            UserId = usr.UserId,
            MessageId = msgId,
            EncryptedKey = message.Key
        };

        await tempContext.UserMessages.AddAsync(userMessage);
        await tempContext.SaveChangesAsync();
    }
    private static async Task BoundRelations
        (uint msgId, uint groupId, User usr, DatabaseContext tempContext)
    {
        using var off = new ConstraintOff(tempContext);
        var now = DateTime.UtcNow;

        var client = await SupportService.GetGroupClientAsync(
            usr.UserId, groupId, tempContext)
            .ConfigureAwait(false);
        if (client is null) throw new UnauthorizedAccessException();

        var status = new MessageStatus()
        {
            MessageId = msgId,
            ClientId = client.ClientId,
            StatusCode = MessageStatusCode.Sent,
            UpdatedTime = now,
        };
        await tempContext.MessageStatuses.AddAsync(status)
            .ConfigureAwait(false);
        await tempContext.SaveChangesAsync();

        var statusHistory = new MessageStatusHistory()
        {
            MessageStatuseId = status.MessageStatusId,
            StatusCode = MessageStatusCode.Sent,
            Time = now
        };

        await tempContext.MessageStatusHistories
            .AddAsync(statusHistory)
            .ConfigureAwait(false);

        await tempContext.SaveChangesAsync();
    }
    private async Task UpdateGroupTimingAsync(uint groupId)
    {
        var group = await Context.Groups
            .FindAsync(groupId);
        if (group is null) return;

        group.LastOperation = DateTime.UtcNow;
        await Context.SaveChangesAsync();
    }


    public async Task<IEnumerable<StoredMessageModel>> GetGroupMessagesAsync(Guid user, uint groupId, uint? messageCount)
    {
        if (messageCount is null) messageCount = int.MaxValue;

        var userData = await SupportService.GetUserDataAsync(user, Context);
        if (userData is null) return [];

        var messageIds = await Context.Messages
            .AsNoTracking()
            .Where(m => m.GroupId == groupId)
            .OrderBy(m => m.CreatedTime)
            .Select(m => m.MessageId)
            .Take((int)messageCount)
            .ToListAsync();

        if (messageIds.Count == 0) return [];

        var tasks = messageIds.Select(id =>
            GetMessageAsyncStatic(userData, id, new DatabaseContext()));

        var results = await Task.WhenAll(tasks);

        return results.Where(msg => msg is not null)!;
    }

    public async Task<StoredMessageModel?> GetMessageAsync(Guid user, uint messageId)
    {
        var userData = await SupportService.GetUserDataAsync(user, Context);
        if (userData is null) return null;
        return await GetMessageAsync(userData, messageId);
    }
    public async Task<StoredMessageModel?> GetMessageAsync(LoggedUserData userData, uint messageId)
    {
        return await GetMessageAsyncStatic(userData, messageId, Context);
    }
    private static async Task<StoredMessageModel?> GetMessageAsyncStatic
        (LoggedUserData userData, uint messageId, DatabaseContext context, bool disposeContext = false)
    {
        var message = await context.Messages
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.MessageId == messageId);
        if (message is null) return null;

        var userMessage = await context.UserMessages
            .AsNoTracking()
            .FirstOrDefaultAsync(um =>
                um.UserId == userData.UserId &&
                um.MessageId == messageId);
        if (userMessage is null) return null;

        var encryptedMessage = new EncryptedMessage(message.Content, userMessage.EncryptedKey);
        var decryptedMessage = encryptedMessage.DecryptKey(userData.DecryptedPrivateKey);
        var content = decryptedMessage.Decrypt();

        var status = message.SenderId != userData.UserId
            ? MessageStatusCode.receiver
            : await GetMessageStatusAsync(messageId, context);

        var pin = message.PinnedMessageId is not null
            ? (await GetMessageAsyncStatic(userData,
                (uint)message.PinnedMessageId, context))?.MessageContent
            : null;

        var result = new StoredMessageModel(
            content,
            message.StoredFileId,
            message.PinnedMessageId,
            message.GroupId,
            (byte)(status ?? MessageStatusCode.Sent),
            GroupService.GetCorrectTymeFormat(message.CreatedTime),
            await GetLastStatusChange(messageId, context),
            pin
        );
        if (disposeContext)
            await context.DisposeAsync();
        return result;
    }


    private static async Task<MessageStatusCode?> GetMessageStatusAsync(uint messageId, DatabaseContext context)
    {
        //var query = context.MessageStatuses
        //    .AsNoTracking()
        //    .Where(ms => ms.MessageId == messageId)
        //    .Select(ms => ms.StatusCode);

        //var requestId = Guid.NewGuid();

        //Console.WriteLine($"[{requestId}] messageId == {messageId}");
        //Console.WriteLine($"[{requestId}] query: {query.ToQueryString().Replace('\n', ' ').Replace('\r', ' ')}");

        var statuses = await context.MessageStatuses
            .AsNoTracking()
            .Where(ms => ms.MessageId == messageId)
            .Select(ms => ms.StatusCode)
            .ToListAsync()
            .ConfigureAwait(false);

        var query = context.MessageStatuses
            .AsNoTracking()
            .Where(ms => ms.MessageId == messageId)
            .Select(ms => ms.StatusCode);

        Console.WriteLine($"{messageId} -> {statuses.Count} -> {query.ToQueryString().Replace('\n', ' ').Replace('\r', ' ')}");

        if (statuses.Count == 0) return null;

        if (statuses.Contains(MessageStatusCode.Sent))
            return MessageStatusCode.Sent;
        if (statuses.Contains(MessageStatusCode.Delivered))
            return MessageStatusCode.Delivered;
        return MessageStatusCode.Read;

    }
    private static async Task<string> GetLastStatusChange(uint messageId, DatabaseContext context)
    {
        var time = await context.MessageStatuses
            .AsNoTracking()
            .Where(ms => ms.MessageId == messageId)
            .OrderByDescending(ms => ms.UpdatedTime)
            .Select(ms => ms.UpdatedTime)
            .FirstOrDefaultAsync()
            .ConfigureAwait(false);
        return GroupService.GetCorrectTymeFormat(time);
    }

}