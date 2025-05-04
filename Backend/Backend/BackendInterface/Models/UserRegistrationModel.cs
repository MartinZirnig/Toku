namespace BackendInterface.Models;

public record UserRegistrationModel(
    string Name,
    string Email,
    string Password,
    int TimeZoneOffset
    )
{
    public UserLoginModel DeriveUserLogin()
        => new UserLoginModel(Name, Password, TimeZoneOffset);
}

