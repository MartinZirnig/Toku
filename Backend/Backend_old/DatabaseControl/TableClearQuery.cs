
using Microsoft.EntityFrameworkCore;

using MysqlDatabaseControl;

namespace MysqlDatabaseControl;
public class TableClearQuery : IQuery<Unit>
{
    public readonly string TableName;
    public TableClearQuery(string tableName)
    {
        TableName = tableName;
    }

    public Unit Execute(DbContext context)
    {
        var query = SqlService.BuildClearTableQuery(TableName);
        context.Database.ExecuteSqlRaw(query);
        return Unit.Value;
    }
}

