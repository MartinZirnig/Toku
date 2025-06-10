using System.Collections.ObjectModel;
using YamlDotNet.RepresentationModel;

namespace ConfigurationParsing;

public class ConfigurationLoader
{
    public readonly ReadOnlyDictionary<string, string> ConfigMap;

    public ConfigurationLoader(string filePath)
    {
        ConfigMap = new ReadOnlyDictionary<string, string>(Load(filePath));
    }

    private static Dictionary<string, string> Load(string filePath)
    {
        if (!File.Exists(filePath))
            throw new FileNotFoundException("YAML config file not found.", filePath);

        var yaml = new YamlStream();

        using (var reader = new StreamReader(filePath))
        {
            yaml.Load(reader);
        }

        var root = (YamlMappingNode)yaml.Documents[0].RootNode;

        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var entry in root.Children)
        {
            var key = ((YamlScalarNode)entry.Key).Value;
            var value = ((YamlScalarNode)entry.Value).Value;

            result[key] = value;
        }

        return result;
    }
}
