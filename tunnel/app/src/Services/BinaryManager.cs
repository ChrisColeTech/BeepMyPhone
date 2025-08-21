using System.Runtime.InteropServices;
using System.Text.Json;
using BeepMyPhone.Tunneling.Models;

namespace BeepMyPhone.Tunneling.Services;

/// <summary>
/// Main service for managing FRP binary lifecycle including download, validation, and caching
/// Implements Single Responsibility Principle by focusing on binary management orchestration
/// </summary>
public class BinaryManager : IBinaryManager
{
    private readonly IBinaryDownloader _downloader;
    private readonly BinaryValidator _validator;
    private readonly ILogger<BinaryManager> _logger;
    private readonly string _cacheDirectory;

    public BinaryManager(
        IBinaryDownloader downloader, 
        BinaryValidator validator,
        ILogger<BinaryManager> logger)
    {
        _downloader = downloader ?? throw new ArgumentNullException(nameof(downloader));
        _validator = validator ?? throw new ArgumentNullException(nameof(validator));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        // Create cache directory in app data folder (following BeepMyPhone pattern)
        var appDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), 
            "BeepMyPhone", 
            "tunnel", 
            "binaries");
        
        Directory.CreateDirectory(appDataPath);
        _cacheDirectory = appDataPath;
        
        _logger.LogInformation("Binary cache directory: {CacheDirectory}", _cacheDirectory);
    }

    public async Task<string> EnsureBinaryAsync(CancellationToken cancellationToken = default)
    {
        var platform = GetCurrentPlatform();
        var binaryPath = GetBinaryPath(platform);
        
        // Check if we have a valid cached binary
        var cachedInfo = await GetCachedBinaryInfoAsync(cancellationToken);
        if (cachedInfo != null && cachedInfo.IsValidated && File.Exists(cachedInfo.FilePath))
        {
            _logger.LogDebug("Using cached FRP binary: {Path}", cachedInfo.FilePath);
            return cachedInfo.FilePath;
        }

        // Download or validate existing binary
        BinaryInfo binaryInfo;
        if (File.Exists(binaryPath))
        {
            // Try to get info for existing binary and validate it
            binaryInfo = await GetLatestBinaryInfoAsync(platform, cancellationToken);
            if (!await _validator.ValidateAsync(binaryPath, binaryInfo.Checksum))
            {
                _logger.LogWarning("Cached binary failed validation, re-downloading");
                File.Delete(binaryPath);
                binaryInfo = await _downloader.DownloadLatestAsync(platform, binaryPath, cancellationToken);
            }
            else
            {
                binaryInfo.FilePath = binaryPath;
                binaryInfo.IsValidated = true;
            }
        }
        else
        {
            // Download fresh binary
            _logger.LogInformation("Downloading FRP binary for platform: {Platform}", platform);
            binaryInfo = await _downloader.DownloadLatestAsync(platform, binaryPath, cancellationToken);
        }

        // Final validation
        if (!await _validator.ValidateAsync(binaryInfo.FilePath, binaryInfo.Checksum))
        {
            throw new InvalidOperationException($"Downloaded binary failed validation: {binaryInfo.FilePath}");
        }

        // Ensure executable permissions
        _validator.MakeExecutable(binaryInfo.FilePath);
        binaryInfo.IsValidated = true;
        binaryInfo.IsExecutable = _validator.IsExecutable(binaryInfo.FilePath);

        // Cache the binary info
        await SaveBinaryInfoAsync(binaryInfo, cancellationToken);

        _logger.LogInformation("FRP binary ready: {Path} (Version: {Version})", 
            binaryInfo.FilePath, binaryInfo.Version);
        
        return binaryInfo.FilePath;
    }

    public async Task<BinaryInfo?> GetCachedBinaryInfoAsync(CancellationToken cancellationToken = default)
    {
        var platform = GetCurrentPlatform();
        var infoPath = GetBinaryInfoPath(platform);

        if (!File.Exists(infoPath))
            return null;

        try
        {
            var jsonContent = await File.ReadAllTextAsync(infoPath, cancellationToken);
            var binaryInfo = JsonSerializer.Deserialize<BinaryInfo>(jsonContent);
            
            // Verify the cached file still exists
            if (binaryInfo != null && File.Exists(binaryInfo.FilePath))
            {
                return binaryInfo;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to read cached binary info from {Path}", infoPath);
        }

        return null;
    }

    public async Task<bool> ValidateBinaryAsync(string binaryPath, string expectedChecksum, CancellationToken cancellationToken = default)
    {
        return await _validator.ValidateAsync(binaryPath, expectedChecksum);
    }

    public async Task ClearCacheAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (Directory.Exists(_cacheDirectory))
            {
                var files = Directory.GetFiles(_cacheDirectory, "*", SearchOption.AllDirectories);
                foreach (var file in files)
                {
                    File.Delete(file);
                }
                _logger.LogInformation("Cleared binary cache directory");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clear binary cache");
            throw;
        }
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

    private string GetBinaryPath(string platform)
    {
        var fileName = $"frpc_{platform}";
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            fileName += ".exe";
        }
        return Path.Combine(_cacheDirectory, fileName);
    }

    private string GetBinaryInfoPath(string platform)
    {
        return Path.Combine(_cacheDirectory, $"frpc_{platform}_info.json");
    }

    private async Task<BinaryInfo> GetLatestBinaryInfoAsync(string platform, CancellationToken cancellationToken)
    {
        return await _downloader.GetLatestVersionInfoAsync(platform, cancellationToken);
    }

    private async Task SaveBinaryInfoAsync(BinaryInfo binaryInfo, CancellationToken cancellationToken)
    {
        try
        {
            var infoPath = GetBinaryInfoPath(binaryInfo.Platform);
            var jsonContent = JsonSerializer.Serialize(binaryInfo, new JsonSerializerOptions 
            { 
                WriteIndented = true 
            });
            await File.WriteAllTextAsync(infoPath, jsonContent, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to save binary info cache");
        }
    }
}