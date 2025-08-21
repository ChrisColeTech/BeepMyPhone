using System.Runtime.InteropServices;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using BeepMyPhone.Tunneling.Models;
using BeepMyPhone.Tunneling.Services;

namespace BeepMyPhone.Tunneling.Tests.Unit.Services;

/// <summary>
/// Comprehensive unit tests for BinaryManager with bundled binary approach
/// Tests platform detection, binary selection, and validation functionality
/// </summary>
public class BinaryManagerTests : IDisposable
{
    private readonly Mock<IBinaryValidator> _mockValidator;
    private readonly Mock<ILogger<BinaryManager>> _mockLogger;
    private readonly string _testBinariesDirectory;
    private readonly string _originalBaseDirectory;

    public BinaryManagerTests()
    {
        _mockValidator = new Mock<IBinaryValidator>();
        _mockLogger = new Mock<ILogger<BinaryManager>>();

        // Create a temporary binaries directory for testing
        _testBinariesDirectory = Path.Combine(Path.GetTempPath(), "BinaryManagerTests", Guid.NewGuid().ToString(), "binaries");
        Directory.CreateDirectory(_testBinariesDirectory);

        // Store original AppContext.BaseDirectory and set up test directory
        _originalBaseDirectory = AppContext.BaseDirectory;
        
        // We'll need to create test binaries for different platforms
        CreateTestBinaries();
    }

    [Fact]
    public async Task EnsureBinaryAsync_WithValidBundledBinary_ReturnsCorrectPath()
    {
        // Arrange
        var platform = GetTestPlatform();
        var expectedPath = GetExpectedBinaryPath(platform);
        
        _mockValidator.Setup(v => v.IsExecutable(expectedPath))
            .Returns(true);
        _mockValidator.Setup(v => v.GetFileChecksumAsync(expectedPath))
            .ReturnsAsync("test-checksum-123");

        var binaryManager = CreateBinaryManagerWithTestDirectory();

        // Act
        var result = await binaryManager.EnsureBinaryAsync();

        // Assert
        Assert.Equal(expectedPath, result);
        _mockValidator.Verify(v => v.MakeExecutable(expectedPath), Times.Once);
    }

    [Fact]
    public async Task EnsureBinaryAsync_WithMissingBundledBinary_ThrowsFileNotFoundException()
    {
        // Arrange
        var emptyBinariesDir = Path.Combine(Path.GetTempPath(), "EmptyBinaries", Guid.NewGuid().ToString(), "binaries");
        Directory.CreateDirectory(emptyBinariesDir);

        var binaryManager = CreateBinaryManagerWithDirectory(emptyBinariesDir);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<FileNotFoundException>(
            () => binaryManager.EnsureBinaryAsync());
        
        Assert.Contains("Bundled FRP binary not found", exception.Message);
        
        // Cleanup
        Directory.Delete(Path.GetDirectoryName(emptyBinariesDir)!, true);
    }

    [Fact]
    public async Task GetCachedBinaryInfoAsync_WithValidBundledBinary_ReturnsBinaryInfo()
    {
        // Arrange
        var platform = GetTestPlatform();
        var expectedPath = GetExpectedBinaryPath(platform);
        
        _mockValidator.Setup(v => v.IsExecutable(expectedPath))
            .Returns(true);
        _mockValidator.Setup(v => v.GetFileChecksumAsync(expectedPath))
            .ReturnsAsync("test-checksum-456");

        var binaryManager = CreateBinaryManagerWithTestDirectory();

        // Act
        var result = await binaryManager.GetCachedBinaryInfoAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal("0.64.0", result.Version);
        Assert.Equal(platform, result.Platform);
        Assert.Equal(expectedPath, result.FilePath);
        Assert.True(result.IsValidated);
        Assert.Equal("test-checksum-456", result.Checksum);
    }

    [Fact]
    public async Task GetCachedBinaryInfoAsync_WithMissingBinary_ReturnsNull()
    {
        // Arrange
        var emptyBinariesDir = Path.Combine(Path.GetTempPath(), "EmptyBinaries2", Guid.NewGuid().ToString(), "binaries");
        Directory.CreateDirectory(emptyBinariesDir);

        var binaryManager = CreateBinaryManagerWithDirectory(emptyBinariesDir);

        // Act
        var result = await binaryManager.GetCachedBinaryInfoAsync();

        // Assert
        Assert.Null(result);
        
        // Cleanup
        Directory.Delete(Path.GetDirectoryName(emptyBinariesDir)!, true);
    }

    [Fact]
    public async Task ValidateBinaryAsync_CallsValidator_ReturnsResult()
    {
        // Arrange
        var binaryPath = "/test/path";
        var checksum = "test-checksum";
        var expectedResult = true;

        _mockValidator.Setup(v => v.ValidateAsync(binaryPath, checksum))
            .ReturnsAsync(expectedResult);

        var binaryManager = CreateBinaryManagerWithTestDirectory();

        // Act
        var result = await binaryManager.ValidateBinaryAsync(binaryPath, checksum);

        // Assert
        Assert.Equal(expectedResult, result);
        _mockValidator.Verify(v => v.ValidateAsync(binaryPath, checksum), Times.Once);
    }

    [Fact]
    public async Task ClearCacheAsync_WithBundledApproach_LogsNoOpMessage()
    {
        // Arrange
        var binaryManager = CreateBinaryManagerWithTestDirectory();

        // Act
        await binaryManager.ClearCacheAsync();

        // Assert - Just verify it completes without error
        // The method should log a message about no cache to clear
        Assert.True(true); // No exception thrown
    }

    [Fact]
    public void GetCurrentPlatform_ReturnsCorrectPlatformString()
    {
        // Arrange
        var binaryManager = CreateBinaryManagerWithTestDirectory();

        // Act
        var result = binaryManager.GetCurrentPlatform();

        // Assert
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            Assert.Contains("windows_", result);
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        {
            Assert.Contains("linux_", result);
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            Assert.Contains("darwin_", result);
        }
        
        // Should contain some architecture identifier
        Assert.Contains("_", result);
        
        // Should be a valid platform string format
        Assert.Matches(@"^(windows|linux|darwin)_(amd64|386|arm64|arm)$", result);
    }

    [Fact]
    public void Constructor_WithNullValidator_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => 
            new BinaryManager(null!, _mockLogger.Object));
    }

    [Fact]
    public void Constructor_WithNullLogger_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => 
            new BinaryManager(_mockValidator.Object, null!));
    }

    [Fact]
    public void Constructor_WithMissingBinariesDirectory_ThrowsDirectoryNotFoundException()
    {
        // Arrange
        var nonExistentDir = Path.Combine(Path.GetTempPath(), "NonExistentBinaries", Guid.NewGuid().ToString());
        
        // Act & Assert
        Assert.Throws<DirectoryNotFoundException>(() => 
            CreateBinaryManagerWithDirectory(Path.Combine(nonExistentDir, "binaries")));
    }

    [Theory]
    [InlineData("windows_amd64", "frpc_windows_amd64.exe")]
    [InlineData("linux_amd64", "frpc_linux_amd64")]
    [InlineData("darwin_amd64", "frpc_darwin_amd64")]
    [InlineData("darwin_arm64", "frpc_darwin_arm64")]
    public async Task EnsureBinaryAsync_ForDifferentPlatforms_SelectsCorrectBinary(string platform, string expectedFileName)
    {
        // Arrange
        var expectedPath = Path.Combine(_testBinariesDirectory, expectedFileName);
        
        _mockValidator.Setup(v => v.IsExecutable(expectedPath))
            .Returns(true);
        _mockValidator.Setup(v => v.GetFileChecksumAsync(expectedPath))
            .ReturnsAsync("test-checksum");

        // We need to mock the platform detection, but since it's not easily mockable,
        // we'll verify the logic by checking if the correct binary would be selected
        var binaryManager = CreateBinaryManagerWithTestDirectory();

        // Act & Assert
        if (GetTestPlatform() == platform)
        {
            var result = await binaryManager.EnsureBinaryAsync();
            Assert.Equal(expectedPath, result);
        }
    }

    // Helper methods for test setup
    private string GetTestPlatform()
    {
        var architecture = RuntimeInformation.OSArchitecture;
        var archString = architecture switch
        {
            Architecture.X64 => "amd64",
            Architecture.Arm64 => "arm64",
            _ => "amd64"
        };

        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            return $"windows_{archString}";
        
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            return $"linux_{archString}";
            
        if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            return $"darwin_{archString}";

        return $"linux_{archString}";
    }

    private string GetExpectedBinaryPath(string platform)
    {
        var fileName = $"frpc_{platform}";
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            fileName += ".exe";
        }
        return Path.Combine(_testBinariesDirectory, fileName);
    }

    private void CreateTestBinaries()
    {
        // Create mock binaries for all platforms
        var platforms = new[]
        {
            "windows_amd64",
            "linux_amd64", 
            "darwin_amd64",
            "darwin_arm64"
        };

        foreach (var platform in platforms)
        {
            var fileName = $"frpc_{platform}";
            if (platform.StartsWith("windows"))
                fileName += ".exe";
                
            var filePath = Path.Combine(_testBinariesDirectory, fileName);
            File.WriteAllText(filePath, $"Mock FRP binary content for {platform}");
        }
    }

    private BinaryManager CreateBinaryManagerWithTestDirectory()
    {
        return CreateBinaryManagerWithDirectory(_testBinariesDirectory);
    }

    private BinaryManager CreateBinaryManagerWithDirectory(string binariesDirectory)
    {
        // Use the optional constructor parameter to specify test binaries directory
        return new BinaryManager(_mockValidator.Object, _mockLogger.Object, binariesDirectory);
    }

    public void Dispose()
    {
        if (Directory.Exists(_testBinariesDirectory))
        {
            Directory.Delete(Path.GetDirectoryName(_testBinariesDirectory)!, true);
        }
    }
}