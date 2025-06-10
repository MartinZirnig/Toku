namespace ConfigurationParsing;
public static class SystemPathParser
{
    public static string? ParseExactly(string sysPath)
    {
        BasicConfig.SystemPathsMap.TryGetValue(sysPath, out var path);
        return path;
    }
    public static string ReplaceSystemPaths(string path)
    {
        foreach (var kvp in BasicConfig.SystemPathsMap)
        {
            path = path.Replace(kvp.Key, kvp.Value);
        }
        return path;
    }
}

