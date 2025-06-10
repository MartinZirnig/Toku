
using Microsoft.EntityFrameworkCore;
using MysqlDatabaseControl;
using BackendEnums;

namespace MysqlDatabase;

internal static class DefaultValues
{
    private static IEnumerable<InsertQuery> GetDefaultFiles()
    {
        var result = new List<InsertQuery>();

        result.Add(new InsertQuery("StoredFiles",
            [1, (byte)FileType.Image,
            "default user image",
            @"etc\\profile_images\\default.png", "0", "null" ]));


        return result;
    }
    private static IEnumerable<InsertQuery> GetDefaultUsers()
    {
        var result = new List<InsertQuery>();

        result.Add(new InsertQuery("Users",
            [1, 1, "default",
            "",0 , "", DateTime.Now.ToString("yyyy-MM-dd HH:MM:ss"), "null"]));


        return result;
    }
    private static IEnumerable<InsertQuery> GetDefaultStoredFileOwners()
    {
        var result = new List<InsertQuery>();

        result.Add(new InsertQuery("StoredFileOwners",[1, 1, "null", "null"]));


        return result;
    }




    public static void Insert(DbContext context)
    {
        ConstraintsCheckQuery.Disable.Execute(context);


        foreach (var file in GetDefaultFiles()) file.Execute(context);
        foreach (var user in GetDefaultUsers()) user.Execute(context);
        foreach (var fileOwner in GetDefaultStoredFileOwners()) fileOwner.Execute(context);


        ConstraintsCheckQuery.Enable.Execute(context);
        context.SaveChanges();
    }
}

