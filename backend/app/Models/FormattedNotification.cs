using System.ComponentModel.DataAnnotations;

namespace WindowsNotificationService.Models;

/// <summary>
/// Represents a formatted notification optimized for mobile display
/// </summary>
public class FormattedNotification
{
    /// <summary>
    /// Unique identifier for the notification
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Clean, readable title for mobile display
    /// </summary>
    /// <example>Weather: Bedford 72°F</example>
    public string DisplayTitle { get; set; } = string.Empty;

    /// <summary>
    /// Formatted message content for mobile display
    /// </summary>
    /// <example>Current temperature in Bedford • Beach hazards statement</example>
    public string DisplayMessage { get; set; } = string.Empty;

    /// <summary>
    /// User-friendly app name
    /// </summary>
    /// <example>Windows Widgets</example>
    public string AppDisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Original app name from Windows
    /// </summary>
    public string OriginalAppName { get; set; } = string.Empty;

    /// <summary>
    /// Notification category for grouping/filtering
    /// </summary>
    /// <example>Weather, News, Communication, System</example>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Priority level for mobile display
    /// </summary>
    /// <example>High, Medium, Normal, Low</example>
    public string Priority { get; set; } = "Normal";

    /// <summary>
    /// Timestamp when the notification was received
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Original notification type from Windows
    /// </summary>
    [Range(0, 2)]
    public int NotificationType { get; set; }

    /// <summary>
    /// Action URL if the notification is clickable
    /// </summary>
    public string? ActionUrl { get; set; }

    /// <summary>
    /// Emoji icon based on category
    /// </summary>
    public string Icon => Category.ToLower() switch
    {
        "weather" => "🌤️",
        "news" => "📰",
        "communication" => "💬",
        "email" => "📧",
        "browser" => "🌐",
        "widgets" => "📱",
        "system" => "⚙️",
        _ => "🔔"
    };

    /// <summary>
    /// Short summary for push notification display
    /// </summary>
    public string ShortSummary => DisplayMessage.Length > 50 
        ? DisplayMessage.Substring(0, 47) + "..." 
        : DisplayMessage;
}