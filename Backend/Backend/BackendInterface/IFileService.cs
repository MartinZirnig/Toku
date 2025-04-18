using BackendInterface.DataObjects;
using BackendInterface.Models;

namespace BackendInterface;
public interface IFileService : IDisposable
{
    Task<uint> SaveFileAsync(ManagedFileModel file);
    Task<FileModel?> GetFileAsync(uint fileId);

    Task<uint> SaveAndEncryptFileAsync(ManagedFileModel file, uint groupId);
    Task<FileModel?> GetAndDecryptFileAsync(Guid userIdentification, uint fileId);
}
