namespace BackendInterface.Models;

public record UserRegistrationModel(
    string Name,
    string Email,
    string Password
    )
{
    public UserLoginModel DeriveUserLogin()
        => new UserLoginModel(Name, Password);
}

