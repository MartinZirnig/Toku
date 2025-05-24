using BackendInterface;
using Microsoft.AspNetCore.StaticFiles;

namespace Backend;

public class FileIdentificator : IFileIdentificator
{
    public string GetIdentification(string path)
    {
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(path, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        return contentType;
    }
}
