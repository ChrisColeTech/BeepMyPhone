using System.Diagnostics;
using System.Reflection;
using System.Runtime.InteropServices;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using BeepMyPhone.Tunneling.Models;
using BeepMyPhone.Tunneling.Services;

namespace BeepMyPhone.Tunneling.Tests.Unit.Services;

/// <summary>
/// Comprehensive unit tests for TunnelProcessManager
/// Tests process lifecycle, configuration handling, and error scenarios
/// </summary>
public class TunnelProcessManagerTests : IDisposable
{
    private readonly Mock<IBinaryManager> _mockBinaryManager;
    private readonly Mock<ILogger<TunnelProcessManager>> _mockLogger;
    private readonly TunnelProcessManager _processManager;
    private readonly string _testBinaryPath;

    public TunnelProcessManagerTests()
    {
        _mockBinaryManager = new Mock<IBinaryManager>();
        _mockLogger = new Mock<ILogger<TunnelProcessManager>>();
        
        // Setup test binary path
        _testBinaryPath = GetTestBinaryPath();
        _mockBinaryManager.Setup(m => m.EnsureBinaryAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testBinaryPath);

        _processManager = new TunnelProcessManager(_mockBinaryManager.Object, _mockLogger.Object);
    }

    [Fact]
    public void Constructor_WithNullBinaryManager_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => 
            new TunnelProcessManager(null!, _mockLogger.Object));
    }

    [Fact]
    public void Constructor_WithNullLogger_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => 
            new TunnelProcessManager(_mockBinaryManager.Object, null!));
    }

    [Fact]
    public async Task StartTunnelAsync_WithNullConfig_ThrowsArgumentNullException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(
            () => _processManager.StartTunnelAsync(null!));
    }

    [Fact]
    public async Task StartTunnelAsync_WithInvalidConfig_ThrowsArgumentException()
    {
        // Arrange
        var invalidConfig = new TunnelConfig
        {
            LocalIp = "", // Invalid - empty
            LocalPort = 0, // Invalid - zero
            ServerAddr = "", // Invalid - empty
            ProxyName = "" // Invalid - empty
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _processManager.StartTunnelAsync(invalidConfig));
    }

    [Fact]
    public async Task StartTunnelAsync_WithValidConfig_ReturnsProcessStatus()
    {
        // Arrange
        var config = CreateValidConfig();
        SetupMockBinaryForEcho(); // Use echo command for testing

        // Act
        var result = await _processManager.StartTunnelAsync(config);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsRunning);
        Assert.True(result.ProcessId > 0);
        Assert.Equal(config, result.Configuration);
        Assert.True(result.StartTime <= DateTime.UtcNow);
        
        // Cleanup
        await _processManager.StopTunnelAsync();
    }

    [Fact]
    public async Task StartTunnelAsync_WhenAlreadyRunning_ReturnsExistingStatus()
    {
        // Arrange
        var config = CreateValidConfig();
        SetupMockBinaryForEcho();

        // Start first process
        var firstResult = await _processManager.StartTunnelAsync(config);

        // Act - Try to start again
        var secondResult = await _processManager.StartTunnelAsync(config);

        // Assert
        Assert.Equal(firstResult.ProcessId, secondResult.ProcessId);
        
        // Cleanup
        await _processManager.StopTunnelAsync();
    }

    [Fact]
    public void GetProcessStatus_WhenNoProcessRunning_ReturnsNull()
    {
        // Act
        var result = _processManager.GetProcessStatus();

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetProcessStatus_WhenProcessRunning_ReturnsCurrentStatus()
    {
        // Arrange
        var config = CreateValidConfig();
        SetupMockBinaryForEcho();

        await _processManager.StartTunnelAsync(config);

        // Act
        var result = _processManager.GetProcessStatus();

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsRunning);
        Assert.True(result.ProcessId > 0);
        
        // Cleanup
        await _processManager.StopTunnelAsync();
    }

    [Fact]
    public void IsProcessRunning_WhenNoProcess_ReturnsFalse()
    {
        // Act
        var result = _processManager.IsProcessRunning();

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task IsProcessRunning_WhenProcessActive_ReturnsTrue()
    {
        // Arrange
        var config = CreateValidConfig();
        SetupMockBinaryForEcho();

        await _processManager.StartTunnelAsync(config);

        // Act
        var result = _processManager.IsProcessRunning();

        // Assert
        Assert.True(result);
        
        // Cleanup
        await _processManager.StopTunnelAsync();
    }

    [Fact]
    public async Task StopTunnelAsync_WhenNoProcessRunning_ReturnsTrue()
    {
        // Act
        var result = await _processManager.StopTunnelAsync();

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task StopTunnelAsync_WhenProcessRunning_StopsProcessAndReturnsTrue()
    {
        // Arrange
        var config = CreateValidConfig();
        SetupMockBinaryForEcho();

        await _processManager.StartTunnelAsync(config);
        Assert.True(_processManager.IsProcessRunning());

        // Act
        var result = await _processManager.StopTunnelAsync();

        // Assert
        Assert.True(result);
        Assert.False(_processManager.IsProcessRunning());
    }

    [Fact]
    public async Task RestartTunnelAsync_WithoutPreviousConfig_ThrowsInvalidOperationException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _processManager.RestartTunnelAsync());
    }

    [Fact]
    public async Task RestartTunnelAsync_WithPreviousConfig_RestartsProcess()
    {
        // Arrange
        var config = CreateValidConfig();
        SetupMockBinaryForEcho();

        var initialStatus = await _processManager.StartTunnelAsync(config);
        var initialPid = initialStatus.ProcessId;

        // Act
        var restartedStatus = await _processManager.RestartTunnelAsync();

        // Assert
        Assert.NotNull(restartedStatus);
        Assert.True(restartedStatus.IsRunning);
        // Process ID should be different after restart
        Assert.NotEqual(initialPid, restartedStatus.ProcessId);
        
        // Cleanup
        await _processManager.StopTunnelAsync();
    }

    [Fact]
    public void GetTunnelUrl_WhenNoProcess_ReturnsNull()
    {
        // Act
        var result = _processManager.GetTunnelUrl();

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task TunnelUrlChanged_Event_FiredWhenUrlDetected()
    {
        // Arrange
        var config = CreateValidConfig();
        SetupMockBinaryForEcho();

        string? capturedUrl = null;
        _processManager.TunnelUrlChanged += (sender, url) => capturedUrl = url;

        // Start the process first
        await _processManager.StartTunnelAsync(config);
        
        // Simulate URL detection by accessing the internal method via reflection
        // This tests that the event firing mechanism works correctly
        var processManagerType = _processManager.GetType();
        var updateTunnelUrlMethod = processManagerType.GetMethod("UpdateTunnelUrl", 
            BindingFlags.NonPublic | BindingFlags.Instance);
        
        if (updateTunnelUrlMethod != null)
        {
            updateTunnelUrlMethod.Invoke(_processManager, new object[] { "http://test-tunnel-url.example.com" });
        }

        // Assert
        Assert.NotNull(capturedUrl);
        Assert.Contains("http", capturedUrl);
        
        // Cleanup
        await _processManager.StopTunnelAsync();
    }

    [Fact]
    public async Task ProcessStatusChanged_Event_FiredOnStatusChanges()
    {
        // Arrange
        var config = CreateValidConfig();
        SetupMockBinaryForEcho();

        var statusChanges = new List<ProcessStatus>();
        _processManager.ProcessStatusChanged += (sender, status) => statusChanges.Add(status);

        // Act
        await _processManager.StartTunnelAsync(config);
        await _processManager.StopTunnelAsync();

        // Assert
        Assert.True(statusChanges.Count >= 1); // At least start event
        // Check that we captured at least one status change event
        Assert.Contains(statusChanges, s => s != null);
        // Verify that the first status shows the process was started (even if it exited quickly)
        var firstStatus = statusChanges.FirstOrDefault();
        Assert.NotNull(firstStatus);
        Assert.True(firstStatus.ProcessId > 0); // Process was actually started
    }

    [Fact]
    public async Task Dispose_StopsRunningProcess()
    {
        // Arrange
        var config = CreateValidConfig();
        SetupMockBinaryForEcho();

        // Start a process
        await _processManager.StartTunnelAsync(config);

        // Act
        _processManager.Dispose();

        // Assert
        Assert.False(_processManager.IsProcessRunning());
    }

    [Theory]
    [InlineData("127.0.0.1", 5000, "test-server", 7000, "test-proxy")]
    [InlineData("localhost", 3000, "frp.example.com", 7001, "web-proxy")]
    public async Task StartTunnelAsync_WithDifferentConfigs_HandlesCorrectly(
        string localIp, int localPort, string serverAddr, int serverPort, string proxyName)
    {
        // Arrange
        var config = new TunnelConfig
        {
            LocalIp = localIp,
            LocalPort = localPort,
            ServerAddr = serverAddr,
            ServerPort = serverPort,
            ProxyName = proxyName
        };
        SetupMockBinaryForEcho();

        // Act
        var result = await _processManager.StartTunnelAsync(config);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.ProcessId > 0); // Process was started successfully
        Assert.Equal(config, result.Configuration);
        
        // Cleanup
        await _processManager.StopTunnelAsync();
    }

    [Fact]
    public async Task StartTunnelAsync_WithBinaryManagerFailure_ThrowsException()
    {
        // Arrange
        var config = CreateValidConfig();
        _mockBinaryManager.Setup(m => m.EnsureBinaryAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new FileNotFoundException("Binary not found"));

        // Act & Assert
        await Assert.ThrowsAsync<FileNotFoundException>(
            () => _processManager.StartTunnelAsync(config));
    }

    // Helper methods
    private TunnelConfig CreateValidConfig()
    {
        return new TunnelConfig
        {
            LocalIp = "127.0.0.1",
            LocalPort = 5000,
            ServerAddr = "test-server.example.com",
            ServerPort = 7000,
            ProxyName = "test-proxy",
            LogLevel = "info"
        };
    }

    private string GetTestBinaryPath()
    {
        // Use a simple command that exists on all platforms for testing
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            return "cmd.exe";
        }
        else
        {
            return "/bin/echo";
        }
    }

    private void SetupMockBinaryForEcho()
    {
        // Configure mock to return path to echo command for testing
        var echoPath = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "cmd.exe" : "/bin/echo";
        _mockBinaryManager.Setup(m => m.EnsureBinaryAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(echoPath);
    }

    private void SetupMockBinaryForUrlOutput()
    {
        // For testing URL extraction, we'd need a mock process that outputs tunnel URLs
        // This is a simplified version - in real tests we'd need more sophisticated mocking
        SetupMockBinaryForEcho();
    }


    public void Dispose()
    {
        _processManager?.Dispose();
        GC.SuppressFinalize(this);
    }
}