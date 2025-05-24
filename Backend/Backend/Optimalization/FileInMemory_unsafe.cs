using System.Buffers;
using System.Runtime.InteropServices;

namespace Optimalization;

public sealed class FileInMemory_unsafe : MemoryManager<byte>, IDisposable
{
    private unsafe byte* _data;
    private int _size;
    private int _used;
    private bool _disposed;

    internal bool Used;

    public int Length => _used;
    public int BackgroundSize => _size;

    public unsafe FileInMemory_unsafe(int size)
    {
        _size = size;
        _used = 0;
        _data = (byte*)NativeMemory.Alloc((nuint)size);
        _disposed = false;
    }
    private unsafe FileInMemory_unsafe(byte* data, int size)
    {
        _size = size;
        _used = 0;
        _data = data;
        _disposed = false;
    }
    protected override bool TryGetArray(out ArraySegment<byte> segment)
    {
        segment = default;
        return false;
    }
    public override Memory<byte> Memory => CreateMemory(_used);


    public unsafe override Span<byte> GetSpan()
    {
        return new Span<byte>(_data, _used);
    }
    public unsafe override MemoryHandle Pin(int elementIndex = 0)
    {
        return new MemoryHandle(_data + elementIndex);
    }
    public override void Unpin() { }

    public unsafe void LoadFromStream(Stream stream)
    {
        var buffer = new Span<byte>(_data, _size);

        int read = 0;
        int now;
        while ((now = stream.Read(buffer.Slice(read))) > 0)
            read += now;

        _used = read;
    }
    public async Task LoadFromStreamAsync(Stream stream)
    {
        var memory = CreateMemory(_size);

        int read = 0;
        int now;
        while ((now = await stream.ReadAsync(memory.Slice(read))) > 0)
            read += now;

        _used = read;
    }

    public unsafe (FileInMemory_unsafe, FileInMemory_unsafe) Split()
    {
        int newSize = _size >> 1;
        var newPtr = _data + newSize;

        var item1 = new FileInMemory_unsafe(_data, newSize);
        var item2 = new FileInMemory_unsafe(newPtr, newSize);

        _data = null;
        _size = 0;
        _used = 0;
        _disposed = true;

        return (item1, item2);
    }

    public void Dispose()
    {
        if (!_disposed)
            Dispose(true);
    }
    protected override unsafe void Dispose(bool disposing)
    {
        NativeMemory.Free(_data);
        _data = null;
        _size = 0;
        _used = 0;
        _disposed = true;
    }

    public static unsafe explicit operator ReadOnlySpan<byte>(FileInMemory_unsafe file)
    {
        return new ReadOnlySpan<byte>(file._data, file._used);
    }
}