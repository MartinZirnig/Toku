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
    private EncryptedMessage(string content, string key, bool isKeyEncrypted)
    {
        Content = content;
        Key = key;
        IsKeyEncrypted = isKeyEncrypted;
    }
    public EncryptedMessage(string content, string key)
        : this(content, key, true) { }


    public EncryptedMessage EncryptKey(string publicKeyPem)
    {
        var encryptedKey = CryptoService.EncryptWithPublicKey(publicKeyPem, Key);
        return new EncryptedMessage(Content, Convert.ToBase64String(encryptedKey), true);
    }
    public EncryptedMessage DecryptKey(string privateKey)
    {
        byte[] encryptedKeyBytes = Convert.FromBase64String(Key);
        string decryptedSymmetricKey = CryptoService.DecryptWithPrivateKey(privateKey, encryptedKeyBytes);
        return new EncryptedMessage(Content, decryptedSymmetricKey, false);
    }
    public string Decrypt()
    {
        if (IsKeyEncrypted)
            throw new InvalidOperationException("Key is encrypted. Decrypt the key first.");

        var key = SimpleKey.FromString(Key);
        return key.Decrypt(Content);
    }

}