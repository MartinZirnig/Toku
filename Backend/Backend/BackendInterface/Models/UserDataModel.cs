using System.Security.Cryptography.X509Certificates;

namespace BackendInterface.Models;

public record UserDataModel(
    string Name,
    string Email,
    string PhoneNumber,
    string Active,
    string? Picture
    );
