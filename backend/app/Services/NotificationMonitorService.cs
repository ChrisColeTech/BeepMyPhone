using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Hosting;
using System.Text.RegularExpressions;
using WindowsNotificationService.Models;

namespace WindowsNotificationService.Services;

public class NotificationMonitorService : BackgroundService, INotificationMonitorService
{
    private readonly ILogger<NotificationMonitorService> _logger;
    private string _notificationDbPath = string.Empty;
    private DateTime _lastCheck = DateTime.Now;
    private FileSystemWatcher? _watcher;

    public event EventHandler<WindowsNotification>? NotificationReceived;
    public bool IsMonitoring { get; private set; }

    public NotificationMonitorService(ILogger<NotificationMonitorService> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Windows Notification Monitor Service starting...");

        if (!FindNotificationDatabase())
        {
            _logger.LogError("Could not find Windows notification database");
            return;
        }

        _logger.LogInformation($"Found notification database: {_notificationDbPath}");

        SetupFileMonitoring();
        IsMonitoring = true;

        _logger.LogInformation("Notification monitoring started successfully");

        // Keep service running
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(1000, stoppingToken);
        }
    }

    private bool FindNotificationDatabase()
    {
        // Try Windows path first (if running on Windows)
        var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        _notificationDbPath = Path.Combine(localAppData, "Microsoft", "Windows", "Notifications", "wpndatabase.db");

        if (File.Exists(_notificationDbPath))
        {
            return true;
        }

        // Try WSL paths (if running in WSL for development)
        var wslPaths = new[]
        {
            "/mnt/c/Users/Risky Biz/AppData/Local/Microsoft/Windows/Notifications/wpndatabase.db",
            "/mnt/c/Users/ccole/AppData/Local/Microsoft/Windows/Notifications/wpndatabase.db"
        };

        foreach (var path in wslPaths)
        {
            if (File.Exists(path))
            {
                _notificationDbPath = path;
                return true;
            }
        }

        return false;
    }

    private void SetupFileMonitoring()
    {
        try
        {
            var directoryPath = Path.GetDirectoryName(_notificationDbPath);
            _watcher = new FileSystemWatcher(directoryPath!)
            {
                Filter = "wpndatabase.db*",
                IncludeSubdirectories = false,
                NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size
            };

            _watcher.Changed += OnNotificationDatabaseChanged;
            _watcher.Created += OnNotificationDatabaseChanged;
            _watcher.EnableRaisingEvents = true;

            _logger.LogInformation("File system monitoring started");
            _lastCheck = DateTime.Now;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to setup file monitoring");
        }
    }

    private async void OnNotificationDatabaseChanged(object sender, FileSystemEventArgs e)
    {
        _logger.LogDebug($"Database changed: {e.Name}");

        // Small delay to let database finish writing
        await Task.Delay(100);

        try
        {
            await CheckForNewNotificationsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking new notifications");
        }
    }

    private async Task CheckForNewNotificationsAsync()
    {
        try
        {
            // Copy database to avoid file locking issues
            var tempDbPath = Path.Combine(Path.GetTempPath(), $"wpndatabase_copy_{Guid.NewGuid():N}.db");
            File.Copy(_notificationDbPath, tempDbPath, true);

            var connectionString = $"Data Source={tempDbPath};Mode=ReadOnly;";
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();

            var lastCheckFileTime = _lastCheck.ToFileTime();

            var sql = @"
                SELECT 
                    n.Payload,
                    n.ArrivalTime,
                    h.PrimaryId as AppName,
                    n.Type
                FROM Notification n 
                LEFT JOIN NotificationHandler h ON n.HandlerID = h.RecordID 
                WHERE n.ArrivalTime > @lastCheck
                ORDER BY n.ArrivalTime DESC";

            using var command = new SqliteCommand(sql, connection);
            command.Parameters.AddWithValue("@lastCheck", lastCheckFileTime);

            using var reader = await command.ExecuteReaderAsync();

            var newNotifications = new List<WindowsNotification>();
            while (await reader.ReadAsync())
            {
                var notification = ParseNotification(reader);
                if (notification != null)
                {
                    newNotifications.Add(notification);
                }
            }

            await connection.CloseAsync();

            // Clean up temp file
            try { File.Delete(tempDbPath); } catch { }

            // Fire events for new notifications
            foreach (var notification in newNotifications.OrderBy(n => n.Timestamp))
            {
                _logger.LogInformation($"New notification: {notification.AppName} - {notification.Title}");
                NotificationReceived?.Invoke(this, notification);
            }

            if (newNotifications.Count > 0)
            {
                _lastCheck = DateTime.Now;
                _logger.LogInformation($"Processed {newNotifications.Count} new notification(s)");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in CheckForNewNotificationsAsync");
        }
    }

    public async Task<IEnumerable<WindowsNotification>> GetRecentNotificationsAsync(int count = 10)
    {
        try
        {
            // Ensure database path is available
            if (string.IsNullOrEmpty(_notificationDbPath) && !FindNotificationDatabase())
            {
                _logger.LogWarning("Notification database not found");
                return new List<WindowsNotification>();
            }

            // Copy database to avoid file locking issues
            var tempDbPath = Path.Combine(Path.GetTempPath(), $"wpndatabase_copy_{Guid.NewGuid():N}.db");
            File.Copy(_notificationDbPath, tempDbPath, true);

            var connectionString = $"Data Source={tempDbPath};Mode=ReadOnly;";
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT 
                    n.Payload,
                    n.ArrivalTime,
                    h.PrimaryId as AppName,
                    n.Type
                FROM Notification n 
                LEFT JOIN NotificationHandler h ON n.HandlerID = h.RecordID 
                ORDER BY n.ArrivalTime DESC 
                LIMIT @count";

            using var command = new SqliteCommand(sql, connection);
            command.Parameters.AddWithValue("@count", count);

            using var reader = await command.ExecuteReaderAsync();

            var notifications = new List<WindowsNotification>();
            while (await reader.ReadAsync())
            {
                var notification = ParseNotification(reader);
                if (notification != null)
                {
                    notifications.Add(notification);
                }
            }

            await connection.CloseAsync();

            // Clean up temp file
            try { File.Delete(tempDbPath); } catch { }

            return notifications;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recent notifications");
            return new List<WindowsNotification>();
        }
    }

    private static WindowsNotification? ParseNotification(SqliteDataReader reader)
    {
        try
        {
            var payload = reader.GetString(0);
            var arrivalTime = reader.GetInt64(1);
            var appName = reader.IsDBNull(2) ? "Unknown" : reader.GetString(2);
            var type = reader.GetInt32(3);

            var dateTime = DateTime.FromFileTime(arrivalTime);

            var notification = new WindowsNotification
            {
                AppName = CleanAppName(appName),
                Timestamp = dateTime,
                RawPayload = payload,
                NotificationType = type
            };

            // Extract title and message from XML payload
            ExtractNotificationContent(payload, notification);

            return notification;
        }
        catch (Exception)
        {
            return null;
        }
    }

    private static string CleanAppName(string rawAppName)
    {
        // Extract readable app name from Windows app identifier
        if (rawAppName.Contains("!"))
        {
            var parts = rawAppName.Split('!');
            if (parts.Length > 1)
            {
                return parts[1];
            }
        }

        if (rawAppName.Contains("/"))
        {
            var parts = rawAppName.Split('/');
            return parts[^1]; // Last part
        }

        return rawAppName;
    }

    private static void ExtractNotificationContent(string payload, WindowsNotification notification)
    {
        try
        {
            // Basic XML parsing to extract title and message
            if (payload.Contains("<text"))
            {
                var textMatches = Regex.Matches(payload, @"<text[^>]*>([^<]+)</text>", RegexOptions.IgnoreCase);
                var textElements = textMatches.Cast<Match>()
                    .Select(m => m.Groups[1].Value.Trim())
                    .Where(text => !string.IsNullOrEmpty(text))
                    .ToList();

                if (textElements.Count > 0)
                {
                    notification.Title = textElements[0];
                    if (textElements.Count > 1)
                    {
                        notification.Message = textElements[1];
                    }
                }
            }

            // Fallback to generic title if no text elements found
            if (string.IsNullOrEmpty(notification.Title))
            {
                notification.Title = $"Notification from {notification.AppName}";
            }
        }
        catch (Exception)
        {
            notification.Title = $"Notification from {notification.AppName}";
            notification.Message = "Unable to parse notification content";
        }
    }

    public override void Dispose()
    {
        _watcher?.Dispose();
        base.Dispose();
    }
}