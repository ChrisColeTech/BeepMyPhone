using System.Runtime.InteropServices;
using System.Text.Json;
using BeepMyPhone.Tunneling.Models;

namespace BeepMyPhone.Tunneling.Services;

/// <summary>
/// Downloads FRP binaries from GitHub releases
/// Implements Single Responsibility Principle by focusing only on download operations
/// </summary>
public class BinaryDownloader : IBinaryDownloader
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<BinaryDownloader> _logger;
    private const string FrpGitHubApiUrl = "https://api.github.com/repos/fatedier/frp/releases/latest";

    public BinaryDownloader(HttpClient httpClient, ILogger<BinaryDownloader> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        
        // Set user agent as required by GitHub API
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "BeepMyPhone-Tunneling/1.0");
    }

    public async Task<BinaryInfo> DownloadLatestAsync(string platform, string destinationPath, CancellationToken cancellationToken = default)
    {
        var binaryInfo = await GetLatestVersionInfoAsync(platform, cancellationToken);
        
        _logger.LogInformation("Downloading FRP binary {Version} for {Platform}", binaryInfo.Version, platform);
        
        try
        {
            // Download the binary file
            var response = await _httpClient.GetAsync(binaryInfo.DownloadUrl, cancellationToken);
            response.EnsureSuccessStatusCode();

            // Create destination directory if it doesn't exist
            var directory = Path.GetDirectoryName(destinationPath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            // Save binary to file
            await using var fileStream = File.Create(destinationPath);
            await response.Content.CopyToAsync(fileStream, cancellationToken);

            // Set executable permissions on Unix systems
            if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                File.SetUnixFileMode(destinationPath, 
                    UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
            }

            // Update binary info with local path
            binaryInfo.FilePath = destinationPath;
            binaryInfo.SizeBytes = new FileInfo(destinationPath).Length;
            binaryInfo.LastUpdated = DateTime.UtcNow;

            _logger.LogInformation("Successfully downloaded FRP binary to {Path}", destinationPath);
            return binaryInfo;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download FRP binary from {Url}", binaryInfo.DownloadUrl);
            throw;
        }
    }

    public async Task<BinaryInfo> GetLatestVersionInfoAsync(string platform, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug("Fetching latest FRP release information for platform {Platform}", platform);
            
            var response = await _httpClient.GetAsync(FrpGitHubApiUrl, cancellationToken);
            response.EnsureSuccessStatusCode();

            var jsonContent = await response.Content.ReadAsStringAsync(cancellationToken);
            var release = JsonSerializer.Deserialize<GitHubRelease>(jsonContent);

            if (release?.Assets == null || release.Assets.Length == 0)
            {
                throw new InvalidOperationException("No assets found in FRP release");
            }

            // Find the asset for our platform
            var asset = FindAssetForPlatform(release.Assets, platform);
            if (asset == null)
            {
                throw new InvalidOperationException($"No FRP binary found for platform {platform}");
            }

            // Get checksum for this asset
            var checksum = await GetChecksumForAssetAsync(release.TagName, asset.Name, cancellationToken);

            return new BinaryInfo
            {
                Version = release.TagName,
                FileName = asset.Name,
                DownloadUrl = asset.BrowserDownloadUrl,
                SizeBytes = asset.Size,
                Platform = platform,
                Checksum = checksum,
                LastUpdated = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get latest FRP version info for platform {Platform}", platform);
            throw;
        }
    }

    public async Task<bool> IsNewerVersionAvailableAsync(string currentVersion, string platform, CancellationToken cancellationToken = default)
    {
        try
        {
            var latestInfo = await GetLatestVersionInfoAsync(platform, cancellationToken);
            return !string.Equals(currentVersion, latestInfo.Version, StringComparison.OrdinalIgnoreCase);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to check for newer version. Current: {Current}", currentVersion);
            return false;
        }
    }

    private static GitHubAsset? FindAssetForPlatform(GitHubAsset[] assets, string platform)
    {
        // Convert platform format: "windows_amd64" -> look for "frpc_windows_amd64.exe"
        var expectedPrefix = $"frpc_{platform}";
        
        return assets.FirstOrDefault(asset => 
            asset.Name.StartsWith(expectedPrefix, StringComparison.OrdinalIgnoreCase));
    }

    private async Task<string> GetChecksumForAssetAsync(string version, string fileName, CancellationToken cancellationToken)
    {
        try
        {
            // Download SHA256 checksum file from releases
            var checksumUrl = $"https://github.com/fatedier/frp/releases/download/{version}/sha256_checksums.txt";
            var response = await _httpClient.GetAsync(checksumUrl, cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Checksum file not found for version {Version}", version);
                return string.Empty;
            }

            var checksumContent = await response.Content.ReadAsStringAsync(cancellationToken);
            var lines = checksumContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);
            
            // Find the line containing our filename
            var checksumLine = lines.FirstOrDefault(line => line.Contains(fileName));
            if (checksumLine != null)
            {
                // Extract checksum (first part before space)
                var parts = checksumLine.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length > 0)
                {
                    return parts[0];
                }
            }

            _logger.LogWarning("Checksum not found for file {FileName} in version {Version}", fileName, version);
            return string.Empty;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get checksum for {FileName}", fileName);
            return string.Empty;
        }
    }

    // JSON models for GitHub API response
    private class GitHubRelease
    {
        public string TagName { get; set; } = string.Empty;
        public GitHubAsset[] Assets { get; set; } = Array.Empty<GitHubAsset>();
    }

    private class GitHubAsset
    {
        public string Name { get; set; } = string.Empty;
        public string BrowserDownloadUrl { get; set; } = string.Empty;
        public long Size { get; set; }
    }
}