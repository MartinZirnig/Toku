using Database.Tables;
using Microsoft.EntityFrameworkCore;

namespace Database;
internal class DatabaseContext : DbContext
{
    private const string Connection =
        "server=mysqlstudenti.litv.sssvt.cz;database=3b2_zirnigmartin_db2;user=zirnigmartin;password=123456";

    public DbSet<Client> Clients { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<GroupClient> GroupClients { get; set; }
    public DbSet<GroupInvite> GroupInvites { get; set; }
    public DbSet<GroupMessage> GroupMessages { get; set; }
    public DbSet<GroupOperation> GroupOperations { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<MessageReaction> MessageReactions { get; set; }
    public DbSet<MessageStatus> MessageStatuses { get; set; }
    public DbSet<MessageStatusHistory> MessageStatusHistories { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<StoredFile> StoredFiles { get; set; }
    public DbSet<StoredFileOwner> StoredFileOwners { get; set; }
    public DbSet<UserLogin> UserLogins { get; set; }
    public DbSet<User> Users { get; set; }


    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseMySQL(Connection);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User entity
        modelBuilder.Entity<User>()
            .HasKey(u => u.UserId);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Name)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasMany(u => u.UserLogins)
            .WithOne(ul => ul.User)
            .HasForeignKey(ul => ul.UserId);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Notifications)
            .WithOne(n => n.User)
            .HasForeignKey(n => n.UserId);

        // UserLogin entity
        modelBuilder.Entity<UserLogin>()
            .HasKey(ul => new { ul.SessionId, ul.UserId });

        // Group entity
        modelBuilder.Entity<Group>()
            .HasKey(g => g.GroupId);

        modelBuilder.Entity<Group>()
            .HasIndex(g => g.Name)
            .IsUnique();

        modelBuilder.Entity<Group>()
            .HasMany(g => g.GroupInvites)
            .WithOne(gi => gi.Group)
            .HasForeignKey(gi => gi.GroupId);

        modelBuilder.Entity<Group>()
            .HasMany(g => g.GroupOperations)
            .WithOne(go => go.Group)
            .HasForeignKey(go => go.GroupId);

        modelBuilder.Entity<Group>()
            .HasMany(g => g.GroupMessages)
            .WithOne(gm => gm.Group)
            .HasForeignKey(gm => gm.GroupId);

        modelBuilder.Entity<Group>()
            .HasMany(g => g.GroupClients)
            .WithOne(gc => gc.Group)
            .HasForeignKey(gc => gc.GroupId);

        // GroupInvite entity
        modelBuilder.Entity<GroupInvite>()
            .HasKey(gi => gi.InviteId);

        modelBuilder.Entity<GroupInvite>()
            .HasOne(gi => gi.User)
            .WithMany(u => u.GroupInvites)
            .HasForeignKey(gi => gi.UserId);

        // GroupOperation entity
        modelBuilder.Entity<GroupOperation>()
            .HasKey(go => go.GroupOperationId);

        modelBuilder.Entity<GroupOperation>()
            .HasOne(go => go.Group)
            .WithMany(g => g.GroupOperations)
            .HasForeignKey(go => go.GroupId);

        modelBuilder.Entity<GroupOperation>()
            .HasOne(go => go.Editor)
            .WithMany(c => c.GroupOperationsEdited)
            .HasForeignKey(go => go.EditorId);

        modelBuilder.Entity<GroupOperation>()
            .HasOne(go => go.TargetUser)
            .WithMany(c => c.GroupOperationsTarget)
            .HasForeignKey(go => go.TargetUserId);

        // Message entity
        modelBuilder.Entity<Message>()
            .HasKey(m => m.MessageId);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.Messages)
            .HasForeignKey(m => m.SenderId);

        modelBuilder.Entity<Message>()
            .HasMany(m => m.MessageStatuses)
            .WithOne(ms => ms.Message)
            .HasForeignKey(ms => ms.MessageId);

        modelBuilder.Entity<Message>()
            .HasMany(m => m.MessageReactions)
            .WithOne(mr => mr.Message)
            .HasForeignKey(mr => mr.MessageId);

        modelBuilder.Entity<Message>()
            .HasMany(m => m.GroupMessages)
            .WithOne(gm => gm.Message)
            .HasForeignKey(gm => gm.MessageId);

        // MessageStatus entity
        modelBuilder.Entity<MessageStatus>()
            .HasKey(ms => ms.MessageStatusId);

        modelBuilder.Entity<MessageStatus>()
            .HasOne(ms => ms.Message)
            .WithMany(m => m.MessageStatuses)
            .HasForeignKey(ms => ms.MessageId);

        modelBuilder.Entity<MessageStatus>()
            .HasOne(ms => ms.Client)
            .WithMany(c => c.MessageStatuses)
            .HasForeignKey(ms => ms.ClientId);

        // MessageReaction entity
        modelBuilder.Entity<MessageReaction>()
            .HasKey(mr => new { mr.MessageId, mr.ClientId });

        modelBuilder.Entity<MessageReaction>()
            .HasOne(mr => mr.Message)
            .WithMany(m => m.MessageReactions)
            .HasForeignKey(mr => mr.MessageId);

        modelBuilder.Entity<MessageReaction>()
            .HasOne(mr => mr.Client)
            .WithMany(c => c.MessageReactions)
            .HasForeignKey(mr => mr.ClientId);

        // Notification entity
        modelBuilder.Entity<Notification>()
            .HasKey(n => n.NotificationId);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId);

        // FileEntity entity
        modelBuilder.Entity<FileEntity>()
            .HasKey(f => f.FileId);

        // GroupMessage entity (junction table)
        modelBuilder.Entity<GroupMessage>()
            .HasKey(gm => new { gm.GroupId, gm.MessageId });

        modelBuilder.Entity<GroupMessage>()
            .HasOne(gm => gm.Group)
            .WithMany(g => g.GroupMessages)
            .HasForeignKey(gm => gm.GroupId);

        modelBuilder.Entity<GroupMessage>()
            .HasOne(gm => gm.Message)
            .WithMany(m => m.GroupMessages)
            .HasForeignKey(gm => gm.MessageId);

        // FileOwner entity
        modelBuilder.Entity<FileOwner>()
            .HasKey(fo => new { fo.FileId });

        modelBuilder.Entity<FileOwner>()
            .HasOne(fo => fo.File)
            .WithMany()
            .HasForeignKey(fo => fo.FileId);

        modelBuilder.Entity<FileOwner>()
            .HasOne(fo => fo.UserOwnerNavigation)
            .WithMany()
            .HasForeignKey(fo => fo.UserOwner);

        modelBuilder.Entity<FileOwner>()
            .HasOne(fo => fo.ClientOwnerNavigation)
            .WithMany()
            .HasForeignKey(fo => fo.ClientOwner);

        modelBuilder.Entity<FileOwner>()
            .HasOne(fo => fo.GroupOwnerNavigation)
            .WithMany()
            .HasForeignKey(fo => fo.GroupOwner);

        // Client entity
        modelBuilder.Entity<Client>()
            .HasKey(c => c.ClientId);

        modelBuilder.Entity<Client>()
            .HasOne(c => c.User)
            .WithMany(u => u.Clients)
            .HasForeignKey(c => c.UserId);

        modelBuilder.Entity<Client>()
            .HasMany(c => c.GroupOperationsEdited)
            .WithOne(go => go.Editor)
            .HasForeignKey(go => go.EditorId);

        modelBuilder.Entity<Client>()
            .HasMany(c => c.GroupOperationsTarget)
            .WithOne(go => go.TargetUser)
            .HasForeignKey(go => go.TargetUserId);

        // GroupClient entity
        modelBuilder.Entity<GroupClient>()
            .HasKey(gc => gc.GroupClientId);

        modelBuilder.Entity<GroupClient>()
            .HasOne(gc => gc.Client)
            .WithMany(c => c.GroupClients)
            .HasForeignKey(gc => gc.ClientId);

        modelBuilder.Entity<GroupClient>()
            .HasOne(gc => gc.Group)
            .WithMany(g => g.GroupClients)
            .HasForeignKey(gc => gc.GroupId);

        // MessageStatusHistory entity
        modelBuilder.Entity<MessageStatusHistory>()
            .HasKey(msh => msh.RecordId);

        modelBuilder.Entity<MessageStatusHistory>()
            .HasOne(msh => msh.MessageStatus)
            .WithMany(ms => ms.MessageStatusHistories)
            .HasForeignKey(msh => msh.MessageStatuseId);
    }

}
