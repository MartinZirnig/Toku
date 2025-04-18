namespace BackendInterface;
public interface IDatabaseService
{
    static abstract void InitializeDatabase();
    static abstract void ClearDatabase();
    static abstract void BackupDatabase(string path);
    static abstract void DestroyDatabase();
    static abstract void RestoreDatabase(string path);
}
