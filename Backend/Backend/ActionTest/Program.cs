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


//byte[] imageBytes = new byte[] {
//            137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
//            0, 0, 0, 100, 0, 0, 0, 100, 8, 2, 0, 0, 0, 255, 128, 2,
//            3, 0, 0, 0, 232, 73, 68, 65, 84, 120, 156, 237, 208, 193, 13, 192,
//            32, 16, 192, 176, 131, 253, 119, 110, 87, 32, 47, 132, 100, 79, 16, 101,
//            205, 124, 195, 153, 125, 59, 224, 37, 102, 5, 102, 5, 102, 5, 102, 5,
//            102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5,
//            102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5,
//            102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5,
//            102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5,
//        };
//var password = "111111";

//var file = new EncryptedFile(imageBytes);
//var keys = new PPKeyPair(password);

//var encrypted = file.EncryptKey(keys.PublicKeyPem);

//var decryptedKey = keys.DecryptPrivateKey(password);
//var decrypted = encrypted.DecryptKey(decryptedKey);

//var result = decrypted.Decrypt();
//var same = result.SequenceEqual(imageBytes);

//Console.WriteLine(string.Join(", ", imageBytes));
//Console.WriteLine();
//Console.WriteLine(string.Join(", ", result));
//Console.WriteLine();
//Console.WriteLine(same);