using System.Numerics;

namespace Optimalization;

internal static class Extensions
{
    public static long NextPowerOfTwo(this long value)
    {
        if (value < 1)
            return 1;

        value--;
        value |= value >> 1;
        value |= value >> 2;
        value |= value >> 4;
        value |= value >> 8;
        value |= value >> 16;
        value++;

        return value;
    }
    public static int NextPowerOfTwo(this int value)
    {
        if (value < 1)
            return 1;

        value--;
        value |= value >> 1;
        value |= value >> 2;
        value |= value >> 4;
        value |= value >> 8;
        value |= value >> 16;
        value++;

        return value;
    }
}
