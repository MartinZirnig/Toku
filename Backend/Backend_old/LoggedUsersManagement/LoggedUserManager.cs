using BackendInterface;
using BackendInterface.DataObjects;
using BackendInterface.Models;
using System.Collections.Concurrent;

namespace LoggedUsersManagement;
internal class LoggedUserManager
{
    private ConcurrentDictionary<Guid, LoggedUserData> _userLogins;
    private ConcurrentBag<LoggedUserData> _toRemove;

    public LoggedUserManager()
    {
        _userLogins = new ConcurrentDictionary<Guid, LoggedUserData>();
        _toRemove = new ConcurrentBag<LoggedUserData>();
    }

    public void RegisterUser(Guid identification, UserLoginModel data)
    {

        _userLogins[identification] = data;
    }
    public void UnregisterUser(Guid identification)
    {
        _userLogins.Remove(identification, out _);
        _toRemove.Add(_userLogins[identification]);
    }
    public void Heartbeat(Guid identification)
    {
        _userLogins[identification].LastHeartbeat = DateTime.Now;
    }
    public void SynchronizeWithDatabase(IUserDataService service)
    {
        while (_unsynchonized.Count > 0)
        {

        }
    }

}
