using BackendInterface.FileRestriction;
using YamlDotNet.Serialization.NamingConventions;
using YamlDotNet.Serialization;

namespace ConfigurationParsing;
public class FileRestrictionParser
{
    private readonly Dictionary<string, FilePurpose> _loadedMap;

    public FileRestrictionParser
        (string filePath = BasicConfig.DefaultFileRestrictionPath)
    {
        _loadedMap = LoadFileRestrictionMap(filePath);
    }
    private static Dictionary<string, FilePurpose> LoadFileRestrictionMap(string filePath)
    {
        var yamlContent = File.ReadAllText(filePath);

        var deserializer = new DeserializerBuilder()
            .WithNamingConvention(PascalCaseNamingConvention.Instance)
            .Build();

        var restrictions = deserializer.Deserialize<Dictionary<string, string>>(yamlContent);
        var result = new Dictionary<string, FilePurpose>();
        foreach (var kvp in restrictions)
        {
            if (Enum.TryParse(typeof(FilePurpose), kvp.Value, out var purpose))
            {
                result[kvp.Key.ToLower()] = (FilePurpose)purpose;
            }
        }
        return result;
    }
    public FilePurpose? GetFilePurpose(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (_loadedMap.TryGetValue(extension, out var purpose))
            return purpose;
        return null;
    }
}

