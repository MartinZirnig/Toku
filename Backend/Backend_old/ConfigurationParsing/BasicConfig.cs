
namespace ConfigurationParsing;
internal static class BasicConfig
{
    public const string DefaultFileRestrictionPath = @"$ExeDir$\etc\config\file_restriction.yaml";
    public const string DefaultFileTypesPath = @"$ExeDir$\etc\config\file_types.yaml";

    public static readonly Dictionary<string, string> SystemPathsMap = new()
    {
        { "$ExeDir$", AppDomain.CurrentDomain.BaseDirectory },
        { "$UserDir$", Environment.GetFolderPath(Environment.SpecialFolder.UserProfile) },
        { "$DocDir$", Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments) },
        { "$DesktopDir$", Environment.GetFolderPath(Environment.SpecialFolder.Desktop) },
        { "$AppDataDir$", Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) },
        { "$LocalAppDataDir$", Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) },
        { "$ProgramFilesDir$", Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles) },
        { "$ProgramFilesX86Dir$", Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86) },
        { "$ProgramDataDir$", Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData) },
        { "$TempDir$", Path.GetTempPath() }
    };
}

