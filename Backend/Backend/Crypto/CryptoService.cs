using System.Security.Cryptography;
using System.Text;

namespace Crypto;
internal static class CryptoService
{
    public const int DefaultIterations = 100_000;

    public static byte[] EncryptWithPublicKey(string publicKeyPem, string data)
    {
        using var rsa = RSA.Create();
        rsa.ImportFromPem(publicKeyPem.ToCharArray());

        byte[] dataToEncrypt = Encoding.UTF8.GetBytes(data);
        return rsa.Encrypt(dataToEncrypt, RSAEncryptionPadding.OaepSHA256);
    }

    public static string DecryptWithPrivateKey(string privateKeyPem, byte[] encryptedData)
    {
        using var rsa = RSA.Create();
        rsa.ImportFromPem(privateKeyPem.ToCharArray());

        byte[] decryptedData = rsa.Decrypt(encryptedData, RSAEncryptionPadding.OaepSHA256);
        return Encoding.UTF8.GetString(decryptedData);
    }
    public static byte[] DeriveKeyFromPassword(string password, byte[] salt, int keySize)
    {
        using var derive = new Rfc2898DeriveBytes(password, salt, DefaultIterations, HashAlgorithmName.SHA256);
        return derive.GetBytes(keySize);
    }


    public static byte[] DecryptPrivateKey(string password, byte[] iv, byte[] salt, byte[] encryptedKey)
    {
        byte[] decryptionKey = DeriveKeyFromPassword(password, salt, 32);

        using var aes = Aes.Create();
        aes.Key = decryptionKey;
        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        using var memoryStream = new System.IO.MemoryStream(encryptedKey);
        using var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read);

        using var resultStream = new MemoryStream();
        cryptoStream.CopyTo(resultStream);
        byte[] decryptedPrivateKey = resultStream.ToArray();


        return decryptedPrivateKey;
    }
    public static byte[] GenerateRandomBytes(int length)
    {
        byte[] bytes = new byte[length];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return bytes;
    }
}

