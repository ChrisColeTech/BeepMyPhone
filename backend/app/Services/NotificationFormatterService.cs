using WindowsNotificationService.Models;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Web;

namespace WindowsNotificationService.Services;

/// <summary>
/// Service for formatting Windows notifications into readable mobile-friendly messages
/// </summary>
public class NotificationFormatterService
{
    private readonly ILogger<NotificationFormatterService> _logger;

    public NotificationFormatterService(ILogger<NotificationFormatterService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Formats a Windows notification for mobile display
    /// </summary>
    public FormattedNotification FormatForMobile(WindowsNotification notification)
    {
        try
        {
            var formatted = new FormattedNotification
            {
                Id = notification.Id,
                OriginalAppName = notification.AppName,
                Timestamp = notification.Timestamp,
                NotificationType = notification.NotificationType
            };

            // Extract meaningful content from raw payload
            var extractedContent = ExtractContentFromPayload(notification.RawPayload);
            
            // Set formatted fields
            formatted.DisplayTitle = GetDisplayTitle(notification, extractedContent);
            formatted.DisplayMessage = GetDisplayMessage(notification, extractedContent);
            formatted.AppDisplayName = GetFriendlyAppName(notification.AppName);
            formatted.Category = DetermineCategory(notification.AppName, extractedContent);
            formatted.Priority = DeterminePriority(notification, extractedContent);
            formatted.ActionUrl = ExtractActionUrl(notification.RawPayload);

            return formatted;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to format notification {NotificationId}", notification.Id);
            
            // Return basic formatted version on error
            return new FormattedNotification
            {
                Id = notification.Id,
                DisplayTitle = notification.Title,
                DisplayMessage = notification.Message,
                AppDisplayName = GetFriendlyAppName(notification.AppName),
                OriginalAppName = notification.AppName,
                Timestamp = notification.Timestamp,
                NotificationType = notification.NotificationType,
                Category = "System",
                Priority = "Normal"
            };
        }
    }

    private ExtractedContent ExtractContentFromPayload(string rawPayload)
    {
        var content = new ExtractedContent();

        if (string.IsNullOrEmpty(rawPayload))
            return content;

        try
        {
            // Extract weather information
            if (rawPayload.Contains("Bedford") && rawPayload.Contains("°F"))
            {
                var tempMatch = Regex.Match(rawPayload, @"""text"":""(\d+)"".*?""text"":""°F""");
                if (tempMatch.Success)
                {
                    content.WeatherTemp = tempMatch.Groups[1].Value;
                    content.WeatherLocation = "Bedford";
                }
            }

            // Extract news/video titles
            var titleMatches = Regex.Matches(rawPayload, @"""text"":""([^""]{20,}?)""");
            foreach (Match match in titleMatches)
            {
                var text = HttpUtility.HtmlDecode(match.Groups[1].Value);
                if (!string.IsNullOrEmpty(text) && !text.Contains("°F") && !text.Contains("Watch more"))
                {
                    content.Headlines.Add(text);
                }
            }

            // Extract URLs
            var urlMatches = Regex.Matches(rawPayload, @"""url"":""([^""]+?)""");
            foreach (Match match in urlMatches)
            {
                content.Urls.Add(match.Groups[1].Value);
            }

        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Error extracting content from payload");
        }

        return content;
    }

    private string GetDisplayTitle(WindowsNotification notification, ExtractedContent content)
    {
        // Use extracted content for better titles
        if (!string.IsNullOrEmpty(content.WeatherTemp))
        {
            return $"Weather: {content.WeatherLocation} {content.WeatherTemp}°F";
        }

        if (content.Headlines.Any())
        {
            return content.Headlines.First();
        }

        // Fall back to original title if not generic
        if (!string.IsNullOrEmpty(notification.Title) && 
            !notification.Title.StartsWith("Notification from"))
        {
            return notification.Title;
        }

        // Generate meaningful title based on app
        return GetFriendlyAppName(notification.AppName) + " Update";
    }

    private string GetDisplayMessage(WindowsNotification notification, ExtractedContent content)
    {
        var messageParts = new List<string>();

        // Add weather details
        if (!string.IsNullOrEmpty(content.WeatherTemp))
        {
            messageParts.Add($"Current temperature in {content.WeatherLocation}");
        }

        // Add headlines (limit to 2)
        if (content.Headlines.Count > 1)
        {
            messageParts.AddRange(content.Headlines.Take(2));
        }

        // Use original message if available and meaningful
        if (!string.IsNullOrEmpty(notification.Message) && notification.Message.Length > 5)
        {
            messageParts.Add(notification.Message);
        }

        var result = string.Join(" • ", messageParts);
        
        // Limit message length for mobile
        if (result.Length > 200)
        {
            result = result.Substring(0, 197) + "...";
        }

        return string.IsNullOrEmpty(result) ? "New notification" : result;
    }

    private string GetFriendlyAppName(string appName)
    {
        return appName.ToLower() switch
        {
            "shellfeedsui" => "Windows Widgets",
            "microsoft.windows.shellexperiencehost" => "Windows Shell",
            "winui.notificationexample" => "Notification Test",
            _ when appName.Contains("chrome") => "Chrome",
            _ when appName.Contains("teams") => "Microsoft Teams",
            _ when appName.Contains("outlook") => "Outlook",
            _ when appName.Contains("slack") => "Slack",
            _ => appName
        };
    }

    private string DetermineCategory(string appName, ExtractedContent content)
    {
        if (!string.IsNullOrEmpty(content.WeatherTemp)) return "Weather";
        if (content.Headlines.Any()) return "News";
        
        return appName.ToLower() switch
        {
            "shellfeedsui" => "Widgets",
            _ when appName.Contains("teams") => "Communication",
            _ when appName.Contains("outlook") => "Email",
            _ when appName.Contains("chrome") => "Browser",
            _ => "System"
        };
    }

    private string DeterminePriority(WindowsNotification notification, ExtractedContent content)
    {
        // High priority for communication apps
        if (notification.AppName.Contains("teams") || notification.AppName.Contains("outlook"))
            return "High";

        // Medium priority for news/alerts
        if (content.Headlines.Any() || notification.NotificationType > 0)
            return "Medium";

        return "Normal";
    }

    private string? ExtractActionUrl(string rawPayload)
    {
        var urlMatch = Regex.Match(rawPayload, @"""url"":""([^""]+?)""");
        return urlMatch.Success ? HttpUtility.HtmlDecode(urlMatch.Groups[1].Value) : null;
    }

    private class ExtractedContent
    {
        public string WeatherTemp { get; set; } = string.Empty;
        public string WeatherLocation { get; set; } = string.Empty;
        public List<string> Headlines { get; set; } = new();
        public List<string> Urls { get; set; } = new();
    }
}