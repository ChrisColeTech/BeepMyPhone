namespace BeepMyPhone.Tunneling.Services;

/// <summary>
/// Interface for validating FRP binary files for integrity and executability
/// </summary>
public interface IBinaryValidator
{
    /// <summary>
    /// Validates that a binary file exists, has correct checksum, and is executable
    /// </summary>
    /// <param name="filePath">Path to the binary file</param>
    /// <param name="expectedChecksum">Expected SHA256 checksum (optional)</param>
    /// <returns>True if binary is valid and executable</returns>
    Task<bool> ValidateAsync(string filePath, string? expectedChecksum = null);

    /// <summary>
    /// Calculates SHA256 checksum of a file
    /// </summary>
    /// <param name="filePath">Path to file</param>
    /// <returns>SHA256 checksum as lowercase hex string</returns>
    Task<string> CalculateSha256Async(string filePath);

    /// <summary>
    /// Gets the SHA256 checksum of a file (alias for CalculateSha256Async)
    /// </summary>
    /// <param name="filePath">Path to file</param>
    /// <returns>SHA256 checksum as lowercase hex string</returns>
    Task<string> GetFileChecksumAsync(string filePath);

    /// <summary>
    /// Checks if a file has executable permissions and is a valid executable
    /// </summary>
    /// <param name="filePath">Path to file</param>
    /// <returns>True if file is executable</returns>
    bool IsExecutable(string filePath);

    /// <summary>
    /// Ensures a file has executable permissions on Unix systems
    /// </summary>
    /// <param name="filePath">Path to file</param>
    void MakeExecutable(string filePath);
}