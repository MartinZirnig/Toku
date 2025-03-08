using Database.Tables;
using Database.Tables.Classes;

namespace Database;

public partial class DatabaseManager
{
    public void AddMessage(Message message, User sender)
    {
        ThrowWhenClosed();

        var user = sender.Validify(_context);
        message.Sender = user;
        Save();
    }

    public void ChangeMessage(Message message, User sender, string newContent)
    {
        ThrowWhenClosed();

        var user = sender.Validify(_context);
        message = message.GetFromDb(_context, user)
            ?? throw new ArgumentException("Arguments are not lucky");

        message.Content = newContent;
        Save();
    }
    public void DeleteMessage(Message message, User sender)
    {
        ThrowWhenClosed();

        var user = sender.Validify(_context);
        message = message.GetFromDb(_context, user)
            ?? throw new ArgumentException("Arguments are not lucky");

        message.IsDeleted = true;
        Save();
    }

    public bool CreateUser(User user)
    {
        ThrowWhenClosed();

        if (user.Exists(_context)) return false;

        user.Validify(_context);
        Save();
        return true;
    }
    public bool UpdateUser(User old, User @new)
    {
        ThrowWhenClosed();

        if (!old.Exists(_context)) return false;

        old = old.Validify(_context);

        old.Email = @new.Email;
        old.Password = @new.Password;
        old.Name = @new.Name;
        Save();

        return true;
    }
    public void DeleteUser(User user)
    {
        ThrowWhenClosed();

        user = user.Validify(_context);

        user.IsDeleted = true;
        Save();
    }

    public bool CreateClass(Class @class)
    {
        ThrowWhenClosed();

        if (@class.Exists(_context)) return false;

        @class.Validify(_context);
        Save();

        return true;
    }
    public void SetClassPublic(Class @class, string password)
    {
        ThrowWhenClosed();

        @class = @class.Validify(_context);
        var publicClass = new PublicClass()
        {
            Class = @class,
            Password = password
        };
        _context.PublicClasses.Add(publicClass);
        Save();
    }
    public void SetClassPrivate(Class @class)
    {
        ThrowWhenClosed();

        @class = @class.Validify(_context);
        var privateClass = new PrivateClass()
        {
            Class = @class,
        };
        _context.PrivateClasses.Add(privateClass);
        Save();
    }

    public bool UpdateClass(Class old, Class @new)
    {
        ThrowWhenClosed();

        if (!old.Exists(_context)) return false;

        old = old.Validify(_context);
        old.CreatedTime = @new.CreatedTime;
        old.Name = @new.Name;
        old.Description = @new.Description;
        Save();

        return true;
    }
    public bool UpdatePublicClass(PublicClass old, Class main, PublicClass @new)
    {
        ThrowWhenClosed();
        old.Class = main;

        if (!old.Exists(_context)) return false;

        old = old.Validify(_context)!;
        old.Password = @new.Password;
        Save();

        return true;

    }

    public void RemoveClass(Class @class)
    {
        ThrowWhenClosed();

        @class = @class.Validify(_context);
        @class.IsDeleted = true;
        Save();
    }






    public void PromoteClassUser()
    {
        ThrowWhenClosed();

    }
    public void DemoteClassUser()
    {
        ThrowWhenClosed();

    }


}
