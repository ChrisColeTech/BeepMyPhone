using BeepMyPhone.Tunneling.Models;

namespace BeepMyPhone.Tunneling.Services;

/// <summary>
/// Interface for managing bundled FRP binaries for tunnel service
/// Follows Interface Segregation Principle by providing focused binary management operations
/// </summary>
public interface IBinaryManager
{
    /// <summary>
    /// Ensures a bundled FRP binary is available for the current platform
    /// Validates binary existence and permissions, returns path to executable
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>Path to validated FRP binary executable</returns>
    Task<string> EnsureBinaryAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets information about the bundled binary for the current platform
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>Binary information if available, null if bundled binary not found</returns>
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
    /// No-op for bundled binary approach (no cache to clear)
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    Task ClearCacheAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the current platform identifier for binary selection
    /// </summary>
    /// <returns>Platform string (e.g., "windows_amd64", "linux_arm64")</returns>
    string GetCurrentPlatform();
}