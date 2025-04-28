using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
namespace MysqlDatabaseControl;
public class InsertQuery : IQuery<Unit>
{
    public readonly string TableName;
    public readonly string[]? Columns;
    public readonly object[] Values;

    public InsertQuery(string tableName, object[] values, string[]? columns = null)
    {
        TableName = tableName;
        Columns = columns;
        Values = values;
    }

    public Unit Execute(DbContext context)
    {
        var paramTable = GetTableNameWithParams();
        var paramValues = GetValues();
        var query = SqlService.BuildInsertQuery(paramTable, paramValues);
        try { context.Database.ExecuteSqlRaw(query); }
        catch (MySqlException) { }

        return Unit.Value;
    }
    private string GetTableNameWithParams()
    {
        if (Columns is null || Columns.Length == 0)
            return TableName;
        return $"{TableName} ('{string.Join("', '", Columns)}')";
    }
    private string GetValues()
    {
        return string
            .Join(", ", Values.Select(x => $"'{x}'"))
            .Replace("'null'", "NULL");
    }
}

