namespace Crypto;
public class EncryptedFile
{
    public readonly string Key;
    public readonly string Content;
    public readonly bool IsKeyEncrypted;


    public EncryptedFile(string content)
    {
        string contentAsString = content;

        SimpleKey key = new SimpleKey();
        Content = key.Encrypt(contentAsString);
        Key = key.ToString();
        IsKeyEncrypted = false;
    }
    public EncryptedFile(string content, string key)
    {
        Content = content;
        Key = key;
        IsKeyEncrypted = true;
    }
    private EncryptedFile(string content, string key, bool isKeyEncrypted)
    {
        Content = content;
        Key = key;
        IsKeyEncrypted = isKeyEncrypted;
    }

    public EncryptedFile EncryptKey(string publicKeyPem)
    {
        var encryptedKey = CryptoService.EncryptWithPublicKey(publicKeyPem, Key);
        return new EncryptedFile(Convert.ToBase64String(encryptedKey), Content, true);
    }
    public EncryptedFile DecryptKey(string privateKey)
    {
        byte[] encryptedKey = Convert.FromBase64String(Content);
        var decryptedKey = CryptoService.DecryptWithPrivateKey(privateKey, encryptedKey);
        return new EncryptedFile(Content, decryptedKey, false);
    }
    public string Decrypt()
    {
        if (IsKeyEncrypted)
            throw new InvalidOperationException("Key is encrypted. Decrypt the key first.");

        var key = SimpleKey.FromString(Key);
        return key.Decrypt(Content);
    }
}
