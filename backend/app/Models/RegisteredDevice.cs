namespace WindowsNotificationService.Models;

/// <summary>
/// Represents a registered device for targeted notifications
/// </summary>
public class RegisteredDevice
{
    /// <summary>
    /// Unique device identifier (UUID, device serial, etc.)
    /// </summary>
    public string DeviceId { get; set; } = string.Empty;
    
    /// <summary>
    /// Human-readable device name (e.g., "John's iPhone")
    /// </summary>
    public string DeviceName { get; set; } = string.Empty;
    
    /// <summary>
    /// Type of device (iOS, Android, Web, Desktop)
    /// </summary>
    public string DeviceType { get; set; } = string.Empty;
    
    /// <summary>
    /// Current SignalR connection ID
    /// </summary>
    public string ConnectionId { get; set; } = string.Empty;
    
    /// <summary>
    /// Last time device was seen/active
    /// </summary>
    public DateTime LastSeen { get; set; }
    
    /// <summary>
    /// Whether device is currently connected
    /// </summary>
    public bool IsActive { get; set; }
}