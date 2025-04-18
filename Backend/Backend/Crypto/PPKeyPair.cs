
using System.Security.Cryptography;
using System.Text;

namespace Crypto;

public class PPKeyPair
{
    public const string PublicPemBegin = "-----BEGIN PUBLIC KEY-----";
    public const string PublicPemEnd = "-----END PUBLIC KEY-----";
    public const string PrivatePemBegin = "-----BEGIN PRIVATE KEY-----";
    public const string PrivatePemEnd = "-----END PRIVATE KEY-----";

    public readonly string PublicKey;
    public string PublicKeyPem =>
        $"{PublicPemBegin}\n{PublicKey}\n{PublicPemEnd}";

    public readonly byte[] EncryptedPrivateKey;
    public readonly byte[] Salt;
    public readonly byte[] IV;


    public PPKeyPair(string password)
    {
        using RSA rsa = RSA.Create(2048);

        string publicKey = ParseKeyToString(rsa);

        byte[] privateKeyBytes = rsa.ExportPkcs8PrivateKey();
        byte[] salt = CryptoService.GenerateRandomBytes(16);
        byte[] iv = CryptoService.GenerateRandomBytes(16);
        byte[] key = CryptoService.DeriveKeyFromPassword(password, salt, 32);
        byte[] encryptedPrivateKey = EncryptPrivateKey(privateKeyBytes, key, iv);

        PublicKey = publicKey;
        EncryptedPrivateKey = encryptedPrivateKey;
        Salt = salt;
        IV = iv;
    }
    public PPKeyPair(string publicKey, byte[] encryptedPrivateKey, byte[] salt, byte[] iV)
    {
        PublicKey = publicKey;
        EncryptedPrivateKey = [.. encryptedPrivateKey];
        Salt = [..salt];
        IV = [.. iV];
    }

    private static byte[] EncryptPrivateKey(byte[] data, byte[] key, byte[] iv)
    {
        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = iv;
        aes.Padding = PaddingMode.PKCS7;
        aes.Mode = CipherMode.CBC;

        using var ms = new MemoryStream();
        using var cs = new CryptoStream(ms, aes.CreateEncryptor(), CryptoStreamMode.Write);
        cs.Write(data, 0, data.Length);
        cs.FlushFinalBlock();
        return ms.ToArray();
    }
    private static string ParseKeyToString(RSA rsa)
    {
        byte[] publicKeyBytes = rsa.ExportSubjectPublicKeyInfo();
        string base64 = Convert.ToBase64String(publicKeyBytes);
        StringBuilder sb = new();
        for (int i = 0; i < base64.Length; i += 64)
            sb.AppendLine(base64.Substring(i, Math.Min(64, base64.Length - i)));
        return sb.ToString();
    }

    public string DecryptPrivateKey(string password, bool usePem = true)
    {
        var key = CryptoService.DecryptPrivateKey(password, IV, Salt, EncryptedPrivateKey);

        if (usePem)
        {
            var builder = new StringBuilder();
            builder.AppendLine(PrivatePemBegin);
            builder.AppendLine(Convert.ToBase64String(key, Base64FormattingOptions.InsertLineBreaks));
            builder.Append(PrivatePemEnd);
            return builder.ToString();
        }
        return Convert.ToBase64String(key);
    }
}
