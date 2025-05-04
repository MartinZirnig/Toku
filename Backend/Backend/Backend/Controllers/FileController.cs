using Backend.Attributes;
using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Authorization]
[Route("[controller]")]
[ApiController]
public sealed class FileController : ControllerBase
{

    private readonly ILogger<FileController> _logger;
    private readonly IDatabaseServiceProvider _serviceProvider;
    public FileController(
        IDatabaseServiceProvider serviceProvider,
        ILogger<FileController> logger)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }



    [HttpPost("group-upload")]
    public async Task<IActionResult> UploadGroupAsync
        ([FromForm] FileTransferModel file)
    {
        using var service = _serviceProvider.GetFileService();
        var data = ReadBytesFromStream(file.File.OpenReadStream());

        var model = new FileModel(
            data, file.File.Name,
            Constants.FileMap[file.File.ContentType],
            file.UserOwner, file.GroupOwner, file.ClientOwner
        );



        return Ok();
    }


    private byte[] ReadBytesFromStream(Stream stream)
    {
        using BinaryReader reader = new BinaryReader(stream);
        var buffer = new byte[stream.Length];
        reader.Read(buffer);
        return buffer;
    }

}