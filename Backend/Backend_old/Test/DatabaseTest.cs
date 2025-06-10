using MysqlDatabase;

namespace Test;

[TestClass]
public sealed class DatabaseTest
{
    [TestMethod]
    public void TestDatabaseInitialization()
    {
        MysqlDatabase.MysqlDatabaseManager.InitializeDatabase();
    }

}