
using Microsoft.EntityFrameworkCore;

using MysqlDatabaseControl;

namespace MysqlDatabaseControl;
public class TablesNameQuery : IQuery<IEnumerable<string>>
{
    public IEnumerable<string> Execute(DbContext context)
    {
        var tables = context
            .Database
            .SqlQueryRaw<string>(SqlService.GetTables)
            .ToList();

        return tables;
    }
}

