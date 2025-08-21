using System.Runtime.InteropServices;
using System.Text.Json;
using BeepMyPhone.Tunneling.Models;

namespace BeepMyPhone.Tunneling.Services;

/// <summary>
/// Main service for managing bundled FRP binaries
/// Implements Single Responsibility Principle by focusing on binary selection and validation
/// </summary>
public class BinaryManager : IBinaryManager
{
    private readonly IBinaryValidator _validator;
    private readonly ILogger<BinaryManager> _logger;
    private readonly string _bundledBinariesDirectory;

    public BinaryManager(
        IBinaryValidator validator,
        ILogger<BinaryManager> logger,
        string? binariesDirectoryPath = null)
    {
        _validator = validator ?? throw new ArgumentNullException(nameof(validator));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        // Use provided path or default to bundled binaries directory relative to application
        _bundledBinariesDirectory = binariesDirectoryPath ?? Path.Combine(AppContext.BaseDirectory, "binaries");
        
        if (!Directory.Exists(_bundledBinariesDirectory))
        {
            throw new DirectoryNotFoundException(
                $"Bundled binaries directory not found: {_bundledBinariesDirectory}");
        }
        
        _logger.LogInformation("Using bundled binaries directory: {BinariesDirectory}", _bundledBinariesDirectory);
    }

    public async Task<string> EnsureBinaryAsync(CancellationToken cancellationToken = default)
    {
        var platform = GetCurrentPlatform();
        var binaryPath = GetBundledBinaryPath(platform);
        
        // Verify bundled binary exists
        if (!File.Exists(binaryPath))
        {
            throw new FileNotFoundException(
                $"Bundled FRP binary not found for platform {platform}: {binaryPath}");
        }

        // Ensure executable permissions on Unix systems
        _validator.MakeExecutable(binaryPath);
        
        // Create binary info for the bundled binary
        var binaryInfo = new BinaryInfo
        {
            Platform = platform,
            FilePath = binaryPath,
            Version = "0.64.0", // Bundled version
            IsValidated = true,
            IsExecutable = _validator.IsExecutable(binaryPath),
            Checksum = await _validator.GetFileChecksumAsync(binaryPath) // Calculate checksum
        };

        _logger.LogInformation("Using bundled FRP binary: {Path} (Platform: {Platform})", 
            binaryPath, platform);
        
        return binaryPath;
    }

    public async Task<BinaryInfo?> GetCachedBinaryInfoAsync(CancellationToken cancellationToken = default)
    {
        var platform = GetCurrentPlatform();
        var binaryPath = GetBundledBinaryPath(platform);

        if (!File.Exists(binaryPath))
            return null;

        try
        {
            // Return binary info for bundled binary
            var binaryInfo = new BinaryInfo
            {
                Platform = platform,
                FilePath = binaryPath,
                Version = "0.64.0", // Bundled version
                IsValidated = true,
                IsExecutable = _validator.IsExecutable(binaryPath),
                Checksum = await _validator.GetFileChecksumAsync(binaryPath)
            };
            
            return binaryInfo;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get bundled binary info for {Platform}", platform);
            return null;
        }
    }

    public async Task<bool> ValidateBinaryAsync(string binaryPath, string expectedChecksum, CancellationToken cancellationToken = default)
    {
        return await _validator.ValidateAsync(binaryPath, expectedChecksum);
    }

    public Task ClearCacheAsync(CancellationToken cancellationToken = default)
    {
        // No cache to clear with bundled binaries approach
        _logger.LogInformation("No cache to clear - using bundled binaries");
        return Task.CompletedTask;
    }

    public string GetCurrentPlatform()
    {
        var architecture = RuntimeInformation.OSArchitecture;
        var archString = architecture switch
        {
            Architecture.X64 => "amd64",
            Architecture.X86 => "386",
            Architecture.Arm64 => "arm64",
            Architecture.Arm => "arm",
            _ => "amd64" // Default fallback
        };

        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            return $"windows_{archString}";
        
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            return $"linux_{archString}";
            
        if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            return $"darwin_{archString}";

        // Fallback for unknown platforms
        return $"linux_{archString}";
    }

    private string GetBundledBinaryPath(string platform)
    {
        var fileName = $"frpc_{platform}";
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            fileName += ".exe";
        }
        return Path.Combine(_bundledBinariesDirectory, fileName);
    }
}