using BackendInterface.Models;

namespace BackendInterface;
public interface IFileService : IDisposable
{
    void ConfigureAccess(FileAccessConfiguration config);
    Task<RequestResultModel> SaveFileAsync(StreamedFileModel model);
    Task<RequestResultModel> SaveAndEncryptFileAsync(StreamedFileModel model, Guid executor);

    Task<RequestResultModel> AssignFileOwner(FileOwnerModel model, Guid executor);

    Task<FileResult> GetFileAsync(Guid executor, uint fileId, IFileIdentificator identificator);
    Task<FileResult> GetEncryptedFileAsync(Guid executor, uint fileId, IFileIdentificator identificator);


    /*

    Task<uint> SaveProfileImage(ManagedFileModel file);
    Task<byte[]> GetProfileImage(uint fileId);

    Task<uint> SaveEncryptMessageFileAsync(ManagedFileModel file, uint groupId);
    Task<byte[]> GetDecryptMessageFileAsync(Guid userIdentification, uint fileId);
    */
}
