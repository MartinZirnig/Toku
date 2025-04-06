using Database;

namespace Test;

[TestClass]
public sealed class DatabaseTest
{
    [TestMethod]
    public void TestDatabaseInitialization()
    {
        DataService.InitializeDatabase();

        DataService dataService = new DataService();
        dataService.Dispose();
    }

}