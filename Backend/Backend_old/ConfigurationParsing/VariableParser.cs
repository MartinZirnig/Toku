using System.Runtime.CompilerServices;

namespace ConfigurationParsing;
public static class VariableParser
{
    public static string ReplaceVariable(this string text, string variable, object value)
    {
        var variableName = $"{{${variable}}}";
        var newText = text.Replace(variableName, value.ToString());
        return newText;
    }
}
