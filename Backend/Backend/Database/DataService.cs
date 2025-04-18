using BackendEnums;
using BackendInterface;
using BackendInterface.DataObjects;
using BackendInterface.Models;
using Crypto;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MysqlDatabase.Tables;
using MysqlDatabaseControl;

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
        using var transaction = await Context.Database.BeginTransactionAsync();

        try
        {
            var encrypted = new EncryptedMessage(message.MessageContent);
            var messageId = await StoreMessageAsync(encrypted, message);
            if (messageId == 0) return 0;

            var users = await SupportService.GetGroupUsersAsync(
                message.GroupId, Context);

            var tasks = users.Select(user =>
                StoreUserMessageRelationAsync(encrypted, user, messageId));
            await Task.WhenAll(tasks);

            await transaction.CommitAsync();
            return messageId;
        }
        catch
        {
            await transaction.RollbackAsync();
            return 0;
        }
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
    private async Task StoreUserMessageRelationAsync(
        EncryptedMessage msg, User usr, uint msgId)
    {
        var message = msg.EncryptKey(((PPKeyPair)usr.Key).PublicKeyPem);
        var userMessage = new UserMessage
        {
            UserId = usr.UserId,
            MessageId = msgId,
            EncryptedKey = message.Key
        };

        Context.UserMessages.Add(userMessage);
        await Context.SaveChangesAsync();
    }



    public async Task<IEnumerable<StoredMessageModel>> GetGroupMessagesAsync(Guid user, uint groupId, uint messageCount)
    {
        var userData = await SupportService.GetUserDataAsync(user, Context);
        if (userData is null) return [];

        var messageIds = await Context.Messages
            .AsNoTracking()
            .Where(m => m.GroupId == groupId)
            .OrderByDescending(m => m.CreatedTime)
            .Select(m => m.MessageId)
            .Take((int)messageCount)
            .ToListAsync();

        if (messageIds.Count == 0) return [];

        var tasks = messageIds.Select(id => GetMessageAsync(userData, id));
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
        var message = await Context.Messages
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.MessageId == messageId);
        if (message is null) return null;

        var userMessage = await Context.UserMessages
            .AsNoTracking()
            .FirstOrDefaultAsync(um =>
                um.UserId == userData.UserId &&
                um.MessageId == messageId);
        if (userMessage is null) return null;

        var encryptedMessage = new EncryptedMessage(message.Content, userMessage.EncryptedKey);
        var decryptedMessage = encryptedMessage.DecryptKey(userData.DecryptedPrivateKey);
        var content = decryptedMessage.Decrypt();

        var status = await GetMessageStatusAsync(messageId);

        return new StoredMessageModel(
            content,
            message.StoredFileId,
            message.PinnedMessageId,
            message.GroupId,
            status ?? MessageStatusCode.Sent
        );
    }

    private async Task<MessageStatusCode?> GetMessageStatusAsync(uint messageId)
    {
        var statuses = await Context.MessageStatuses
            .AsNoTracking()
            .Where(ms => ms.MessageId == messageId)
            .Select(ms => ms.StatusCode)
            .ToListAsync();

        if (statuses.Count == 0) return null;

        if (statuses.Contains(MessageStatusCode.Sent))
            return MessageStatusCode.Sent;
        if (statuses.Contains(MessageStatusCode.Delivered))
            return MessageStatusCode.Delivered;
        return MessageStatusCode.Read;
    }


}