using BackendInterface;
using BackendInterface.DataObjects;
using BackendInterface.Models;
using Crypto;
using Microsoft.EntityFrameworkCore;
using MysqlDatabase.Tables;
using BackendEnums;
using ConfigurationParsing;

namespace MysqlDatabase;
internal class FileService : DatabaseServisLifecycle, IFileService
{
    private static readonly FileTypeParser _fileParser = new FileTypeParser();

    public FileService(MysqlDatabaseManager creator)
    : base(creator) { }

    public async Task<uint> SaveAndEncryptFileAsync(ManagedFileModel file, uint groupId)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var encryptedFile = new EncryptedFile(file.Origin.Data);
            var data = Convert.FromBase64String(encryptedFile.Content);

            var newOrigin = file.Origin with { Data = data };
            var newFile = file with { Origin = newOrigin };
            var fileId = await SaveFileAsync(newFile);

            var users = await SupportService.GetGroupUsersAsync(groupId, Context);
            foreach (var user in users)
                await EncryptAndSaveFileForSingleUserAsync(
                    encryptedFile, user, fileId);

            await transaction.CommitAsync();
            return fileId;
        }
        catch
        {
            await transaction.RollbackAsync();
            return 0;
        }
    }
    private async Task EncryptAndSaveFileForSingleUserAsync
        (EncryptedFile eFile, User user, uint fileId)
    {
        var encrypted = eFile.EncryptKey(user.Key.PublicKey);
        var record = new UserFileEncryption()
        {
            UserId = user.UserId,
            StoredFileId = fileId,
            EncryptedFileKey = encrypted.Key,
        };
        await Context.AddAsync(record);
        await Context.SaveChangesAsync();
    }

    public async Task<FileModel?> GetAndDecryptFileAsync(Guid userIdentification, uint fileId)
    {
        try
        {
            var login = await SupportService.GetUserDataAsync(
                userIdentification, Context);
            if (login is null) return null;

            var filePath = await GetFilePathAsync(fileId);
            if (filePath is null) return null;

            var file = new FileInfo(filePath);
            if (!file.Exists) return null;

            var key = await GetKeyAsync(login, fileId);
            if (key is null) return null;

            (byte[] decryptedData, byte fileType)
                = await DecryptFileAsync(filePath, key, login);

            return new FileModel(
                decryptedData, Path.GetFileName(filePath),
                fileType, null, null, null
                );
        }
        catch
        {
            return null;
        }

    }
    private async Task<string?> GetFilePathAsync(uint fileId)
    {
        return (await Context.StoredFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(sf => sf.StoredFileId == fileId))?
            .FilePath;
    }
    private async Task<string?> GetKeyAsync(LoggedUserData login, uint fileId)
    {
        var keyEncryption = await Context.userFileEncryptions
            .AsNoTracking()
            .FirstOrDefaultAsync(ufe =>
                ufe.UserId == login.UserId
                && ufe.StoredFileId == fileId);
        return keyEncryption?.EncryptedFileKey;
    }
    private async static Task<(byte[], byte)> DecryptFileAsync(string filePath, string key, LoggedUserData login)
    {
        var fileData = await File.ReadAllBytesAsync(filePath);
        var fileAsString = Convert.ToBase64String(fileData);


        var encryptedFile = new EncryptedFile(fileAsString, key);
        var decryptedFile = encryptedFile.DecryptKey(
            login.DecryptedPrivateKey);
        var decryptedData = Convert.FromBase64String(
            decryptedFile.Content);
        var fileType = _fileParser.GetFileType(filePath);
        return (decryptedData, (byte)fileType);
    }




    public async Task<FileModel?> GetFileAsync(uint fileId)
    {
        var file = await GetFilePathAsync(fileId);
        if (file is null) return null;

        var fileData = await File.ReadAllBytesAsync(file);

        var model = new FileModel(
            fileData, Path.GetFileName(file),
            (byte)_fileParser.GetFileType(file),
            null, null, null
            );
        return model;
    }
    public async Task<uint> SaveFileAsync(ManagedFileModel file)
    {
        await using var transaction = await Context.Database
             .BeginTransactionAsync()
             .ConfigureAwait(false);
        try
        {
            var path = await StoreFileToDiskAsync(file);
            var id = await StoreFileToDatabaseAsync(path, file);

            await transaction.CommitAsync();
            return id;
        }
        catch
        {
            await transaction.RollbackAsync();
            return 0;
        }
    }

    private async static Task<string> StoreFileToDiskAsync(ManagedFileModel file)
    {

        var dir = new DirectoryInfo(file.AssignedFiePath);
        if (!dir.Exists) dir.Create();

        var filePath = Path.Combine(file.AssignedFiePath, file.Origin.FileName);
        var fileStream = File.Create(filePath);

        await fileStream.WriteAsync(file.Origin.Data);

        fileStream.Close();
        return filePath;
    }
    private async Task<uint> StoreFileToDatabaseAsync(string path, ManagedFileModel file)
    {
        var transaction = await Context.Database.BeginTransactionAsync();
        try
        {
            using var off = new ConstraintOff(Context);

            var fileRecordId = await StoreNewFileAsync(file, path);
            var user = await FindUserOwnerAsync(file);
            if (user is null) return 0;
            await StoreFileOwnerAsync(fileRecordId, (uint)user, file);

            await transaction.CommitAsync();
            return fileRecordId;
        }
        catch
        {
            await transaction.RollbackAsync();
            return 0;
        }
    }
    private async Task<uint> StoreNewFileAsync(ManagedFileModel model, string path)
    {
        var databaseFile = new StoredFile()
        {
            TypeCode = (FileType)model.Origin.fileType,
            Description = model.Origin.FileName,
            FilePath = path
        };
        await Context.StoredFiles.AddAsync(databaseFile);
        await Context.SaveChangesAsync();

        return databaseFile.StoredFileId;
    }
    private async Task<uint?> FindUserOwnerAsync(ManagedFileModel model)
    {
        if (model.Origin.UserOwner is not null)
        {
            var userUID = (Guid)model.Origin.UserOwner; // neparsovat, přetypování je správně!!!!!
            var user = await SupportService.GetUserDataAsync(userUID, Context);
            return user?.UserId;
        }
        return null;
    }
    private async Task StoreFileOwnerAsync(uint fileId, uint userId, ManagedFileModel file)
    {

        var fileOwner = new StoredFileOwner()
        {
            FileId = fileId,
            UserOwnerId = userId,
            ClientOwnerId = file.Origin.ClientOwner,
            GroupOwnerId = file.Origin.GroupOwner
        };
        await Context.StoredFileOwners.AddAsync(fileOwner);
        await Context.SaveChangesAsync();
    }
}
