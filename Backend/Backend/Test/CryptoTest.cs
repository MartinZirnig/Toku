using Crypto;

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


}
