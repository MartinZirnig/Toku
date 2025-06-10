using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Claims;

namespace BackendInterface.Models;
public record GmailAuthorizationModel(
    string Credentials, string Select_by, int TimeZoneOffset)
{
    private readonly Dictionary<string, string> ParsedCredentials
        = ParseCredential(Credentials);
    public string Name => Get("name");
    public string Email => Get("email");
    public string Token => Get("sub");
    public string PictureUrl => Get("picture");




    public string Get(string key) =>
        ParsedCredentials[key];
    public UserRegistrationModel DeriveRegistration()
    {
        return new UserRegistrationModel(
            Name, Email, Token, TimeZoneOffset, 1);
    }

    private static Dictionary<string, string> ParseCredential(string credential)
    {
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(credential);

        return jwt.Claims.ToDictionary(c => c.Type, c => c.Value);
    }
}