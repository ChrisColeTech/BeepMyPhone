namespace BeepMyPhone.Tunneling.Models;

/// <summary>
/// Represents the current status of the tunnel service
/// Used for API responses and status monitoring
/// </summary>
public class TunnelStatus
{
    /// <summary>
    /// Whether the tunnel process is currently running
    /// </summary>
    public bool IsRunning { get; set; }

    /// <summary>
    /// Current platform (e.g., "windows_amd64", "linux_amd64")
    /// </summary>
    public string Platform { get; set; } = string.Empty;

    /// <summary>
    /// Version of the FRP binary currently available
    /// </summary>
    public string BinaryVersion { get; set; } = string.Empty;

    /// <summary>
    /// Path to the FRP binary on the local system
    /// </summary>
    public string BinaryPath { get; set; } = string.Empty;

    /// <summary>
    /// Current public tunnel URL (if tunnel is running)
    /// </summary>
    public string? TunnelUrl { get; set; }

    /// <summary>
    /// Last time the status was updated
    /// </summary>
    public DateTime LastUpdated { get; set; }

    /// <summary>
    /// Any error message from the last operation
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Additional status information
    /// </summary>
    public string? StatusMessage { get; set; }

    /// <summary>
    /// Process ID of the running FRP client (if running)
    /// </summary>
    public int? ProcessId { get; set; }

    /// <summary>
    /// Process start time (if running)
    /// </summary>
    public DateTime? ProcessStartTime { get; set; }

    /// <summary>
    /// Number of seconds the process has been running
    /// </summary>
    public double? UpTimeSeconds { get; set; }

    /// <summary>
    /// Exit code of the process if it has exited
    /// </summary>
    public int? ExitCode { get; set; }

    /// <summary>
    /// Current tunnel configuration being used
    /// </summary>
    public TunnelConfig? Configuration { get; set; }

    /// <summary>
    /// Human-readable status description
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
    /// Creates tunnel status from process status and binary info
    /// </summary>
    /// <param name="processStatus">Current process status</param>
    /// <param name="binaryInfo">Binary information</param>
    /// <param name="platform">Current platform</param>
    /// <returns>Combined tunnel status</returns>
    public static TunnelStatus FromProcessStatus(ProcessStatus? processStatus, BinaryInfo? binaryInfo, string platform)
    {
        var status = new TunnelStatus
        {
            Platform = platform,
            BinaryVersion = binaryInfo?.Version ?? "Unknown",
            BinaryPath = binaryInfo?.FilePath ?? "Not Available",
            LastUpdated = DateTime.UtcNow
        };

        if (processStatus != null)
        {
            status.IsRunning = processStatus.IsRunning;
            status.TunnelUrl = processStatus.TunnelUrl;
            status.ErrorMessage = processStatus.ErrorMessage;
            status.ProcessId = processStatus.IsRunning ? processStatus.ProcessId : null;
            status.ProcessStartTime = processStatus.IsRunning ? processStatus.StartTime : null;
            status.UpTimeSeconds = processStatus.IsRunning ? processStatus.UpTimeSeconds : null;
            status.ExitCode = processStatus.ExitCode;
            status.Configuration = processStatus.Configuration;
            status.StatusMessage = processStatus.StatusDescription;
        }

        return status;
    }
}