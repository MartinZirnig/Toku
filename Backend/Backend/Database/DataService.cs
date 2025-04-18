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


    public uint ReceiveMessage(MessageModel message)
    {
        throw new NotImplementedException();
        /*
        var encrypted = new EncryptedMessage(message.MessageContent);
        var messageId = StoreMessage(encrypted, message);
        if (messageId == 0) return 0;
        var users = SupportService.GetGroupUsersAsync(
            message.GroupId, Context);
        foreach (var user in users)
            StoreUserMessageRelation(encrypted, user, messageId);
        return messageId;
        */
    }
    private uint StoreMessage
        (EncryptedMessage message, MessageModel model)
    {
        throw new NotImplementedException();
        /*
        var user = SupportService.GetUserDataAsync(
            model.SenderContext, Context);

        if (user is null) return 0;

        var dbMessage = new Message
        {
            Content = message.Content,
            StoredFileId = model.AttachedFileId,
            SenderId = user.UserId,
            PinnedMessageId = model.PinnedMessageId,
            CreatedTime = DateTime.Now
        };

        Context.Messages.Add(dbMessage);
        Context.SaveChanges();
        return dbMessage.MessageId;
        */
    }
    private void StoreUserMessageRelation(
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
        Context.SaveChanges();
    }


    public IEnumerable<StoredMessageModel> GetGroupMessages(Guid user, uint groupId, uint messageCount)
    {
        var userData = SupportService.GetUserDataAsync(user, Context);
        var messages = Context.Groups
            .AsNoTracking()
            .Include(g => g.Messages)
            .Take((int)messageCount)
            .FirstOrDefault(g => g.GroupId == groupId)?
            .Messages
            .Select(m => m.MessageId);
        if (messages is null) return [];

        var result = new List<StoredMessageModel>();
        foreach (var message in messages)
        {
            var storedMessage = GetMessage(user, message);
            if (storedMessage is null) continue;
            result.Add(storedMessage);
        }
        return result;

    }

    public StoredMessageModel? GetMessage(Guid user, uint messageId)
    {
        throw new NotImplementedException();
        /*
        var userData = SupportService.GetUserDataAsync(user, Context);
        if (userData is null) return null;
        var message = Context.Messages
            .AsNoTracking()
            .FirstOrDefault(m => m.MessageId == messageId);
        if (message is null) return null;
        var userMessage = Context.UserMessages
            .AsNoTracking()
            .FirstOrDefault(um =>
                um.UserId == userData.UserId
                && um.MessageId == messageId);
        if (userMessage is null) return null;

        var encryptedMessage = new EncryptedMessage(
            message.Content, userMessage.EncryptedKey);
        var decryptedMessage = encryptedMessage.DecryptKey(
            userData.DecryptedPrivateKey);
        var content = decryptedMessage.Decrypt();

        return new StoredMessageModel(
            content, message.StoredFileId, message.PinnedMessageId,
            message.GroupId, GetMessageStatus(messageId)
                ?? MessageStatusCode.Sent
            );
    */
    }
    private MessageStatusCode? GetMessageStatus(uint messageId)
    {
        var statuses = Context.MessageStatuses
            .AsNoTracking()
            .Where(ms => ms.MessageId == messageId)
            .Select(ms => ms.StatusCode)
            .ToList();
        if (statuses is null) return null;

        if (statuses.Contains(MessageStatusCode.Sent))
            return MessageStatusCode.Sent;
        if (statuses.Contains(MessageStatusCode.Delivered))
            return MessageStatusCode.Delivered;
        return MessageStatusCode.Read;
    }


}