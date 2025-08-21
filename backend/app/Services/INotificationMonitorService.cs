using WindowsNotificationService.Models;

namespace WindowsNotificationService.Services;

public interface INotificationMonitorService
{
    event EventHandler<WindowsNotification>? NotificationReceived;
    Task<IEnumerable<WindowsNotification>> GetRecentNotificationsAsync(int count = 10);
    bool IsMonitoring { get; }
}