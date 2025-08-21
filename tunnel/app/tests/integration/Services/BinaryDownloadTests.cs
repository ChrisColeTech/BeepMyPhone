using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using BeepMyPhone.Tunneling.Services;
using System.Net;

namespace BeepMyPhone.Tunneling.Tests.Integration.Services;

/// <summary>
/// Integration tests for BinaryDownloader covering real GitHub API scenarios
/// Tests actual HTTP interactions and file operations with proper cleanup
/// </summary>
public class BinaryDownloadTests : IDisposable
{
    private readonly HttpClient _httpClient;
    private readonly Mock<ILogger<BinaryDownloader>> _mockLogger;
    private readonly BinaryDownloader _binaryDownloader;
    private readonly string _testDownloadDirectory;

    public BinaryDownloadTests()
    {
        _httpClient = new HttpClient();
        _mockLogger = new Mock<ILogger<BinaryDownloader>>();
        _binaryDownloader = new BinaryDownloader(_httpClient, _mockLogger.Object);
        
        // Create temporary directory for downloads
        _testDownloadDirectory = Path.Combine(Path.GetTempPath(), "BinaryDownloadTests", Guid.NewGuid().ToString());
        Directory.CreateDirectory(_testDownloadDirectory);
    }

    [Fact]
    public async Task GetLatestVersionInfoAsync_WithValidPlatform_ReturnsVersionInfo()
    {
        // Arrange
        var platform = "windows_amd64";

        // Act
        var result = await _binaryDownloader.GetLatestVersionInfoAsync(platform);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result.Version);
        Assert.StartsWith("v", result.Version); // FRP versions start with 'v'
        Assert.NotEmpty(result.DownloadUrl);
        Assert.Contains("github.com", result.DownloadUrl);
        Assert.Contains($"frpc_{platform}", result.FileName);
        Assert.True(result.SizeBytes > 0);
        Assert.Equal(platform, result.Platform);
    }

    [Theory]
    [InlineData("windows_amd64")]
    [InlineData("linux_amd64")]
    [InlineData("darwin_amd64")]
    public async Task GetLatestVersionInfoAsync_WithSupportedPlatforms_ReturnsValidInfo(string platform)
    {
        // Act
        var result = await _binaryDownloader.GetLatestVersionInfoAsync(platform);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(platform, result.Platform);
        Assert.Contains($"frpc_{platform}", result.FileName);
        Assert.NotEmpty(result.DownloadUrl);
        Assert.True(result.SizeBytes > 1024 * 1024); // FRP binaries should be at least 1MB
    }

    [Fact]
    public async Task GetLatestVersionInfoAsync_WithInvalidPlatform_ThrowsException()
    {
        // Arrange
        var invalidPlatform = "nonexistent_platform";

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _binaryDownloader.GetLatestVersionInfoAsync(invalidPlatform));
        
        Assert.Contains("No FRP binary found for platform", exception.Message);
    }

    [Fact]
    public async Task DownloadLatestAsync_WithValidPlatform_DownloadsFile()
    {
        // Arrange
        var platform = "windows_amd64";
        var destinationPath = Path.Combine(_testDownloadDirectory, $"frpc_{platform}.exe");

        // Act
        var result = await _binaryDownloader.DownloadLatestAsync(platform, destinationPath);

        // Assert
        Assert.NotNull(result);
        Assert.True(File.Exists(destinationPath));
        Assert.Equal(destinationPath, result.FilePath);
        
        var fileInfo = new FileInfo(destinationPath);
        Assert.True(fileInfo.Length > 1024 * 1024); // Should be substantial binary
        Assert.Equal(fileInfo.Length, result.SizeBytes);
        
        // Verify it's a real executable (basic check)
        var firstBytes = await File.ReadAllBytesAsync(destinationPath);
        Assert.True(firstBytes.Length > 100); // Has substantial content
    }

    [Fact]
    public async Task DownloadLatestAsync_WithNetworkError_ThrowsHttpRequestException()
    {
        // Arrange
        var httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri("https://nonexistent-domain-12345.com/");
        var downloader = new BinaryDownloader(httpClient, _mockLogger.Object);
        
        var platform = "windows_amd64";
        var destinationPath = Path.Combine(_testDownloadDirectory, "test.exe");

        // Act & Assert
        await Assert.ThrowsAnyAsync<HttpRequestException>(
            () => downloader.DownloadLatestAsync(platform, destinationPath));
    }

    [Fact]
    public async Task IsNewerVersionAvailableAsync_WithOldVersion_ReturnsTrue()
    {
        // Arrange
        var platform = "windows_amd64";
        var oldVersion = "v0.1.0"; // Definitely older than current

        // Act
        var result = await _binaryDownloader.IsNewerVersionAvailableAsync(oldVersion, platform);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task IsNewerVersionAvailableAsync_WithCurrentVersion_ReturnsFalse()
    {
        // Arrange
        var platform = "windows_amd64";
        
        // Get the actual current version
        var versionInfo = await _binaryDownloader.GetLatestVersionInfoAsync(platform);
        var currentVersion = versionInfo.Version;

        // Act
        var result = await _binaryDownloader.IsNewerVersionAvailableAsync(currentVersion, platform);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task DownloadLatestAsync_CreatesDirectoryIfNotExists()
    {
        // Arrange
        var platform = "linux_amd64";
        var nestedDirectory = Path.Combine(_testDownloadDirectory, "nested", "deep", "directory");
        var destinationPath = Path.Combine(nestedDirectory, $"frpc_{platform}");

        // Ensure directory doesn't exist
        Assert.False(Directory.Exists(nestedDirectory));

        // Act
        var result = await _binaryDownloader.DownloadLatestAsync(platform, destinationPath);

        // Assert
        Assert.True(Directory.Exists(nestedDirectory));
        Assert.True(File.Exists(destinationPath));
        Assert.Equal(destinationPath, result.FilePath);
    }

    [Fact]
    public async Task DownloadLatestAsync_SetsExecutablePermissionsOnUnix()
    {
        // Arrange
        var platform = "linux_amd64";
        var destinationPath = Path.Combine(_testDownloadDirectory, $"frpc_{platform}");

        // Act
        var result = await _binaryDownloader.DownloadLatestAsync(platform, destinationPath);

        // Assert
        Assert.True(File.Exists(destinationPath));
        
        // On Unix systems, check executable permissions
        if (!System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.Windows))
        {
            var mode = File.GetUnixFileMode(destinationPath);
            Assert.True((mode & UnixFileMode.UserExecute) != 0);
        }
    }

    [Fact]
    public async Task GetLatestVersionInfoAsync_ReturnsChecksumWhenAvailable()
    {
        // Arrange
        var platform = "windows_amd64";

        // Act
        var result = await _binaryDownloader.GetLatestVersionInfoAsync(platform);

        // Assert
        Assert.NotNull(result);
        // Checksum might be empty if not available, but should not throw
        // The test verifies the method completes without error
        Assert.True(result.Checksum.Length == 0 || result.Checksum.Length == 64); // SHA256 is 64 chars
    }

    [Fact]
    public async Task DownloadLatestAsync_WithCancellation_ThrowsOperationCanceledException()
    {
        // Arrange
        using var cts = new CancellationTokenSource();
        cts.Cancel();
        
        var platform = "windows_amd64";
        var destinationPath = Path.Combine(_testDownloadDirectory, "test.exe");

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(
            () => _binaryDownloader.DownloadLatestAsync(platform, destinationPath, cts.Token));
    }

    [Fact]
    public async Task GetLatestVersionInfoAsync_WithCancellation_ThrowsOperationCanceledException()
    {
        // Arrange
        using var cts = new CancellationTokenSource();
        cts.Cancel();
        
        var platform = "windows_amd64";

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(
            () => _binaryDownloader.GetLatestVersionInfoAsync(platform, cts.Token));
    }

    [Fact]
    public void Constructor_WithNullHttpClient_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => 
            new BinaryDownloader(null!, _mockLogger.Object));
    }

    [Fact]
    public void Constructor_WithNullLogger_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => 
            new BinaryDownloader(_httpClient, null!));
    }

    [Fact]
    public async Task GetLatestVersionInfoAsync_SetsUserAgent()
    {
        // This test verifies that the User-Agent header is set correctly
        // We can't directly test the header, but we can verify the request succeeds
        // which it wouldn't without a proper User-Agent for GitHub API
        
        // Arrange
        var platform = "windows_amd64";

        // Act & Assert - Should not throw 403 Forbidden
        var result = await _binaryDownloader.GetLatestVersionInfoAsync(platform);
        Assert.NotNull(result);
    }

    [Fact]
    public async Task IsNewerVersionAvailableAsync_WithNetworkError_ReturnsFalse()
    {
        // Arrange
        var httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri("https://nonexistent-domain-12345.com/");
        var downloader = new BinaryDownloader(httpClient, _mockLogger.Object);
        
        var platform = "windows_amd64";
        var currentVersion = "v0.44.0";

        // Act
        var result = await downloader.IsNewerVersionAvailableAsync(currentVersion, platform);

        // Assert
        Assert.False(result); // Should return false on network error, not throw
    }

    public void Dispose()
    {
        _httpClient?.Dispose();
        
        if (Directory.Exists(_testDownloadDirectory))
        {
            try
            {
                Directory.Delete(_testDownloadDirectory, true);
            }
            catch
            {
                // Ignore cleanup errors in tests
            }
        }
    }
}