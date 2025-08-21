using System.Diagnostics;
using System.Text;
using System.Text.RegularExpressions;
using BeepMyPhone.Tunneling.Models;

namespace BeepMyPhone.Tunneling.Services;

/// <summary>
/// Manages FRP tunnel process lifecycle including start, stop, monitoring, and URL extraction
/// Implements Single Responsibility Principle by focusing only on process management
/// </summary>
public class TunnelProcessManager : ITunnelProcessManager, IDisposable
{
    private readonly IBinaryManager _binaryManager;
    private readonly ILogger<TunnelProcessManager> _logger;
    private Process? _tunnelProcess;
    private ProcessStatus? _currentStatus;
    private readonly StringBuilder _outputBuffer = new();
    private readonly object _processLock = new();
    private volatile bool _disposed;

    // Regex pattern to extract tunnel URL from FRP output
    private static readonly Regex TunnelUrlRegex = new(
        @"start proxy success: (.+?) listen on (.+?):([\d]+)",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private static readonly Regex HttpTunnelUrlRegex = new(
        @"http://([a-zA-Z0-9\-\.]+)/",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public event EventHandler<string>? TunnelUrlChanged;
    public event EventHandler<ProcessStatus>? ProcessStatusChanged;

    public TunnelProcessManager(IBinaryManager binaryManager, ILogger<TunnelProcessManager> logger)
    {
        _binaryManager = binaryManager ?? throw new ArgumentNullException(nameof(binaryManager));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ProcessStatus> StartTunnelAsync(TunnelConfig config, CancellationToken cancellationToken = default)
    {
        if (config == null)
            throw new ArgumentNullException(nameof(config));

        if (!config.IsValid())
            throw new ArgumentException("Invalid tunnel configuration", nameof(config));

        lock (_processLock)
        {
            if (_tunnelProcess != null && !_tunnelProcess.HasExited)
            {
                _logger.LogWarning("Tunnel process is already running with PID {ProcessId}", _tunnelProcess.Id);
                return _currentStatus ?? ProcessStatus.CreateStopped(null, "Process running but status unavailable");
            }
        }

        try
        {
            // Get FRP binary path
            var binaryPath = await _binaryManager.EnsureBinaryAsync(cancellationToken);
            _logger.LogInformation("Starting FRP tunnel with binary: {BinaryPath}", binaryPath);

            // Build command arguments
            var arguments = BuildFrpArguments(config);
            _logger.LogDebug("FRP arguments: {Arguments}", arguments);

            // Create and start process
            var processStartInfo = new ProcessStartInfo
            {
                FileName = binaryPath,
                Arguments = arguments,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            lock (_processLock)
            {
                _tunnelProcess = new Process { StartInfo = processStartInfo };
                
                // Set up output monitoring
                _tunnelProcess.OutputDataReceived += OnOutputDataReceived;
                _tunnelProcess.ErrorDataReceived += OnErrorDataReceived;
                _tunnelProcess.Exited += OnProcessExited;
                _tunnelProcess.EnableRaisingEvents = true;

                // Start the process
                var started = _tunnelProcess.Start();
                if (!started)
                {
                    throw new InvalidOperationException("Failed to start FRP process");
                }

                _tunnelProcess.BeginOutputReadLine();
                _tunnelProcess.BeginErrorReadLine();

                // Create initial status
                _currentStatus = ProcessStatus.CreateStarting(_tunnelProcess.Id, config);
                _logger.LogInformation("FRP process started with PID {ProcessId}", _tunnelProcess.Id);
            }

            // Notify status change
            ProcessStatusChanged?.Invoke(this, _currentStatus);

            return _currentStatus;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to start tunnel process");
            var errorStatus = ProcessStatus.CreateStopped(null, ex.Message);
            _currentStatus = errorStatus;
            ProcessStatusChanged?.Invoke(this, errorStatus);
            throw;
        }
    }

    public async Task<bool> StopTunnelAsync(CancellationToken cancellationToken = default)
    {
        Process? processToStop = null;
        
        lock (_processLock)
        {
            if (_tunnelProcess == null || _tunnelProcess.HasExited)
            {
                _logger.LogInformation("No tunnel process running to stop");
                return true;
            }
            
            processToStop = _tunnelProcess;
        }

        try
        {
            _logger.LogInformation("Stopping tunnel process with PID {ProcessId}", processToStop.Id);

            // Try graceful shutdown first
            if (!processToStop.HasExited)
            {
                processToStop.CloseMainWindow();
                
                // Wait for graceful shutdown
                var gracefulShutdown = await WaitForExitAsync(processToStop, TimeSpan.FromSeconds(5), cancellationToken);
                
                if (!gracefulShutdown && !processToStop.HasExited)
                {
                    _logger.LogWarning("Graceful shutdown failed, forcing process termination");
                    processToStop.Kill();
                    
                    // Wait for forced termination
                    await WaitForExitAsync(processToStop, TimeSpan.FromSeconds(2), cancellationToken);
                }
            }

            var exitCode = processToStop.HasExited ? (int?)processToStop.ExitCode : null;
            _logger.LogInformation("Tunnel process stopped with exit code: {ExitCode}", exitCode);

            // Update status while preserving configuration for potential restart
            lock (_processLock)
            {
                var previousConfig = _currentStatus?.Configuration;
                _currentStatus = ProcessStatus.CreateStopped(exitCode);
                _currentStatus.Configuration = previousConfig; // Preserve config for restart
                _tunnelProcess?.Dispose();
                _tunnelProcess = null;
            }

            ProcessStatusChanged?.Invoke(this, _currentStatus);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error stopping tunnel process");
            return false;
        }
    }

    public ProcessStatus? GetProcessStatus()
    {
        lock (_processLock)
        {
            if (_currentStatus != null)
            {
                _currentStatus.RefreshStatus();
                
                // Update running status based on actual process state
                if (_tunnelProcess != null && _currentStatus.IsRunning)
                {
                    _currentStatus.IsRunning = !_tunnelProcess.HasExited;
                }
            }
            
            return _currentStatus;
        }
    }

    public bool IsProcessRunning()
    {
        lock (_processLock)
        {
            return _tunnelProcess != null && !_tunnelProcess.HasExited;
        }
    }

    public async Task<ProcessStatus> RestartTunnelAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Restarting tunnel process");

        var config = _currentStatus?.Configuration;
        if (config == null)
        {
            throw new InvalidOperationException("Cannot restart tunnel: no previous configuration available");
        }

        await StopTunnelAsync(cancellationToken);
        
        // Wait a moment before restarting
        await Task.Delay(1000, cancellationToken);
        
        return await StartTunnelAsync(config, cancellationToken);
    }

    public string? GetTunnelUrl()
    {
        return _currentStatus?.TunnelUrl;
    }

    private string BuildFrpArguments(TunnelConfig config)
    {
        var args = new List<string>
        {
            "http", // Use HTTP proxy mode
            "-s", config.ServerAddr,
            "-P", config.ServerPort.ToString(),
            "-i", config.LocalIp,
            "-l", config.LocalPort.ToString(),
            "-n", config.ProxyName,
            "--log-level", config.LogLevel
        };

        if (!string.IsNullOrEmpty(config.Token))
        {
            args.AddRange(["-t", config.Token]);
        }

        if (!string.IsNullOrEmpty(config.User))
        {
            args.AddRange(["-u", config.User]);
        }

        if (!string.IsNullOrEmpty(config.SubDomain))
        {
            args.AddRange(["--sd", config.SubDomain]);
        }

        if (!string.IsNullOrEmpty(config.CustomDomain))
        {
            args.AddRange(["-d", config.CustomDomain]);
        }

        if (config.EnableTls)
        {
            args.Add("--tls-enable");
        }

        if (config.UseCompression)
        {
            args.Add("--uc");
        }

        if (config.UseEncryption)
        {
            args.Add("--ue");
        }

        if (config.Protocol != "tcp")
        {
            args.AddRange(["-p", config.Protocol]);
        }

        return string.Join(" ", args.Select(arg => arg.Contains(' ') ? $"\"{arg}\"" : arg));
    }

    private void OnOutputDataReceived(object sender, DataReceivedEventArgs e)
    {
        if (string.IsNullOrEmpty(e.Data)) return;

        _logger.LogDebug("FRP Output: {Output}", e.Data);
        
        lock (_outputBuffer)
        {
            _outputBuffer.AppendLine(e.Data);
            
            // Update current status with output
            if (_currentStatus != null)
            {
                _currentStatus.ProcessOutput = _outputBuffer.ToString();
                _currentStatus.RefreshStatus();
            }
        }

        // Try to extract tunnel URL
        TryExtractTunnelUrl(e.Data);
    }

    private void OnErrorDataReceived(object sender, DataReceivedEventArgs e)
    {
        if (string.IsNullOrEmpty(e.Data)) return;

        _logger.LogWarning("FRP Error: {Error}", e.Data);
        
        lock (_outputBuffer)
        {
            _outputBuffer.AppendLine($"ERROR: {e.Data}");
            
            // Update current status with error
            if (_currentStatus != null)
            {
                _currentStatus.ErrorMessage = e.Data;
                _currentStatus.ProcessOutput = _outputBuffer.ToString();
                _currentStatus.RefreshStatus();
            }
        }
    }

    private void OnProcessExited(object? sender, EventArgs e)
    {
        if (sender is Process process)
        {
            _logger.LogInformation("FRP process exited with code {ExitCode}", process.ExitCode);
            
            lock (_processLock)
            {
                if (_currentStatus != null)
                {
                    _currentStatus.IsRunning = false;
                    _currentStatus.ExitCode = process.ExitCode;
                    _currentStatus.RefreshStatus();
                    
                    ProcessStatusChanged?.Invoke(this, _currentStatus);
                }
            }
        }
    }

    private void TryExtractTunnelUrl(string output)
    {
        // Try to extract tunnel URL from various FRP output patterns
        var match = TunnelUrlRegex.Match(output);
        if (match.Success)
        {
            var tunnelUrl = $"http://{match.Groups[2].Value}:{match.Groups[3].Value}";
            UpdateTunnelUrl(tunnelUrl);
            return;
        }

        // Try alternative pattern for HTTP tunnels
        var httpMatch = HttpTunnelUrlRegex.Match(output);
        if (httpMatch.Success)
        {
            var tunnelUrl = httpMatch.Value.TrimEnd('/');
            UpdateTunnelUrl(tunnelUrl);
        }
    }

    private void UpdateTunnelUrl(string tunnelUrl)
    {
        lock (_processLock)
        {
            if (_currentStatus != null)
            {
                var previousUrl = _currentStatus.TunnelUrl;
                _currentStatus.UpdateTunnelUrl(tunnelUrl);
                
                if (previousUrl != tunnelUrl)
                {
                    _logger.LogInformation("Tunnel URL detected: {TunnelUrl}", tunnelUrl);
                    TunnelUrlChanged?.Invoke(this, tunnelUrl);
                    ProcessStatusChanged?.Invoke(this, _currentStatus);
                }
            }
        }
    }

    private static async Task<bool> WaitForExitAsync(Process process, TimeSpan timeout, CancellationToken cancellationToken)
    {
        try
        {
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(timeout);
            
            await process.WaitForExitAsync(timeoutCts.Token);
            return true;
        }
        catch (OperationCanceledException)
        {
            return false;
        }
    }

    public void Dispose()
    {
        if (_disposed) return;

        try
        {
            StopTunnelAsync().GetAwaiter().GetResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during disposal");
        }

        lock (_processLock)
        {
            _tunnelProcess?.Dispose();
            _tunnelProcess = null;
        }

        _disposed = true;
        GC.SuppressFinalize(this);
    }
}