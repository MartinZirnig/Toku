using Microsoft.EntityFrameworkCore;
using MysqlDatabase.Tables;

namespace MysqlDatabase;
internal static class DatabaseServis
{
    public static User? GetUserByContext(Guid sessionId)
    {
        using var context = new DatabaseContext();
        var userLogin = context.UserLogins
            .Include(x => x.User)
            .FirstOrDefault(x => x.SessionId == sessionId);

        return userLogin?.User;
    }

}

