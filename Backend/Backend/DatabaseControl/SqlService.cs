using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace MysqlDatabaseControl;
internal static class SqlService
{
    public const string GetTables = """
        SELECT TABLE_NAME as Name
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
                AND TABLE_SCHEMA = DATABASE();
        """;


    public const string Distinct = "DISTINCT";
    public const string Top = "TOP {0} {1}";
    public const string SelectData = """
        SELECT {0}
            FROM {1}
        """;
    public static string BuildSelectQuery(
        string tableName,
        bool distinct = false,
        int? top = null,
        bool topInPercent = false,
        string[]? columns = null)
    {
        var builder = new StringBuilder();

        if (distinct) builder.Append(Distinct);
        if (top is not null)
        {
            builder.AppendFormat(Top, top,
                topInPercent ? "PERCENT" : "");
            builder.AppendLine();
        }
        if (columns is not null && columns.Length != 0)
            builder.Append($"[{string.Join("], [", columns)}]");
        else builder.Append("*");

        return string.Format(SelectData,
            builder.ToString(),
            tableName);
    }

    public const string InsertData = """
        INSERT INTO {0}
            VALUES ({1})
        """;
    public static string BuildInsertQuery(string tableNameWithParams, string values) =>
        string.Format(InsertData, tableNameWithParams, values);

    public const string ClearTable = """
        TRUNCATE TABLE {0};
        """;
    public static string BuildClearTableQuery(string tableName) =>
        string.Format(ClearTable, tableName);
    public const string Condition = """
        WHERE {0}
        """;
    public static string BuildCondition(string condition) =>
        string.Format(Condition, condition);

    public const string SetConstraintCheck = "SET FOREIGN_KEY_CHECKS = {0};";
    public static string BuildConstraintCheckQuery(bool enable) =>
        string.Format(SetConstraintCheck, enable ? 1 : 0);


}
