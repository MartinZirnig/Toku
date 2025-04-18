using MysqlDatabase.Tables;
using Microsoft.EntityFrameworkCore;
using Crypto;

namespace MysqlDatabase;
internal class DatabaseContext : DbContext
{
    private const string ConnectionString =
        "server=mysqlstudenti.litv.sssvt.cz;" +
        "database=3b2_zirnigmartin_db2;" +
        "user=zirnigmartin;" +
        "password=123456";
    #region DbSets

    public DbSet<Client> Clients { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<GroupClient> GroupClients { get; set; }
    public DbSet<GroupInvite> GroupInvites { get; set; }
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
    public DbSet<CryptoKey> CryptoKeys { get; set; }
    public DbSet<UserMessage> UserMessages { get; set; }
    public DbSet<UserFileEncryption> userFileEncryptions { get; set; }

    #endregion

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseMySQL(ConnectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .Property(u => u.Password)
            .HasConversion(
                hashedValue => hashedValue.ToString(),
                str => new HashedValue(str)
            );

        modelBuilder.Entity<Client>()
            .Property(c => c.LocalPassword)
            .HasConversion(
                hashedValue => hashedValue.ToString(),
                str => new HashedValue(str)
            );
        modelBuilder.Entity<Group>()
            .Property(g => g.Password)
            .HasConversion(
                hashedValue => hashedValue.ToString(),
                str => new HashedValue(str)
            );
        modelBuilder.Entity<Group>()
            .Property(g => g.TwoUserIdentifier)
            .HasConversion(
                hashedValue => hashedValue.ToString(),
                str => new HashedValue(str)
            );
    }
}
