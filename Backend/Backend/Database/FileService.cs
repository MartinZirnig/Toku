using BackendEnums;
using BackendInterface;
using BackendInterface.DataObjects;
using BackendInterface.Models;
using ConfigurationParsing;
using Crypto;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;
using MysqlDatabase.Tables;
using Org.BouncyCastle.Asn1;
using System.Reflection;
using System.Security;
using System.Threading.Tasks;
using System.Transactions;

namespace MysqlDatabase;
internal class FileService : DatabaseServisLifecycle, IFileService
{
    private static readonly FileTypeParser _fileParser = new FileTypeParser();
    private FileAccessConfiguration _config;
    public FileService(MysqlDatabaseManager creator)
        : base(creator)
    { }

    public void ConfigureAccess(FileAccessConfiguration config)
    {
        _config = config;
    }

    public async Task<RequestResultModel> SaveFileAsync(StreamedFileModel model)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var path = MakeUniqueDestination(model.DestinationPath);
            var type = _fileParser.GetFileType(path);

            var root = Path.GetDirectoryName(path)!;
            Directory.CreateDirectory(root);

            await using var stream = File.OpenWrite(path);
            var task = model.SourceStream.CopyToAsync(stream);

            var fileId = await StoreToDatabase(GetSubpathFromDirectory(path, "Storage"), type, null)
                .ConfigureAwait(false);

            await task.ConfigureAwait(false);
            await Context.SaveChangesAsync();
            await transaction.CommitAsync();
            return new RequestResultModel(
                true, fileId.ToString());
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new RequestResultModel(
                false, ex.Message);
        }
    }
    public async Task<RequestResultModel> SaveAndEncryptFileAsync(StreamedFileModel model, Guid executor)
    {
        await using var transaction = await Context.Database
            .BeginTransactionAsync()
            .ConfigureAwait(false);
        try
        {
            var path = MakeUniqueDestination(model.DestinationPath);
            var type = _fileParser.GetFileType(path);

            var root = Path.GetDirectoryName(path)!;
            Directory.CreateDirectory(root);

            var key = new SimpleKey();
            await using var stream = File.OpenWrite(path);

            var cryptoStream = new EncryptedStream(model.SourceStream, key);
            var task = cryptoStream.CopyToAsync(stream);


            var fileId = await StoreToDatabase(GetSubpathFromDirectory(path, "Storage"), type, null)
                .ConfigureAwait(false);
            await CreateUserEncryption(executor, key, fileId)
                .ConfigureAwait(false);

            await task.ConfigureAwait(false);

            await Context.SaveChangesAsync();
            await transaction.CommitAsync();
            return new RequestResultModel(
                true, fileId.ToString());
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new RequestResultModel(
                false, ex.Message);
        }
    }
    private static string MakeUniqueDestination(string destination)
    {
        if (!File.Exists(destination))
            return destination;

        string directory = Path.GetDirectoryName(destination) ?? "";
        string filename = Path.GetFileNameWithoutExtension(destination);
        string extension = Path.GetExtension(destination);

        string path;
        int counter = 0;
        do path = directory + filename + "_" + counter++.ToString() + extension;
        while (File.Exists(path));

        return path;
    }
    public static string GetSubpathFromDirectory(string fullPath, string startDirectoryName)
    {
        fullPath = Path.GetFullPath(fullPath).Replace('\\', '/');
        startDirectoryName = startDirectoryName.Trim('/');

        int index = fullPath.IndexOf("/" + startDirectoryName + "/", StringComparison.OrdinalIgnoreCase);

        if (index == -1)
        {
            throw new ArgumentException($"Adresář '{startDirectoryName}' nebyl nalezen v cestě '{fullPath}'.");
        }

        return fullPath.Substring(index + 1);
    }
    private async Task<uint> StoreToDatabase(string filePath, FileType type, string? encryptionKey)
    {
        var record = new StoredFile()
        {
            TypeCode = type,
            FilePath = filePath,
            IsEncrypted = encryptionKey is not null,
            EncryptionKey = encryptionKey,
            Description = filePath
        };

        await Context.StoredFiles.AddAsync(record);
        await Context.SaveChangesAsync();
        return record.StoredFileId;
    }
    private async Task CreateUserEncryption(Guid executor, SimpleKey key, uint storeFileId)
    {
        var login = await SupportService.GetUserDataAsync(executor, Context)
            .ConfigureAwait(false)
            ?? throw new UnauthorizedAccessException();

        var user = await Context.Users
            .Include(u => u.Key)
            .FirstOrDefaultAsync(u => u.UserId == login.UserId)
            .ConfigureAwait(false)
            ?? throw new UnauthorizedAccessException();

        var userKey = (PPKeyPair)user.Key;
        var EncryptedKey = userKey.EncryptByPublicKey(key);

        var record = new UserFileEncryption()
        {
            UserId = user.UserId,
            StoredFileId = storeFileId,
            EncryptedFileKey = EncryptedKey,
        };

        await Context.userFileEncryptions.AddAsync(record);
        await Context.SaveChangesAsync();
    }

    public async Task<RequestResultModel> AssignFileOwner(FileOwnerModel model, Guid executor)
    {
        await using var transaction = await Context.Database.BeginTransactionAsync()
            .ConfigureAwait(false);

        try
        {
            var record = new StoredFileOwner()
            {
                FileId = model.FileId,
                UserOwnerId = model.UserOwner,
                ClientOwnerId = model.ClientOwner,
                GroupOwnerId = model.GroupOwner
            };

            await Context.StoredFileOwners.AddAsync(record)
                .ConfigureAwait(false);
            await Context.SaveChangesAsync()
                .ConfigureAwait(false);
            await transaction.CommitAsync()
                .ConfigureAwait(false);

            return new RequestResultModel(
                true, string.Empty);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new RequestResultModel(
                false, ex.Message);
        }
    }

    public async Task<FileResult> GetFileAsync(Guid executor, uint fileId, IFileIdentificator identificator)
    {
        try
        {
            var file = await Context.StoredFiles
                .AsNoTracking()
                .FirstOrDefaultAsync(sf => sf.StoredFileId == fileId)
                .ConfigureAwait(false)
                ?? throw new FileNotFoundException();

            var path = Path.Combine(Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location)!, file.FilePath);

            var array = await File.ReadAllBytesAsync(path)
                .ConfigureAwait(false);
            var type = identificator.GetIdentification(file.FilePath);
            return new FileResult(array, type);

        }
        catch (Exception ex)
        {
            return new FileResult([], ex.Message);
        }
    }


    public async Task<FileResult> GetEncryptedFileAsync(Guid executor, uint fileId, IFileIdentificator identificator)
    {
        try
        {
            var login = await SupportService.GetUserDataAsync(executor, Context)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var encryption = await Context.userFileEncryptions
                .AsNoTracking()
                .FirstOrDefaultAsync(ufe =>
                    ufe.UserId == login.UserId
                    && ufe.StoredFileId == fileId)
                .ConfigureAwait(false)
                ?? throw new UnauthorizedAccessException();

            var privateKey = login.DecryptedPrivateKey;
            var encryptedKey = encryption.EncryptedFileKey;

            var key = SimpleKey.FromEncrypted(encryptedKey, privateKey);

            var file = await Context.StoredFiles
                .AsNoTracking()
                .FirstOrDefaultAsync(sf => sf.StoredFileId == fileId)
                .ConfigureAwait(false)
                ?? throw new FileNotFoundException();

            var basePath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)!;
            var path = Path.Combine(basePath, file.FilePath);

            await using var stream = File.OpenRead(path);
            var decriptionStream = new DecryptedStream(stream, key);
            var memoryStream = new MemoryStream();
            await decriptionStream.CopyToAsync(memoryStream)
                .ConfigureAwait(false);

            var array = memoryStream.ToArray();
            var type = identificator.GetIdentification(file.FilePath);
            return new FileResult(array, type);
        }
        catch (Exception ex)
        {

            return new FileResult([], ex.Message);


        }
    }
}
