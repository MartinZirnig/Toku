namespace Crypto;
public class EncryptedMessage
{
    public readonly string Key;
    public readonly string Content;
    public readonly bool IsKeyEncrypted;

    public EncryptedMessage(string content)
    {
        SimpleKey key = new SimpleKey();
        Content = key.Encrypt(content);
        Key = key.ToString();
        IsKeyEncrypted = false;
    }
    public EncryptedMessage(string content, string key)
    {
        Content = content;
        Key = key;
        IsKeyEncrypted = true;
    }
    private EncryptedMessage(string content, string key, bool isKeyEncrypted)
    {
        Content = content;
        Key = key;
        IsKeyEncrypted = isKeyEncrypted;
    }

    public EncryptedMessage EncryptKey(string publicKeyPem)
    {
        var encryptedKey = CryptoService.EncryptWithPublicKey(publicKeyPem, Key);
        return new EncryptedMessage(Convert.ToBase64String(encryptedKey), Content, true);
    }
    public EncryptedMessage DecryptKey(string privateKey)
    {
        byte[] encryptedKey = Convert.FromBase64String(Content);
        var decryptedKey = CryptoService.DecryptWithPrivateKey(privateKey, encryptedKey);
        return new EncryptedMessage(Content, decryptedKey, false);
    }
    public string Decrypt()
    {
        if (IsKeyEncrypted)
            throw new InvalidOperationException("Key is encrypted. Decrypt the key first.");

        var key = SimpleKey.FromString(Key);
        return key.Decrypt(Content);
    }

}