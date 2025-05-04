using MysqlDatabaseControl;
using System.Security.Cryptography.X509Certificates;

namespace MysqlDatabase.Tables;
internal class ConstraintOff : IDisposable
{
    private readonly DatabaseContext _context;
    public ConstraintOff(DatabaseContext context)
    {
        _context = context;
        Disable();
    }

    private void Disable()
    {
        ConstraintsCheckQuery.Disable.Execute(_context);
        _context.SaveChanges();
    }
    private void Enable()
    {
        ConstraintsCheckQuery.Enable.Execute(_context);
        _context.SaveChanges();
    }

    public void Dispose() =>
        Enable();
}
