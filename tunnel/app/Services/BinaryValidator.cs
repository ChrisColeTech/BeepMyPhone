using System.Runtime.InteropServices;
using System.Security.Cryptography;

namespace BeepMyPhone.Tunneling.Services;

/// <summary>
/// Validates FRP binary files for integrity and executability
/// Implements Single Responsibility Principle by focusing only on validation logic
/// </summary>
public class BinaryValidator : IBinaryValidator
{
    private readonly ILogger<BinaryValidator> _logger;

    public BinaryValidator(ILogger<BinaryValidator> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Validates that a binary file exists, has correct checksum, and is executable
    /// </summary>
    /// <param name="filePath">Path to the binary file</param>
    /// <param name="expectedChecksum">Expected SHA256 checksum (optional)</param>
    /// <returns>True if binary is valid and executable</returns>
    public async Task<bool> ValidateAsync(string filePath, string? expectedChecksum = null)
    {
        try
        {
            // Check if file exists
            if (!File.Exists(filePath))
            {
                _logger.LogWarning("Binary file not found: {FilePath}", filePath);
                return false;
            }

            // Check file size (FRP binaries should be at least 1MB)
            var fileInfo = new FileInfo(filePath);
            if (fileInfo.Length < 1024 * 1024)
            {
                _logger.LogWarning("Binary file too small ({Size} bytes): {FilePath}", fileInfo.Length, filePath);
                return false;
            }

            // Validate checksum if provided
            if (!string.IsNullOrEmpty(expectedChecksum))
            {
                var actualChecksum = await CalculateSha256Async(filePath);
                if (!string.Equals(actualChecksum, expectedChecksum, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogError("Checksum mismatch for {FilePath}. Expected: {Expected}, Actual: {Actual}", 
                        filePath, expectedChecksum, actualChecksum);
                    return false;
                }
            }

            // Check if file is executable
            if (!IsExecutable(filePath))
            {
                _logger.LogWarning("Binary file is not executable: {FilePath}", filePath);
                return false;
            }

            _logger.LogDebug("Binary validation successful: {FilePath}", filePath);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate binary: {FilePath}", filePath);
            return false;
        }
    }

    /// <summary>
    /// Calculates SHA256 checksum of a file
    /// </summary>
    /// <param name="filePath">Path to file</param>
    /// <returns>SHA256 checksum as lowercase hex string</returns>
    public async Task<string> CalculateSha256Async(string filePath)
    {
        using var sha256 = SHA256.Create();
        await using var stream = File.OpenRead(filePath);
        var hash = await sha256.ComputeHashAsync(stream);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    /// <summary>
    /// Gets the SHA256 checksum of a file (alias for CalculateSha256Async)
    /// </summary>
    /// <param name="filePath">Path to file</param>
    /// <returns>SHA256 checksum as lowercase hex string</returns>
    public async Task<string> GetFileChecksumAsync(string filePath)
    {
        return await CalculateSha256Async(filePath);
    }

    /// <summary>
    /// Checks if a file has executable permissions and is a valid executable
    /// </summary>
    /// <param name="filePath">Path to file</param>
    /// <returns>True if file is executable</returns>
    public bool IsExecutable(string filePath)
    {
        try
        {
            if (!File.Exists(filePath))
                return false;

            // On Windows, check if it's an .exe file
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                return filePath.EndsWith(".exe", StringComparison.OrdinalIgnoreCase);
            }

            // On Unix systems, check executable permission
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux) || 
                RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                var mode = File.GetUnixFileMode(filePath);
                return (mode & UnixFileMode.UserExecute) != 0;
            }

            // Unknown platform - assume executable if file exists
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to check executable status for {FilePath}", filePath);
            return false;
        }
    }

    /// <summary>
    /// Ensures a file has executable permissions on Unix systems
    /// </summary>
    /// <param name="filePath">Path to file</param>
    public void MakeExecutable(string filePath)
    {
        try
        {
            if (!File.Exists(filePath))
                return;

            // Set executable permissions on Unix systems
            if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                File.SetUnixFileMode(filePath, 
                    UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
                _logger.LogDebug("Set executable permissions for {FilePath}", filePath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to set executable permissions for {FilePath}", filePath);
        }
    }
}