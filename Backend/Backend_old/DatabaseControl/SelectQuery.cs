using Microsoft.EntityFrameworkCore;

namespace MysqlDatabaseControl;

public record SelectQuery(
    string TableName,
    bool Distinct = false,
    int? Top = null,
    bool TopInPercent = false,
    string? Condition = null,
    params string[]? Columns
    ) : IQuery<IEnumerable<IEnumerable<object?>>>
{
    public IEnumerable<IEnumerable<object?>> Execute(DbContext context)
    {
        var query = GetSelectQuery();

        var connection = context.Database.GetDbConnection();
        connection.Open();

        using var command = connection.CreateCommand();
        command.CommandText = SqlService.BuildSelectQuery(TableName);

        using (var reader = command.ExecuteReader())
        {
            var results = new List<List<object?>>();
            while (reader.Read())
            {
                var row = new List<object?>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    var value = reader.IsDBNull(i) ? null : reader.GetValue(i);
                    row.Add(value);
                }
                results.Add(row);
            }
            connection.Close();
            return results;
        }
    }
    public IEnumerable<IEnumerable<string>> ExecuteIntoString(DbContext context)
    {
        var query = GetSelectQuery();

        var connection = context.Database.GetDbConnection();
        connection.Open();

        using var command = connection.CreateCommand();
        command.CommandText = SqlService.BuildSelectQuery(TableName);

        using (var reader = command.ExecuteReader())
        {
            var results = new List<List<string>>();
            while (reader.Read())
            {
                var row = new List<string>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    var value = reader.IsDBNull(i) ? null : reader.GetValue(i).ToString();
                    if (value is null) value = "NULL";
                    row.Add(value);
                }
                results.Add(row);
            }
            connection.Close();
            return results;
        }
    }

    private string GetSelectQuery()
    {
        var select = SqlService.BuildSelectQuery(
            TableName,
            Distinct,
            Top,
            TopInPercent,
            Columns);
        if (Condition is not null)
        {
            select += SqlService.BuildCondition(Condition);
        }
        return select;
    }

    public static void Print(IEnumerable<IEnumerable<object?>> content, TextWriter output)
    {
        foreach (var row in content)
        {
            var stringed = row.Select(x => x?.ToString() ?? "NULL");
            var rowAsString = string.Join(" <--> ", stringed);
            output.WriteLine(rowAsString);
        }
    }
    public static void Print(IEnumerable<IEnumerable<string>> content, TextWriter output)
    {
        foreach (var row in content)
        {
            var rowAsString = string.Join(" <--> ", row);
            output.WriteLine(rowAsString);
        }
    }
}

