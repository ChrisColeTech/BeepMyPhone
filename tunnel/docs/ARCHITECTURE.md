# BeepMyPhone Tunneling Architecture Guide

This document defines and enforces clean architecture patterns, SOLID principles, and anti-pattern prevention for the BeepMyPhone tunneling component.

## 🏗️ SOLID Principles Implementation

### Single Responsibility Principle (SRP)

#### Definition and Component Examples

The Single Responsibility Principle states that a class should have only one reason to change, meaning it should have only one job or responsibility.

#### ✅ Correct Implementation Examples

**FrpBinaryManager** - Responsibility: FRP binary lifecycle management only
```csharp
public class FrpBinaryManager : IFrpBinaryManager
{
    private readonly IBinaryDownloadSource _downloadSource;
    private readonly IBinaryValidationService _validationService;
    private readonly ILogger<FrpBinaryManager> _logger;

    // Single responsibility: Manage FRP binary download, validation, and caching
    public async Task<string> EnsureBinaryAvailableAsync(CancellationToken cancellationToken)
    {
        // Only handles binary management logic
    }
}
```

**TunnelConfigurationService** - Responsibility: Configuration loading and validation only
```csharp
public class TunnelConfigurationService : ITunnelConfigurationService
{
    // Single responsibility: Load, validate, and manage tunnel configuration
    public async Task<TunnelConfiguration> LoadConfigurationAsync()
    {
        // Only handles configuration management logic
    }
}
```

#### ❌ Violation Examples with Explanations

**Violation: Mixed Responsibilities**
```csharp
// BAD: This class violates SRP by mixing multiple concerns
public class TunnelManager
{
    public async Task DownloadFrpBinary() { } // Binary management responsibility
    public async Task LoadConfiguration() { } // Configuration responsibility  
    public async Task StartTunnel() { } // Process management responsibility
    public async Task MonitorHealth() { } // Health monitoring responsibility
    
    // This class has 4 different reasons to change!
}
```

**Violation: Business Logic in Controller**
```csharp
// BAD: Controller handling business logic instead of just HTTP concerns
public class TunnelController : ControllerBase
{
    [HttpPost("restart")]
    public async Task<IActionResult> RestartTunnel()
    {
        // BAD: Complex business logic in controller
        if (await IsHealthy())
        {
            await StopProcess();
            await StartProcess();
            await WaitForConnection();
        }
        // Controller should only handle HTTP concerns!
    }
}
```

#### Enforcement Rules

- **Class Size Limit**: Maximum 350 lines for complex services, 250 lines for standard services
- **Method Limit**: Maximum 50 lines per method
- **Responsibility Audit**: Each class must have single, clearly documented responsibility
- **Change Analysis**: If a class changes for multiple unrelated reasons, it violates SRP
- **Dependency Count**: Maximum 8 constructor dependencies (high dependency count often indicates multiple responsibilities)

### Open/Closed Principle (OCP)

#### Extension Patterns for .NET Tunneling Technology

The Open/Closed Principle states that software entities should be open for extension but closed for modification.

#### ✅ Correct Implementation Examples

**Strategy Pattern for Reconnection Algorithms**
```csharp
public interface IReconnectionStrategy
{
    Task<TimeSpan> CalculateDelayAsync(int attemptNumber, Exception lastError);
}

public class ExponentialBackoffStrategy : IReconnectionStrategy
{
    public async Task<TimeSpan> CalculateDelayAsync(int attemptNumber, Exception lastError)
    {
        // Exponential backoff implementation
        return TimeSpan.FromSeconds(Math.Pow(2, attemptNumber));
    }
}

public class LinearBackoffStrategy : IReconnectionStrategy
{
    public async Task<TimeSpan> CalculateDelayAsync(int attemptNumber, Exception lastError)
    {
        // Linear backoff implementation
        return TimeSpan.FromSeconds(attemptNumber * 5);
    }
}

// Client code remains unchanged when adding new strategies
public class TunnelReconnectionManager
{
    private readonly IReconnectionStrategy _strategy;
    
    // Can use any strategy without modification
    public TunnelReconnectionManager(IReconnectionStrategy strategy)
    {
        _strategy = strategy;
    }
}
```

**Provider Pattern for Binary Download Sources**
```csharp
public interface IBinaryDownloadSource
{
    Task<BinaryInfo> DownloadBinaryAsync(PlatformInfo platform, CancellationToken cancellationToken);
}

public class GitHubReleaseBinarySource : IBinaryDownloadSource
{
    // Download from GitHub releases
}

public class LocalCacheBinarySource : IBinaryDownloadSource  
{
    // Use local cached binary
}

public class CustomRepositoryBinarySource : IBinaryDownloadSource
{
    // Download from custom repository - NEW extension without modifying existing code
}
```

#### ❌ Violation Examples

**Violation: Hard-coded Strategy Selection**
```csharp
// BAD: Hard-coded reconnection logic
public class TunnelReconnectionManager
{
    public async Task<TimeSpan> CalculateDelay(int attempt, string failureType)
    {
        // BAD: Adding new strategies requires modifying this code
        if (failureType == "network")
        {
            return TimeSpan.FromSeconds(Math.Pow(2, attempt));
        }
        else if (failureType == "authentication")
        {
            return TimeSpan.FromSeconds(attempt * 5);
        }
        // Adding new failure types requires modification here!
    }
}
```

#### Interface and Abstraction Strategies

- **Service Interfaces**: All major services exposed through interfaces
- **Configuration-Driven Behavior**: Use configuration to select implementations
- **Plugin Architecture**: Support for runtime plugin loading through interfaces
- **Extension Points**: Clearly defined extension points for future enhancements

### Liskov Substitution Principle (LSP)

#### Inheritance and Interface Implementation Rules

The Liskov Substitution Principle states that objects of a superclass should be replaceable with objects of a subclass without breaking the application.

#### ✅ Correct Implementation Examples

**Consistent Health Check Implementations**
```csharp
public interface IHealthCheck
{
    Task<HealthCheckResult> CheckHealthAsync(CancellationToken cancellationToken);
}

public class HttpHealthCheck : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(CancellationToken cancellationToken)
    {
        // Always returns valid HealthCheckResult
        // Never throws exceptions for normal operation failures
        // Consistent timeout behavior
        try
        {
            var response = await _httpClient.GetAsync(_endpoint, cancellationToken);
            return new HealthCheckResult(response.IsSuccessStatusCode, "HTTP check completed");
        }
        catch (Exception ex)
        {
            return new HealthCheckResult(false, ex.Message);
        }
    }
}

public class TcpHealthCheck : IHealthCheck  
{
    public async Task<HealthCheckResult> CheckHealthAsync(CancellationToken cancellationToken)
    {
        // Identical contract behavior - fully substitutable
        try
        {
            using var client = new TcpClient();
            await client.ConnectAsync(_host, _port);
            return new HealthCheckResult(true, "TCP connection successful");
        }
        catch (Exception ex)
        {
            return new HealthCheckResult(false, ex.Message);
        }
    }
}
```

#### ❌ Violation Examples

**Violation: Inconsistent Exception Behavior**
```csharp
// BAD: Inconsistent exception handling violates LSP
public class UnreliableHealthCheck : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(CancellationToken cancellationToken)
    {
        // BAD: Throws exceptions while other implementations return HealthCheckResult
        if (someCondition)
        {
            throw new InvalidOperationException("This breaks substitutability!");
        }
        return new HealthCheckResult(true, "Check passed");
    }
}
```

#### Type Safety Requirements

- **Contract Consistency**: All implementations must honor the same contracts
- **Exception Behavior**: Consistent exception handling across implementations
- **Return Value Consistency**: Same return value semantics for all implementations
- **Side Effect Consistency**: Similar side effect behavior across implementations

#### Substitution Test Patterns

- **Unit Testing**: All implementations tested with identical test patterns
- **Integration Testing**: Substitution testing using different implementations
- **Contract Testing**: Automated testing of interface contracts
- **Behavioral Testing**: Verification of consistent behavior across implementations

### Interface Segregation Principle (ISP)

#### Interface Design Guidelines

The Interface Segregation Principle states that clients should not be forced to depend on interfaces they do not use.

#### ✅ Correct Implementation Examples

**Segregated Status Interfaces**
```csharp
// Focused interface for read-only status access
public interface IStatusReader
{
    Task<TunnelStatus> GetCurrentStatusAsync();
    Task<StatusHistory> GetStatusHistoryAsync(TimeSpan period);
}

// Focused interface for status updates
public interface IStatusWriter
{
    Task UpdateStatusAsync(TunnelStatus status);
    Task RecordStatusChangeAsync(StatusChangeEventArgs change);
}

// Focused interface for status notifications
public interface IStatusNotifier
{
    event EventHandler<StatusChangeEventArgs> StatusChanged;
    Task NotifyStatusChangeAsync(StatusChangeEventArgs change);
}

// Client uses only what it needs
public class TunnelDashboard
{
    private readonly IStatusReader _statusReader; // Only needs read access
    
    public TunnelDashboard(IStatusReader statusReader)
    {
        _statusReader = statusReader;
    }
}
```

**Segregated Configuration Interfaces**
```csharp
public interface IRelayConfiguration
{
    List<string> RelayServers { get; }
    string PreferredRegion { get; }
}

public interface ISecurityConfiguration  
{
    bool EncryptionEnabled { get; }
    string AuthenticationMethod { get; }
}

public interface IPerformanceConfiguration
{
    int HeartbeatInterval { get; }
    int ConnectionTimeout { get; }
}

// Clients depend only on configuration sections they use
public class RelayServerManager
{
    private readonly IRelayConfiguration _relayConfig; // Only relay configuration
    
    public RelayServerManager(IRelayConfiguration relayConfig)
    {
        _relayConfig = relayConfig;
    }
}
```

#### ❌ Violation Examples

**Violation: Monolithic Interface**
```csharp
// BAD: Monolithic interface forcing unnecessary dependencies
public interface ITunnelManager
{
    // Binary management methods
    Task<string> DownloadBinaryAsync();
    Task ValidateBinaryAsync(string path);
    
    // Configuration methods  
    Task<TunnelConfiguration> LoadConfigurationAsync();
    Task SaveConfigurationAsync(TunnelConfiguration config);
    
    // Process management methods
    Task StartProcessAsync();
    Task StopProcessAsync();
    
    // Health monitoring methods
    Task<HealthStatus> CheckHealthAsync();
    Task StartHealthMonitoringAsync();
    
    // QR code methods
    Task<byte[]> GenerateQrCodeAsync();
    
    // Clients are forced to depend on ALL methods even if they only need one area!
}
```

#### Dependency Injection Patterns

- **Constructor Injection**: Use focused interfaces in constructor parameters
- **Service Registration**: Register implementations against specific interfaces
- **Client Isolation**: Ensure clients receive only interfaces they need
- **Interface Composition**: Compose larger interfaces from smaller focused ones when needed

#### Service Contract Definitions

- **Single Concern Interfaces**: Each interface addresses one specific concern
- **Minimal Method Sets**: Include only methods clients actually need
- **Role-Based Design**: Design interfaces around client roles and usage patterns
- **Cohesive Functionality**: Methods in interface should be related and commonly used together

### Dependency Inversion Principle (DIP)

#### Dependency Injection Implementation

The Dependency Inversion Principle states that high-level modules should not depend on low-level modules; both should depend on abstractions.

#### ✅ Correct Implementation Examples

**High-Level Service with Abstracted Dependencies**
```csharp
public class TunnelService // High-level module
{
    private readonly IFrpProcessManager _processManager;        // Abstraction
    private readonly ITunnelConfigurationService _configService; // Abstraction
    private readonly ITunnelHealthMonitor _healthMonitor;       // Abstraction
    private readonly ILogger<TunnelService> _logger;            // Abstraction

    public TunnelService(
        IFrpProcessManager processManager,
        ITunnelConfigurationService configService,
        ITunnelHealthMonitor healthMonitor,
        ILogger<TunnelService> logger)
    {
        _processManager = processManager;
        _configService = configService;
        _healthMonitor = healthMonitor;
        _logger = logger;
    }

    public async Task StartTunnelAsync()
    {
        // High-level business logic using abstractions
        var config = await _configService.LoadConfigurationAsync();
        await _processManager.StartProcessAsync(config);
        await _healthMonitor.StartMonitoringAsync();
    }
}
```

**Abstracted External Dependencies**
```csharp
// Abstraction for file system operations
public interface IFileSystemService
{
    Task<bool> FileExistsAsync(string path);
    Task<byte[]> ReadAllBytesAsync(string path);
    Task WriteAllBytesAsync(string path, byte[] content);
}

// Abstraction for HTTP operations
public interface IHttpClientService
{
    Task<HttpResponseMessage> GetAsync(string url, CancellationToken cancellationToken);
    Task<HttpResponseMessage> PostAsync(string url, HttpContent content, CancellationToken cancellationToken);
}

// High-level service depends on abstractions, not concrete implementations
public class FrpBinaryManager
{
    private readonly IFileSystemService _fileSystem;     // Abstraction
    private readonly IHttpClientService _httpClient;     // Abstraction
    
    public FrpBinaryManager(IFileSystemService fileSystem, IHttpClientService httpClient)
    {
        _fileSystem = fileSystem;
        _httpClient = httpClient;
    }
}
```

#### ❌ Violation Examples

**Violation: Direct Dependency on Concrete Types**
```csharp
// BAD: High-level module depending on low-level concrete types
public class TunnelService
{
    private readonly FrpProcessManager _processManager;        // Concrete type!
    private readonly FileSystemService _fileSystem;           // Concrete type!
    private readonly HttpClient _httpClient;                  // Concrete type!
    
    public TunnelService()
    {
        // BAD: Creating dependencies directly
        _processManager = new FrpProcessManager();
        _fileSystem = new FileSystemService();
        _httpClient = new HttpClient();
    }
}
```

#### Abstraction Layer Design

- **Service Abstractions**: All major services exposed through interfaces
- **Infrastructure Abstractions**: External dependencies abstracted through interfaces
- **Data Access Abstractions**: Database and file operations abstracted
- **Cross-Cutting Abstractions**: Logging, caching, and monitoring abstracted

#### Service Container Patterns

**Dependency Registration**
```csharp
public static class TunnelServiceRegistration
{
    public static IServiceCollection AddTunnelingServices(this IServiceCollection services)
    {
        // Register abstractions with implementations
        services.AddSingleton<IFrpBinaryManager, FrpBinaryManager>();
        services.AddSingleton<ITunnelConfigurationService, TunnelConfigurationService>();
        services.AddSingleton<ITunnelHealthMonitor, TunnelHealthMonitor>();
        services.AddSingleton<IFileSystemService, FileSystemService>();
        services.AddHttpClient<IHttpClientService, HttpClientService>();
        
        return services;
    }
}
```

## 🧹 DRY Principle Implementation

### Code Reuse Strategies

#### ✅ Correct Implementation Examples

**Base Service Classes for Common Functionality**
```csharp
public abstract class TunnelServiceBase
{
    protected readonly ILogger _logger;
    protected readonly CancellationTokenSource _cancellationTokenSource;

    protected TunnelServiceBase(ILogger logger)
    {
        _logger = logger;
        _cancellationTokenSource = new CancellationTokenSource();
    }

    protected async Task<T> ExecuteWithRetryAsync<T>(
        Func<Task<T>> operation, 
        int maxRetries = 3,
        TimeSpan delay = default)
    {
        // Common retry logic used across multiple services
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                return await operation();
            }
            catch (Exception ex) when (attempt < maxRetries)
            {
                _logger.LogWarning("Attempt {Attempt} failed: {Error}", attempt, ex.Message);
                await Task.Delay(delay == default ? TimeSpan.FromSeconds(attempt) : delay);
            }
        }
        
        return await operation(); // Final attempt without catch
    }

    protected virtual void Dispose(bool disposing)
    {
        if (disposing)
        {
            _cancellationTokenSource?.Cancel();
            _cancellationTokenSource?.Dispose();
        }
    }
}
```

#### Abstraction Techniques

**Common Result Patterns**
```csharp
public class Result<T>
{
    public bool Success { get; }
    public T Value { get; }
    public string Error { get; }
    
    private Result(bool success, T value, string error)
    {
        Success = success;
        Value = value;
        Error = error;
    }
    
    public static Result<T> Ok(T value) => new Result<T>(true, value, null);
    public static Result<T> Fail(string error) => new Result<T>(false, default(T), error);
}

// Used consistently across all services
public interface ITunnelHealthMonitor
{
    Task<Result<HealthStatus>> CheckHealthAsync();
}

public interface IFrpProcessManager
{
    Task<Result<ProcessStatus>> StartProcessAsync();
}
```

#### Utility Function Organization

**Extension Methods for Common Operations**
```csharp
public static class StringExtensions
{
    public static bool IsValidUrl(this string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uri) &&
               (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }
    
    public static string ToSnakeCase(this string input)
    {
        return Regex.Replace(input, "([a-z0-9])([A-Z])", "$1_$2").ToLower();
    }
}

public static class TaskExtensions
{
    public static async Task<T> WithTimeout<T>(this Task<T> task, TimeSpan timeout)
    {
        using var timeoutCts = new CancellationTokenSource(timeout);
        var completedTask = await Task.WhenAny(task, Task.Delay(timeout, timeoutCts.Token));
        
        if (completedTask == task)
        {
            timeoutCts.Cancel();
            return await task;
        }
        
        throw new TimeoutException($"Operation timed out after {timeout}");
    }
}
```

#### Component Composition Patterns

**Service Builder Pattern for Complex Configuration**
```csharp
public class TunnelServiceBuilder
{
    private readonly List<IReconnectionStrategy> _strategies = new();
    private readonly List<IBinaryDownloadSource> _binarySources = new();
    private TunnelConfiguration _configuration;

    public TunnelServiceBuilder WithExponentialBackoff(double multiplier = 2.0)
    {
        _strategies.Add(new ExponentialBackoffStrategy(multiplier));
        return this;
    }

    public TunnelServiceBuilder WithGitHubBinarySource()
    {
        _binarySources.Add(new GitHubReleaseBinarySource());
        return this;
    }

    public TunnelServiceBuilder WithConfiguration(TunnelConfiguration configuration)
    {
        _configuration = configuration;
        return this;
    }

    public ITunnelService Build()
    {
        // Compose service with configured components
        return new TunnelService(_strategies, _binarySources, _configuration);
    }
}
```

## 🚫 Anti-Pattern Prevention Rules

### Spaghetti Code Prevention

#### Clear Component Boundaries

**✅ Correct Layered Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                      │
│  Controllers (HTTP) → Services (Business Logic)            │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                    │
│  Services → Managers → Core Business Objects               │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                    │
│  External APIs, File System, Process Management            │
└─────────────────────────────────────────────────────────────┘

Dependency Direction: Presentation → Business → Infrastructure
```

**Explicit Interface Contracts**
```csharp
// Clear boundaries through interface contracts
namespace BeepMyPhone.Tunneling.Services.BinaryManagement
{
    public interface IFrpBinaryManager  // Clear service boundary
    {
        Task<string> EnsureBinaryAvailableAsync(CancellationToken cancellationToken);
    }
}

namespace BeepMyPhone.Tunneling.Services.ProcessManagement  
{
    public interface IFrpProcessManager  // Clear service boundary
    {
        Task<ProcessStatus> StartProcessAsync(FrpConfiguration configuration);
    }
}

// Services communicate only through interfaces, never direct dependencies
```

#### Dependency Direction Rules

- **Upward Dependencies Only**: Lower layers never depend on higher layers
- **Interface-Based Communication**: All layer communication through interfaces
- **No Circular References**: Automated detection and prevention of circular dependencies
- **Explicit Contracts**: All dependencies explicitly declared through constructor injection

#### Coupling Minimization Strategies

**Event-Driven Decoupling**
```csharp
public class TunnelStatusManager : ITunnelStatusManager
{
    public event EventHandler<StatusChangeEventArgs> StatusChanged;

    protected virtual void OnStatusChanged(StatusChangeEventArgs e)
    {
        StatusChanged?.Invoke(this, e);
    }
}

// Decoupled consumers
public class TunnelDashboard
{
    public TunnelDashboard(ITunnelStatusManager statusManager)
    {
        statusManager.StatusChanged += HandleStatusChange; // Loose coupling through events
    }
}
```

### Monster Class Prevention

#### Maximum Component Size Limits

**Class Size Limits by Type:**
- **Controllers**: Maximum 300 lines
- **Services**: Maximum 250 lines (standard), 350 lines (complex with justification)
- **Managers**: Maximum 300 lines
- **Models**: Maximum 150 lines
- **Interfaces**: Maximum 50 lines

**Method Complexity Limits:**
- **Individual Methods**: Maximum 50 lines
- **Cyclomatic Complexity**: Maximum 15 (complex algorithms), 10 (standard methods)
- **Parameter Count**: Maximum 6 parameters
- **Nesting Depth**: Maximum 4 levels

#### Maximum Method Complexity Limits

**Automated Complexity Analysis**
```csharp
// GOOD: Simple, focused method
public async Task<HealthCheckResult> CheckHttpHealthAsync(string endpoint)
{
    try
    {
        var response = await _httpClient.GetAsync(endpoint);
        return new HealthCheckResult(response.IsSuccessStatusCode, "HTTP check completed");
    }
    catch (Exception ex)
    {
        return new HealthCheckResult(false, ex.Message);
    }
}

// BAD: Complex method violating complexity limits
public async Task<ComplexResult> DoManyThingsAsync(string input) // Violates method complexity
{
    // 100+ lines of complex logic with multiple nested conditions
    // Cyclomatic complexity > 15
    // Multiple responsibilities mixed together
}
```

#### Single Responsibility Enforcement

**Refactoring Guidelines for Oversized Classes**
```csharp
// BEFORE: Monster class violating SRP
public class TunnelManager  // 800+ lines, multiple responsibilities
{
    public async Task DownloadBinary() { }
    public async Task LoadConfiguration() { }
    public async Task StartProcess() { }
    public async Task MonitorHealth() { }
    public async Task HandleReconnection() { }
    public async Task GenerateQrCode() { }
}

// AFTER: Properly decomposed services
public class TunnelService  // 200 lines, orchestration only
{
    private readonly IFrpBinaryManager _binaryManager;
    private readonly ITunnelConfigurationService _configService;
    private readonly IFrpProcessManager _processManager;
    
    // Coordinates other services, doesn't implement business logic
}

public class FrpBinaryManager  // 180 lines, binary management only
{
    // Focused on binary download, validation, and caching
}

public class TunnelConfigurationService  // 150 lines, configuration only  
{
    // Focused on configuration loading and validation
}
```

### God Object Prevention

#### Responsibility Distribution Rules

**Service Decomposition by Domain**
```csharp
// Each service has a single, well-defined domain responsibility

public class TunnelHealthMonitor  // Domain: Health monitoring
{
    // ONLY health check logic
    public async Task<HealthStatus> CheckHealthAsync() { }
    public async Task StartContinuousMonitoringAsync() { }
}

public class TunnelReconnectionManager  // Domain: Connection recovery
{
    // ONLY reconnection logic
    public async Task HandleConnectionFailureAsync(Exception error) { }
    public async Task AttemptReconnectionAsync() { }
}

public class TunnelStatusManager  // Domain: Status management
{
    // ONLY status aggregation and notification
    public async Task UpdateStatusAsync(TunnelStatus status) { }
    public async Task NotifyStatusChangeAsync() { }
}
```

#### Service Decomposition Strategies

**Domain-Driven Service Boundaries**
- **Binary Management Domain**: Download, validation, versioning
- **Configuration Domain**: Loading, validation, hot-reload
- **Process Management Domain**: Startup, monitoring, shutdown
- **Health Monitoring Domain**: Status checks, failure detection
- **Connection Management Domain**: Reconnection, failover
- **Security Domain**: Authentication, encryption, tokens

#### State Management Boundaries

**Isolated State Management**
```csharp
// Each service manages only its own state
public class TunnelConfigurationService
{
    private TunnelConfiguration _currentConfiguration; // Only configuration state
}

public class TunnelStatusManager  
{
    private TunnelStatus _currentStatus; // Only status state
    private StatusHistory _statusHistory; // Only status history
}

public class FrpProcessManager
{
    private Process _frpProcess; // Only process state
    private ProcessStatus _processStatus; // Only process status
}

// No shared global state - each service encapsulates its domain state
```

## 📏 Enforceable Guidelines

### Component Size Limits

**Maximum Lines per File/Class:**
- Controllers: 300 lines maximum
- Service implementations: 250 lines (standard), 350 lines (complex with architectural justification)
- Manager classes: 300 lines maximum
- Model classes: 150 lines maximum
- Interface definitions: 50 lines maximum
- Test classes: 500 lines maximum (with clear test organization)

**Enforcement Mechanisms:**
- Pre-commit hooks checking file sizes
- Build-time analysis with warnings for oversized classes
- Code review requirements for classes exceeding limits
- Automated refactoring suggestions for oversized components

### Complexity Limits

**Cyclomatic Complexity Thresholds:**
- Standard methods: Maximum 10 cyclomatic complexity
- Complex algorithms: Maximum 15 cyclomatic complexity (with documentation)
- Constructor methods: Maximum 5 cyclomatic complexity
- Property getters/setters: Maximum 3 cyclomatic complexity

**Method Size Limits:**
- Standard methods: Maximum 50 lines
- Constructor methods: Maximum 30 lines
- Simple property methods: Maximum 10 lines
- Complex algorithm methods: Maximum 75 lines (with justification)

### Dependency Limits

**Maximum Dependencies per Component:**
- Constructor parameters: Maximum 8 dependencies
- Interface implementations: Maximum 5 interfaces per class
- Service references: Maximum 6 service dependencies per class
- External library dependencies: Maximum 3 external libraries per service

### Nesting Limits

**Maximum Indentation Levels:**
- Standard methods: Maximum 4 levels of nesting
- Complex conditional logic: Maximum 5 levels (with refactoring plan)
- Loop nesting: Maximum 3 levels
- Try-catch nesting: Maximum 2 levels

### Method Limits

**Maximum Parameters:**
- Constructor parameters: Maximum 8 parameters
- Method parameters: Maximum 6 parameters
- Prefer parameter objects for complex method signatures
- Use options pattern for methods with many optional parameters

**Return Complexity:**
- Single return type per method
- Avoid complex generic type parameters (maximum 2 type parameters)
- Prefer Result<T> pattern for methods that can fail
- Use explicit return statements rather than implicit returns

## 🎯 Quality Standards

### Technology-Specific Patterns

All architectural examples and patterns are specifically designed for the .NET 8.0 and C# technology stack used in the BeepMyPhone tunneling component.

### Practical Implementation

All architectural guidelines are designed to be immediately implementable using standard .NET development tools and practices.

### Enforceable Rules

All architectural rules include specific metrics and thresholds that can be automatically validated through static analysis tools and build processes.

### Complete Coverage

This architecture guide covers all aspects of the tunneling component design from service decomposition to dependency management, ensuring comprehensive architectural guidance for implementation.