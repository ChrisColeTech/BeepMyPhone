# BeepMyPhone Tunneling API Reference

Complete interface documentation for all tunnel services and controllers.

## Table of Contents
- [Controllers](#controllers)
- [Core Services](#core-services)
- [Configuration Services](#configuration-services)
- [Health and Monitoring](#health-and-monitoring)
- [Security Services](#security-services)
- [Integration Services](#integration-services)
- [Models and DTOs](#models-and-dtos)

## Controllers

### TunnelController
Primary REST API controller for tunnel management.

```csharp
[ApiController]
[Route("api/tunnel")]
public class TunnelController : ControllerBase
```

#### Endpoints

**GET /api/tunnel/status**
- **Description**: Get current tunnel status and connection information
- **Returns**: `TunnelStatusResponse`
- **Status Codes**: 200 (OK), 503 (Service Unavailable)

**POST /api/tunnel/start**
- **Description**: Start the tunnel service
- **Returns**: `ApiResponse`
- **Status Codes**: 200 (Started), 409 (Already Running), 500 (Error)

**POST /api/tunnel/stop**
- **Description**: Stop the tunnel service
- **Returns**: `ApiResponse`
- **Status Codes**: 200 (Stopped), 404 (Not Running)

**POST /api/tunnel/restart**
- **Body**: `TunnelRestartRequest`
- **Description**: Restart tunnel with optional configuration changes
- **Returns**: `ApiResponse`
- **Status Codes**: 200 (Restarted), 400 (Invalid Request), 500 (Error)

**GET /api/tunnel/url**
- **Description**: Get the current public tunnel URL
- **Returns**: `string` (URL)
- **Status Codes**: 200 (OK), 404 (No Active Tunnel)

**GET /api/tunnel/qrcode**
- **Query Parameters**: 
  - `size` (optional): QR code size in pixels (default: 256)
  - `format` (optional): png|svg (default: png)
- **Description**: Generate QR code for mobile device setup
- **Returns**: Image binary or SVG text
- **Status Codes**: 200 (OK), 503 (Tunnel Not Available)

**GET /api/tunnel/health**
- **Description**: Get detailed tunnel health metrics
- **Returns**: `HealthCheckResult`
- **Status Codes**: 200 (Healthy), 503 (Unhealthy)

**GET /api/tunnel/metrics**
- **Description**: Get performance metrics
- **Returns**: `PerformanceMetrics`
- **Status Codes**: 200 (OK)

## Core Services

### ITunnelControlService
Central service for tunnel lifecycle management.

```csharp
public interface ITunnelControlService
{
    Task<TunnelStatus> StartTunnelAsync(CancellationToken cancellationToken = default);
    Task<TunnelStatus> StopTunnelAsync(CancellationToken cancellationToken = default);
    Task<TunnelStatus> RestartTunnelAsync(TunnelRestartRequest request, CancellationToken cancellationToken = default);
    Task<TunnelStatus> GetStatusAsync(CancellationToken cancellationToken = default);
    Task<string?> GetPublicUrlAsync(CancellationToken cancellationToken = default);
    
    event EventHandler<StatusChangeEventArgs> StatusChanged;
}
```

### ITunnelQueryService
Service for tunnel information queries.

```csharp
public interface ITunnelQueryService
{
    Task<TunnelStatusResponse> GetDetailedStatusAsync(CancellationToken cancellationToken = default);
    Task<HealthCheckResult> GetHealthAsync(CancellationToken cancellationToken = default);
    Task<PerformanceMetrics> GetMetricsAsync(CancellationToken cancellationToken = default);
    Task<StatusHistory> GetStatusHistoryAsync(TimeSpan period, CancellationToken cancellationToken = default);
}
```

### IFrpProcessManager
FRP process lifecycle management.

```csharp
public interface IFrpProcessManager
{
    Task<ProcessStatus> StartAsync(FrpConfiguration configuration, CancellationToken cancellationToken = default);
    Task<ProcessStatus> StopAsync(CancellationToken cancellationToken = default);
    Task<ProcessStatus> RestartAsync(FrpConfiguration configuration, CancellationToken cancellationToken = default);
    Task<ProcessStatus> GetStatusAsync();
    
    event EventHandler<ProcessEventArgs> ProcessExited;
    event EventHandler<ProcessEventArgs> ProcessStarted;
    event EventHandler<ProcessEventArgs> ProcessError;
}
```

## Configuration Services

### ITunnelConfigurationService
Configuration management and validation.

```csharp
public interface ITunnelConfigurationService
{
    Task<TunnelConfiguration> GetConfigurationAsync();
    Task<TunnelConfiguration> UpdateConfigurationAsync(TunnelConfiguration configuration);
    Task<bool> ValidateConfigurationAsync(TunnelConfiguration configuration);
    Task ReloadConfigurationAsync();
    
    event EventHandler<ConfigurationChange> ConfigurationChanged;
}
```

### IConfigurationHotReloadService
Real-time configuration updates.

```csharp
public interface IConfigurationHotReloadService
{
    Task StartWatchingAsync();
    Task StopWatchingAsync();
    Task<ConfigurationChangeResult> ApplyChangeAsync(ConfigurationChange change);
    
    event EventHandler<ConfigurationChange> ConfigurationFileChanged;
}
```

## Health and Monitoring

### ITunnelHealthMonitor
Continuous health monitoring service.

```csharp
public interface ITunnelHealthMonitor
{
    Task<HealthStatus> GetCurrentHealthAsync();
    Task<HealthCheckResult> PerformHealthCheckAsync();
    Task StartMonitoringAsync(TimeSpan interval);
    Task StopMonitoringAsync();
    
    event EventHandler<HealthStatusEventArgs> HealthStatusChanged;
}
```

### ITunnelPerformanceMonitor
Performance metrics collection and monitoring.

```csharp
public interface ITunnelPerformanceMonitor
{
    Task<PerformanceMetrics> GetCurrentMetricsAsync();
    Task<MetricSnapshot> TakeSnapshotAsync();
    Task StartCollectionAsync(TimeSpan interval);
    Task StopCollectionAsync();
    
    event EventHandler<PerformanceMetrics> MetricsUpdated;
}
```

### ITunnelReconnectionManager
Automatic reconnection and failure recovery.

```csharp
public interface ITunnelReconnectionManager
{
    Task<bool> AttemptReconnectionAsync();
    Task SetReconnectionStrategyAsync(IReconnectionStrategy strategy);
    Task StartAutomaticReconnectionAsync();
    Task StopAutomaticReconnectionAsync();
    
    event EventHandler<ReconnectionAttempt> ReconnectionAttempted;
    event EventHandler<ConnectionState> ConnectionStateChanged;
}
```

## Security Services

### ITunnelSecurityService
Security and encryption management.

```csharp
public interface ITunnelSecurityService
{
    Task<AuthenticationToken> GenerateTokenAsync(DeviceCredentials credentials);
    Task<bool> ValidateTokenAsync(string token);
    Task<DeviceCredentials> AuthenticateDeviceAsync(string deviceId, string authCode);
    Task RevokeTokenAsync(string token);
    
    event EventHandler<string> TokenRevoked;
}
```

### IDeviceAuthenticationService
Device-specific authentication handling.

```csharp
public interface IDeviceAuthenticationService
{
    Task<string> GenerateAuthCodeAsync(string deviceId);
    Task<bool> ValidateAuthCodeAsync(string deviceId, string authCode);
    Task<DeviceCredentials> RegisterDeviceAsync(string deviceId, string authCode);
    Task UnregisterDeviceAsync(string deviceId);
}
```

## Integration Services

### ITunnelServiceIntegration
Integration with BeepMyPhone backend services.

```csharp
public interface ITunnelServiceIntegration
{
    Task<bool> RegisterWithBackendAsync();
    Task<bool> UnregisterFromBackendAsync();
    Task<string> GetBackendBaseUrlAsync();
    Task NotifyBackendOfStatusChangeAsync(TunnelStatus status);
    
    event EventHandler<IntegrationOptions> BackendConnectionChanged;
}
```

### TunnelHostedService
ASP.NET Core hosted service for tunnel lifecycle.

```csharp
public class TunnelHostedService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken);
    public override async Task StartAsync(CancellationToken cancellationToken);
    public override async Task StopAsync(CancellationToken cancellationToken);
}
```

## Models and DTOs

### TunnelStatusResponse
Complete tunnel status information for API responses.

```csharp
public class TunnelStatusResponse
{
    public string Status { get; set; }
    public string? PublicUrl { get; set; }
    public DateTime? StartedAt { get; set; }
    public TimeSpan? Uptime { get; set; }
    public HealthStatus Health { get; set; }
    public PerformanceMetrics Metrics { get; set; }
    public string? ServerLocation { get; set; }
    public bool IsSecure { get; set; }
}
```

### TunnelRestartRequest
Request model for tunnel restart operations.

```csharp
public class TunnelRestartRequest
{
    public bool ForceRestart { get; set; } = false;
    public TunnelConfiguration? NewConfiguration { get; set; }
    public bool WaitForStability { get; set; } = true;
    public TimeSpan? Timeout { get; set; }
}
```

### TunnelConfiguration
Complete tunnel configuration model.

```csharp
public class TunnelConfiguration
{
    public RelayServerConfiguration RelayServer { get; set; }
    public SecurityConfiguration Security { get; set; }
    public PerformanceConfiguration Performance { get; set; }
    public Dictionary<string, object> Advanced { get; set; }
}
```

### HealthCheckResult
Health check result with detailed status information.

```csharp
public class HealthCheckResult
{
    public HealthStatus Status { get; set; }
    public Dictionary<string, object> Details { get; set; }
    public TimeSpan ResponseTime { get; set; }
    public DateTime CheckedAt { get; set; }
    public string? ErrorMessage { get; set; }
}
```

### PerformanceMetrics
Performance monitoring data.

```csharp
public class PerformanceMetrics
{
    public double CpuUsagePercent { get; set; }
    public long MemoryUsageBytes { get; set; }
    public long NetworkBytesReceived { get; set; }
    public long NetworkBytesSent { get; set; }
    public double AverageResponseTime { get; set; }
    public int ActiveConnections { get; set; }
    public DateTime CollectedAt { get; set; }
}
```

### QrCodeContent
QR code content structure for mobile setup.

```csharp
public class QrCodeContent
{
    public string TunnelUrl { get; set; }
    public string AuthToken { get; set; }
    public string ServerFingerprint { get; set; }
    public Dictionary<string, string> Metadata { get; set; }
}
```

## Error Handling

### ApiResponse
Standard API response wrapper with error handling.

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorCode { get; set; }
    public DateTime Timestamp { get; set; }
}
```

### ErrorResponse
Detailed error information for API responses.

```csharp
public class ErrorResponse
{
    public string ErrorCode { get; set; }
    public string Message { get; set; }
    public string? Details { get; set; }
    public string? HelpUrl { get; set; }
    public DateTime Timestamp { get; set; }
}
```

## Authentication

All API endpoints support the following authentication methods:

1. **Bearer Token**: Include `Authorization: Bearer <token>` header
2. **API Key**: Include `X-API-Key: <key>` header
3. **Device Authentication**: Include `X-Device-ID: <id>` and `X-Auth-Code: <code>` headers

## Rate Limiting

- **Control Operations** (start/stop/restart): 10 requests per minute
- **Status Queries**: 100 requests per minute
- **Health Checks**: 60 requests per minute
- **QR Code Generation**: 20 requests per minute

## WebSocket Support

Real-time status updates available via WebSocket at `/ws/tunnel/status`:

```javascript
// Connection
const ws = new WebSocket('ws://localhost:5000/ws/tunnel/status');

// Message format
{
  "type": "status_update",
  "data": {
    "status": "connected",
    "publicUrl": "https://abc123.frp.example.com",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## Service Dependencies

The tunnel service depends on the following external services:

1. **FRP Binary**: Downloaded from GitHub releases
2. **Relay Servers**: Public FRP relay servers or custom instances
3. **BeepMyPhone Backend**: For integration and status reporting

All dependencies are automatically managed by the service with proper error handling and fallback mechanisms.