using Crypto;

void PrintMsg(EncryptedMessage msg)
{
    Console.WriteLine("< --- >");

    Console.WriteLine($"encrypted: {msg.IsKeyEncrypted}");
    Console.WriteLine($"content: {msg.Content}");
    Console.WriteLine($"key: {msg.Key}");

    Console.WriteLine("< --- >");
    Console.WriteLine();
}


var msg = "secret message";
var password = "111111";
var key = new PPKeyPair(password);

var emsg = new EncryptedMessage(msg);
PrintMsg(emsg);

var encrypted = emsg.EncryptKey(key.PublicKeyPem);
PrintMsg(encrypted);

var decryptedPrivateKey = key.DecryptPrivateKey(password);
var decrypted = encrypted.DecryptKey(decryptedPrivateKey);
PrintMsg(decrypted);

var content = decrypted.Decrypt();
Console.WriteLine($"decrypted: {content}");
