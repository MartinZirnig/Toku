using BackendInterface.Models;
using MysqlDatabaseControl;

namespace BackendInterface;
public interface IDataService : IDisposable
{
    T ExecuteQuery<T>(IQuery<T> query);

    Task<uint> ReceiveMessageAsync(MessageModel message);
    Task<StoredMessageModel?> GetMessageAsync(Guid user, uint messageId);
    Task<IEnumerable<StoredMessageModel>> GetGroupMessagesAsync(
        Guid user, uint groupId, uint? messageCount);
    Task<RequestResultModel> UpdateMessageAsync(MessageEditModel model);
    Task<RequestResultModel> RemoveMessageAsync(MessageRemoveModel model);
    Task<RequestResultModel> HideMessageAsync(Guid executor, uint messageId);

    Task<StoredMessageModel> AskAiAsync(AiQueryModel query, Guid executor);
    Task<RequestResultModel> ClearAiAsync(Guid executor);
    Task<IEnumerable<StoredMessageModel>> GetAiHistoryAsync(Guid executor);
    Task ClearAllAiAsync();
}

