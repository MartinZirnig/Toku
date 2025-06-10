using Microsoft.AspNetCore.Identity;
using System.Security.Cryptography;
using System.Text;

namespace Crypto;

public class HashedValue
{
    public const string DefaultValue = "Undefined";
    public readonly string Value;

    private HashedValue(string value, bool priv) =>
        Value = value;

    public HashedValue(string? value)
    {
        if (value == null)
            value = DefaultValue;
        Value = value;
    }
    public HashedValue()
    {
        Value = DefaultValue;
    }


    public static HashedValue HashPassword(string value)
    {
        var hasher = new PasswordHasher<string>();
        return new HashedValue(hasher.HashPassword(null!, value));
    }
    public static HashedValue HashUsers(params uint[] userIds)
    {
        var orderedIds = userIds.OrderBy(x => x).ToArray();
        var combination = string.Join("::", orderedIds);

        using (var hasher = SHA256.Create())
        {
            var hashedBytes = hasher.ComputeHash(Encoding.UTF8.GetBytes(combination));
            var hash = Convert.ToBase64String(hashedBytes);
            return new HashedValue(hash, true);
        }
    }
    public bool VerifyPassword(string password)
    {
        var hasher = new PasswordHasher<string>();
        return hasher.VerifyHashedPassword(null!, Value, password) == PasswordVerificationResult.Success;
    }

    public override string ToString() =>
        Value;

    public static implicit operator string(HashedValue hashedValue) =>
        hashedValue.ToString();
}
