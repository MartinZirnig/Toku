using BackendInterfaces;

namespace Database;
public class DataService : IDataService, IDisposable
{
    private readonly DatabaseContext _databaseContext = new();
    ~DataService() => _databaseContext.Dispose();

    public static void InitializeDatabase()
    {
        using var context = new DatabaseContext();
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();
    }







    public void Dispose()
    {
        _databaseContext.Dispose();
        GC.SuppressFinalize(this);
    }  
}

