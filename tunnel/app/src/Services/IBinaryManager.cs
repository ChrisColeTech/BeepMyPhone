using BeepMyPhone.Tunneling.Models;

namespace BeepMyPhone.Tunneling.Services;

/// <summary>
/// Interface for managing FRP binary lifecycle including download, validation, and caching
/// Follows Interface Segregation Principle by providing focused binary management operations
/// </summary>
public interface IBinaryManager
{
    /// <summary>
    /// Ensures an FRP binary is available for the current platform
    /// Downloads if needed, validates if present, and returns path to executable
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>Path to validated FRP binary executable</returns>
    Task<string> EnsureBinaryAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets information about the currently cached binary for the current platform
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>Binary information if available, null if no cached binary exists</returns>
    Task<BinaryInfo?> GetCachedBinaryInfoAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates that a binary file exists, has correct checksum, and is executable
    /// </summary>
    /// <param name="binaryPath">Path to binary file to validate</param>
    /// <param name="expectedChecksum">Expected SHA256 checksum for validation</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>True if binary is valid and executable, false otherwise</returns>
    Task<bool> ValidateBinaryAsync(string binaryPath, string expectedChecksum, CancellationToken cancellationToken = default);

    /// <summary>
    /// Clears cached binary files to force fresh download on next request
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    Task ClearCacheAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the current platform identifier for binary selection
    /// </summary>
    /// <returns>Platform string (e.g., "windows_amd64", "linux_arm64")</returns>
    string GetCurrentPlatform();
}