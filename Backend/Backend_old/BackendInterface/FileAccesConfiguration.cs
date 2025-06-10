namespace BackendInterface;

public record FileAccessConfiguration(
    string PublicUser,
    string PrivateUser,
    string PublicGroup,
    string PrivateGroup
    );