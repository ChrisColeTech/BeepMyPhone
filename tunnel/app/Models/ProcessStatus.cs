namespace BeepMyPhone.Tunneling.Models;

/// <summary>
/// Represents the current status and metadata of a running FRP tunnel process
/// </summary>
public class ProcessStatus
{
    /// <summary>
    /// Process ID of the running FRP client
    /// </summary>
    public int ProcessId { get; set; }

    /// <summary>
    /// Whether the process is currently running
    /// </summary>
    public bool IsRunning { get; set; }

    /// <summary>
    /// Process start time
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// Last time the process status was updated
    /// </summary>
    public DateTime LastChecked { get; set; }

    /// <summary>
    /// Current tunnel URL (if available)
    /// </summary>
    public string? TunnelUrl { get; set; }

    /// <summary>
    /// Tunnel configuration used to start the process
    /// </summary>
    public TunnelConfig? Configuration { get; set; }

    /// <summary>
    /// Exit code of the process (if exited)
    /// </summary>
    public int? ExitCode { get; set; }

    /// <summary>
    /// Error message if process failed
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Raw output from the FRP process
    /// </summary>
    public string? ProcessOutput { get; set; }

    /// <summary>
    /// Number of seconds the process has been running
    /// </summary>
    public double UpTimeSeconds => IsRunning ? (DateTime.UtcNow - StartTime).TotalSeconds : 0;

    /// <summary>
    /// Current process status as a human-readable string
    /// </summary>
    public string StatusDescription
    {
        get
        {
            if (!IsRunning && ExitCode.HasValue)
                return $"Exited with code {ExitCode}";
            
            if (!IsRunning)
                return "Stopped";

            if (!string.IsNullOrEmpty(TunnelUrl))
                return $"Running - Tunnel active at {TunnelUrl}";

            return "Starting...";
        }
    }

    /// <summary>
    /// Creates a new process status for a starting process
    /// </summary>
    /// <param name="processId">Process ID</param>
    /// <param name="config">Tunnel configuration</param>
    /// <returns>New process status instance</returns>
    public static ProcessStatus CreateStarting(int processId, TunnelConfig config)
    {
        return new ProcessStatus
        {
            ProcessId = processId,
            IsRunning = true,
            StartTime = DateTime.UtcNow,
            LastChecked = DateTime.UtcNow,
            Configuration = config
        };
    }

    /// <summary>
    /// Creates a new process status for a stopped process
    /// </summary>
    /// <param name="exitCode">Process exit code</param>
    /// <param name="errorMessage">Error message if applicable</param>
    /// <returns>New process status instance</returns>
    public static ProcessStatus CreateStopped(int? exitCode = null, string? errorMessage = null)
    {
        return new ProcessStatus
        {
            IsRunning = false,
            LastChecked = DateTime.UtcNow,
            ExitCode = exitCode,
            ErrorMessage = errorMessage
        };
    }

    /// <summary>
    /// Updates the status with new tunnel URL
    /// </summary>
    /// <param name="tunnelUrl">New tunnel URL</param>
    public void UpdateTunnelUrl(string tunnelUrl)
    {
        TunnelUrl = tunnelUrl;
        LastChecked = DateTime.UtcNow;
    }

    /// <summary>
    /// Updates the status timestamp
    /// </summary>
    public void RefreshStatus()
    {
        LastChecked = DateTime.UtcNow;
    }
}