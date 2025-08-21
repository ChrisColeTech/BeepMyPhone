using BeepMyPhone.Tunneling.Models;

namespace BeepMyPhone.Tunneling.Services;

/// <summary>
/// Interface for downloading FRP binaries from external sources
/// Abstracts download source implementation following Dependency Inversion Principle
/// </summary>
public interface IBinaryDownloader
{
    /// <summary>
    /// Downloads the latest FRP binary for the specified platform
    /// </summary>
    /// <param name="platform">Target platform (e.g., "windows_amd64")</param>
    /// <param name="destinationPath">Local path where binary should be saved</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>Binary information including version and checksum</returns>
    Task<BinaryInfo> DownloadLatestAsync(string platform, string destinationPath, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets information about the latest available binary version without downloading
    /// </summary>
    /// <param name="platform">Target platform (e.g., "windows_amd64")</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>Binary information with download URL and metadata</returns>
    Task<BinaryInfo> GetLatestVersionInfoAsync(string platform, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a newer version is available compared to the current version
    /// </summary>
    /// <param name="currentVersion">Current version string (e.g., "v0.44.0")</param>
    /// <param name="platform">Target platform</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>True if newer version is available, false otherwise</returns>
    Task<bool> IsNewerVersionAvailableAsync(string currentVersion, string platform, CancellationToken cancellationToken = default);
}