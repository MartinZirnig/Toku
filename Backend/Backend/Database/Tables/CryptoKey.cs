using Crypto;
using System.ComponentModel.DataAnnotations;

namespace MysqlDatabase.Tables;
internal class CryptoKey
{
    [Key]
    public uint KeyId { get; set; }
    [Required]
    public bool IsSimple { get; set; }
    [Required]
    public byte[] IV { get; set; } = [];


    // SimpleKey columns:
    public byte[] Value { get; set; } = [];

    // PPKeyPair columns:
    public string PublicKey { get; set; }
        = string.Empty;
    public byte[] EncryptedPrivateKey { get; set; } = [];
    public byte[] Salt { get; set; } = [];





    public static explicit operator SimpleKey(CryptoKey key)
    {
        if (!key.IsSimple)
            throw new InvalidCastException("Is not simpleKey");

            return new SimpleKey(key.Value, key.IV);
    }
    public static explicit operator PPKeyPair(CryptoKey key)
    {
        if (key.IsSimple)
            throw new InvalidCastException("Is not PPKeyPair");

        return new PPKeyPair(key.PublicKey, key.EncryptedPrivateKey, key.Salt, key.IV);
    }
}

