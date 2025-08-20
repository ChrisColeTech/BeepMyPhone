using Microsoft.Data.Sqlite;
using WindowsNotificationService.Models;

namespace WindowsNotificationService.Services;

/// <summary>
/// Service for managing device registration and persistence
/// </summary>
public class DeviceManagementService
{
    private readonly string _databasePath;
    private readonly ILogger<DeviceManagementService> _logger;

    public DeviceManagementService(ILogger<DeviceManagementService> logger)
    {
        _logger = logger;
        
        // Store our database in the app's data directory
        var appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "BeepMyPhone");
        Directory.CreateDirectory(appDataPath);
        _databasePath = Path.Combine(appDataPath, "devices.db");
        
        InitializeDatabase();
    }

    private void InitializeDatabase()
    {
        try
        {
            var connectionString = $"Data Source={_databasePath};";
            using var connection = new SqliteConnection(connectionString);
            connection.Open();

            var createTableSql = @"
                CREATE TABLE IF NOT EXISTS RegisteredDevices (
                    DeviceId TEXT PRIMARY KEY,
                    DeviceName TEXT NOT NULL,
                    DeviceType TEXT NOT NULL,
                    ConnectionId TEXT,
                    LastSeen DATETIME NOT NULL,
                    IsActive INTEGER NOT NULL DEFAULT 1,
                    RegistrationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    NotificationCount INTEGER NOT NULL DEFAULT 0
                );

                CREATE INDEX IF NOT EXISTS idx_device_active ON RegisteredDevices(IsActive);
                CREATE INDEX IF NOT EXISTS idx_device_lastseen ON RegisteredDevices(LastSeen);
            ";

            using var command = new SqliteCommand(createTableSql, connection);
            command.ExecuteNonQuery();

            _logger.LogInformation($"Device database initialized at: {_databasePath}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize device database");
            throw;
        }
    }

    /// <summary>
    /// Registers or updates a device
    /// </summary>
    public async Task<bool> RegisterDeviceAsync(RegisteredDevice device)
    {
        try
        {
            var connectionString = $"Data Source={_databasePath};";
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();

            var sql = @"
                INSERT OR REPLACE INTO RegisteredDevices 
                (DeviceId, DeviceName, DeviceType, ConnectionId, LastSeen, IsActive, RegistrationDate, NotificationCount)
                VALUES 
                (@DeviceId, @DeviceName, @DeviceType, @ConnectionId, @LastSeen, @IsActive, 
                 COALESCE((SELECT RegistrationDate FROM RegisteredDevices WHERE DeviceId = @DeviceId), CURRENT_TIMESTAMP),
                 COALESCE((SELECT NotificationCount FROM RegisteredDevices WHERE DeviceId = @DeviceId), 0))
            ";

            using var command = new SqliteCommand(sql, connection);
            command.Parameters.AddWithValue("@DeviceId", device.DeviceId);
            command.Parameters.AddWithValue("@DeviceName", device.DeviceName);
            command.Parameters.AddWithValue("@DeviceType", device.DeviceType);
            command.Parameters.AddWithValue("@ConnectionId", device.ConnectionId);
            command.Parameters.AddWithValue("@LastSeen", device.LastSeen);
            command.Parameters.AddWithValue("@IsActive", device.IsActive ? 1 : 0);

            var result = await command.ExecuteNonQueryAsync();
            _logger.LogInformation($"Device registered: {device.DeviceName} ({device.DeviceId})");
            
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to register device {DeviceId}", device.DeviceId);
            return false;
        }
    }

    /// <summary>
    /// Gets all registered devices
    /// </summary>
    public async Task<List<RegisteredDevice>> GetAllDevicesAsync()
    {
        var devices = new List<RegisteredDevice>();

        try
        {
            var connectionString = $"Data Source={_databasePath};";
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();

            var sql = "SELECT * FROM RegisteredDevices ORDER BY LastSeen DESC";
            using var command = new SqliteCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                devices.Add(new RegisteredDevice
                {
                    DeviceId = reader["DeviceId"].ToString() ?? string.Empty,
                    DeviceName = reader["DeviceName"].ToString() ?? string.Empty,
                    DeviceType = reader["DeviceType"].ToString() ?? string.Empty,
                    ConnectionId = reader["ConnectionId"] is DBNull ? string.Empty : reader["ConnectionId"].ToString() ?? string.Empty,
                    LastSeen = DateTime.Parse(reader["LastSeen"].ToString() ?? DateTime.UtcNow.ToString()),
                    IsActive = Convert.ToInt32(reader["IsActive"]) == 1
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get registered devices");
        }

        return devices;
    }

    /// <summary>
    /// Gets active devices only
    /// </summary>
    public async Task<List<RegisteredDevice>> GetActiveDevicesAsync()
    {
        var devices = await GetAllDevicesAsync();
        return devices.Where(d => d.IsActive).ToList();
    }

    /// <summary>
    /// Marks a device as inactive by connection ID
    /// </summary>
    public async Task<bool> DeactivateDeviceByConnectionAsync(string connectionId)
    {
        try
        {
            var connectionString = $"Data Source={_databasePath};";
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();

            var sql = @"
                UPDATE RegisteredDevices 
                SET IsActive = 0, LastSeen = CURRENT_TIMESTAMP 
                WHERE ConnectionId = @ConnectionId
            ";

            using var command = new SqliteCommand(sql, connection);
            command.Parameters.AddWithValue("@ConnectionId", connectionId);

            var result = await command.ExecuteNonQueryAsync();
            if (result > 0)
            {
                _logger.LogInformation($"Device deactivated by connection: {connectionId}");
            }
            
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deactivate device by connection {ConnectionId}", connectionId);
            return false;
        }
    }

    /// <summary>
    /// Increments notification count for a device
    /// </summary>
    public async Task IncrementNotificationCountAsync(string deviceId)
    {
        try
        {
            var connectionString = $"Data Source={_databasePath};";
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();

            var sql = @"
                UPDATE RegisteredDevices 
                SET NotificationCount = NotificationCount + 1, LastSeen = CURRENT_TIMESTAMP 
                WHERE DeviceId = @DeviceId
            ";

            using var command = new SqliteCommand(sql, connection);
            command.Parameters.AddWithValue("@DeviceId", deviceId);

            await command.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to increment notification count for device {DeviceId}", deviceId);
        }
    }

    /// <summary>
    /// Gets device by ID
    /// </summary>
    public async Task<RegisteredDevice?> GetDeviceByIdAsync(string deviceId)
    {
        try
        {
            var connectionString = $"Data Source={_databasePath};";
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();

            var sql = "SELECT * FROM RegisteredDevices WHERE DeviceId = @DeviceId";
            using var command = new SqliteCommand(sql, connection);
            command.Parameters.AddWithValue("@DeviceId", deviceId);
            using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new RegisteredDevice
                {
                    DeviceId = reader["DeviceId"].ToString() ?? string.Empty,
                    DeviceName = reader["DeviceName"].ToString() ?? string.Empty,
                    DeviceType = reader["DeviceType"].ToString() ?? string.Empty,
                    ConnectionId = reader["ConnectionId"] is DBNull ? string.Empty : reader["ConnectionId"].ToString() ?? string.Empty,
                    LastSeen = DateTime.Parse(reader["LastSeen"].ToString() ?? DateTime.UtcNow.ToString()),
                    IsActive = Convert.ToInt32(reader["IsActive"]) == 1
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get device {DeviceId}", deviceId);
        }

        return null;
    }

    /// <summary>
    /// Updates an existing device
    /// </summary>
    public async Task<bool> UpdateDeviceAsync(RegisteredDevice device)
    {
        try
        {
            var connectionString = $"Data Source={_databasePath};";
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();

            var sql = @"
                UPDATE RegisteredDevices 
                SET DeviceName = @DeviceName, 
                    DeviceType = @DeviceType,
                    ConnectionId = @ConnectionId,
                    LastSeen = @LastSeen,
                    IsActive = @IsActive
                WHERE DeviceId = @DeviceId
            ";

            using var command = new SqliteCommand(sql, connection);
            command.Parameters.AddWithValue("@DeviceId", device.DeviceId);
            command.Parameters.AddWithValue("@DeviceName", device.DeviceName);
            command.Parameters.AddWithValue("@DeviceType", device.DeviceType);
            command.Parameters.AddWithValue("@ConnectionId", device.ConnectionId);
            command.Parameters.AddWithValue("@LastSeen", device.LastSeen);
            command.Parameters.AddWithValue("@IsActive", device.IsActive ? 1 : 0);

            var result = await command.ExecuteNonQueryAsync();
            _logger.LogInformation($"Device updated: {device.DeviceName} ({device.DeviceId})");
            
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update device {DeviceId}", device.DeviceId);
            return false;
        }
    }

    /// <summary>
    /// Deletes a device by ID
    /// </summary>
    public async Task<bool> DeleteDeviceAsync(string deviceId)
    {
        try
        {
            var connectionString = $"Data Source={_databasePath};";
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();

            var sql = "DELETE FROM RegisteredDevices WHERE DeviceId = @DeviceId";
            using var command = new SqliteCommand(sql, connection);
            command.Parameters.AddWithValue("@DeviceId", deviceId);

            var result = await command.ExecuteNonQueryAsync();
            _logger.LogInformation($"Device deleted: {deviceId}");
            
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete device {DeviceId}", deviceId);
            return false;
        }
    }

    /// <summary>
    /// Cleans up old inactive devices (older than 30 days)
    /// </summary>
    public async Task CleanupOldDevicesAsync()
    {
        try
        {
            var connectionString = $"Data Source={_databasePath};";
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();

            var sql = @"
                DELETE FROM RegisteredDevices 
                WHERE IsActive = 0 AND LastSeen < datetime('now', '-30 days')
            ";

            using var command = new SqliteCommand(sql, connection);
            var deleted = await command.ExecuteNonQueryAsync();
            
            if (deleted > 0)
            {
                _logger.LogInformation($"Cleaned up {deleted} old inactive devices");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup old devices");
        }
    }
}