using Microsoft.AspNetCore.Mvc;
using BeepMyPhone.Tunneling.Services;
using BeepMyPhone.Tunneling.Models;

namespace BeepMyPhone.Tunneling.Controllers;

/// <summary>
/// REST API controller for tunnel management operations
/// Provides endpoints for tunnel status, control, and binary management
/// </summary>
[ApiController]
[Route("[controller]")]
public class TunnelController : ControllerBase
{
    private readonly IBinaryManager _binaryManager;
    private readonly ITunnelProcessManager _processManager;
    private readonly IFrpConfigGenerator _configGenerator;
    private readonly ILogger<TunnelController> _logger;

    public TunnelController(
        IBinaryManager binaryManager, 
        ITunnelProcessManager processManager,
        IFrpConfigGenerator configGenerator,
        ILogger<TunnelController> logger)
    {
        _binaryManager = binaryManager ?? throw new ArgumentNullException(nameof(binaryManager));
        _processManager = processManager ?? throw new ArgumentNullException(nameof(processManager));
        _configGenerator = configGenerator ?? throw new ArgumentNullException(nameof(configGenerator));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Get current tunnel service status
    /// </summary>
    /// <returns>Tunnel status information</returns>
    [HttpGet("status")]
    public async Task<ActionResult<TunnelStatus>> GetStatus()
    {
        try
        {
            var binaryInfo = await _binaryManager.GetCachedBinaryInfoAsync();
            var platform = _binaryManager.GetCurrentPlatform();
            var processStatus = _processManager.GetProcessStatus();

            var status = TunnelStatus.FromProcessStatus(processStatus, binaryInfo, platform);
            
            _logger.LogDebug("Retrieved tunnel status: Running={IsRunning}, URL={TunnelUrl}", 
                status.IsRunning, status.TunnelUrl);

            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get tunnel status");
            return StatusCode(500, "Failed to retrieve tunnel status");
        }
    }

    /// <summary>
    /// Get current tunnel URL (when tunnel is active)
    /// </summary>
    /// <returns>Active tunnel URL</returns>
    [HttpGet("url")]
    public ActionResult<string> GetTunnelUrl()
    {
        try
        {
            var tunnelUrl = _processManager.GetTunnelUrl();
            
            if (string.IsNullOrEmpty(tunnelUrl))
            {
                return NotFound("No active tunnel URL available");
            }

            _logger.LogDebug("Retrieved tunnel URL: {TunnelUrl}", tunnelUrl);
            return Ok(tunnelUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get tunnel URL");
            return StatusCode(500, "Failed to retrieve tunnel URL");
        }
    }

    /// <summary>
    /// Start tunnel process with optional configuration
    /// </summary>
    /// <param name="config">Optional tunnel configuration (uses default if not provided)</param>
    /// <returns>Operation result with process status</returns>
    [HttpPost("start")]
    public async Task<ActionResult<ProcessStatus>> StartTunnel([FromBody] TunnelConfig? config = null)
    {
        try
        {
            // Check if tunnel is already running
            if (_processManager.IsProcessRunning())
            {
                _logger.LogWarning("Tunnel start requested but process is already running");
                var currentStatus = _processManager.GetProcessStatus();
                return BadRequest(new { message = "Tunnel is already running", status = currentStatus });
            }

            // Use provided config or create default
            var tunnelConfig = config ?? _configGenerator.CreateDefaultConfig();
            
            // Validate configuration
            if (!_configGenerator.ValidateConfig(tunnelConfig))
            {
                return BadRequest(new { message = "Invalid tunnel configuration provided" });
            }

            _logger.LogInformation("Starting tunnel with config: LocalPort={LocalPort}, ServerAddr={ServerAddr}", 
                tunnelConfig.LocalPort, tunnelConfig.ServerAddr);

            // Start the tunnel process
            var processStatus = await _processManager.StartTunnelAsync(tunnelConfig);
            
            _logger.LogInformation("Tunnel started successfully with PID {ProcessId}", processStatus.ProcessId);
            
            return Ok(new { 
                message = "Tunnel started successfully", 
                processId = processStatus.ProcessId,
                status = processStatus 
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid tunnel configuration provided");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to start tunnel");
            return StatusCode(500, new { message = "Failed to start tunnel", error = ex.Message });
        }
    }

    /// <summary>
    /// Stop tunnel process
    /// </summary>
    /// <returns>Operation result</returns>
    [HttpPost("stop")]
    public async Task<ActionResult> StopTunnel()
    {
        try
        {
            // Check if tunnel is running
            if (!_processManager.IsProcessRunning())
            {
                _logger.LogInformation("Tunnel stop requested but no process is running");
                return Ok(new { message = "No tunnel process running" });
            }

            _logger.LogInformation("Stopping tunnel process");
            
            var stopped = await _processManager.StopTunnelAsync();
            
            if (stopped)
            {
                _logger.LogInformation("Tunnel stopped successfully");
                return Ok(new { message = "Tunnel stopped successfully" });
            }
            else
            {
                _logger.LogWarning("Failed to stop tunnel process");
                return StatusCode(500, new { message = "Failed to stop tunnel process" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error stopping tunnel");
            return StatusCode(500, new { message = "Error stopping tunnel", error = ex.Message });
        }
    }

    /// <summary>
    /// Get QR code for mobile app connection (placeholder)
    /// </summary>
    /// <returns>QR code data</returns>
    [HttpGet("qr-code")]
    public ActionResult GetQrCode()
    {
        // TODO: Implement QR code generation
        return Ok(new { message = "QR code generation not yet implemented" });
    }

    /// <summary>
    /// Restart tunnel process with current or new configuration
    /// </summary>
    /// <param name="config">Optional new tunnel configuration</param>
    /// <returns>Operation result with new process status</returns>
    [HttpPost("restart")]
    public async Task<ActionResult<ProcessStatus>> RestartTunnel([FromBody] TunnelConfig? config = null)
    {
        try
        {
            _logger.LogInformation("Restarting tunnel process");

            ProcessStatus processStatus;
            
            if (config != null)
            {
                // Validate new configuration
                if (!_configGenerator.ValidateConfig(config))
                {
                    return BadRequest(new { message = "Invalid tunnel configuration provided" });
                }

                // Stop current process and start with new config
                await _processManager.StopTunnelAsync();
                await Task.Delay(1000); // Brief pause
                processStatus = await _processManager.StartTunnelAsync(config);
            }
            else
            {
                // Restart with existing configuration
                processStatus = await _processManager.RestartTunnelAsync();
            }
            
            _logger.LogInformation("Tunnel restarted successfully with PID {ProcessId}", processStatus.ProcessId);
            
            return Ok(new { 
                message = "Tunnel restarted successfully", 
                processId = processStatus.ProcessId,
                status = processStatus 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to restart tunnel");
            return StatusCode(500, new { message = "Failed to restart tunnel", error = ex.Message });
        }
    }

    /// <summary>
    /// Clear binary cache (no-op for bundled binaries)
    /// </summary>
    /// <returns>Operation result</returns>
    [HttpPost("clear-cache")]
    public async Task<ActionResult> ClearCache()
    {
        try
        {
            await _binaryManager.ClearCacheAsync();
            _logger.LogInformation("Binary cache cleared successfully");
            
            return Ok(new { message = "Binary cache cleared successfully (no-op for bundled binaries)" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clear binary cache");
            return StatusCode(500, "Failed to clear binary cache");
        }
    }
}