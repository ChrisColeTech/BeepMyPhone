namespace BeepMyPhone.Tunneling.Models;

/// <summary>
/// Represents metadata about an FRP binary including version, path, and validation information
/// </summary>
public class BinaryInfo
{
    /// <summary>
    /// Version of the FRP binary (e.g., "v0.44.0")
    /// </summary>
    public string Version { get; set; } = string.Empty;

    /// <summary>
    /// Local file path where the binary is stored
    /// </summary>
    public string FilePath { get; set; } = string.Empty;

    /// <summary>
    /// Filename of the binary (e.g., "frpc_windows_amd64.exe")
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Download URL from GitHub releases
    /// </summary>
    public string DownloadUrl { get; set; } = string.Empty;

    /// <summary>
    /// SHA256 checksum for integrity verification
    /// </summary>
    public string Checksum { get; set; } = string.Empty;

    /// <summary>
    /// Size of the binary file in bytes
    /// </summary>
    public long SizeBytes { get; set; }

    /// <summary>
    /// Platform architecture (e.g., "windows_amd64", "linux_arm64")
    /// </summary>
    public string Platform { get; set; } = string.Empty;

    /// <summary>
    /// When this binary information was last updated
    /// </summary>
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Whether the binary has been validated successfully
    /// </summary>
    public bool IsValidated { get; set; }

    /// <summary>
    /// Whether the binary is executable (has correct permissions)
    /// </summary>
    public bool IsExecutable { get; set; }
}