using Microsoft.AspNetCore.Mvc;
using WindowsNotificationService.Models;
using WindowsNotificationService.Services;

namespace WindowsNotificationService.Controllers;

/// <summary>
/// API controller for managing Windows notifications
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationMonitorService _monitorService;
    private readonly NotificationFormatterService _formatter;
    private readonly DeviceManagementService _deviceService;
    private readonly NotificationBroadcastService _broadcastService;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(
        INotificationMonitorService monitorService, 
        NotificationFormatterService formatter,
        DeviceManagementService deviceService,
        NotificationBroadcastService broadcastService,
        ILogger<NotificationsController> logger)
    {
        _monitorService = monitorService;
        _formatter = formatter;
        _deviceService = deviceService;
        _broadcastService = broadcastService;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves recent Windows notifications
    /// </summary>
    /// <param name="count">The maximum number of notifications to retrieve (default: 10, max: 100)</param>
    /// <returns>A list of recent Windows notifications</returns>
    /// <response code="200">Returns the list of recent notifications</response>
    /// <response code="400">If the count parameter is invalid</response>
    /// <response code="500">If there was an internal server error</response>
    [HttpGet("recent")]
    [ProducesResponseType(typeof(IEnumerable<WindowsNotification>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<WindowsNotification>>> GetRecentNotifications([FromQuery] int count = 10)
    {
        try
        {
            if (count <= 0 || count > 100)
            {
                return BadRequest("Count must be between 1 and 100");
            }

            var notifications = await _monitorService.GetRecentNotificationsAsync(count);
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recent notifications");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Gets the current status of the notification monitoring service
    /// </summary>
    /// <returns>Service status information including monitoring state and timestamp</returns>
    /// <response code="200">Returns the current service status</response>
    [HttpGet("status")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public ActionResult<object> GetStatus()
    {
        return Ok(new
        {
            IsMonitoring = _monitorService.IsMonitoring,
            ServiceName = "Windows Notification Monitor",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Retrieves recent Windows notifications formatted for mobile display
    /// </summary>
    /// <param name="count">The maximum number of notifications to retrieve (default: 10, max: 100)</param>
    /// <returns>A list of formatted notifications optimized for mobile</returns>
    /// <response code="200">Returns the list of formatted notifications</response>
    /// <response code="400">If the count parameter is invalid</response>
    /// <response code="500">If there was an internal server error</response>
    [HttpGet("recent/formatted")]
    [ProducesResponseType(typeof(IEnumerable<FormattedNotification>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<FormattedNotification>>> GetRecentFormattedNotifications([FromQuery] int count = 10)
    {
        try
        {
            if (count <= 0 || count > 100)
            {
                return BadRequest("Count must be between 1 and 100");
            }

            var notifications = await _monitorService.GetRecentNotificationsAsync(count);
            var formattedNotifications = notifications.Select(n => _formatter.FormatForMobile(n));
            
            return Ok(formattedNotifications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting formatted notifications");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Gets all registered devices
    /// </summary>
    /// <returns>A list of registered devices with their status</returns>
    /// <response code="200">Returns the list of registered devices</response>
    /// <response code="500">If there was an internal server error</response>
    [HttpGet("devices")]
    [ProducesResponseType(typeof(IEnumerable<RegisteredDevice>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<RegisteredDevice>>> GetRegisteredDevices()
    {
        try
        {
            var devices = await _deviceService.GetAllDevicesAsync();
            return Ok(devices);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting registered devices");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Gets only active registered devices
    /// </summary>
    /// <returns>A list of currently active devices</returns>
    /// <response code="200">Returns the list of active devices</response>
    /// <response code="500">If there was an internal server error</response>
    [HttpGet("devices/active")]
    [ProducesResponseType(typeof(IEnumerable<RegisteredDevice>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<RegisteredDevice>>> GetActiveDevices()
    {
        try
        {
            var devices = await _deviceService.GetActiveDevicesAsync();
            return Ok(devices);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active devices");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Registers a new device for notification forwarding
    /// </summary>
    /// <param name="request">Device registration details</param>
    /// <returns>The registered device with connection details</returns>
    /// <response code="200">Device registered successfully</response>
    /// <response code="400">Invalid device data</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("devices/register")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<object>> RegisterDevice([FromBody] DeviceRegistrationRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Device name is required");
            }

            var device = new RegisteredDevice
            {
                DeviceId = Guid.NewGuid().ToString(),
                DeviceName = request.Name,
                DeviceType = request.Platform,
                LastSeen = DateTime.UtcNow,
                IsActive = false
            };

            await _deviceService.RegisterDeviceAsync(device);

            // Generate user-friendly connection code (6-digit PIN)
            var random = new Random();
            var connectionCode = random.Next(100000, 999999).ToString();
            
            // Store the pairing code temporarily (you might want to add this to a cache or database)
            // For now, we'll include both the PIN and device info in the response

            return Ok(new { 
                device, 
                connectionCode,
                pairingInstructions = new {
                    qrCode = $"beep://pair?code={connectionCode}&device={device.DeviceId}",
                    manualCode = connectionCode,
                    instructions = "Enter this 6-digit code in your mobile app to pair your device"
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering device");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Updates an existing device
    /// </summary>
    /// <param name="id">Device ID</param>
    /// <param name="request">Updated device details</param>
    /// <returns>The updated device</returns>
    /// <response code="200">Device updated successfully</response>
    /// <response code="404">Device not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("devices/{id}")]
    [ProducesResponseType(typeof(RegisteredDevice), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<RegisteredDevice>> UpdateDevice(string id, [FromBody] DeviceUpdateRequest request)
    {
        try
        {
            var device = await _deviceService.GetDeviceByIdAsync(id);
            if (device == null)
            {
                return NotFound("Device not found");
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                device.DeviceName = request.Name;
            }
            
            if (request.IsActive.HasValue)
            {
                device.IsActive = request.IsActive.Value;
            }

            await _deviceService.UpdateDeviceAsync(device);
            return Ok(device);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating device {DeviceId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Deletes a registered device
    /// </summary>
    /// <param name="id">Device ID</param>
    /// <returns>Success confirmation</returns>
    /// <response code="204">Device deleted successfully</response>
    /// <response code="404">Device not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("devices/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteDevice(string id)
    {
        try
        {
            var device = await _deviceService.GetDeviceByIdAsync(id);
            if (device == null)
            {
                return NotFound("Device not found");
            }

            await _deviceService.DeleteDeviceAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting device {DeviceId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Sends a test notification to a specific device
    /// </summary>
    /// <param name="id">Device ID</param>
    /// <param name="request">Test notification details</param>
    /// <returns>Success confirmation</returns>
    /// <response code="200">Test notification sent</response>
    /// <response code="404">Device not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("devices/{id}/test")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> SendTestNotification(string id, [FromBody] TestNotificationRequest request)
    {
        try
        {
            var device = await _deviceService.GetDeviceByIdAsync(id);
            if (device == null)
            {
                return NotFound("Device not found");
            }

            // Create test notification
            var testNotification = new WindowsNotification
            {
                Id = Guid.NewGuid().ToString(),
                AppName = "BeepMyPhone Test",
                Title = "Test Notification",
                Message = request.Message ?? "This is a test notification from BeepMyPhone",
                Timestamp = DateTime.UtcNow,
                NotificationType = 0 // Info type
            };

            // Send via NotificationBroadcastService to specific device
            await _broadcastService.SendToDeviceAsync(id, testNotification);
            
            _logger.LogInformation("Test notification sent to device {DeviceId}: {Message}", id, testNotification.Message);
            
            return Ok(new { message = "Test notification sent successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending test notification to device {DeviceId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Gets notification statistics
    /// </summary>
    /// <returns>Statistics about notifications</returns>
    /// <response code="200">Returns notification statistics</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<object>> GetStats()
    {
        try
        {
            var notifications = await _monitorService.GetRecentNotificationsAsync(1000);
            var devices = await _deviceService.GetAllDevicesAsync();
            
            var stats = new
            {
                totalNotifications = notifications.Count(),
                todayNotifications = notifications.Count(n => n.Timestamp.Date == DateTime.UtcNow.Date),
                activeDevices = devices.Count(d => d.IsActive),
                totalDevices = devices.Count(),
                notificationsByApp = notifications.GroupBy(n => n.AppName)
                    .Select(g => new { app = g.Key, count = g.Count() })
                    .OrderByDescending(x => x.count)
                    .Take(5),
                lastNotification = notifications.OrderByDescending(n => n.Timestamp).FirstOrDefault()?.Timestamp
            };
            
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notification stats");
            return StatusCode(500, "Internal server error");
        }
    }
}

// Request models for the new endpoints
public class DeviceRegistrationRequest
{
    public string Name { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
}

public class DeviceUpdateRequest
{
    public string? Name { get; set; }
    public bool? IsActive { get; set; }
}

public class TestNotificationRequest
{
    public string? Message { get; set; }
}