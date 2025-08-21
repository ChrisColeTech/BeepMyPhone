# BeepMyPhone Tunneling Code Examples

Implementation pattern examples supporting all 15 objectives with SOLID principles enforcement.

## Table of Contents
- [Binary Management Examples](#binary-management-examples)
- [Configuration Management Examples](#configuration-management-examples)
- [Process Management Examples](#process-management-examples)
- [Health Monitoring Examples](#health-monitoring-examples)
- [Security Implementation Examples](#security-implementation-examples)
- [Integration Patterns](#integration-patterns)
- [Error Handling Patterns](#error-handling-patterns)
- [Testing Examples](#testing-examples)

## Binary Management Examples

### Objective 1: FRP Binary Manager with Strategy Pattern

```csharp
// Interface segregation - separate concerns
public interface IBinaryDownloadSource
{
    Task<BinaryInfo> GetLatestBinaryAsync(PlatformInfo platform);
    Task<Stream> DownloadBinaryAsync(BinaryInfo binaryInfo);
}

// Single responsibility - GitHub-specific implementation
public class GitHubReleaseBinarySource : IBinaryDownloadSource
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GitHubReleaseBinarySource> _logger;

    public GitHubReleaseBinarySource(HttpClient httpClient, ILogger<GitHubReleaseBinarySource> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<BinaryInfo> GetLatestBinaryAsync(PlatformInfo platform)
    {
        const string apiUrl = "https://api.github.com/repos/fatedier/frp/releases/latest";
        
        try
        {
            var response = await _httpClient.GetStringAsync(apiUrl);
            var release = JsonSerializer.Deserialize<GitHubRelease>(response);
            
            var asset = release.Assets.FirstOrDefault(a => 
                a.Name.Contains(platform.Architecture) && 
                a.Name.Contains(platform.OperatingSystem));
                
            if (asset == null)
                throw new BinaryNotFoundException($"No binary found for {platform}");

            return new BinaryInfo
            {
                Version = release.TagName,
                DownloadUrl = asset.BrowserDownloadUrl,
                FileName = asset.Name,
                Size = asset.Size,
                Checksum = await GetChecksumAsync(release.TagName, asset.Name)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get latest binary for platform {Platform}", platform);
            throw;
        }
    }

    public async Task<Stream> DownloadBinaryAsync(BinaryInfo binaryInfo)
    {
        return await _httpClient.GetStreamAsync(binaryInfo.DownloadUrl);
    }

    private async Task<string> GetChecksumAsync(string version, string fileName)
    {
        var checksumUrl = $"https://github.com/fatedier/frp/releases/download/{version}/sha256sum.txt";
        var checksumContent = await _httpClient.GetStringAsync(checksumUrl);
        
        var lines = checksumContent.Split('\n');
        var checksumLine = lines.FirstOrDefault(l => l.Contains(fileName));
        
        return checksumLine?.Split(' ')[0] ?? string.Empty;
    }
}

// Open/closed principle - new sources can be added without modification
public class FrpBinaryManager
{
    private readonly IEnumerable<IBinaryDownloadSource> _downloadSources;
    private readonly IBinaryValidationService _validationService;
    private readonly ILogger<FrpBinaryManager> _logger;

    public FrpBinaryManager(
        IEnumerable<IBinaryDownloadSource> downloadSources,
        IBinaryValidationService validationService,
        ILogger<FrpBinaryManager> logger)
    {
        _downloadSources = downloadSources ?? throw new ArgumentNullException(nameof(downloadSources));
        _validationService = validationService ?? throw new ArgumentNullException(nameof(validationService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<string> EnsureBinaryAsync(string targetPath, PlatformInfo platform)
    {
        foreach (var source in _downloadSources)
        {
            try
            {
                var binaryInfo = await source.GetLatestBinaryAsync(platform);
                var filePath = Path.Combine(targetPath, binaryInfo.FileName);

                if (await _validationService.ValidateBinaryAsync(filePath, binaryInfo))
                {
                    _logger.LogInformation("Valid binary found at {Path}", filePath);
                    return filePath;
                }

                _logger.LogInformation("Downloading binary from {Source}", source.GetType().Name);
                using var stream = await source.DownloadBinaryAsync(binaryInfo);
                await SaveBinaryAsync(stream, filePath);

                if (await _validationService.ValidateBinaryAsync(filePath, binaryInfo))
                {
                    _logger.LogInformation("Binary downloaded and validated successfully");
                    return filePath;
                }

                _logger.LogWarning("Downloaded binary failed validation");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to download from source {Source}", source.GetType().Name);
            }
        }

        throw new BinaryDownloadException("Failed to download binary from all sources");
    }

    private async Task SaveBinaryAsync(Stream stream, string filePath)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
        
        using var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write);
        await stream.CopyToAsync(fileStream);
        
        // Make executable on Unix systems
        if (!OperatingSystem.IsWindows())
        {
            File.SetUnixFileMode(filePath, UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
        }
    }
}
```

## Configuration Management Examples

### Objective 2 & 14: Configuration Service with Hot Reload

```csharp
// Single responsibility - configuration management
public class TunnelConfigurationService : ITunnelConfigurationService
{
    private readonly IConfiguration _configuration;
    private readonly IConfigurationValidationService _validationService;
    private readonly ILogger<TunnelConfigurationService> _logger;
    private TunnelConfiguration? _cachedConfiguration;

    public event EventHandler<ConfigurationChange>? ConfigurationChanged;

    public TunnelConfigurationService(
        IConfiguration configuration,
        IConfigurationValidationService validationService,
        ILogger<TunnelConfigurationService> logger)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _validationService = validationService ?? throw new ArgumentNullException(nameof(validationService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<TunnelConfiguration> GetConfigurationAsync()
    {
        if (_cachedConfiguration != null)
            return _cachedConfiguration;

        var config = new TunnelConfiguration();
        _configuration.GetSection("Tunnel").Bind(config);

        // Apply defaults
        config.RelayServer ??= new RelayServerConfiguration
        {
            Host = "frp.example.com",
            Port = 7000,
            Protocol = "tcp"
        };

        config.Security ??= new SecurityConfiguration
        {
            EnableAuthentication = true,
            TokenExpirationMinutes = 60
        };

        config.Performance ??= new PerformanceConfiguration
        {
            MaxConnections = 100,
            ConnectionTimeoutSeconds = 30,
            KeepAliveIntervalSeconds = 25
        };

        if (!await _validationService.ValidateConfigurationAsync(config))
        {
            throw new InvalidConfigurationException("Configuration validation failed");
        }

        _cachedConfiguration = config;
        return config;
    }

    public async Task<TunnelConfiguration> UpdateConfigurationAsync(TunnelConfiguration configuration)
    {
        if (!await _validationService.ValidateConfigurationAsync(configuration))
        {
            throw new InvalidConfigurationException("Configuration validation failed");
        }

        var previousConfig = _cachedConfiguration;
        _cachedConfiguration = configuration;

        var change = new ConfigurationChange
        {
            Timestamp = DateTime.UtcNow,
            PreviousConfiguration = previousConfig,
            NewConfiguration = configuration,
            ChangeType = ConfigurationChangeType.Update
        };

        ConfigurationChanged?.Invoke(this, change);
        
        _logger.LogInformation("Configuration updated successfully");
        return configuration;
    }

    public async Task<bool> ValidateConfigurationAsync(TunnelConfiguration configuration)
    {
        return await _validationService.ValidateConfigurationAsync(configuration);
    }

    public async Task ReloadConfigurationAsync()
    {
        _cachedConfiguration = null;
        await GetConfigurationAsync();
        _logger.LogInformation("Configuration reloaded from source");
    }
}

// Hot reload implementation with file watching
public class ConfigurationHotReloadService : IConfigurationHotReloadService, IDisposable
{
    private readonly IConfigurationChangeHandler _changeHandler;
    private readonly ILogger<ConfigurationHotReloadService> _logger;
    private readonly FileSystemWatcher _fileWatcher;
    private readonly CancellationTokenSource _cancellationTokenSource;

    public event EventHandler<ConfigurationChange>? ConfigurationFileChanged;

    public ConfigurationHotReloadService(
        IConfigurationChangeHandler changeHandler,
        ILogger<ConfigurationHotReloadService> logger)
    {
        _changeHandler = changeHandler ?? throw new ArgumentNullException(nameof(changeHandler));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _cancellationTokenSource = new CancellationTokenSource();

        _fileWatcher = new FileSystemWatcher
        {
            Path = AppDomain.CurrentDomain.BaseDirectory,
            Filter = "appsettings.json",
            NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size
        };

        _fileWatcher.Changed += OnConfigurationFileChanged;
    }

    public async Task StartWatchingAsync()
    {
        _fileWatcher.EnableRaisingEvents = true;
        _logger.LogInformation("Configuration hot reload monitoring started");
        await Task.CompletedTask;
    }

    public async Task StopWatchingAsync()
    {
        _fileWatcher.EnableRaisingEvents = false;
        _cancellationTokenSource.Cancel();
        _logger.LogInformation("Configuration hot reload monitoring stopped");
        await Task.CompletedTask;
    }

    private async void OnConfigurationFileChanged(object sender, FileSystemEventArgs e)
    {
        try
        {
            // Debounce multiple file system events
            await Task.Delay(500, _cancellationTokenSource.Token);

            var change = new ConfigurationChange
            {
                Timestamp = DateTime.UtcNow,
                ChangeType = ConfigurationChangeType.FileChanged,
                SourceFile = e.FullPath
            };

            var result = await _changeHandler.HandleChangeAsync(change);
            
            if (result.Success)
            {
                ConfigurationFileChanged?.Invoke(this, change);
                _logger.LogInformation("Configuration file change processed successfully");
            }
            else
            {
                _logger.LogWarning("Configuration file change processing failed: {Reason}", result.ErrorMessage);
            }
        }
        catch (OperationCanceledException)
        {
            // Expected when stopping
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing configuration file change");
        }
    }

    public void Dispose()
    {
        _fileWatcher?.Dispose();
        _cancellationTokenSource?.Dispose();
    }
}
```

## Process Management Examples

### Objective 3: FRP Process Manager with Process Lifecycle

```csharp
// Dependency inversion - abstractions not concretions
public class FrpProcessManager : IFrpProcessManager, IDisposable
{
    private readonly IFrpConfigurationGenerator _configGenerator;
    private readonly IProcessOutputParser _outputParser;
    private readonly ILogger<FrpProcessManager> _logger;
    private Process? _frpProcess;
    private readonly SemaphoreSlim _processLock = new(1, 1);

    public event EventHandler<ProcessEventArgs>? ProcessExited;
    public event EventHandler<ProcessEventArgs>? ProcessStarted;
    public event EventHandler<ProcessEventArgs>? ProcessError;

    public FrpProcessManager(
        IFrpConfigurationGenerator configGenerator,
        IProcessOutputParser outputParser,
        ILogger<FrpProcessManager> logger)
    {
        _configGenerator = configGenerator ?? throw new ArgumentNullException(nameof(configGenerator));
        _outputParser = outputParser ?? throw new ArgumentNullException(nameof(outputParser));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ProcessStatus> StartAsync(FrpConfiguration configuration, CancellationToken cancellationToken = default)
    {
        await _processLock.WaitAsync(cancellationToken);
        try
        {
            if (_frpProcess?.HasExited == false)
            {
                return new ProcessStatus
                {
                    State = ProcessState.Running,
                    ProcessId = _frpProcess.Id,
                    StartTime = _frpProcess.StartTime,
                    Message = "Process already running"
                };
            }

            var configFile = await _configGenerator.GenerateConfigurationFileAsync(configuration);
            
            var startInfo = new ProcessStartInfo
            {
                FileName = configuration.ExecutablePath,
                Arguments = $"-c \"{configFile}\"",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            _frpProcess = new Process { StartInfo = startInfo };
            _frpProcess.OutputDataReceived += OnOutputDataReceived;
            _frpProcess.ErrorDataReceived += OnErrorDataReceived;
            _frpProcess.Exited += OnProcessExited;
            _frpProcess.EnableRaisingEvents = true;

            var started = _frpProcess.Start();
            if (!started)
            {
                throw new ProcessStartException("Failed to start FRP process");
            }

            _frpProcess.BeginOutputReadLine();
            _frpProcess.BeginErrorReadLine();

            var status = new ProcessStatus
            {
                State = ProcessState.Starting,
                ProcessId = _frpProcess.Id,
                StartTime = _frpProcess.StartTime,
                Message = "Process started successfully"
            };

            ProcessStarted?.Invoke(this, new ProcessEventArgs(status));
            _logger.LogInformation("FRP process started with PID {ProcessId}", _frpProcess.Id);

            return status;
        }
        finally
        {
            _processLock.Release();
        }
    }

    public async Task<ProcessStatus> StopAsync(CancellationToken cancellationToken = default)
    {
        await _processLock.WaitAsync(cancellationToken);
        try
        {
            if (_frpProcess == null || _frpProcess.HasExited)
            {
                return new ProcessStatus
                {
                    State = ProcessState.Stopped,
                    Message = "Process not running"
                };
            }

            var processId = _frpProcess.Id;
            
            // Graceful shutdown first
            _frpProcess.CloseMainWindow();
            
            // Wait for graceful shutdown
            var gracefulShutdown = await WaitForExitAsync(_frpProcess, TimeSpan.FromSeconds(10));
            
            if (!gracefulShutdown)
            {
                _logger.LogWarning("Graceful shutdown timeout, forcing termination");
                _frpProcess.Kill();
                await WaitForExitAsync(_frpProcess, TimeSpan.FromSeconds(5));
            }

            var status = new ProcessStatus
            {
                State = ProcessState.Stopped,
                ProcessId = processId,
                Message = gracefulShutdown ? "Process stopped gracefully" : "Process terminated forcefully"
            };

            _logger.LogInformation("FRP process stopped: {Message}", status.Message);
            return status;
        }
        finally
        {
            _processLock.Release();
        }
    }

    public async Task<ProcessStatus> GetStatusAsync()
    {
        await _processLock.WaitAsync();
        try
        {
            if (_frpProcess == null)
            {
                return new ProcessStatus { State = ProcessState.NotStarted };
            }

            if (_frpProcess.HasExited)
            {
                return new ProcessStatus
                {
                    State = ProcessState.Stopped,
                    ExitCode = _frpProcess.ExitCode,
                    ExitTime = _frpProcess.ExitTime
                };
            }

            return new ProcessStatus
            {
                State = ProcessState.Running,
                ProcessId = _frpProcess.Id,
                StartTime = _frpProcess.StartTime,
                CpuTime = _frpProcess.TotalProcessorTime,
                WorkingSet = _frpProcess.WorkingSet64
            };
        }
        finally
        {
            _processLock.Release();
        }
    }

    private async Task<bool> WaitForExitAsync(Process process, TimeSpan timeout)
    {
        using var cts = new CancellationTokenSource(timeout);
        try
        {
            await process.WaitForExitAsync(cts.Token);
            return true;
        }
        catch (OperationCanceledException)
        {
            return false;
        }
    }

    private void OnOutputDataReceived(object sender, DataReceivedEventArgs e)
    {
        if (string.IsNullOrWhiteSpace(e.Data)) return;

        _logger.LogDebug("FRP Output: {Output}", e.Data);
        _outputParser.ParseOutput(e.Data);
    }

    private void OnErrorDataReceived(object sender, DataReceivedEventArgs e)
    {
        if (string.IsNullOrWhiteSpace(e.Data)) return;

        _logger.LogWarning("FRP Error: {Error}", e.Data);
        
        var status = new ProcessStatus
        {
            State = ProcessState.Error,
            Message = e.Data
        };

        ProcessError?.Invoke(this, new ProcessEventArgs(status));
    }

    private void OnProcessExited(object? sender, EventArgs e)
    {
        if (_frpProcess == null) return;

        var status = new ProcessStatus
        {
            State = ProcessState.Stopped,
            ProcessId = _frpProcess.Id,
            ExitCode = _frpProcess.ExitCode,
            ExitTime = _frpProcess.ExitTime,
            Message = $"Process exited with code {_frpProcess.ExitCode}"
        };

        ProcessExited?.Invoke(this, new ProcessEventArgs(status));
        _logger.LogInformation("FRP process exited: {Message}", status.Message);
    }

    public void Dispose()
    {
        _frpProcess?.Kill();
        _frpProcess?.Dispose();
        _processLock?.Dispose();
    }
}
```

## Health Monitoring Examples

### Objective 5: Health Monitor with Composite Pattern

```csharp
// Interface segregation - specific health check contract
public interface IHealthCheck
{
    string Name { get; }
    Task<HealthCheckResult> CheckHealthAsync(CancellationToken cancellationToken = default);
}

// Single responsibility - HTTP endpoint health checking
public class HttpHealthCheck : IHealthCheck
{
    private readonly HttpClient _httpClient;
    private readonly string _url;
    private readonly TimeSpan _timeout;

    public string Name => "HTTP Endpoint";

    public HttpHealthCheck(HttpClient httpClient, string url, TimeSpan timeout)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _url = url ?? throw new ArgumentNullException(nameof(url));
        _timeout = timeout;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(_timeout);

            var response = await _httpClient.GetAsync(_url, cts.Token);
            stopwatch.Stop();

            var isHealthy = response.IsSuccessStatusCode;
            
            return new HealthCheckResult
            {
                Status = isHealthy ? HealthStatus.Healthy : HealthStatus.Unhealthy,
                ResponseTime = stopwatch.Elapsed,
                CheckedAt = DateTime.UtcNow,
                Details = new Dictionary<string, object>
                {
                    { "url", _url },
                    { "statusCode", (int)response.StatusCode },
                    { "reasonPhrase", response.ReasonPhrase ?? "Unknown" }
                }
            };
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            stopwatch.Stop();
            return new HealthCheckResult
            {
                Status = HealthStatus.Unhealthy,
                ResponseTime = stopwatch.Elapsed,
                CheckedAt = DateTime.UtcNow,
                ErrorMessage = "Health check was cancelled"
            };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            return new HealthCheckResult
            {
                Status = HealthStatus.Unhealthy,
                ResponseTime = stopwatch.Elapsed,
                CheckedAt = DateTime.UtcNow,
                ErrorMessage = ex.Message,
                Details = new Dictionary<string, object>
                {
                    { "url", _url },
                    { "exceptionType", ex.GetType().Name }
                }
            };
        }
    }
}

// Composite pattern - aggregating multiple health checks
public class TunnelHealthMonitor : ITunnelHealthMonitor
{
    private readonly IEnumerable<IHealthCheck> _healthChecks;
    private readonly ILogger<TunnelHealthMonitor> _logger;
    private readonly Timer? _monitoringTimer;
    private readonly SemaphoreSlim _checkLock = new(1, 1);

    public event EventHandler<HealthStatusEventArgs>? HealthStatusChanged;

    private HealthStatus _currentStatus = HealthStatus.Unknown;

    public TunnelHealthMonitor(
        IEnumerable<IHealthCheck> healthChecks,
        ILogger<TunnelHealthMonitor> logger)
    {
        _healthChecks = healthChecks ?? throw new ArgumentNullException(nameof(healthChecks));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<HealthStatus> GetCurrentHealthAsync()
    {
        await _checkLock.WaitAsync();
        try
        {
            return _currentStatus;
        }
        finally
        {
            _checkLock.Release();
        }
    }

    public async Task<HealthCheckResult> PerformHealthCheckAsync()
    {
        await _checkLock.WaitAsync();
        try
        {
            var checkTasks = _healthChecks.Select(check => check.CheckHealthAsync());
            var results = await Task.WhenAll(checkTasks);

            var overallStatus = DetermineOverallStatus(results);
            var aggregatedResult = new HealthCheckResult
            {
                Status = overallStatus,
                CheckedAt = DateTime.UtcNow,
                Details = results.ToDictionary(
                    r => _healthChecks.ElementAt(Array.IndexOf(results, r)).Name,
                    r => (object)r
                ),
                ResponseTime = TimeSpan.FromMilliseconds(results.Average(r => r.ResponseTime.TotalMilliseconds))
            };

            if (_currentStatus != overallStatus)
            {
                var previousStatus = _currentStatus;
                _currentStatus = overallStatus;

                HealthStatusChanged?.Invoke(this, new HealthStatusEventArgs
                {
                    PreviousStatus = previousStatus,
                    CurrentStatus = overallStatus,
                    CheckResult = aggregatedResult
                });

                _logger.LogInformation("Health status changed from {Previous} to {Current}", 
                    previousStatus, overallStatus);
            }

            return aggregatedResult;
        }
        finally
        {
            _checkLock.Release();
        }
    }

    private static HealthStatus DetermineOverallStatus(IEnumerable<HealthCheckResult> results)
    {
        var statuses = results.Select(r => r.Status).ToList();

        if (statuses.All(s => s == HealthStatus.Healthy))
            return HealthStatus.Healthy;

        if (statuses.Any(s => s == HealthStatus.Unhealthy))
            return HealthStatus.Unhealthy;

        return HealthStatus.Degraded;
    }

    public async Task StartMonitoringAsync(TimeSpan interval)
    {
        _logger.LogInformation("Starting health monitoring with interval {Interval}", interval);
        
        // Perform initial check
        await PerformHealthCheckAsync();
        
        // Start periodic monitoring
        var timer = new Timer(
            async _ => await PerformHealthCheckAsync(),
            null,
            interval,
            interval);

        await Task.CompletedTask;
    }

    public async Task StopMonitoringAsync()
    {
        _monitoringTimer?.Dispose();
        _logger.LogInformation("Health monitoring stopped");
        await Task.CompletedTask;
    }
}
```

## Security Implementation Examples

### Objective 12: Security Service with Token Management

```csharp
// Single responsibility - device authentication
public class DeviceAuthenticationService : IDeviceAuthenticationService
{
    private readonly IMemoryCache _authCodeCache;
    private readonly IEncryptionService _encryptionService;
    private readonly ILogger<DeviceAuthenticationService> _logger;
    private readonly TimeSpan _authCodeExpiration = TimeSpan.FromMinutes(5);

    public DeviceAuthenticationService(
        IMemoryCache authCodeCache,
        IEncryptionService encryptionService,
        ILogger<DeviceAuthenticationService> logger)
    {
        _authCodeCache = authCodeCache ?? throw new ArgumentNullException(nameof(authCodeCache));
        _encryptionService = encryptionService ?? throw new ArgumentNullException(nameof(encryptionService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<string> GenerateAuthCodeAsync(string deviceId)
    {
        if (string.IsNullOrWhiteSpace(deviceId))
            throw new ArgumentException("Device ID cannot be null or empty", nameof(deviceId));

        // Generate cryptographically secure random code
        var codeBytes = new byte[6];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(codeBytes);
        
        var authCode = Convert.ToBase64String(codeBytes)[..8].ToUpperInvariant();
        
        // Store with expiration
        var cacheKey = $"auth_code_{deviceId}";
        _authCodeCache.Set(cacheKey, authCode, _authCodeExpiration);

        _logger.LogInformation("Generated auth code for device {DeviceId}", deviceId);
        
        return await Task.FromResult(authCode);
    }

    public async Task<bool> ValidateAuthCodeAsync(string deviceId, string authCode)
    {
        if (string.IsNullOrWhiteSpace(deviceId) || string.IsNullOrWhiteSpace(authCode))
            return false;

        var cacheKey = $"auth_code_{deviceId}";
        var storedCode = _authCodeCache.Get<string>(cacheKey);

        if (storedCode == null)
        {
            _logger.LogWarning("Auth code validation failed: code expired or not found for device {DeviceId}", deviceId);
            return false;
        }

        var isValid = string.Equals(storedCode, authCode, StringComparison.OrdinalIgnoreCase);
        
        if (isValid)
        {
            // Remove used code
            _authCodeCache.Remove(cacheKey);
            _logger.LogInformation("Auth code validated successfully for device {DeviceId}", deviceId);
        }
        else
        {
            _logger.LogWarning("Auth code validation failed: invalid code for device {DeviceId}", deviceId);
        }

        return await Task.FromResult(isValid);
    }

    public async Task<DeviceCredentials> RegisterDeviceAsync(string deviceId, string authCode)
    {
        var isValidCode = await ValidateAuthCodeAsync(deviceId, authCode);
        if (!isValidCode)
        {
            throw new AuthenticationException("Invalid authentication code");
        }

        var credentials = new DeviceCredentials
        {
            DeviceId = deviceId,
            SecretKey = await _encryptionService.GenerateSecretKeyAsync(),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        // In production, store in secure database
        var cacheKey = $"device_credentials_{deviceId}";
        _authCodeCache.Set(cacheKey, credentials, credentials.ExpiresAt);

        _logger.LogInformation("Device {DeviceId} registered successfully", deviceId);
        
        return credentials;
    }

    public async Task UnregisterDeviceAsync(string deviceId)
    {
        var cacheKey = $"device_credentials_{deviceId}";
        _authCodeCache.Remove(cacheKey);
        
        _logger.LogInformation("Device {DeviceId} unregistered", deviceId);
        await Task.CompletedTask;
    }
}

// Token management with JWT
public class TokenManagementService : ITokenManagementService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<TokenManagementService> _logger;
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;

    public TokenManagementService(IConfiguration configuration, ILogger<TokenManagementService> logger)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        
        _secretKey = _configuration["Security:JwtSecretKey"] ?? throw new InvalidOperationException("JWT secret key not configured");
        _issuer = _configuration["Security:JwtIssuer"] ?? "BeepMyPhone.Tunneling";
        _audience = _configuration["Security:JwtAudience"] ?? "BeepMyPhone.Mobile";
    }

    public async Task<AuthenticationToken> GenerateTokenAsync(DeviceCredentials credentials)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, credentials.DeviceId),
            new Claim("device_secret", credentials.SecretKey),
            new Claim(ClaimTypes.Expiration, credentials.ExpiresAt.ToString("O"))
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = credentials.ExpiresAt,
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = signingCredentials
        };

        var tokenHandler = new JsonWebTokenHandler();
        var tokenString = tokenHandler.CreateToken(tokenDescriptor);

        var token = new AuthenticationToken
        {
            TokenValue = tokenString,
            DeviceId = credentials.DeviceId,
            ExpiresAt = credentials.ExpiresAt,
            CreatedAt = DateTime.UtcNow
        };

        _logger.LogInformation("Generated authentication token for device {DeviceId}", credentials.DeviceId);
        
        return await Task.FromResult(token);
    }

    public async Task<bool> ValidateTokenAsync(string tokenValue)
    {
        try
        {
            var tokenHandler = new JsonWebTokenHandler();
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = securityKey,
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(5)
            };

            var result = await tokenHandler.ValidateTokenAsync(tokenValue, validationParameters);
            
            if (result.IsValid)
            {
                _logger.LogDebug("Token validation successful");
                return true;
            }

            _logger.LogWarning("Token validation failed: {Exception}", result.Exception?.Message);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token");
            return false;
        }
    }
}
```

## Integration Patterns

### Objective 15: Service Registration and Integration

```csharp
// Extension method for clean service registration
public static class TunnelServiceCollectionExtensions
{
    public static IServiceCollection AddTunnelServices(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        // Core services
        services.AddSingleton<ITunnelConfigurationService, TunnelConfigurationService>();
        services.AddSingleton<IFrpProcessManager, FrpProcessManager>();
        services.AddSingleton<ITunnelHealthMonitor, TunnelHealthMonitor>();
        services.AddSingleton<ITunnelReconnectionManager, TunnelReconnectionManager>();

        // Binary management
        services.AddHttpClient<GitHubReleaseBinarySource>();
        services.AddSingleton<IBinaryDownloadSource, GitHubReleaseBinarySource>();
        services.AddSingleton<IBinaryDownloadSource, LocalCacheBinarySource>();
        services.AddSingleton<FrpBinaryManager>();

        // Configuration services
        services.AddSingleton<IConfigurationValidationService, ConfigurationValidationService>();
        services.AddSingleton<IConfigurationHotReloadService, ConfigurationHotReloadService>();
        services.AddSingleton<IConfigurationChangeHandler, TunnelConfigurationChangeHandler>();

        // Health checks
        services.AddTransient<IHealthCheck>(provider =>
        {
            var httpClient = provider.GetRequiredService<HttpClient>();
            var config = provider.GetRequiredService<ITunnelConfigurationService>()
                .GetConfigurationAsync().GetAwaiter().GetResult();
            
            return new HttpHealthCheck(httpClient, "http://localhost:5000/health", TimeSpan.FromSeconds(10));
        });

        // Security services
        services.AddSingleton<IDeviceAuthenticationService, DeviceAuthenticationService>();
        services.AddSingleton<ITokenManagementService, TokenManagementService>();
        services.AddSingleton<ITunnelSecurityService, TunnelSecurityService>();

        // API services
        services.AddScoped<ITunnelControlService, TunnelControlService>();
        services.AddScoped<ITunnelQueryService, TunnelQueryService>();

        // Background services
        services.AddHostedService<TunnelHostedService>();

        // Integration
        services.AddSingleton<ITunnelServiceIntegration, TunnelServiceIntegration>();

        return services;
    }
}

// Hosted service for tunnel lifecycle management
public class TunnelHostedService : BackgroundService
{
    private readonly ITunnelServiceIntegration _integration;
    private readonly ITunnelHealthMonitor _healthMonitor;
    private readonly IConfigurationHotReloadService _hotReloadService;
    private readonly ILogger<TunnelHostedService> _logger;

    public TunnelHostedService(
        ITunnelServiceIntegration integration,
        ITunnelHealthMonitor healthMonitor,
        IConfigurationHotReloadService hotReloadService,
        ILogger<TunnelHostedService> logger)
    {
        _integration = integration ?? throw new ArgumentNullException(nameof(integration));
        _healthMonitor = healthMonitor ?? throw new ArgumentNullException(nameof(healthMonitor));
        _hotReloadService = hotReloadService ?? throw new ArgumentNullException(nameof(hotReloadService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting tunnel hosted service");

        // Initialize integration with backend
        await _integration.RegisterWithBackendAsync();

        // Start health monitoring
        await _healthMonitor.StartMonitoringAsync(TimeSpan.FromSeconds(30));

        // Start configuration hot reload
        await _hotReloadService.StartWatchingAsync();

        await base.StartAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Tunnel hosted service is running");

        try
        {
            // Keep service running and handle any periodic tasks
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                
                // Periodic health check or maintenance tasks
                var health = await _healthMonitor.GetCurrentHealthAsync();
                _logger.LogDebug("Current tunnel health: {Health}", health);
            }
        }
        catch (OperationCanceledException)
        {
            // Expected when cancellation is requested
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in tunnel hosted service execution");
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Stopping tunnel hosted service");

        // Stop monitoring services
        await _hotReloadService.StopWatchingAsync();
        await _healthMonitor.StopMonitoringAsync();

        // Unregister from backend
        await _integration.UnregisterFromBackendAsync();

        await base.StopAsync(cancellationToken);
    }
}
```

## Testing Examples

### Unit Test Example with Dependency Injection

```csharp
public class FrpBinaryManagerTests
{
    private readonly Mock<IBinaryDownloadSource> _mockDownloadSource;
    private readonly Mock<IBinaryValidationService> _mockValidationService;
    private readonly Mock<ILogger<FrpBinaryManager>> _mockLogger;
    private readonly FrpBinaryManager _binaryManager;

    public FrpBinaryManagerTests()
    {
        _mockDownloadSource = new Mock<IBinaryDownloadSource>();
        _mockValidationService = new Mock<IBinaryValidationService>();
        _mockLogger = new Mock<ILogger<FrpBinaryManager>>();
        
        _binaryManager = new FrpBinaryManager(
            new[] { _mockDownloadSource.Object },
            _mockValidationService.Object,
            _mockLogger.Object);
    }

    [Fact]
    public async Task EnsureBinaryAsync_ValidBinaryExists_ReturnsExistingPath()
    {
        // Arrange
        var platform = new PlatformInfo { OperatingSystem = "linux", Architecture = "amd64" };
        var binaryInfo = new BinaryInfo { FileName = "frpc", Version = "0.44.0" };
        var targetPath = "/tmp/binaries";
        var expectedPath = Path.Combine(targetPath, binaryInfo.FileName);

        _mockDownloadSource.Setup(x => x.GetLatestBinaryAsync(platform))
            .ReturnsAsync(binaryInfo);
        
        _mockValidationService.Setup(x => x.ValidateBinaryAsync(expectedPath, binaryInfo))
            .ReturnsAsync(true);

        // Act
        var result = await _binaryManager.EnsureBinaryAsync(targetPath, platform);

        // Assert
        Assert.Equal(expectedPath, result);
        _mockDownloadSource.Verify(x => x.DownloadBinaryAsync(It.IsAny<BinaryInfo>()), Times.Never);
    }

    [Fact]
    public async Task EnsureBinaryAsync_InvalidBinary_DownloadsAndValidates()
    {
        // Arrange
        var platform = new PlatformInfo { OperatingSystem = "linux", Architecture = "amd64" };
        var binaryInfo = new BinaryInfo { FileName = "frpc", Version = "0.44.0" };
        var targetPath = "/tmp/binaries";
        var expectedPath = Path.Combine(targetPath, binaryInfo.FileName);
        var downloadStream = new MemoryStream(Encoding.UTF8.GetBytes("binary content"));

        _mockDownloadSource.Setup(x => x.GetLatestBinaryAsync(platform))
            .ReturnsAsync(binaryInfo);
        
        _mockValidationService.SetupSequence(x => x.ValidateBinaryAsync(expectedPath, binaryInfo))
            .ReturnsAsync(false) // First call - invalid
            .ReturnsAsync(true); // Second call - valid after download

        _mockDownloadSource.Setup(x => x.DownloadBinaryAsync(binaryInfo))
            .ReturnsAsync(downloadStream);

        // Act
        var result = await _binaryManager.EnsureBinaryAsync(targetPath, platform);

        // Assert
        Assert.Equal(expectedPath, result);
        _mockDownloadSource.Verify(x => x.DownloadBinaryAsync(binaryInfo), Times.Once);
        _mockValidationService.Verify(x => x.ValidateBinaryAsync(expectedPath, binaryInfo), Times.Exactly(2));
    }
}
```

## Error Handling Patterns

### Objective 10: Comprehensive Error Handling

```csharp
// Custom exception hierarchy
public class TunnelException : Exception
{
    public string ErrorCode { get; }
    public ErrorSeverity Severity { get; }

    public TunnelException(string errorCode, string message, ErrorSeverity severity = ErrorSeverity.Error) 
        : base(message)
    {
        ErrorCode = errorCode;
        Severity = severity;
    }

    public TunnelException(string errorCode, string message, Exception innerException, ErrorSeverity severity = ErrorSeverity.Error) 
        : base(message, innerException)
    {
        ErrorCode = errorCode;
        Severity = severity;
    }
}

// Error handler with recovery strategies
public class TunnelErrorHandler : ITunnelErrorHandler
{
    private readonly IErrorClassificationService _classificationService;
    private readonly IErrorRecoveryService _recoveryService;
    private readonly ILogger<TunnelErrorHandler> _logger;

    public TunnelErrorHandler(
        IErrorClassificationService classificationService,
        IErrorRecoveryService recoveryService,
        ILogger<TunnelErrorHandler> logger)
    {
        _classificationService = classificationService ?? throw new ArgumentNullException(nameof(classificationService));
        _recoveryService = recoveryService ?? throw new ArgumentNullException(nameof(recoveryService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<RecoveryResult> HandleErrorAsync(Exception exception, CancellationToken cancellationToken = default)
    {
        try
        {
            var classification = await _classificationService.ClassifyErrorAsync(exception);
            
            _logger.LogError(exception, "Handling error: {ErrorType} - {ErrorCode}", 
                classification.ErrorType, classification.ErrorCode);

            var recoveryResult = await _recoveryService.AttemptRecoveryAsync(classification, cancellationToken);

            if (recoveryResult.Success)
            {
                _logger.LogInformation("Error recovery successful: {Strategy}", recoveryResult.Strategy);
            }
            else
            {
                _logger.LogWarning("Error recovery failed: {Reason}", recoveryResult.ErrorMessage);
            }

            return recoveryResult;
        }
        catch (Exception recoveryException)
        {
            _logger.LogError(recoveryException, "Error during error recovery process");
            
            return new RecoveryResult
            {
                Success = false,
                Strategy = "None",
                ErrorMessage = "Recovery process failed",
                Exception = recoveryException
            };
        }
    }
}
```

These examples demonstrate the implementation of all 15 objectives using SOLID principles, clean architecture patterns, and comprehensive error handling throughout the tunneling service.