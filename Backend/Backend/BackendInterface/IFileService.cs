using BackendInterface.DataObjects;
using BackendInterface.Models;

namespace BackendInterface;
public interface IFileService : IDisposable
{
    void ConfigureAccess(FileAccessConfiguration config);


    Task<uint> SaveProfileImage(ManagedFileModel file);
    Task<byte[]> GetProfileImage(uint fileId);

    Task<uint> SaveEncryptMessageFileAsync(ManagedFileModel file, uint groupId);
    Task<byte[]> GetDecryptMessageFileAsync(Guid userIdentification, uint fileId);
}
