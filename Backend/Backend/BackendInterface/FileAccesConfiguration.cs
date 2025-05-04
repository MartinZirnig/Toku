namespace BackendInterface;

public record FileAccessConfiguration(
    IReadOnlyCollection<string> UserPaths,
    IReadOnlyCollection<string> GroupPaths
    );