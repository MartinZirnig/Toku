using System.Reflection;
using BackendInterface;
using MysqlDatabase.Tables;
using MysqlDatabaseControl;

namespace MysqlDatabase;

public sealed class MysqlDatabaseManager
    : IDatabaseServiceProvider, IDatabaseService, IDisposable
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
        EmergencyBackup();
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
    public static void RestoreDatabase(string path)
    {
        using var context = new DatabaseContext();
        using var off = new ConstraintOff(context);
        var query = new DatabaseRestoreQuery(path);
        query.Execute(context);

    }
    #endregion


    #region IServiceProvider

    public IDataService GetDataService()
    {
        return new DataService(this);
    }

    public IUserService GetUserService()
    {
        return new UserService(this);
    }

    public IFileService GetFileService()
    {
        return new FileService(this);
    }

    public IGroupService GetGroupService()
    {
        return new GroupService(this);
    }

    #endregion


    #region LifeCycle
    internal UserWatcher UserWatcher;
    private bool _disposed;
    public MysqlDatabaseManager()
    {
        Initialize().GetAwaiter().GetResult();
    }
    private async Task Initialize()
    {
        using var context = new DataService(this);
        await context.ClearAllAiAsync()
            .ConfigureAwait(false);
        UserWatcher = new UserWatcher();
        await UserWatcher.LogoutAll()
            .ConfigureAwait(false);
        UserWatcher.StartWatch();
        Console.WriteLine("created");
    }
    ~MysqlDatabaseManager() =>
        Dispose();

    public void Dispose()
    {
        if (_disposed) return;

        _disposed = true;
        UserWatcher.StopWatch();
        GC.SuppressFinalize(this);
    }
    #endregion
}

