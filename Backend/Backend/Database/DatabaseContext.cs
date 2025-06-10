using Crypto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MysqlDatabase.Tables;

namespace MysqlDatabase;
internal class DatabaseContext : DbContext
{
    private const string ConnectionString =
        "server=mysqlstudenti.litv.sssvt.cz;" +
        "database=3b2_zirnigmartin_db2;" +
        "user=zirnigmartin;" +
        "password=SilneHeslo1;" +
        "charset=utf8mb4";
    #region DbSets
    public DbSet<Client> Clients { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<GroupClient> GroupClients { get; set; }
    public DbSet<GroupInvite> GroupInvites { get; set; }
    public DbSet<GroupOperation> GroupOperations { get; set; }
    public DbSet<Message> Messages { get; set; }
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
    public DbSet<MessageStoredFile> MessageStoredFiles { get; set; }

    public DbSet<GeminiContext> GeminiContext { get; set; }
    public DbSet<ExplicitContact> ExplicitContacts { get; set; }

    public DbSet<RegisteredDomain> RegisteredDomains { get; set; }
    public DbSet<ColorSetting> ColorSettings { get; set; }
    #endregion

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseMySQL(ConnectionString);
        //.EnableSensitiveDataLogging()
        //.LogTo(Console.WriteLine, LogLevel.Information);

    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        modelBuilder.Entity<Group>()
            .Property(g => g.TwoUserIdentifier)
            .IsRequired(false);


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
                hashedValue => hashedValue == null ? null : hashedValue.ToString(),
                str => str == null ? null : new HashedValue(str)
            );
        modelBuilder.Entity<Group>()
            .Property(g => g.TwoUserIdentifier)
            .HasConversion(
                hashedValue => hashedValue == null ? null : hashedValue.ToString(),
                str => str == null ? null : new HashedValue(str)
            );

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(m => m.MessageId);

            entity
                .HasMany(m => m.MessageStoredFiles)
                .WithOne(msf => msf.Message)
                .HasForeignKey(msf => msf.MessageId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StoredFile>(entity =>
        {
            entity.HasKey(sf => sf.StoredFileId);

            entity
                .HasMany(sf => sf.MessageStoredFiles)
                .WithOne(msf => msf.StoredFile)
                .HasForeignKey(msf => msf.StoredFileId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MessageStoredFile>(entity =>
        {
            entity.HasKey(msf => new { msf.MessageId, msf.StoredFileId });

            entity.ToTable("MessageStoredFiles");
        });
    }
}
