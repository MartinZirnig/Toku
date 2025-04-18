using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Database
{
    public sealed partial class DatabaseManager : IDisposable
    {
        public static DatabaseManager Instance
        { 
            get
            {
                if (_instance == null)
                    _instance = new DatabaseManager();
                return _instance;
            }
        }
        private static DatabaseManager? _instance;



        private MysqlContext _context;
        private bool _disposed;

        private DatabaseManager() 
        {
            _context = new MysqlContext();
            _context.Database.EnsureCreated();
        }
        ~DatabaseManager()
        {
            this.Dispose();
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _context.Database.CloseConnection();
                _context.Dispose();
                _context = null!;
                _disposed = true;
            }
        }

        private void ThrowWhenClosed()
        {
            if (_disposed || _context is null)
                throw new InvalidOperationException("Cannot use closed closed database");
        }

        private void Save() => _context.SaveChanges();
    }
}
