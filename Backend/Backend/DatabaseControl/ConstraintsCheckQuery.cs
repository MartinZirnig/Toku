using Microsoft.EntityFrameworkCore;
using System.Data.Common;
using MysqlDatabaseControl;

namespace MysqlDatabaseControl;
public record ConstraintsCheckQuery
    (bool SetEnabled)
    : IQuery<Unit>
{
    public Unit Execute(DbContext context)
    {
        var query = SqlService.BuildConstraintCheckQuery(SetEnabled);
        context.Database.ExecuteSqlRaw(query);
        return Unit.Value;
    }

    public static ConstraintsCheckQuery Enable = new (true);
    public static ConstraintsCheckQuery Disable = new (false);
}
