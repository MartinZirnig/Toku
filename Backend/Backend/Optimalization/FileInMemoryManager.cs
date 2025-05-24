using System.Collections.Concurrent;

namespace Optimalization;

public sealed class FileInMemoryManager
    : IDisposable
{
    private readonly HashSet<FileInMemory> _files;
    private readonly long _maxSize;
    private long _usedSize;
    private readonly object _lock;
    private long _availableSize => _maxSize - _usedSize;
    private readonly CancellationTokenSource _cancel;

    private readonly ConcurrentQueue<RequestOperation> _requests;

    public FileInMemoryManager(long maxSize)
    {
        _maxSize = maxSize.NextPowerOfTwo();
        _usedSize = 0;
        _files = new HashSet<FileInMemory>();
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
    private FileInMemory? TryAssignFile(int size)
    {
        FileInMemory? file;

        lock (_lock)
        {
            file = FindUnused(size);
            if (file is null && _availableSize >= size)
                file = Assign(size);
        }

        return file;
    }


    public Task<FileInMemory> RentAsync(int size)
    {
        size = size.NextPowerOfTwo();
        ThrowWhenInvalidSize(size);
        ThrowWhenDisposed();

        var tcs = new TaskCompletionSource<FileInMemory>();
        var request = new RequestOperation(size, tcs);
        _requests.Enqueue(request);

        return request.Tcs.Task;
    }
    public void Return(FileInMemory file)
    {
        if (_cancel.IsCancellationRequested)
            return;

        file.Used = false;

        lock (_lock)
        {
            if (!_files.Contains(file))
            {
                _files.Add(file);
                _usedSize += file.Size;
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
    private void Consume(FileInMemory target)
    {
        _usedSize -= target.Size;

        _files.Remove(target);
    }

    private FileInMemory Assign(int size)
    {

        this._usedSize += size;
        return new FileInMemory(size);
    }
    private FileInMemory? FindUnused(long size)
    {
        var greater = _files
            .Where(f => !f.Used && f.Size >= size)
            .OrderBy(f => f.Size)
            .FirstOrDefault();

        return greater;
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
            throw new ObjectDisposedException(nameof(FileInMemoryManager), "The FileInMemoryManager has been disposed.");
    }

    public void Dispose()
    {
        _cancel.Cancel();

        lock (_lock)
        {
            _files.Clear();
        }

        _cancel.Dispose();
    }


    private sealed record RequestOperation(
        int Size,
        TaskCompletionSource<FileInMemory> Tcs
        );
}