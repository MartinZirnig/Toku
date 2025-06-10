using Crypto;
using System.Diagnostics;

namespace Test;

[TestClass]
public sealed class CryptoTest
{
    [TestMethod]
    public void TestPasswordHashing()
    {
        string original = "password123";
        var hashedValue = HashedValue.HashPassword(original);

        Assert.IsNotNull(hashedValue);
        Assert.AreNotEqual(original, hashedValue.Value);
        Assert.IsTrue(hashedValue.VerifyPassword(original));
    }
    [TestMethod]
    public void TestUsers()
    {
        uint idUser1 = 11;
        uint idUser2 = 257;

        var hashedValue = HashedValue.HashUsers(idUser1, idUser2);
        var hashedAgain = HashedValue.HashUsers(idUser2, idUser1);

        Assert.IsNotNull(hashedValue);
        Assert.AreEqual(hashedValue.Value, hashedAgain.Value);
        Assert.AreNotEqual(idUser1.ToString() + idUser2.ToString(), hashedValue.Value);
    }
    [TestMethod]
    public void TestFileCrypto()
    {
        byte[] imageBytes = new byte[] {
            137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
            0, 0, 0, 100, 0, 0, 0, 100, 8, 2, 0, 0, 0, 255, 128, 2,
            3, 0, 0, 0, 232, 73, 68, 65, 84, 120, 156, 237, 208, 193, 13, 192,
            32, 16, 192, 176, 131, 253, 119, 110, 87, 32, 47, 132, 100, 79, 16, 101,
            205, 124, 195, 153, 125, 59, 224, 37, 102, 5, 102, 5, 102, 5, 102, 5,
            102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5,
            102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5,
            102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5,
            102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5, 102, 5,
        };
        var password = "111111";

        var file = new EncryptedFile(imageBytes);
        var keys = new PPKeyPair(password);

        var encrypted = file.EncryptKey(keys.PublicKeyPem);

        var decryptedKey = keys.DecryptPrivateKey(password);
        var decrypted = encrypted.DecryptKey(decryptedKey);

        var result = decrypted.Decrypt();
        var same = result.SequenceEqual(imageBytes);


        Assert.IsTrue(same);
    }

}
