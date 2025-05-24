using BackendEnums;
using BackendInterface;
using BackendInterface.DataObjects;
using BackendInterface.Models;
using Crypto;
using Microsoft.EntityFrameworkCore;
using MysqlDatabase.Tables;
using MysqlDatabaseControl;

namespace MysqlDatabase;
internal class DataService : DatabaseServisLifecycle, IDataService
{
    public DataService(MysqlDatabaseManager creator)
    : base(creator) { }

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
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        using var off = new ConstraintOff(Context);

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
    private static async Task StoreUserMessageRelationAndHistoryAsync
        (EncryptedMessage msg, User usr, uint msgId, MessageModel model)
    {
        await using var tempContext = new DatabaseContext();
        using var off = new ConstraintOff(tempContext);

        await StoreUserMessageRelationAsync(msg, usr, msgId, tempContext)
            .ConfigureAwait(false);
        await BoundRelations(msgId, model.GroupId, usr, tempContext)
            .ConfigureAwait(false);
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
            SenderId = user.UserId,
            PinnedMessageId = model.PinnedMessageId,
            CreatedTime = DateTime.UtcNow,
        };

        Context.Messages.Add(dbMessage);
        await Context.SaveChangesAsync();

        if (model.AttachedFilesId is not null)
        {
            foreach (var file in model.AttachedFilesId)
            {
                await Context.MessageStoredFiles.AddAsync(new MessageStoredFile()
                {
                    MessageId = dbMessage.MessageId,
                    StoredFileId = file
                });
            }
        }

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
            .ConfigureAwait(false)
            ?? throw new UnauthorizedAccessException();

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
        await Context.Groups
            .Where(g => g.GroupId == groupId)
            .ExecuteUpdateAsync(x =>
                x.SetProperty(g =>
                    g.LastOperation, DateTime.UtcNow))
            .ConfigureAwait(false);

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
            .Where(m => m.DeletedTime == null)
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
            messageId,
            content,
            message.MessageStoredFiles.Select(msf => msf.StoredFileId).ToArray(),
            message.PinnedMessageId,
            message.GroupId,
            (byte)(status ?? MessageStatusCode.Sent),
            GroupService.GetCorrectTimeFormat(message.CreatedTime
                .AddMinutes(-userData.TimeZoneOffset)),
            await GetLastStatusChange(messageId, context),
            pin
        );
        if (disposeContext)
            await context.DisposeAsync();
        return result;
    }


    private static async Task<MessageStatusCode?> GetMessageStatusAsync(uint messageId, DatabaseContext context)
    {
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
        return GroupService.GetCorrectTimeFormat(time);
    }

    public async Task<RequestResultModel> UpdateMessageAsync(MessageEditModel model)
    {
        await using var transaction = await Context.Database.BeginTransactionAsync();
        try
        {
            var login = await SupportService
                .GetUserDataAsync(model.EditorContext, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var message = await Context.Messages.
                FirstOrDefaultAsync(m => m.MessageId == model.MessageId)
                .ConfigureAwait(false)
                ?? throw new ArgumentException("message not found");

            var userMessage = await Context.UserMessages
                .AsNoTracking()
                .FirstOrDefaultAsync(um =>
                    um.UserId == login.UserId &&
                    um.MessageId == model.MessageId)
                .ConfigureAwait(false)
                ?? throw new ArgumentException("user-message not found");

            var encryptedMessage = new EncryptedMessage(message.Content, userMessage.EncryptedKey);
            var decryptedMessage = encryptedMessage.DecryptKey(login.DecryptedPrivateKey);

            var encryptedNewContent = EncryptedMessage.EncryptByKey(model.NewContent, decryptedMessage.Key);

            message.Content = encryptedNewContent.Content;
            //message.CreatedTime = DateTime.UtcNow;

            await Context.SaveChangesAsync().ConfigureAwait(false);
            await transaction.CommitAsync().ConfigureAwait(false);

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
    public async Task<RequestResultModel> RemoveMessageAsync(MessageRemoveModel model)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var login = await SupportService
                .GetUserDataAsync(model.UserContext, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var message = await Context.Messages
                .Where(m => m.SenderId == login.UserId)
                .FirstOrDefaultAsync(m => m.MessageId == model.MessageId)
                .ConfigureAwait(false)
                ?? throw new ArgumentException("message not found");

            message.DeletedTime = DateTime.UtcNow;
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
}