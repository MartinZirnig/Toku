using Backend.Attributes;
using BackendInterface;
using BackendInterface.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

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

    [HttpPut("upload-user/{id}")]
    public async Task<IActionResult> UploadUserFileAsync(
        [FromRoute] int id, [FromQuery] string fileName, [FromForm] FileTransferObject file)
    {
        using var service = _serviceProvider.GetFileService();

        var restrict = new FileRestrictor(Constants.GetRestrictionConfig());
        var path = restrict.GetUserPath(fileName, id);
        var model = new StreamedFileModel(true, file.File.OpenReadStream(), path);

        var result = await service.SaveFileAsync(model)
            .ConfigureAwait(false);

        return Ok(result);
    }
    [HttpPut("upload-group/{id}")]
    public async Task<IActionResult> UploadGroupFileAsync(
        [FromRoute] int id, [FromQuery] string fileName, [FromForm] FileTransferObject file)
    {
        using var service = _serviceProvider.GetFileService();

        var restrict = new FileRestrictor(Constants.GetRestrictionConfig());
        var path = restrict.GetGroupPath(fileName, id);
        var model = new StreamedFileModel(false, file.File.OpenReadStream(), path);

        var result = await service.SaveFileAsync(model)
            .ConfigureAwait(false);

        return Ok(result);
    }

    [HttpPut("upload-user-secret/{id}")]
    public async Task<IActionResult> UploadUserSecretFileAsync(
        [FromRoute] int id, [FromQuery] string fileName, [FromForm] FileTransferObject file)
    {
        using var service = _serviceProvider.GetFileService();

        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
        var restrict = new FileRestrictor(Constants.GetRestrictionConfig());
        var path = restrict.GetUserSecretPath(fileName, id);
        var model = new StreamedFileModel(true, file.File.OpenReadStream(), path);

        var result = await service.SaveAndEncryptFileAsync(model, executor)
            .ConfigureAwait(false);
        return Ok(result);
    }
    [HttpPut("upload-group-secret/{id}")]
    public async Task<IActionResult> UploadGroupSecretFileAsync(
        [FromRoute] int id, [FromQuery] string fileName, [FromForm] FileTransferObject file)
    {
        using var service = _serviceProvider.GetFileService();

        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
        var restrict = new FileRestrictor(Constants.GetRestrictionConfig());
        var path = restrict.GetGroupSecretPath(fileName, id);
        var model = new StreamedFileModel(false, file.File.OpenReadStream(), path);

        var result = await service.SaveAndEncryptFileAsync(model, executor)
            .ConfigureAwait(false);
        return Ok(result);
    }

    [HttpPut("set-file-owner/{fileId}")]
    public async Task<IActionResult> SetFileOwnerAsync([FromRoute] uint fileId, [FromBody]FileOwnerModel model)
    {
        using var service = _serviceProvider.GetFileService();
        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;

        var result = await service
            .AssignFileOwner(model, executor)
            .ConfigureAwait(false);

        return Ok(result);
    }


    [HttpGet("get-file/{fileId}")]
    public async Task<IActionResult> GetFileAsync(uint fileId)
    {
        using var service = _serviceProvider.GetFileService();

        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
        var identificator = new FileIdentificator();

        (var bytes, var type) = await service
            .GetFileAsync(executor, fileId, identificator)
            .ConfigureAwait(false);

        return File(bytes, type);
    }
    [HttpGet("get-secret-file/{fileId}")]
    public async Task<IActionResult> GetSecretFileAsync(uint fileId)
    {
        using var service = _serviceProvider.GetFileService();

        var executor = (Guid)AuthorizationAttribute.GetUID(HttpContext)!;
        var identificator = new FileIdentificator();

        (var bytes, var type) = await service
            .GetEncryptedFileAsync(executor, fileId, identificator)
            .ConfigureAwait(false);

        return File(bytes, type);
    }
}