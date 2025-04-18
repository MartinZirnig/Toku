using System.Reflection;
using BackendInterface;
using MysqlDatabaseControl;

namespace MysqlDatabase;

public sealed class MysqlDatabaseManager
    : IDatabaseServiceProvider, IDatabaseService
{
    #region IDatabaseService
    public static readonly string BaseEmergencyBackupPath
        = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)
        ?? Directory.GetCurrentDirectory();

    public static void InitializeDatabase()
    {
        using var context = new DatabaseContext();
        if (!context.Database.CanConnect())
        {
            context.Database.EnsureCreated();
            DefaultValues.Insert(context);
        }
    }
    public static void DestroyDatabase()
    {
        //EmergencyBackup();
        using var context = new DatabaseContext();
        context.Database.EnsureDeleted();
    }
    public static void BackupDatabase(string path)
    {
        using var context = new DatabaseContext();

        var query = new DatabaseBackupQuery(path);
        query.Execute(context);
    }
    public static void ClearDatabase()
    {
        using var context = new DatabaseContext();
        var query = new DatabaseClearQuery();
        query.Execute(context);
    }
    private static void EmergencyBackup()
    {
        var path = Path.Combine(
            Directory.GetCurrentDirectory(),
            "db_backups",
            DateTime.Now.ToString("yyyy-MM-dd HH-mm-ss ff"));
        BackupDatabase(path);
    }
    #endregion


    #region IServiceProvider
    public static IDataService GetDataServiceStatic()
    {
        return new DataService();
    }

    public static IUserService GetUserServiceStatic()
    {
        return new UserService();
    }

    public static IFileService GetFileServiceStatic()
    {
        return new FileService();
    }

    public IDataService GetDataService()
    {
        return GetDataServiceStatic();
    }

    public IUserService GetUserService()
    {
        return GetUserServiceStatic();
    }

    public IFileService GetFileService()
    {
        return GetFileServiceStatic();
    }
    #endregion
}

