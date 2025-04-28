using Microsoft.EntityFrameworkCore;
using MysqlDatabaseControl;
using MySqlX.XDevAPI.Common;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Dynamic;

namespace MysqlDatabaseControl;

public class TableBackupQuery : IQuery<Unit>
{
    private readonly string BackupPath;
    private readonly string TableName;
    public TableBackupQuery(string backupPath, string tableName)
    {
        BackupPath = backupPath;
        TableName = tableName;
    }
    public Unit Execute(DbContext context)
    {
        var data = SelectData(context);
        Debug.WriteLine($"Start backup table {TableName} into {BackupPath}");

        TableBackupManager.IntoFile(data, BackupPath);

        Debug.WriteLine($"finished backup table {TableName}");
        return Unit.Value;
    }
    private IEnumerable<IEnumerable<string>> SelectData(DbContext context)
    {
        var query = new SelectQuery(TableName);
        var result = query.ExecuteIntoString(context);
        return result;
    }
}
