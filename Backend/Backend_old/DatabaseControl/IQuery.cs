using Microsoft.EntityFrameworkCore;

namespace MysqlDatabaseControl;

public interface IQuery<T>
{
    T Execute(DbContext context);
    async Task<T> ExecuteAsync(DbContext context)
    {
        return await Task.Run(() => Execute(context));
    }
}
