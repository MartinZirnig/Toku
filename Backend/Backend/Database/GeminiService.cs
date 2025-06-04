using MysqlDatabase.Tables;
using System.Text;
using System.Text.Json;

namespace MysqlDatabase;

internal class GeminiService
{
    private const string ApiKey = "AIzaSyAhrgEsKLqSVT6wCMGa-eU8kBWzz1J2tlo";
    private static readonly string Endpoint =
           $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={ApiKey}";

    private StringContent? _query;

    private readonly HttpClient _client = new HttpClient();

    public async Task<string> AskAiAsync(string query)
    {
        var content = _query ?? BuildQuery(query);

        var httpResponse = await _client.PostAsync(Endpoint, content);
        if (!httpResponse.IsSuccessStatusCode)
        {
            return $"Error: {httpResponse.StatusCode}";
        }

        var responseString = await httpResponse.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(responseString);

        return ParseResponse(json);
    }
    private static StringContent BuildQuery(string query)
    {
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = query }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        return new StringContent(json, Encoding.UTF8, "application/json");
    }
    private static string ParseResponse(JsonDocument json)
    {
        var textResponse = json.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return textResponse ?? "Null response";
    }

    public void LoadContext(GeminiContext[] context)
    {
        var ordered = context.OrderBy(c => c.Time);

        var messages = ordered.Select(c => new
        {
            role = c.IsSender ? "user" : "model",
            parts = new[]
            {
            new { text = c.Content }
        }
        }).ToArray();

        var payload = new
        {
            contents = messages
        };

        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        });

        _query = new StringContent(json, Encoding.UTF8, "application/json");
    }
}