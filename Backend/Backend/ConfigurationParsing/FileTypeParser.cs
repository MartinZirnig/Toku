using YamlDotNet.Serialization.NamingConventions;
using YamlDotNet.Serialization;
using BackendEnums;

namespace ConfigurationParsing;
public class FileTypeParser
{
    private readonly Dictionary<string, FileType> _loadedMap;


    public FileTypeParser
        (string filePath = BasicConfig.DefaultFileTypesPath)
    {
        try
        {
            filePath = SystemPathParser.ReplaceSystemPaths(filePath);
            _loadedMap = LoadFileTypeMap(filePath);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
    }
    private static Dictionary<string, FileType> LoadFileTypeMap(string filePath)
    {
        var yamlContent = File.ReadAllText(filePath);

        var deserializer = new DeserializerBuilder()
            .WithNamingConvention(PascalCaseNamingConvention.Instance)
            .Build();

        var result = deserializer.Deserialize<Dictionary<string, List<string>>>(yamlContent);

        Dictionary<string, FileType> fileTypes = new();

        foreach (var kvp in result)
        {
            var fileType = FileType.Other;

            if (Enum.TryParse(typeof(FileType), kvp.Key, out var tempFileType))
                fileType = (FileType)tempFileType;

            foreach (var extension in kvp.Value)
                fileTypes[extension.ToLower()] = fileType;
        }

        return fileTypes;
    }

    public FileType GetFileType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (_loadedMap.TryGetValue(extension, out var fileType))
            return fileType;
        return FileType.Other;
    }
}

