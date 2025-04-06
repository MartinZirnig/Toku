using BackendInterfaces;

namespace Database;

public class Database : IDataServiceProvider
{
    public static IDataService GetService() => new DataService();
    public IDataService GetDataService() => GetService();
}

