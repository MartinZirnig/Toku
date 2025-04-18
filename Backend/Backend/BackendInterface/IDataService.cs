﻿using BackendInterface.Models;
using MysqlDatabaseControl;

namespace BackendInterface;
public interface IDataService : IDisposable
{
    T ExecuteQuery<T>(IQuery<T> query);

    Task<uint> ReceiveMessageAsync(MessageModel message);
    Task<StoredMessageModel?> GetMessageAsync(Guid user, uint messageId);
    Task<IEnumerable<StoredMessageModel>> GetGroupMessagesAsync(
        Guid user, uint groupId, uint messageCount);
}

