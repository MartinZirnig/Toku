using Microsoft.EntityFrameworkCore;
using MysqlDatabaseControl;

namespace MysqlDatabaseControl;
public class DatabaseBackupQuery : IQuery<Unit>
{
    private readonly string BackupPath;

    public DatabaseBackupQuery(string backupPath)
    {
        BackupPath = backupPath;
    }

    public Unit Execute(DbContext context)
    {
        var tables = GetTablesNames(context);
        var queries = GetQueries(BackupPath, tables);
        queries.ForEach(q => q.Execute(context));
        return Unit.Value;
    }

    private IEnumerable<string> GetTablesNames(DbContext context)
    {
        var query = new TablesNameQuery();
        return query.Execute(context);
    }
    private List<TableBackupQuery> GetQueries(string path, IEnumerable<string> tables)
    {
        var queries = new List<TableBackupQuery>();
        foreach (var table in tables)
        {
            var filePath = Path.Combine(path, $"{table}");
            var query = new TableBackupQuery(filePath, table);
            queries.Add(query);
        }
        return queries;
    }

}
