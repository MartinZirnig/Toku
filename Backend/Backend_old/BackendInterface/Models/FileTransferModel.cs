using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BackendInterface.Models;

public record class FileTransferModel(
    IFormFile File,
    Guid? UserOwner,
    uint? ClientOwner,
    uint? GroupOwner
    );
