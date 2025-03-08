using Database.Tables;
using Database.Tables.Classes;
using Microsoft.EntityFrameworkCore;


namespace Database;

internal class MysqlContext : DbContext
{
    public DbSet<Class> Classes { get; set; }
    public DbSet<PrivateClass> PrivateClasses { get; set; }
    public DbSet<PublicClass> PublicClasses { get; set; }

    public DbSet<User> Users { get; set; }
    public DbSet<ClassOperation> Operations { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseMySQL("server=mysqlstudenti.litv.sssvt.cz;database=3b2_zirnigmartin_db2;user=zirnigmartin;password=123456");
    }
}
