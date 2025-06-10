using BackendInterface;
using ConfigurationParsing;

namespace Backend;

public class FileRestrictor(FileAccessConfiguration config)
{
    private const string _userId = "UserId";
    private const string _groupId = "GroupId";

    private readonly FileAccessConfiguration _config = config;


    public string GetUserPath(string name, int id) =>
        GetPath(_config.PublicUser, _userId, name, id);
    public string GetUserSecretPath(string name, int id) =>
        GetPath(_config.PrivateUser, _userId, name, id);


    public string GetGroupPath(string name, int id) =>
        GetPath(_config.PublicGroup, _groupId, name, id);

    public string GetGroupSecretPath(string name, int id) =>
        GetPath(_config.PrivateGroup, _groupId, name, id);

    private static string GetPath(string root, string variable, string name, int id)
    {
        root = SystemPathParser.ReplaceSystemPaths(root);
        root = root.ReplaceVariable(variable, id);
        return Path.Combine(root, name);
    }

}
