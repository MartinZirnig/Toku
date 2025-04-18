using Microsoft.EntityFrameworkCore;
using MysqlDatabaseControl;

namespace MysqlDatabaseControl;
public class DatabaseRestoreQuery : IQuery<Unit>
{
    public readonly string DatabasePath;
    public DatabaseRestoreQuery(string databasePath)
    {
        DatabasePath = databasePath;
    }

    public Unit Execute(DbContext context)
    {
        ThrowWhenInvalidPath();

        var files = GetDatabaseFiles();
        var queries = GetQueries(files);
        queries.ForEach(q => q.Execute(context));
        return Unit.Value;
    }
    private IEnumerable<string> GetDatabaseFiles()
    {
        var files = Directory.GetFiles(DatabasePath, 
            $"*{TableBackupManager.BackupFileExtension}");
        return files;
    }
    private List<TableRestoreQuery> GetQueries(IEnumerable<string> files)
    {
        var queries = new List<TableRestoreQuery>();

        foreach (var file in files)
        {
            var fileName = Path.GetFileNameWithoutExtension(file);
            var query = new TableRestoreQuery(fileName, file);
            queries.Add(query);
        }
        return queries;
    }
    private void ThrowWhenInvalidPath()
    {
        if (!Directory.Exists(DatabasePath))
            throw new DirectoryNotFoundException(
                $"The directory {DatabasePath} does not exist.");
    }
}
