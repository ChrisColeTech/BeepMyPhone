using System.ComponentModel.DataAnnotations;

namespace WindowsNotificationService.Models;

/// <summary>
/// Represents a Windows notification captured by the monitoring service
/// </summary>
public class WindowsNotification
{
    /// <summary>
    /// Unique identifier for the notification
    /// </summary>
    /// <example>f47ac10b-58cc-4372-a567-0e02b2c3d479</example>
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Name of the application that generated the notification
    /// </summary>
    /// <example>Microsoft Teams</example>
    public string AppName { get; set; } = string.Empty;

    /// <summary>
    /// Title of the notification
    /// </summary>
    /// <example>New message from John Doe</example>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Main content/body of the notification
    /// </summary>
    /// <example>Hey, are you available for a quick call?</example>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when the notification was received
    /// </summary>
    /// <example>2024-01-15T10:30:00Z</example>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Raw payload data from the Windows notification system
    /// </summary>
    public string RawPayload { get; set; } = string.Empty;

    /// <summary>
    /// Type/category of the notification (0=Info, 1=Warning, 2=Error)
    /// </summary>
    /// <example>0</example>
    [Range(0, 2)]
    public int NotificationType { get; set; }
}