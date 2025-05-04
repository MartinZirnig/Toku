using BackendEnums;
using ConfigurationParsing;
using Optimalization;
using System.Buffers;
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

    public static readonly ConfigurationLoader Configuration;
    public static readonly FileInMemoryManager FileManager;

    static Constants()
    {
        Configuration = InitConfig();
        FileManager = InitManager();
    }
    private static ConfigurationLoader InitConfig()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "etc", "config.yaml");
        return new ConfigurationLoader(path);
    }

    private static FileInMemoryManager InitManager()
    {
        var asString = Configuration.ConfigMap["maxMemory"];
        var asNumber = long.Parse(asString);

        return new FileInMemoryManager(asNumber);
    }
}
