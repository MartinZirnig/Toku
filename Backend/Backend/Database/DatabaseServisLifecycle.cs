namespace MysqlDatabase;
internal abstract class DatabaseServisLifecycle(MysqlDatabaseManager creator) : IDisposable
{
    private bool _disposed = false;
    protected readonly DatabaseContext Context = new();
    protected MysqlDatabaseManager Creator = creator;


    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;

        if (disposing)
        {
            try
            {
                Context.SaveChanges();
            } catch { }
            Context.Dispose();
        }

        _disposed = true;
    }
    internal DatabaseContext GetContextAsync() => Context;

    ~DatabaseServisLifecycle()
    {
        Dispose(disposing: false);
    }
}

