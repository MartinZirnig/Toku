using System.Text;

namespace BackendInterface.Models;
public record UserLoginModel(
    string UserName,
    string Password,
    int TimeZone
    );

