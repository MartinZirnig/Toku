using Mysqlx.Expr;
using Org.BouncyCastle.Asn1.BC;
using Org.BouncyCastle.Bcpg.OpenPgp;
using System.Diagnostics;
using System.Net.Http.Headers;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace MysqlDatabaseControl;
internal static class TableBackupManager
{
    public const string BackupFileExtension = ".NSV"; // Null Separated Values

    public const char ColumnSeparator = '\0';
    public static readonly byte[] ColumnSeparatorBytes =
        Encoding.Unicode.GetBytes(ColumnSeparator.ToString());

    public const char RowSeparator = '\n';
    public static readonly byte[] RowSeparatorBytes =
        Encoding.Unicode.GetBytes(RowSeparator.ToString());

    public static IEnumerable<IEnumerable<string>> FromFile(string path)
    {
        path = Path.ChangeExtension(path, BackupFileExtension);

        using var stream = new FileStream(path, FileMode.Open);
        var result = new List<IEnumerable<string>>();

        while (stream.Position != stream.Length)
        {
            var line = GetLine(stream);
            result.Add(line);
        }

        return result;
    }
    private static IEnumerable<string> GetLine(FileStream stream)
    {
        var columns = new List<string>();
        var builder = new StringBuilder();

        byte[] current = new byte[2];

        while (stream.Position != stream.Length)
        {
            stream.Read(current, 0, UnicodeEncoding.CharSize);

            if (current.SequenceEqual(ColumnSeparatorBytes))
            {
                columns.Add(builder.ToString());
                builder.Clear();
            }
            else if (current.SequenceEqual(RowSeparatorBytes))
            {
                columns.Add(builder.ToString());
                return columns;
            }
            else
            {
                builder.Append(Encoding.Unicode
                    .GetString(current, 0, UnicodeEncoding.CharSize));
            }
        }

        return columns;
    }


    public static Task<IEnumerable<IEnumerable<string>>> FromFileAsync(string path) =>
        Task.Run(() => FromFile(path));

    public static void IntoFile(IEnumerable<IEnumerable<string>> values, string path)
    {
        CheckDirectoryAndTryCreate(path);

        path = Path.ChangeExtension(path, BackupFileExtension);
        var file = new FileInfo(path);
        if (file.Exists)
            file.Delete();

        var stream = file.Create();

        foreach (var row in values)
        {
            foreach (var column in row)
            {
                Debug.Write(column);
                Debug.Write(", ");
                var bytes = Encoding.Unicode.GetBytes(column);
                stream.Write(bytes);
                stream.Write(ColumnSeparatorBytes);
            }
            Debug.WriteLine("");
            stream.Position -= ColumnSeparatorBytes.Length;
            stream.Write(RowSeparatorBytes);
        }

        stream.Close();
    }
    public static Task IntoFileAsync(IEnumerable<IEnumerable<string>> values, string path) =>
        Task.Run(() => IntoFile(values, path));

    private static void CheckDirectoryAndTryCreate(string path)
    {
        var directory = Path.GetDirectoryName(path);
        if (!Directory.Exists(directory)
            && directory is not null)
            Directory.CreateDirectory(directory);
    }
}

