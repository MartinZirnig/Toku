using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using MysqlDatabaseControl;
using Org.BouncyCastle.Crypto.Prng.Drbg;
using System.Diagnostics;

namespace MysqlDatabaseControl;
public class TableRestoreQuery : IQuery<Unit>
{
    public readonly string TableName;
    public readonly string BackupPath;
    public TableRestoreQuery(string tableName, string backupPath)
    {
        TableName = tableName;
        BackupPath = backupPath;
    }
    public Unit Execute(DbContext context)
    {
        var data = ReadDatabaseFile(BackupPath);
        Debug.WriteLine($"{TableName} restoring from {BackupPath}");
        foreach (var row in data)
        {
            var query = new InsertQuery(TableName, values: row.ToArray());
            query.Execute(context);
        }
        Debug.WriteLine($"end of {TableName} values");


        return Unit.Value;
    }

    private static IEnumerable<IEnumerable<string>> ReadDatabaseFile(string path)
    {
        var data = TableBackupManager.FromFile(path);
        return data;
    }
}

