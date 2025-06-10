using System.Collections.Concurrent;
using System.Diagnostics.Tracing;
using System.Net.Http.Headers;
using System.Security.Cryptography.X509Certificates;

namespace Optimalization;

public sealed class FileInMemoryManager_unsafe
    : IDisposable
{
    private readonly List<FileInMemory_unsafe> _files;
    private readonly long _maxSize;
    private long _usedSize;
    private readonly object _lock;
    private long _availableSize => _maxSize - _usedSize;
    private readonly CancellationTokenSource _cancel;

    private readonly ConcurrentQueue<RequestOperation> _requests;

    public FileInMemoryManager_unsafe(long maxSize)
    {
        _maxSize = NextPowerOfTwo(maxSize);
        _usedSize = 0;
        _files = new List<FileInMemory_unsafe>();
        _cancel = new CancellationTokenSource();
        _requests = new ConcurrentQueue<RequestOperation>();
        _lock = new object();

        Task.Run(Run);
    }
    private async void Run()
    {
        while (!_cancel.IsCancellationRequested)
        {
            if (!_requests.TryPeek(out var request))
            {
                await Task.Delay(100);
                continue;
            }

            var file = TryAssignFile(request.Size);

            if (file is not null)
            {
                _requests.TryDequeue(out _);
                request.Tcs.SetResult(file);
            }
            else
            {
                Consume();
                await Task.Delay(10);
            }
        }

        while (_requests.TryDequeue(out var req))
            req.Tcs.SetCanceled();
    }
    private FileInMemory_unsafe? TryAssignFile(int size)
    {
        FileInMemory_unsafe? file;

        lock (_lock)
        {
            file = FindUnused(size);
            if (file is null && _availableSize >= size)
                file = Assign(size);
        }

        return file;
    }


    public Task<FileInMemory_unsafe> RentAsync(int size)
    {
        size = (int)NextPowerOfTwo(size);
        ThrowWhenInvalidSize(size);
        ThrowWhenDisposed();

        var tcs = new TaskCompletionSource<FileInMemory_unsafe>();
        var request = new RequestOperation(size, tcs);
        _requests.Enqueue(request);

        return request.Tcs.Task;
    }
    public void Return(FileInMemory_unsafe file)
    {
        if (_cancel.IsCancellationRequested)
        {
            file.Dispose();
            return;
        }

        file.Used = false;

        lock (_lock)
        {
            if (!_files.Contains(file))
            {
                _files.Add(file);
                _usedSize += file.BackgroundSize;
            }
        }
    }

    public void Consume()
    {
        lock (_lock)
        {
            var filesToDispose = _files
                .Where(f => !f.Used);

            foreach (var file in filesToDispose)
                Consume(file);
        }
    }
    private void Consume(FileInMemory_unsafe target)
    {
        _usedSize -= target.BackgroundSize;
        target.Dispose();

        _files.Remove(target);
    }

    private FileInMemory_unsafe Assign(int size)
    {

        this._usedSize += size;
        return new FileInMemory_unsafe(size);
    }
    private FileInMemory_unsafe? FindUnused(long size)
    {
        var greater = _files
            .Where(f => !f.Used && f.BackgroundSize >= size)
            .OrderBy(f => f.BackgroundSize)
            .FirstOrDefault();

        return greater;
    }

    private static long NextPowerOfTwo(long n)
    {
        if (n < 1)
            return 1;

        n--;
        n |= n >> 1;
        n |= n >> 2;
        n |= n >> 4;
        n |= n >> 8;
        n |= n >> 16;
        n++;

        return n;
    }
    private void ThrowWhenInvalidSize(long size)
    {
        if (size > _maxSize)
            throw new ArgumentOutOfRangeException(nameof(size), "Requested size is larger than the maximum size.");
        if (size < 0)
            throw new ArgumentOutOfRangeException(nameof(size), "Requested size is less than 0.");
    }
    private void ThrowWhenDisposed()
    {
        if (_cancel.IsCancellationRequested)
            throw new ObjectDisposedException(nameof(FileInMemoryManager_unsafe), "The FileInMemoryManager_unsafe has been disposed.");
    }

    public void Dispose()
    {
        _cancel.Cancel();

        lock (_lock)
        {
            var unusedFiles = _files
    .           Where(f => !f.Used);

            foreach (var file in unusedFiles)
                file.Dispose();

            _files.Clear();
        }

        _cancel.Dispose();
    }


    private sealed record RequestOperation(
        int Size,
        TaskCompletionSource<FileInMemory_unsafe> Tcs
        );
}