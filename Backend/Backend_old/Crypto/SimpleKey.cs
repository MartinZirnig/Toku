using Microsoft.AspNetCore.DataProtection.KeyManagement;
using System.Security.Cryptography;
using System.Text;

namespace Crypto;
public class SimpleKey
{
    private const int ValueLength = 16;
    private const int IVLength = 16;

    private readonly byte[] _value;
    private readonly byte[] _iv;

    internal byte[] Key => _value;
    internal byte[] IV => _iv;


    public SimpleKey()
    {
        _value = CryptoService.GenerateRandomBytes(ValueLength);
        _iv = CryptoService.GenerateRandomBytes(IVLength);
    }
    public SimpleKey(byte[] value, byte[] iv)
    {
        if (value.Length != ValueLength
            || iv.Length != IVLength)
            throw new ArgumentException("Invalid Key size");

        _value = [.. value];
        _iv = [.. iv];
    }

    public string Encrypt(string message)
    {
        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.Key = _value;
            aesAlg.IV = _iv;

            ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

            using MemoryStream msEncrypt = new MemoryStream();
            using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
            using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
            {
                swEncrypt.Write(message);
            }
            return Convert.ToBase64String(msEncrypt.ToArray());
        }
    }
    public string Decrypt(string data)
    {
        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.Key = _value;
            aesAlg.IV = _iv;

            ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

            using (MemoryStream msDecrypt = new MemoryStream(Convert.FromBase64String(data)))
            using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
            using (StreamReader srDecrypt = new StreamReader(csDecrypt))
            {
                return srDecrypt.ReadToEnd();
            }
        }
    }

    public override string ToString()
    {
        var bytes = GC.AllocateUninitializedArray<byte>(ValueLength + IVLength);
        Array.Copy(_value, bytes, ValueLength);
        Array.Copy(_iv, 0, bytes, ValueLength, IVLength);
        return Convert.ToBase64String(bytes);
    }
    public static SimpleKey FromString(string key)
    {
        var bytes = Convert.FromBase64String(key);
        if (bytes.Length != ValueLength + IVLength)
            throw new ArgumentException("Invalid Key size");

        var value = new byte[ValueLength];
        var iv = new byte[IVLength];

        Array.Copy(bytes, value, ValueLength);
        Array.Copy(bytes, ValueLength, iv, 0, IVLength);

        return new SimpleKey(value, iv);
    }

    public static SimpleKey FromEncrypted(string encryptedKey, string decryptedPrivateKey)
    {
        byte[] encryptedKeyBytes = Convert.FromBase64String(encryptedKey);
        string decryptedSymmetricKey = CryptoService.DecryptWithPrivateKey(decryptedPrivateKey, encryptedKeyBytes);

        return FromString(decryptedSymmetricKey);
    }
}

