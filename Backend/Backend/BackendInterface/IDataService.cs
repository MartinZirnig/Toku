using BackendInterface.Models;
using MysqlDatabaseControl;

namespace BackendInterface;
public interface IDataService : IDisposable
{
    T ExecuteQuery<T>(IQuery<T> query);

    uint ReceiveMessage(MessageModel message);
    StoredMessageModel? GetMessage(Guid user, uint messageId);
    IEnumerable<StoredMessageModel> GetGroupMessages(
        Guid user, uint groupId, uint messageCount);
}

