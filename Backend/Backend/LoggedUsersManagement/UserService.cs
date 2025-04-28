using BackendInterface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using ZstdSharp.Unsafe;

namespace LoggedUsersManagement;
internal class UserService : IUserService
{
    private readonly IDataServiceProvider _provider;
    private LoggedUserManager _manager;

    public UserService(IDataServiceProvider provider)
    {
        _provider = provider;
        _manager = new LoggedUserManager();
    }




    public void Heartbeat(Guid identification)
    {
        _manager.Heartbeat(identification);
    }

    public void RegisterUser(Guid identification)
    {
        throw new NotImplementedException();
    }


    public void UnregisterAllUsers()
    {
        throw new NotImplementedException();
    }

    public void UnregisterUser(Guid identification)
    {
        throw new NotImplementedException();
    }
}

