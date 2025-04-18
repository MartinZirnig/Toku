using Crypto;

namespace BackendInterface.DataObjects;
public record UserKey(
    uint UserId,
    PPKeyPair PublicKey
    );
