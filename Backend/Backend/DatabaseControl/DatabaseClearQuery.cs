using Microsoft.EntityFrameworkCore;
using MysqlDatabaseControl;

namespace MysqlDatabaseControl;
public class DatabaseClearQuery : IQuery<Unit>
{
    public Unit Execute(DbContext context)
    {
        ConstraintsCheckQuery.Disable.Execute(context);

        var tables = GetTableNames(context);
        var queries = GetQueries(tables);
        queries.ForEach(q => q.Execute(context));

        ConstraintsCheckQuery.Enable.Execute(context);
        return Unit.Value;
    }
    private IEnumerable<string> GetTableNames(DbContext context)
    {
        var query = new TablesNameQuery();
        return query.Execute(context);
    }
    private List<TableClearQuery> GetQueries(IEnumerable<string> tables)
    {
        var queries = new List<TableClearQuery>();
        foreach (var table in tables)
        {
            var query = new TableClearQuery(table);
            queries.Add(query);
        }
        return queries;
    }
}
