
using BackendInterface.Models;
using System.Security.Cryptography.X509Certificates;

namespace BackendInterface.DataObjects;
public record ManagedFileModel(
    FileModel Origin,
    string AssignedFiePath
    );
