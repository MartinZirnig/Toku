namespace MysqlDatabase;
internal abstract class DatabaseServisLifecycle : IDisposable
{
    private bool _disposed = false;
    protected readonly DatabaseContext Context = new();


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
            Context.SaveChanges();
            Context.Dispose();
        }

        _disposed = true;
    }
    internal DatabaseContext GetContext() => Context;

    ~DatabaseServisLifecycle()
    {
        Dispose(disposing: false);
    }
}

