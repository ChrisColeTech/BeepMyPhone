using Microsoft.AspNetCore.SignalR;
using WindowsNotificationService.Models;
using WindowsNotificationService.Services;
using System.Collections.Concurrent;

namespace WindowsNotificationService.Hubs;

public class NotificationHub : Hub
{
    private readonly INotificationMonitorService _monitorService;
    private readonly DeviceManagementService _deviceService;
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(
        INotificationMonitorService monitorService, 
        DeviceManagementService deviceService,
        ILogger<NotificationHub> logger)
    {
        _monitorService = monitorService;
        _deviceService = deviceService;
        _logger = logger;
    }

    /// <summary>
    /// Registers a device with the SignalR hub for targeted messaging
    /// </summary>
    /// <param name="deviceId">Unique device identifier</param>
    /// <param name="deviceName">Human-readable device name</param>
    /// <param name="deviceType">Type of device (iOS, Android, Web, etc.)</param>
    public async Task RegisterDevice(string deviceId, string deviceName, string deviceType = "Unknown")
    {
        var device = new RegisteredDevice
        {
            DeviceId = deviceId,
            DeviceName = deviceName,
            DeviceType = deviceType,
            ConnectionId = Context.ConnectionId,
            LastSeen = DateTime.UtcNow,
            IsActive = true
        };

        // Save to database
        await _deviceService.RegisterDeviceAsync(device);
        
        // Add to device-specific group for targeted messaging
        await Groups.AddToGroupAsync(Context.ConnectionId, $"device_{deviceId}");
        
        _logger.LogInformation($"Device registered: {deviceName} ({deviceId}) - {deviceType}");
        
        // Send recent notifications to newly registered device
        var recentNotifications = await _monitorService.GetRecentNotificationsAsync(5);
        foreach (var notification in recentNotifications)
        {
            await Clients.Caller.SendAsync("NotificationReceived", notification);
        }
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation($"Client connected: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation($"Client disconnected: {Context.ConnectionId}");
        
        // Mark device as inactive in database
        await _deviceService.DeactivateDeviceByConnectionAsync(Context.ConnectionId);
        
        await base.OnDisconnectedAsync(exception);
    }

    public async Task RequestRecentNotifications(int count = 10)
    {
        var notifications = await _monitorService.GetRecentNotificationsAsync(count);
        await Clients.Caller.SendAsync("RecentNotifications", notifications);
    }

    /// <summary>
    /// Gets list of currently registered devices
    /// </summary>
    public async Task GetRegisteredDevices()
    {
        var devices = await _deviceService.GetAllDevicesAsync();
        var deviceInfo = devices.Select(d => new 
        { 
            d.DeviceId, 
            d.DeviceName, 
            d.DeviceType, 
            d.IsActive, 
            d.LastSeen 
        }).ToList();
            
        await Clients.Caller.SendAsync("RegisteredDevices", deviceInfo);
    }

    /// <summary>
    /// Sends a notification to a specific device
    /// </summary>
    public async Task SendToDevice(string deviceId, WindowsNotification notification)
    {
        await Clients.Group($"device_{deviceId}").SendAsync("NotificationReceived", notification);
        _logger.LogInformation($"Notification sent to device: {deviceId}");
    }

    /// <summary>
    /// Sends a notification to all registered devices
    /// </summary>
    public async Task SendToAllDevices(WindowsNotification notification)
    {
        await Clients.All.SendAsync("NotificationReceived", notification);
        _logger.LogInformation("Notification broadcast to all devices");
    }
}