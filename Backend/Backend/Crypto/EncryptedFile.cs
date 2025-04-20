namespace Crypto;
public class EncryptedFile
{
    public readonly string Key;
    public readonly string Content;
    public readonly bool IsKeyEncrypted;


    public EncryptedFile(byte[] content)
    {
        SimpleKey key = new SimpleKey();
        var contentAsString = Convert.ToBase64String(content);
        Content = key.Encrypt(contentAsString);
        Key = key.ToString();
        IsKeyEncrypted = false;
    }
    private EncryptedFile(string content, string key, bool isKeyEncrypted)
    {
        Content = content;
        Key = key;
        IsKeyEncrypted = isKeyEncrypted;
    }
    public EncryptedFile(string content, string key)
        : this(content, key, true) { }


    public EncryptedFile EncryptKey(string publicKeyPem)
    {
        var encryptedKey = CryptoService.EncryptWithPublicKey(publicKeyPem, Key);
        return new EncryptedFile(Content, Convert.ToBase64String(encryptedKey), true);
    }
    public EncryptedFile DecryptKey(string privateKey)
    {
        byte[] encryptedKeyBytes = Convert.FromBase64String(Key);
        string decryptedSymmetricKey = CryptoService.DecryptWithPrivateKey(privateKey, encryptedKeyBytes);
        return new EncryptedFile(Content, decryptedSymmetricKey, false);
    }
    public byte[] Decrypt()
    {
        if (IsKeyEncrypted)
            throw new InvalidOperationException("Key is encrypted. Decrypt the key first.");

        var key = SimpleKey.FromString(Key);
        var content = key.Decrypt(Content);
        return Convert.FromBase64String(content);
    }
}
