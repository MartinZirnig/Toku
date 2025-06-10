namespace BackendInterface.Models;

public record DomainLoginCreation(
    string DomainName,
    string UserName,
    string UserPassword
    );