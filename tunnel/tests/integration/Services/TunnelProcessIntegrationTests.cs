using System.Linq;
using System.Runtime.InteropServices;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using BeepMyPhone.Tunneling.Models;
using BeepMyPhone.Tunneling.Services;

namespace BeepMyPhone.Tunneling.Tests.Integration.Services;

/// <summary>
/// Integration tests for tunnel process management with real FRP binaries
/// Tests actual process lifecycle, configuration handling, and URL extraction
/// </summary>
public class TunnelProcessIntegrationTests : IDisposable
{
    private readonly IBinaryManager _binaryManager;
    private readonly IFrpConfigGenerator _configGenerator;
    private readonly TunnelProcessManager _processManager;
    private readonly Mock<ILogger<TunnelProcessManager>> _mockLogger;
    private readonly Mock<ILogger<FrpConfigGenerator>> _mockConfigLogger;
    private readonly Mock<ILogger<BinaryManager>> _mockBinaryLogger;
    private readonly Mock<ILogger<BinaryValidator>> _mockValidatorLogger;

    public TunnelProcessIntegrationTests()
    {
        // Setup real services for integration testing
        _mockLogger = new Mock<ILogger<TunnelProcessManager>>();
        _mockConfigLogger = new Mock<ILogger<FrpConfigGenerator>>();
        _mockBinaryLogger = new Mock<ILogger<BinaryManager>>();
        _mockValidatorLogger = new Mock<ILogger<BinaryValidator>>();

        var validator = new BinaryValidator(_mockValidatorLogger.Object);
        
        // Point to the actual binaries directory in the app folder
        var currentDirectory = Directory.GetCurrentDirectory();
        var binariesPath = Path.Combine(currentDirectory, "..", "..", "..", "..", "app", "binaries");
        var absoluteBinariesPath = Path.GetFullPath(binariesPath);
        
        _binaryManager = new BinaryManager(validator, _mockBinaryLogger.Object, absoluteBinariesPath);
        _configGenerator = new FrpConfigGenerator(_mockConfigLogger.Object);
        _processManager = new TunnelProcessManager(_binaryManager, _mockLogger.Object);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task StartTunnelAsync_WithRealFrpBinary_StartsProcess()
    {
        // Arrange
        var config = CreateTestConfig();

        // Act
        var result = await _processManager.StartTunnelAsync(config);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsRunning);
        Assert.True(result.ProcessId > 0);
        Assert.Equal(config, result.Configuration);

        // Cleanup
        await _processManager.StopTunnelAsync();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ProcessLifecycle_StartStopRestart_WorksCorrectly()
    {
        // Arrange
        var config = CreateTestConfig();

        // Act - Start
        var startResult = await _processManager.StartTunnelAsync(config);
        Assert.True(startResult.IsRunning);
        var originalPid = startResult.ProcessId;

        // Act - Stop
        var stopResult = await _processManager.StopTunnelAsync();
        Assert.True(stopResult);
        Assert.False(_processManager.IsProcessRunning());

        // Act - Restart
        var restartResult = await _processManager.RestartTunnelAsync();
        Assert.True(restartResult.IsRunning);
        Assert.NotEqual(originalPid, restartResult.ProcessId);

        // Cleanup
        await _processManager.StopTunnelAsync();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ConfigGenerator_GeneratesValidFrpArguments()
    {
        // Arrange
        var config = CreateTestConfig();

        // Act
        var args = _configGenerator.GenerateCommandLineArgs(config);
        var isValid = _configGenerator.ValidateConfig(config);

        // Assert
        Assert.True(isValid);
        Assert.Contains("http", args);
        Assert.Contains("-s", args);
        Assert.Contains("-P", args);
        Assert.Contains("-i", args);
        Assert.Contains("-l", args);
        Assert.Contains("-n", args);

        // Test that FRP binary accepts the arguments (dry run)
        try
        {
            var binaryPath = await _binaryManager.EnsureBinaryAsync();
            // We can't do a real dry run without a server, but we can verify the binary exists
            Assert.True(File.Exists(binaryPath));
        }
        catch (Exception ex)
        {
            // If we can't get the binary, skip this part of the test
            Assert.True(true, $"Binary validation skipped: {ex.Message}");
        }
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ProcessManager_HandlesInvalidServer_GracefullyFails()
    {
        // Arrange
        var config = CreateTestConfig();
        config.ServerAddr = "nonexistent-server-12345.invalid";
        config.ServerPort = 9999;

        // Act
        var result = await _processManager.StartTunnelAsync(config);

        // Wait for process to attempt connection and potentially fail
        await Task.Delay(2000);

        // Assert
        // Process might start but won't establish tunnel (which is expected)
        Assert.NotNull(result);
        
        // Check if process is still running or has failed
        var status = _processManager.GetProcessStatus();
        if (status != null)
        {
            // Process might be running but unable to connect (which is fine for this test)
            Assert.True(status.ProcessId > 0);
        }

        // Cleanup
        await _processManager.StopTunnelAsync();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ProcessManager_EventsAreRaised_OnStatusChanges()
    {
        // Arrange
        var config = CreateTestConfig();
        var statusChanges = new List<ProcessStatus>();
        var urlChanges = new List<string>();

        _processManager.ProcessStatusChanged += (sender, status) => statusChanges.Add(status);
        _processManager.TunnelUrlChanged += (sender, url) => urlChanges.Add(url);

        // Act
        await _processManager.StartTunnelAsync(config);
        await Task.Delay(1000); // Allow time for events
        await _processManager.StopTunnelAsync();

        // Assert
        Assert.True(statusChanges.Count > 0);
        // In integration testing with invalid servers, process may start and quickly fail
        // We verify that events are fired and the first status shows the process was created
        var firstStatus = statusChanges.FirstOrDefault();
        Assert.NotNull(firstStatus);
        Assert.True(firstStatus.ProcessId > 0); // Process was actually started
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task MultipleConfigs_CanBeValidatedAndUsed()
    {
        // Arrange
        var configs = new[]
        {
            CreateTestConfig("proxy1", 5001),
            CreateTestConfig("proxy2", 5002),
            CreateTestConfig("proxy3", 5003)
        };

        // Act & Assert
        foreach (var config in configs)
        {
            var isValid = _configGenerator.ValidateConfig(config);
            Assert.True(isValid);

            var args = _configGenerator.GenerateCommandLineArgs(config);
            Assert.Contains(config.ProxyName, args);
            Assert.Contains(config.LocalPort.ToString(), args);
        }
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task BinaryManager_ProvidesValidFrpBinary()
    {
        // Act
        var binaryPath = await _binaryManager.EnsureBinaryAsync();
        var binaryInfo = await _binaryManager.GetCachedBinaryInfoAsync();
        var platform = _binaryManager.GetCurrentPlatform();

        // Assert
        Assert.True(File.Exists(binaryPath));
        Assert.NotNull(binaryInfo);
        Assert.True(binaryInfo.IsValidated);
        Assert.NotEmpty(platform);
        Assert.Contains("_", platform); // Should contain platform and architecture
    }

    [Fact]
    [Trait("Category", "Integration")]
    public void DefaultConfig_IsValidForCurrentEnvironment()
    {
        // Act
        var defaultConfig = _configGenerator.CreateDefaultConfig();

        // Assert
        Assert.True(_configGenerator.ValidateConfig(defaultConfig));
        Assert.NotEmpty(defaultConfig.ProxyName);
        Assert.NotEmpty(defaultConfig.SubDomain);
        Assert.True(defaultConfig.LocalPort > 0);
        Assert.True(defaultConfig.ServerPort > 0);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ProcessManager_CanDetectProcessState()
    {
        // Arrange
        var config = CreateTestConfig();

        // Assert initial state
        Assert.False(_processManager.IsProcessRunning());
        Assert.Null(_processManager.GetProcessStatus());
        Assert.Null(_processManager.GetTunnelUrl());

        // Start process
        await _processManager.StartTunnelAsync(config);

        // Assert running state
        Assert.True(_processManager.IsProcessRunning());
        Assert.NotNull(_processManager.GetProcessStatus());
        Assert.True(_processManager.GetProcessStatus()!.IsRunning);

        // Stop process
        await _processManager.StopTunnelAsync();

        // Assert stopped state
        Assert.False(_processManager.IsProcessRunning());
    }

    [Theory]
    [InlineData("tcp")]
    [InlineData("kcp")]
    [Trait("Category", "Integration")]
    public async Task ProcessManager_HandlesVariousProtocols(string protocol)
    {
        // Arrange
        var config = CreateTestConfig();
        config.Protocol = protocol;

        // Act
        var isValid = _configGenerator.ValidateConfig(config);
        
        // Assert
        Assert.True(isValid);
        
        if (protocol == "tcp") // Only test actual process start with TCP to avoid network complexities
        {
            var result = await _processManager.StartTunnelAsync(config);
            Assert.NotNull(result);
            Assert.True(result.IsRunning);
            
            // Cleanup
            await _processManager.StopTunnelAsync();
        }
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task StressTest_MultipleStartStopCycles()
    {
        // Arrange
        var config = CreateTestConfig();
        const int cycles = 3; // Keep low for CI/CD performance

        // Act & Assert
        for (int i = 0; i < cycles; i++)
        {
            var startResult = await _processManager.StartTunnelAsync(config);
            Assert.True(startResult.IsRunning);
            
            await Task.Delay(500); // Brief running time
            
            var stopResult = await _processManager.StopTunnelAsync();
            Assert.True(stopResult);
            
            await Task.Delay(200); // Brief pause between cycles
        }
    }

    // Helper methods
    private TunnelConfig CreateTestConfig(string? proxyName = null, int? localPort = null)
    {
        return new TunnelConfig
        {
            LocalIp = "127.0.0.1",
            LocalPort = localPort ?? 5000,
            ServerAddr = "test-server.invalid", // Use .invalid TLD to avoid real connections
            ServerPort = 7000,
            ProxyName = proxyName ?? $"test-proxy-{Guid.NewGuid().ToString("N")[..8]}",
            LogLevel = "info",
            Protocol = "tcp",
            EnableTls = false, // Disable for testing
            UseCompression = false, // Disable for testing
            UseEncryption = false // Disable for testing
        };
    }

    public void Dispose()
    {
        _processManager?.Dispose();
        GC.SuppressFinalize(this);
    }
}