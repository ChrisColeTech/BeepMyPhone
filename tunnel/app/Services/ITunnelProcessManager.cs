using BeepMyPhone.Tunneling.Models;

namespace BeepMyPhone.Tunneling.Services;

/// <summary>
/// Interface for managing FRP tunnel process lifecycle
/// Follows Single Responsibility Principle by focusing only on process management
/// </summary>
public interface ITunnelProcessManager
{
    /// <summary>
    /// Starts an FRP tunnel process with the specified configuration
    /// </summary>
    /// <param name="config">Tunnel configuration parameters</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>Process status information</returns>
    Task<ProcessStatus> StartTunnelAsync(TunnelConfig config, CancellationToken cancellationToken = default);

    /// <summary>
    /// Stops the currently running tunnel process gracefully
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>True if process was stopped successfully</returns>
    Task<bool> StopTunnelAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the current status of the tunnel process
    /// </summary>
    /// <returns>Current process status, null if no process is running</returns>
    ProcessStatus? GetProcessStatus();

    /// <summary>
    /// Checks if a tunnel process is currently running
    /// </summary>
    /// <returns>True if process is running and responsive</returns>
    bool IsProcessRunning();

    /// <summary>
    /// Restarts the tunnel process with the current configuration
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>Process status information after restart</returns>
    Task<ProcessStatus> RestartTunnelAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the current tunnel URL if available
    /// </summary>
    /// <returns>Active tunnel URL, null if not available</returns>
    string? GetTunnelUrl();

    /// <summary>
    /// Event fired when the tunnel URL becomes available or changes
    /// </summary>
    event EventHandler<string>? TunnelUrlChanged;

    /// <summary>
    /// Event fired when the process status changes
    /// </summary>
    event EventHandler<ProcessStatus>? ProcessStatusChanged;
}