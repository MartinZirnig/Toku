using Microsoft.EntityFrameworkCore;
using MysqlDatabase.Tables;

namespace MysqlDatabase;
internal class UserWatcher
{
    private CancellationTokenSource _cancel;
    private const int WatchDelayInSeconds = 60;
    private const int UnactiveMinutesToLogout = 3;

    public UserWatcher()
    {
        _cancel = new CancellationTokenSource();
    }
    public async Task LogoutAll(DatabaseContext? context = null)
    {
        var localContext =
            context ?? new DatabaseContext();

        await localContext.UserLogins
        .Where(x => x.LoggedOut == null)
        .ExecuteUpdateAsync(ul => ul
            .SetProperty(x => x.DecryptedKey, string.Empty)
            .SetProperty(x => x.LoggedOut, DateTime.Now));
        await localContext.SaveChangesAsync();
        if (context is null)
            await localContext.DisposeAsync();
    }


    public void StartWatch()
    {
        Task.Run(WatchAsync);
    }
    public void StopWatch()
    {
        this._cancel.Cancel();
    }
    private async Task WatchAsync()
    {
        var delayTime = TimeSpan.FromSeconds(WatchDelayInSeconds);
        while (!_cancel.IsCancellationRequested)
        {
            await ProceedCheckAsync()
                .ConfigureAwait(false);

            await Task.Delay(delayTime)
                .ConfigureAwait(false);
        }
    }
    private static async Task ProceedCheckAsync()
    {
        var now = DateTime.UtcNow;
        using var context = new DatabaseContext();
        await using var transaction = await context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {


            var cutoff = now.AddMinutes(-UnactiveMinutesToLogout);

            var logins = await context.UserLogins
                .Where(ul => ul.LoggedOut == null
                          && ul.LashHearthBeat < cutoff)
                .ToListAsync()
                .ConfigureAwait(false);

            foreach (var login in logins)
                Logout(login, now);

            await context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            Console.WriteLine(ex.Message);
        }
    }
    public async Task Logout(Guid userContext, DatabaseContext context)
    {
        var loginData = await context.UserLogins
            .FirstOrDefaultAsync(ul => ul.SessionId == userContext)
            .ConfigureAwait(false)
            ?? throw new UnauthorizedAccessException();

        Logout(loginData, DateTime.Now);
    }
    private static void Logout(UserLogin login, DateTime now)
    {
        login.LoggedOut = now;
        login.DecryptedKey = string.Empty;
    }


}

