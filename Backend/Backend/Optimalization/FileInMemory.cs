using Crypto;
namespace Optimalization;

public sealed class FileInMemory
{
    private readonly byte[] _data;

    public int Size => _data.Length;
    public int ContentSize { get; private set; }
    internal bool Used { get; set; }

    public FileInMemory(int size)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(size, 1);

        _data = GC.AllocateUninitializedArray<byte>(size);
        Used = false;
    }

    public void LoadFromStream(Stream stream)
    {
       var buffer = new Span<byte>(_data);


        int read = 0;
        int now;
        while ((now = stream.Read(buffer[read..])) > 0)
            read += now;
        ContentSize = read;
    }
    public async Task LoadFromStreamAsync(Stream stream)
    {
        var memory = new Memory<byte>(_data);

        int read = 0;
        int now;
        while ((now = await stream.ReadAsync(memory[read..])) > 0)
            read += now;

        ContentSize = read;
    }
    public void Clear()
    {
        ContentSize = 0;
    }

    public EncryptedFile Encrypt()
    {
        ThrowWhenNotLoaded();
        var span = new Span<byte>(_data, 0, ContentSize);

        return new EncryptedFile(span);
    }

    private void ThrowWhenNotLoaded()
    {
        if (ContentSize == 0)
        {
            throw new InvalidOperationException(
                "Instance must be filled with data before use");
        }
    }
}
