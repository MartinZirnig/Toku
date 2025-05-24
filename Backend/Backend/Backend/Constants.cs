using BackendEnums;
using BackendInterface;
using ConfigurationParsing;
using Optimalization;
using System.Collections.ObjectModel;

namespace Backend;

public static class Constants
{
    public static readonly ReadOnlyDictionary<string, FileType> FileMap
     = new(new Dictionary<string, FileType>()
     {
            { "image/jpeg", FileType.Image },
            { "image/jpg", FileType.Image },
            { "image/png", FileType.Image },
            { "image/gif", FileType.Image },
            { "image/bmp", FileType.Image },
            { "image/webp", FileType.Image },
            { "image/svg+xml", FileType.Image },

            { "video/mp4", FileType.Video },
            { "video/x-msvideo", FileType.Video },
            { "video/x-matroska", FileType.Video },
            { "video/webm", FileType.Video },
            { "video/quicktime", FileType.Video },

            { "audio/mpeg", FileType.Audio },
            { "audio/wav", FileType.Audio },
            { "audio/ogg", FileType.Audio },
            { "audio/webm", FileType.Audio },

            { "application/pdf", FileType.Document },
            { "application/msword", FileType.Document },
            { "application/vnd.openxmlformats-officedocument.wordprocessingml.document", FileType.Document },
            { "application/vnd.ms-excel", FileType.Document },
            { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", FileType.Document },
            { "application/vnd.ms-powerpoint", FileType.Document },
            { "application/vnd.openxmlformats-officedocument.presentationml.presentation", FileType.Document },
            { "text/plain", FileType.Document },
            { "application/rtf", FileType.Document },

            { "application/zip", FileType.Archive },
            { "application/x-7z-compressed", FileType.Archive },
            { "application/x-rar-compressed", FileType.Archive },
            { "application/x-tar", FileType.Archive },
            { "application/gzip", FileType.Archive },

            { "application/json", FileType.Document },
            { "application/xml", FileType.Document },
            { "text/xml", FileType.Document },

     });

    public static readonly ConfigurationLoader BaseConfig;
    public static readonly ConfigurationLoader RestrictionConfig;
    public static readonly FileInMemoryManager FileManager;

    static Constants()
    {
        try
        {
            BaseConfig = InitBaseConfig();
            RestrictionConfig = InitRestrictionConfig();
            FileManager = InitManager();
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }
    private static ConfigurationLoader InitBaseConfig()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "etc", "config", "base_config.yaml");
        return new ConfigurationLoader(path);
    }
    private static ConfigurationLoader InitRestrictionConfig()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "etc", "config", "file_restrictions.yaml");
        return new ConfigurationLoader(path);
    }
    public static FileAccessConfiguration GetRestrictionConfig() =>
        new FileAccessConfiguration(
            RestrictionConfig.ConfigMap[nameof(FileAccessConfiguration.PublicUser)],
            RestrictionConfig.ConfigMap[nameof(FileAccessConfiguration.PrivateUser)],
            RestrictionConfig.ConfigMap[nameof(FileAccessConfiguration.PublicGroup)],
            RestrictionConfig.ConfigMap[nameof(FileAccessConfiguration.PrivateGroup)]);




    private static FileInMemoryManager InitManager()
    {
        var asString = BaseConfig.ConfigMap["maxMemory"];
        var asNumber = long.Parse(asString);

        return new FileInMemoryManager(asNumber);
    }
}
