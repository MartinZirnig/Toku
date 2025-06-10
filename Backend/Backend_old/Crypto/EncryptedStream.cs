using System.Security.Cryptography;

namespace Crypto;

public class EncryptedStream : Stream
{
    private readonly Stream _baseStream;
    private readonly CryptoStream _cryptoStream;
    private readonly Aes _aes;
    private readonly SimpleKey _key;

    public EncryptedStream(Stream baseStream, SimpleKey key)
    {
        _baseStream = baseStream;
        _key = key;

        _aes = Aes.Create();
        _aes.Key = _key.Key;
        _aes.IV = _key.IV;
        _aes.Mode = CipherMode.CBC;
        _aes.Padding = PaddingMode.PKCS7;

        var encryptor = _aes.CreateEncryptor();
        _cryptoStream = new CryptoStream(_baseStream, encryptor, CryptoStreamMode.Read);
    }

    public override bool CanRead => _cryptoStream.CanRead;
    public override bool CanSeek => false;
    public override bool CanWrite => false;
    public override long Length => throw new NotSupportedException();

    public override long Position
    {
        get => throw new NotSupportedException();
        set => throw new NotSupportedException();
    }

    public override void Flush() => _cryptoStream.Flush();

    public override int Read(byte[] buffer, int offset, int count) =>
        _cryptoStream.Read(buffer, offset, count);

    public override async ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default) =>
        await _cryptoStream.ReadAsync(buffer, cancellationToken);

    public override long Seek(long offset, SeekOrigin origin) =>
        throw new NotSupportedException();

    public override void SetLength(long value) =>
        throw new NotSupportedException();

    public override void Write(byte[] buffer, int offset, int count) =>
        throw new NotSupportedException("This stream is read-only.");

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _cryptoStream.Dispose();
            _aes.Dispose();
        }
        base.Dispose(disposing);
    }
}
