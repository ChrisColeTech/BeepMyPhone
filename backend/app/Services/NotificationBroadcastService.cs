using Microsoft.AspNetCore.SignalR;
using WindowsNotificationService.Hubs;
using WindowsNotificationService.Models;

namespace WindowsNotificationService.Services;

public class NotificationBroadcastService : IHostedService
{
    private readonly INotificationMonitorService _monitorService;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly NotificationFormatterService _formatter;
    private readonly DeviceManagementService _deviceService;
    private readonly ILogger<NotificationBroadcastService> _logger;

    public NotificationBroadcastService(
        INotificationMonitorService monitorService,
        IHubContext<NotificationHub> hubContext,
        NotificationFormatterService formatter,
        DeviceManagementService deviceService,
        ILogger<NotificationBroadcastService> logger)
    {
        _monitorService = monitorService;
        _hubContext = hubContext;
        _formatter = formatter;
        _deviceService = deviceService;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _monitorService.NotificationReceived += OnNotificationReceived;
        _logger.LogInformation("Notification broadcast service started");
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _monitorService.NotificationReceived -= OnNotificationReceived;
        _logger.LogInformation("Notification broadcast service stopped");
        return Task.CompletedTask;
    }

    private async void OnNotificationReceived(object? sender, WindowsNotification notification)
    {
        try
        {
            // Format notification for mobile display
            var formattedNotification = _formatter.FormatForMobile(notification);
            
            _logger.LogInformation($"Broadcasting formatted notification: {formattedNotification.DisplayTitle}");
            
            // Get active devices for targeted messaging
            var activeDevices = await _deviceService.GetActiveDevicesAsync();
            
            if (activeDevices.Any())
            {
                // Send to all active devices
                await BroadcastToActiveDevices(notification, formattedNotification);
                
                // Update notification counts for each device
                foreach (var device in activeDevices)
                {
                    await _deviceService.IncrementNotificationCountAsync(device.DeviceId);
                }
                
                _logger.LogInformation($"Notification sent to {activeDevices.Count} active devices");
            }
            else
            {
                // No active devices, but still broadcast for any connected clients
                await _hubContext.Clients.All.SendAsync("NotificationReceived", new
                {
                    Original = notification,
                    Formatted = formattedNotification
                });
                
                _logger.LogInformation("Notification broadcast to all clients (no registered devices)");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting notification");
        }
    }

    /// <summary>
    /// Broadcasts notification to all active devices
    /// </summary>
    private async Task BroadcastToActiveDevices(WindowsNotification original, FormattedNotification formatted)
    {
        await _hubContext.Clients.All.SendAsync("NotificationReceived", new
        {
            Original = original,
            Formatted = formatted
        });
    }

    /// <summary>
    /// Sends notification to a specific device
    /// </summary>
    public async Task SendToDeviceAsync(string deviceId, WindowsNotification notification)
    {
        try
        {
            var device = await _deviceService.GetDeviceByIdAsync(deviceId);
            if (device == null || !device.IsActive)
            {
                _logger.LogWarning($"Cannot send notification to inactive device: {deviceId}");
                return;
            }

            var formattedNotification = _formatter.FormatForMobile(notification);

            await _hubContext.Clients.Group($"device_{deviceId}").SendAsync("NotificationReceived", new
            {
                Original = notification,
                Formatted = formattedNotification
            });

            await _deviceService.IncrementNotificationCountAsync(deviceId);
            _logger.LogInformation($"Notification sent to device: {device.DeviceName} ({deviceId})");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to device {DeviceId}", deviceId);
        }
    }

    /// <summary>
    /// Sends notification to devices of a specific type
    /// </summary>
    public async Task SendToDeviceTypeAsync(string deviceType, WindowsNotification notification)
    {
        try
        {
            var devices = await _deviceService.GetActiveDevicesAsync();
            var targetDevices = devices.Where(d => d.DeviceType.Equals(deviceType, StringComparison.OrdinalIgnoreCase)).ToList();

            if (!targetDevices.Any())
            {
                _logger.LogInformation($"No active devices of type '{deviceType}' found");
                return;
            }

            var formattedNotification = _formatter.FormatForMobile(notification);

            foreach (var device in targetDevices)
            {
                await _hubContext.Clients.Group($"device_{device.DeviceId}").SendAsync("NotificationReceived", new
                {
                    Original = notification,
                    Formatted = formattedNotification
                });

                await _deviceService.IncrementNotificationCountAsync(device.DeviceId);
            }

            _logger.LogInformation($"Notification sent to {targetDevices.Count} devices of type '{deviceType}'");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to device type {DeviceType}", deviceType);
        }
    }
}