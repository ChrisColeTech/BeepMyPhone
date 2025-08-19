# BeepMyPhone Backend Implementation Plan

## 📋 Objective Index

[Objective 1: Windows Notification Monitoring](#objective-1-windows-notification-monitoring)  
[Objective 2: Linux Notification Monitoring](#objective-2-linux-notification-monitoring)  
[Objective 3: macOS Notification Monitoring](#objective-3-macos-notification-monitoring)  
[Objective 4: WebSocket Server Core](#objective-4-websocket-server-core)  
[Objective 5: Connection Management](#objective-5-connection-management)  
[Objective 6: Device Authentication](#objective-6-device-authentication)  
[Objective 7: Message Routing](#objective-7-message-routing)  
[Objective 8: Device Registration](#objective-8-device-registration)  
[Objective 9: Database Operations](#objective-9-database-operations)  
[Objective 10: Token Authentication](#objective-10-token-authentication)  
[Objective 11: Device Status Tracking](#objective-11-device-status-tracking)  
[Objective 12: HTTP Server Setup](#objective-12-http-server-setup)  
[Objective 13: Device API Endpoints](#objective-13-device-api-endpoints)  
[Objective 14: Health Monitoring API](#objective-14-health-monitoring-api)  
[Objective 15: Notification Processing Pipeline](#objective-15-notification-processing-pipeline)  
[Objective 16: System Orchestration](#objective-16-system-orchestration)

## Implementation Objectives

### Objective 1: Windows Notification Monitoring

#### Objective

Implement Windows PC notification capture using UserNotificationListener API to capture system notifications specifically on Windows platforms.

#### Architecture Requirements

- Apply Single Responsibility Principle: Windows monitor handles only Windows notification system
- Use Dependency Inversion Principle: Monitor depends on notification interface abstractions
- Follow Interface Segregation Principle: Separate interfaces for monitoring, parsing, and event handling
- Implement proper error boundaries to prevent Windows API failures from crashing system

#### Files to Create

- `backend/app/src/monitors/WindowsMonitor.ts` - Windows UserNotificationListener implementation
- `backend/app/src/types/windows-notifications.ts` - Windows-specific notification type definitions
- `backend/app/tests/unit/monitors/WindowsMonitor.test.ts` - Unit tests for Windows monitoring

#### Dependencies

- Technical: `@nodert-win10-rs4/windows.ui.notifications` package for Windows API access
- External: Windows notification permissions and UserNotificationListener API availability

#### Implementation Requirements

- Capture Windows system notifications without interfering with normal display
- Extract notification metadata: title, body, app name, timestamp, icon path
- Handle Windows-specific permissions and error cases gracefully
- Emit standardized notification events for forwarding service integration
- Support Windows 10 and Windows 11 notification systems

#### Success Criteria

- Windows notifications captured successfully across different apps
- Notification metadata extracted correctly with all required fields
- <100ms latency from system notification to captured event
- All unit tests passing with >90% code coverage
- Windows permission handling works correctly

---

### Objective 2: Linux Notification Monitoring

#### Objective

Implement Linux PC notification capture using D-Bus notification monitoring to capture system notifications specifically on Linux platforms.

#### Architecture Requirements

- Apply Single Responsibility Principle: Linux monitor handles only Linux D-Bus notification system
- Use Dependency Inversion Principle: Monitor depends on notification interface abstractions  
- Follow Interface Segregation Principle: Separate interfaces for D-Bus monitoring and event handling
- Implement proper error boundaries to prevent D-Bus failures from crashing system

#### Files to Create

- `backend/app/src/monitors/LinuxMonitor.ts` - Linux D-Bus notification monitoring implementation
- `backend/app/src/types/linux-notifications.ts` - Linux-specific notification type definitions
- `backend/app/tests/unit/monitors/LinuxMonitor.test.ts` - Unit tests for Linux monitoring

#### Dependencies

- Technical: `dbus` package for Linux D-Bus notification access
- External: Linux desktop environment with D-Bus notifications enabled

#### Implementation Requirements

- Capture Linux system notifications via D-Bus org.freedesktop.Notifications interface
- Support major desktop environments (GNOME, KDE, XFCE, Unity)
- Extract notification metadata: title, body, app name, timestamp, urgency level
- Handle D-Bus connection errors and desktop environment differences
- Emit standardized notification events for forwarding service integration

#### Success Criteria

- Linux notifications captured across major desktop environments
- D-Bus integration working correctly with proper error handling
- <100ms latency from system notification to captured event
- All unit tests passing with >90% code coverage
- Desktop environment compatibility verified

---

### Objective 3: macOS Notification Monitoring

#### Objective

Implement macOS PC notification capture to capture system notifications specifically on macOS platforms with appropriate handling of API limitations.

#### Architecture Requirements

- Apply Single Responsibility Principle: macOS monitor handles only macOS notification system
- Use Dependency Inversion Principle: Monitor depends on notification interface abstractions
- Follow Interface Segregation Principle: Separate interfaces for macOS monitoring and event handling
- Implement graceful degradation for limited macOS notification access

#### Files to Create

- `backend/app/src/monitors/MacOSMonitor.ts` - macOS notification monitoring implementation
- `backend/app/src/types/macos-notifications.ts` - macOS-specific notification type definitions
- `backend/app/tests/unit/monitors/MacOSMonitor.test.ts` - Unit tests for macOS monitoring

#### Dependencies

- External: macOS notification permissions and available notification APIs

#### Implementation Requirements

- Implement macOS notification capture using available system APIs
- Handle macOS-specific permission requirements (notification access)
- Extract available notification metadata within system limitations
- Provide clear documentation of macOS notification limitations
- Emit standardized notification events where possible

#### Success Criteria

- macOS notifications captured where system APIs allow
- Graceful handling of permission limitations and API restrictions
- Clear documentation of macOS-specific limitations provided
- All unit tests passing with >90% code coverage
- Proper fallback behavior when full access unavailable

---

### Objective 4: WebSocket Server Core

#### Objective

Implement basic WebSocket server foundation using Socket.io for establishing real-time connections with mobile devices.

#### Architecture Requirements

- Apply Single Responsibility Principle: WebSocket server only handles connection establishment and lifecycle
- Use Dependency Inversion Principle: Server depends on configuration interfaces, not concrete implementations
- Follow Interface Segregation Principle: Separate interfaces for server lifecycle and connection handling
- Implement proper error boundaries to prevent connection failures from crashing server

#### Files to Create

- `backend/app/src/websocket/SocketServer.ts` - Main WebSocket server implementation
- `backend/app/src/types/websocket-core.ts` - Core WebSocket type definitions
- `backend/app/tests/unit/websocket/SocketServer.test.ts` - WebSocket server unit tests

#### Dependencies

- Technical: `socket.io` package for WebSocket implementation
- External: Available network port for WebSocket binding

#### Implementation Requirements

- Initialize Socket.io WebSocket server with proper configuration
- Handle basic client connections and disconnections cleanly
- Implement server lifecycle management (start, stop, restart)
- Provide proper error handling to prevent server crashes
- Configure CORS and security settings for mobile device access

#### Success Criteria

- WebSocket server starts and accepts connections on configured port
- Basic connection and disconnection handling works correctly
- Server lifecycle management functional (start/stop without errors)
- All unit tests passing with >90% code coverage
- Proper error handling prevents server crashes

---

### Objective 5: Connection Management

#### Objective

Implement WebSocket connection management system to track multiple mobile device connections and monitor connection health.

#### Architecture Requirements

- Apply Single Responsibility Principle: Connection manager only handles connection tracking and health
- Use Dependency Inversion Principle: Manager depends on connection interfaces, not Socket.io directly
- Follow Interface Segregation Principle: Separate interfaces for connection tracking and health monitoring
- Implement proper state management to prevent memory leaks from abandoned connections

#### Files to Create

- `backend/app/src/websocket/ConnectionManager.ts` - Client connection tracking and management
- `backend/app/src/types/connection.ts` - Connection-specific type definitions
- `backend/app/tests/unit/websocket/ConnectionManager.test.ts` - Connection management tests

#### Dependencies

- Objective: WebSocket Server Core must exist for connection handling
- External: Network connectivity for health monitoring

#### Implementation Requirements

- Track multiple concurrent mobile device connections with unique identifiers
- Implement connection health monitoring using heartbeat/ping-pong mechanism
- Handle connection drops gracefully with proper cleanup
- Maintain connection state and metadata for each connected device
- Provide connection statistics and monitoring capabilities

#### Success Criteria

- Multiple concurrent connections supported and tracked correctly
- Connection health monitoring functional with heartbeat system
- Graceful handling of connection drops with proper cleanup
- All unit tests passing with >90% code coverage
- Connection statistics and monitoring working

---

### Objective 6: Device Authentication

#### Objective

Implement simple device token authentication system for WebSocket connections to ensure only registered devices can connect.

#### Architecture Requirements

- Apply Single Responsibility Principle: Authentication middleware only handles device verification
- Use Dependency Inversion Principle: Authentication depends on token service interfaces
- Follow Interface Segregation Principle: Separate interfaces for authentication and authorization
- Implement secure token validation to prevent unauthorized access

#### Files to Create

- `backend/app/src/websocket/middleware/AuthMiddleware.ts` - Device authentication for WebSocket connections
- `backend/app/src/types/auth.ts` - Authentication type definitions
- `backend/app/tests/unit/websocket/AuthMiddleware.test.ts` - Authentication middleware tests

#### Dependencies

- Objective: Connection Management must exist for connection handling
- Future: Will integrate with Token Authentication system (Objective 10)

#### Implementation Requirements

- Authenticate devices using simple tokens during WebSocket handshake
- Reject unauthorized connection attempts with appropriate error messages
- Map authenticated connections to registered device identities
- Handle authentication failures gracefully without server disruption
- Provide authentication logging for security monitoring

#### Success Criteria

- Device authentication working correctly during WebSocket connection
- Unauthorized connections properly rejected with clear error messages
- Device identity mapping functional for authenticated connections
- All unit tests passing with >90% code coverage
- Authentication logging provides security visibility

---

### Objective 7: Message Routing

#### Objective

Implement WebSocket message broadcasting and routing system to deliver notifications to connected mobile devices.

#### Architecture Requirements

- Apply Single Responsibility Principle: Message handler only manages message routing and delivery
- Use Dependency Inversion Principle: Handler depends on connection manager interfaces
- Follow Interface Segregation Principle: Separate interfaces for broadcasting and targeted messaging
- Implement efficient message delivery to minimize latency

#### Files to Create

- `backend/app/src/websocket/MessageHandler.ts` - Handle incoming/outgoing WebSocket messages
- `backend/app/src/types/messages.ts` - Message type definitions
- `backend/app/tests/unit/websocket/MessageHandler.test.ts` - Message handling tests

#### Dependencies

- Objective: Connection Management must exist for device targeting
- Objective: Device Authentication must exist for secure messaging

#### Implementation Requirements

- Broadcast notifications to all connected devices efficiently
- Handle targeted messaging to specific devices by device ID
- Implement message queuing for temporarily disconnected devices
- Standardize message format for consistent mobile device handling
- Provide message delivery confirmation and error handling

#### Success Criteria

- Broadcast messaging to all connected devices works correctly
- Targeted messaging to specific devices functional
- Message queuing for offline devices implemented
- <50ms message delivery latency for connected devices
- All unit tests passing with >90% code coverage

---

### Objective 8: Device Registration

#### Objective

Implement device registration system to register new mobile devices with unique identifiers and human-readable names.

#### Architecture Requirements

- Apply Single Responsibility Principle: Registration service only handles device registration logic
- Use Dependency Inversion Principle: Service depends on repository interfaces for data persistence
- Follow Interface Segregation Principle: Separate interfaces for registration and validation
- Implement proper data validation to ensure device data integrity

#### Files to Create

- `backend/app/src/services/DeviceRegistrationService.ts` - Device registration business logic
- `backend/app/src/models/Device.ts` - Device data model and validation
- `backend/app/src/types/device.ts` - Device-related type definitions
- `backend/app/tests/unit/services/DeviceRegistrationService.test.ts` - Registration service tests

#### Dependencies

- External: None (standalone feature for registration logic)

#### Implementation Requirements

- Register devices with auto-generated unique device IDs and user-provided names
- Generate cryptographically secure device identifiers
- Validate device data including name length limits and character restrictions
- Handle duplicate registration attempts with appropriate error responses
- Provide device registration confirmation with generated credentials

#### Success Criteria

- Device registration with unique IDs working correctly
- Device name validation preventing invalid data
- Duplicate registration handling works with clear error messages
- All unit tests passing with >90% code coverage
- Registration confirmation provides necessary device credentials

---

### Objective 9: Database Operations

#### Objective

Implement SQLite database operations system for persistent storage and retrieval of device information.

#### Architecture Requirements

- Apply Single Responsibility Principle: Repository only handles data access operations
- Use Dependency Inversion Principle: Higher-level services depend on repository interfaces
- Follow Interface Segregation Principle: Separate interfaces for different data operations
- Implement proper transaction handling to ensure data consistency

#### Files to Create

- `backend/app/src/repositories/DeviceRepository.ts` - SQLite database operations for devices
- `backend/app/src/database/connection.ts` - SQLite connection management
- `backend/app/src/database/migrations/001_devices.sql` - Initial device table creation
- `backend/app/tests/unit/repositories/DeviceRepository.test.ts` - Repository unit tests

#### Dependencies

- Technical: `sqlite3` package for database operations
- External: File system access for SQLite database file storage

#### Implementation Requirements

- Establish SQLite database connection with proper error handling
- Create and manage device table schema through migrations
- Implement CRUD operations for device records (Create, Read, Update, Delete)
- Handle database connection failures and provide appropriate error messages
- Ensure proper database cleanup and connection management

#### Success Criteria

- SQLite database operations functional with proper error handling
- Device CRUD operations working correctly for all scenarios
- Database migrations execute successfully on first run
- All unit tests passing with >90% code coverage
- Database connection management prevents resource leaks

---

### Objective 10: Token Authentication

#### Objective

Implement authentication token management system to generate, store, and validate secure authentication tokens for registered devices.

#### Architecture Requirements

- Apply Single Responsibility Principle: Token service only handles token lifecycle management
- Use Dependency Inversion Principle: Service depends on repository interfaces for token storage
- Follow Interface Segregation Principle: Separate interfaces for token generation and validation
- Implement cryptographically secure token generation and validation

#### Files to Create

- `backend/app/src/services/TokenService.ts` - Authentication token generation and validation
- `backend/app/src/types/token.ts` - Token-related type definitions
- `backend/app/tests/unit/services/TokenService.test.ts` - Token service tests

#### Dependencies

- Objective: Database Operations (Objective 9) must exist for token persistence

#### Implementation Requirements

- Generate cryptographically secure authentication tokens for registered devices
- Store and retrieve tokens from database with proper indexing
- Implement token validation logic with expiration checking
- Provide token refresh mechanism for long-lived devices
- Handle token expiration and cleanup of expired tokens

#### Success Criteria

- Secure token generation using cryptographically strong random values
- Token validation functional with proper expiration handling
- Database token storage and retrieval working correctly
- All unit tests passing with >90% code coverage
- Token refresh mechanism prevents authentication interruption

---

### Objective 11: Device Status Tracking

#### Objective

Implement device status monitoring system to track device connection status and maintain last-seen timestamps.

#### Architecture Requirements

- Apply Single Responsibility Principle: Status service only handles device status updates
- Use Dependency Inversion Principle: Service depends on repository interfaces for status persistence
- Follow Interface Segregation Principle: Separate interfaces for status updates and queries
- Implement efficient status updates to minimize database operations

#### Files to Create

- `backend/app/src/services/DeviceStatusService.ts` - Device status tracking and updates
- `backend/app/src/types/device-status.ts` - Status-related type definitions
- `backend/app/tests/unit/services/DeviceStatusService.test.ts` - Status service tests

#### Dependencies

- Objective: Database Operations (Objective 9) must exist for status persistence

#### Implementation Requirements

- Track device connection status (online, offline, last_seen timestamps)
- Update device status automatically on connection and disconnection events
- Provide device status queries for monitoring and management
- Implement efficient batch status updates for multiple devices
- Handle status update failures gracefully without affecting device functionality

#### Success Criteria

- Device status tracking functional across connection lifecycle
- Status updates triggered correctly on connection events
- Last seen timestamps accurate and properly maintained
- All unit tests passing with >90% code coverage
- Status queries provide accurate real-time device information

---

### Objective 12: HTTP Server Setup

#### Objective

Implement Express.js HTTP server foundation with middleware configuration for API endpoints and cross-origin access.

#### Architecture Requirements

- Apply Single Responsibility Principle: HTTP server setup only handles server initialization and middleware
- Use Dependency Inversion Principle: Server depends on configuration interfaces
- Follow Interface Segregation Principle: Separate interfaces for server lifecycle and middleware
- Implement proper middleware ordering and error handling

#### Files to Create

- `backend/app/src/server.ts` - Express server setup and configuration
- `backend/app/src/middleware/errorHandler.ts` - Global error handling middleware
- `backend/app/tests/unit/server.test.ts` - Server setup tests

#### Dependencies

- Technical: `express`, `cors` packages for HTTP server functionality
- External: Available HTTP port for server binding

#### Implementation Requirements

- Initialize Express.js server with proper configuration and security settings
- Configure CORS middleware for frontend and mobile application access
- Implement global error handling middleware for consistent error responses
- Set up request logging and basic security headers
- Provide server lifecycle management with graceful shutdown

#### Success Criteria

- HTTP server starts successfully and accepts requests on configured port
- CORS properly configured for cross-origin requests from authorized sources
- Error handling returns appropriate HTTP status codes and error messages
- All unit tests passing with >90% code coverage
- Server lifecycle management works correctly (start/stop/restart)

---

### Objective 13: Device API Endpoints

#### Objective

Implement RESTful API endpoints for device management operations including registration, listing, updating, and deletion.

#### Architecture Requirements

- Apply Single Responsibility Principle: Each controller method handles one specific API operation
- Use Dependency Inversion Principle: Controllers depend on service interfaces, not implementations
- Follow Interface Segregation Principle: Separate interfaces for different API operations
- Implement proper input validation and sanitization for all endpoints

#### Files to Create

- `backend/app/src/routes/devices.ts` - Device management API routes
- `backend/app/src/controllers/DeviceController.ts` - Device API request handlers
- `backend/app/src/middleware/validation.ts` - Request validation middleware
- `backend/app/tests/integration/api/device-endpoints.test.ts` - API endpoint integration tests

#### Dependencies

- Objective: HTTP Server Setup (Objective 12) must exist for route handling
- Objective: Device Registration (Objective 8), Database Operations (Objective 9), Token Authentication (Objective 10) must exist

#### Implementation Requirements

- Implement REST endpoints: POST /devices (register), GET /devices (list), PUT /devices/:id (update), DELETE /devices/:id (delete)
- Validate all request data using middleware to prevent invalid operations
- Return consistent JSON responses with appropriate HTTP status codes
- Handle API errors gracefully with informative error messages
- Provide API request logging for debugging and monitoring

#### Success Criteria

- All device API endpoints functional (register, list, update, delete)
- Request validation prevents invalid data from reaching business logic
- Consistent JSON response format across all endpoints
- All API integration tests passing with comprehensive coverage
- API error handling provides clear, actionable error messages

---

### Objective 14: Health Monitoring API

#### Objective

Implement system health check API endpoints for monitoring server status, system resources, and service availability.

#### Architecture Requirements

- Apply Single Responsibility Principle: Health controller only handles system status reporting
- Use Dependency Inversion Principle: Controller depends on monitoring service interfaces
- Follow Interface Segregation Principle: Separate interfaces for different health checks
- Implement lightweight health checks to minimize performance impact

#### Files to Create

- `backend/app/src/routes/health.ts` - Health check and status endpoints
- `backend/app/src/controllers/HealthController.ts` - Health check handlers
- `backend/app/tests/integration/api/health-endpoints.test.ts` - Health endpoint tests

#### Dependencies

- Objective: HTTP Server Setup (Objective 12) must exist for route handling

#### Implementation Requirements

- Implement health check endpoint for basic server availability (GET /health)
- Provide system status endpoint with uptime, memory usage, and connected device count
- Check database connectivity and report database health status
- Include service-specific health information (WebSocket server status)
- Provide detailed error information for troubleshooting when services are unhealthy

#### Success Criteria

- Health check endpoint returns server status quickly (<50ms response time)
- System metrics reporting functional with accurate resource information
- Database health check correctly identifies connectivity issues
- All integration tests passing with comprehensive health scenario coverage
- Health information useful for system monitoring and troubleshooting

---

### Objective 15: Notification Processing Pipeline

#### Objective

Implement notification processing system to receive notifications from platform monitors, format them for mobile delivery, and prepare them for forwarding.

#### Architecture Requirements

- Apply Single Responsibility Principle: Processing service only handles notification transformation
- Use Dependency Inversion Principle: Processor depends on monitor and formatter interfaces
- Follow Interface Segregation Principle: Separate interfaces for processing and formatting
- Implement efficient processing to minimize notification delivery latency

#### Files to Create

- `backend/app/src/services/NotificationProcessingService.ts` - Core notification processing logic
- `backend/app/src/utils/NotificationFormatter.ts` - Format notifications for mobile delivery
- `backend/app/src/types/processing.ts` - Notification processing type definitions
- `backend/app/tests/unit/services/NotificationProcessingService.test.ts` - Processing service tests

#### Dependencies

- Objectives: Platform monitoring objectives (1-3) must exist for notification input
- Objectives: WebSocket objectives (4-7) must exist for notification output delivery

#### Implementation Requirements

- Listen for notification events from all platform monitors (Windows, Linux, macOS)
- Transform platform-specific notifications into standardized mobile-friendly format
- Handle processing failures gracefully without losing notifications
- Implement notification queuing for high-volume scenarios
- Provide processing activity logging for debugging and monitoring

#### Success Criteria

- Notifications from all platform monitors processed successfully
- Standardized mobile format created correctly with all required fields
- Processing failures handled gracefully with notification preservation
- All unit tests passing with >90% code coverage
- Processing latency optimized for real-time notification delivery

---

### Objective 16: System Orchestration

#### Objective

Implement complete system integration to coordinate startup, shutdown, and orchestration of all system components into a functioning notification forwarding system.

#### Architecture Requirements

- Apply Single Responsibility Principle: Orchestrator only handles system coordination and lifecycle
- Use Dependency Inversion Principle: Orchestrator depends on service interfaces for all components
- Follow Interface Segregation Principle: Separate interfaces for system lifecycle and service management
- Implement proper dependency management to ensure services start in correct order

#### Files to Create

- `backend/app/index.ts` - Main application entry point orchestrating all services
- `backend/app/src/services/SystemOrchestrator.ts` - System component coordination
- `backend/app/tests/e2e/complete-system.test.ts` - Full system integration tests
- `backend/app/tests/integration/notification-flow.test.ts` - End-to-end notification flow tests

#### Dependencies

- **ALL previous objectives (1-15) must be completed** - this is the final integration objective

#### Implementation Requirements

- Coordinate startup sequence of all system components with proper dependency ordering
- Handle system shutdown gracefully with resource cleanup
- Integrate all services: monitors, WebSocket server, database, HTTP API, processing pipeline
- Implement system-wide error handling and recovery mechanisms
- Provide complete end-to-end notification flow from PC capture to mobile delivery

#### Success Criteria

- Complete system startup and shutdown procedures working correctly
- All services integrate properly with correct dependency resolution
- End-to-end notification flow functional (PC notification → mobile device delivery)
- All integration and e2e tests passing with comprehensive system coverage
- System handles errors gracefully with appropriate recovery mechanisms

---

## 🏗️ Clean Architecture Enforcement

### SOLID Principles Application

#### Single Responsibility Principle (SRP)

**Enforcement Rules:**
- Each objective implements exactly one focused feature
- Maximum 150 lines per implementation file
- Each class/service has single, well-defined purpose
- No mixing of concerns within a single component

**Technology-Specific Examples:**

✅ **Correct Implementation:**
```typescript
// WindowsMonitor.ts - Only handles Windows notification monitoring
class WindowsMonitor implements INotificationMonitor {
  private listener: UserNotificationListener;
  
  async startMonitoring(): Promise<void> {
    // Only Windows notification setup logic
  }
}

// DeviceRegistrationService.ts - Only handles device registration
class DeviceRegistrationService {
  async registerDevice(deviceData: DeviceInput): Promise<Device> {
    // Only registration logic, no database operations
    return this.repository.create(validatedData);
  }
}
```

❌ **Violation Examples:**
```typescript
// DON'T: Mixed responsibilities
class NotificationManager {
  startWindowsMonitoring() { /* Windows logic */ }
  startLinuxMonitoring() { /* Linux logic */ }
  sendToWebSocket() { /* Communication logic */ }
  saveToDatabase() { /* Persistence logic */ }
}
```

#### Open/Closed Principle (OCP)

**Extension Patterns:**
- Abstract base classes for platform monitors
- Interface-based service contracts
- Configuration-driven behavior modification

**Implementation:**
```typescript
// Open for extension, closed for modification
abstract class BaseMonitor implements INotificationMonitor {
  abstract startMonitoring(): Promise<void>;
  
  // Common functionality available to all monitors
  protected emitNotification(notification: StandardNotification): void {
    this.eventEmitter.emit('notification', notification);
  }
}

// Extend without modifying existing code
class WindowsMonitor extends BaseMonitor {
  async startMonitoring(): Promise<void> {
    // Windows-specific implementation
  }
}
```

#### Liskov Substitution Principle (LSP)

**Interface Implementation Rules:**
- All monitor implementations must be interchangeable
- Repository implementations must provide consistent behavior
- Service implementations must honor interface contracts

**Type Safety Requirements:**
```typescript
// All monitors must be substitutable
function createMonitor(platform: Platform): INotificationMonitor {
  switch (platform) {
    case 'windows': return new WindowsMonitor();
    case 'linux': return new LinuxMonitor();
    case 'macos': return new MacOSMonitor();
  }
}
```

#### Interface Segregation Principle (ISP)

**Interface Design Guidelines:**
- Separate interfaces for different concerns
- Clients depend only on methods they use
- Avoid fat interfaces with unused methods

**Service Contract Definitions:**
```typescript
// Segregated interfaces
interface IDeviceRegistration {
  registerDevice(data: DeviceInput): Promise<Device>;
}

interface IDeviceStatus {
  updateStatus(deviceId: string, status: DeviceStatus): Promise<void>;
}

interface IDeviceRepository {
  findById(id: string): Promise<Device | null>;
  save(device: Device): Promise<Device>;
}

// Controllers depend only on what they need
class DeviceController {
  constructor(
    private registration: IDeviceRegistration,
    private status: IDeviceStatus
  ) {}
}
```

#### Dependency Inversion Principle (DIP)

**Dependency Injection Implementation:**
- Services depend on abstractions, not concrete implementations
- Repository pattern abstracts database operations
- Interface-based service dependencies

**Abstraction Layer Design:**
```typescript
// High-level service depends on abstraction
class NotificationProcessingService {
  constructor(
    private monitors: INotificationMonitor[],
    private formatter: INotificationFormatter,
    private websocket: IWebSocketServer
  ) {}
}

// Concrete implementations injected at runtime
const processingService = new NotificationProcessingService(
  [windowsMonitor, linuxMonitor, macosMonitor],
  notificationFormatter,
  socketServer
);
```

### DRY Principle Implementation

**Code Reuse Strategies:**
- Shared utility functions for common operations
- Base classes for common behavior patterns
- Configuration-driven behavior to eliminate code duplication

**Abstraction Techniques:**
- Generic repository pattern for all database entities
- Common error handling patterns
- Shared validation utilities

**Utility Function Organization:**
- `src/utils/` directory for shared functionality
- Type-safe utility functions with proper generics
- Comprehensive test coverage for all utilities

### Anti-Pattern Prevention Rules

#### Spaghetti Code Prevention

**Clear Component Boundaries:**
- Each service has well-defined responsibility
- Dependencies flow in one direction (no circular dependencies)
- Clear interfaces between layers

**Dependency Direction Rules:**
```
Controllers → Services → Repositories → Database
Monitors → Processing Service → WebSocket Server → Mobile Devices
```

**Coupling Minimization Strategies:**
- Event-driven communication between loosely coupled components
- Interface-based dependencies to enable testing and flexibility
- Configuration injection to avoid hardcoded dependencies

#### Monster Class Prevention

**Enforceable Size Limits:**
- Maximum 150 lines per implementation file
- Maximum 20 lines per method/function
- Maximum 5 parameters per method
- Maximum 3 levels of nesting

**Single Responsibility Enforcement:**
- If class approaches size limits, split into focused components
- Each method should have single, clear purpose
- Classes should not require extensive comments to explain purpose

**Service Decomposition Strategies:**
```typescript
// DON'T: Monster service
class DeviceManager {
  registerDevice() { /* 50 lines */ }
  validateDevice() { /* 30 lines */ }
  saveToDatabase() { /* 40 lines */ }
  generateToken() { /* 25 lines */ }
  updateStatus() { /* 35 lines */ }
  sendNotification() { /* 45 lines */ }
}

// DO: Decomposed services
class DeviceRegistrationService { /* Only registration logic */ }
class DeviceValidationService { /* Only validation logic */ }
class TokenService { /* Only token operations */ }
class DeviceStatusService { /* Only status operations */ }
```

#### God Object Prevention

**Responsibility Distribution Rules:**
- No single class handles more than one major system concern
- Business logic separated from data access
- Presentation layer separated from business logic

**Service Decomposition:**
- Each objective creates focused, single-purpose services
- Services communicate through well-defined interfaces
- No service has knowledge of all other services

**State Management Boundaries:**
- Each service manages only its own state
- Shared state handled through proper abstractions
- No global state accessible by all components

### Component Size Limits

**File/Class Limits:**
- Implementation files: 150 lines maximum
- Test files: 200 lines maximum
- Interface files: 50 lines maximum
- Configuration files: 100 lines maximum

**Method/Function Limits:**
- Regular methods: 20 lines maximum
- Test methods: 30 lines maximum
- Setup/teardown methods: 15 lines maximum
- Utility functions: 10 lines maximum

**Complexity Limits:**
- Cyclomatic complexity: 5 maximum per method
- Parameter count: 5 maximum per method/function
- Nesting levels: 3 maximum
- Import statements: 15 maximum per file

**Refactoring Triggers:**
- When any limit is approached (80% of maximum), refactor
- Extract methods, create helper functions, split classes
- Use composition over inheritance to manage complexity

### Quality Gates

**Code Coverage Requirements:**
- Unit tests: >90% code coverage for all services
- Integration tests: >80% coverage for API endpoints
- E2E tests: 100% coverage for critical user flows
- All tests must pass before objective completion

**TypeScript Compliance:**
- Strict TypeScript configuration enforced
- Zero TypeScript compilation errors required
- All public APIs must have proper type definitions
- No `any` types allowed in production code

**Architecture Compliance:**
- No circular dependencies between modules
- All SOLID principles must be demonstrably applied
- Component size limits must be enforced
- Interface segregation must be maintained

**Performance Standards:**
- API endpoint response times: <100ms for simple operations
- Notification processing latency: <50ms from capture to forwarding
- Memory usage: <100MB during normal operation
- WebSocket message delivery: <50ms for connected devices

## 📊 Progress Tracking

| Objective | Feature | Status | Files Created | Tests Passing | Completion Date |
| --------- | ------- | ------ | ------------- | ------------- | --------------- |
| 1 | Windows Notification Monitoring | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 2 | Linux Notification Monitoring | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 3 | macOS Notification Monitoring | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 4 | WebSocket Server Core | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 5 | Connection Management | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 6 | Device Authentication | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 7 | Message Routing | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 8 | Device Registration | ❌ **NOT STARTED** | 0/4 | 0/1 | - |
| 9 | Database Operations | ❌ **NOT STARTED** | 0/4 | 0/1 | - |
| 10 | Token Authentication | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 11 | Device Status Tracking | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 12 | HTTP Server Setup | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 13 | Device API Endpoints | ❌ **NOT STARTED** | 0/4 | 0/1 | - |
| 14 | Health Monitoring API | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 15 | Notification Processing Pipeline | ❌ **NOT STARTED** | 0/4 | 0/1 | - |
| 16 | System Orchestration | ❌ **NOT STARTED** | 0/4 | 0/2 | - |

**Total Progress: 0/16 objectives completed (0%)**

**Implementation Phase Recommendations:**
- **Phase 1 (Foundation)**: Objectives 8-11 (Device Management)
- **Phase 2 (Communication)**: Objectives 4-7 (WebSocket)  
- **Phase 3 (API)**: Objectives 12-14 (HTTP API)
- **Phase 4 (Monitoring)**: Objectives 1-3 (Platform Monitoring)
- **Phase 5 (Integration)**: Objectives 15-16 (Processing & Orchestration)# BeepMyPhone Backend Implementation Plan

## 📋 Objective Index

[Objective 1: Windows Notification Monitoring](#objective-1-windows-notification-monitoring)  
[Objective 2: Linux Notification Monitoring](#objective-2-linux-notification-monitoring)  
[Objective 3: macOS Notification Monitoring](#objective-3-macos-notification-monitoring)  
[Objective 4: WebSocket Server Core](#objective-4-websocket-server-core)  
[Objective 5: Connection Management](#objective-5-connection-management)  
[Objective 6: Device Authentication](#objective-6-device-authentication)  
[Objective 7: Message Routing](#objective-7-message-routing)  
[Objective 8: Device Registration](#objective-8-device-registration)  
[Objective 9: Database Operations](#objective-9-database-operations)  
[Objective 10: Token Authentication](#objective-10-token-authentication)  
[Objective 11: Device Status Tracking](#objective-11-device-status-tracking)  
[Objective 12: HTTP Server Setup](#objective-12-http-server-setup)  
[Objective 13: Device API Endpoints](#objective-13-device-api-endpoints)  
[Objective 14: Health Monitoring API](#objective-14-health-monitoring-api)  
[Objective 15: Notification Processing Pipeline](#objective-15-notification-processing-pipeline)  
[Objective 16: System Orchestration](#objective-16-system-orchestration)

## Implementation Objectives

### Objective 1: Windows Notification Monitoring

#### Objective

Implement Windows PC notification capture using UserNotificationListener API to capture system notifications specifically on Windows platforms.

#### Architecture Requirements

- Apply Single Responsibility Principle: Windows monitor handles only Windows notification system
- Use Dependency Inversion Principle: Monitor depends on notification interface abstractions
- Follow Interface Segregation Principle: Separate interfaces for monitoring, parsing, and event handling
- Implement proper error boundaries to prevent Windows API failures from crashing system

#### Files to Create

- `backend/app/src/monitors/WindowsMonitor.ts` - Windows UserNotificationListener implementation
- `backend/app/src/types/windows-notifications.ts` - Windows-specific notification type definitions
- `backend/app/tests/unit/monitors/WindowsMonitor.test.ts` - Unit tests for Windows monitoring

#### Dependencies

- Technical: `@nodert-win10-rs4/windows.ui.notifications` package for Windows API access
- External: Windows notification permissions and UserNotificationListener API availability

#### Implementation Requirements

- Capture Windows system notifications without interfering with normal display
- Extract notification metadata: title, body, app name, timestamp, icon path
- Handle Windows-specific permissions and error cases gracefully
- Emit standardized notification events for forwarding service integration
- Support Windows 10 and Windows 11 notification systems

#### Success Criteria

- Windows notifications captured successfully across different apps
- Notification metadata extracted correctly with all required fields
- <100ms latency from system notification to captured event
- All unit tests passing with >90% code coverage
- Windows permission handling works correctly

---

### Objective 2: Linux Notification Monitoring

#### Objective

Implement Linux PC notification capture using D-Bus notification monitoring to capture system notifications specifically on Linux platforms.

#### Architecture Requirements

- Apply Single Responsibility Principle: Linux monitor handles only Linux D-Bus notification system
- Use Dependency Inversion Principle: Monitor depends on notification interface abstractions  
- Follow Interface Segregation Principle: Separate interfaces for D-Bus monitoring and event handling
- Implement proper error boundaries to prevent D-Bus failures from crashing system

#### Files to Create

- `backend/app/src/monitors/LinuxMonitor.ts` - Linux D-Bus notification monitoring implementation
- `backend/app/src/types/linux-notifications.ts` - Linux-specific notification type definitions
- `backend/app/tests/unit/monitors/LinuxMonitor.test.ts` - Unit tests for Linux monitoring

#### Dependencies

- Technical: `dbus` package for Linux D-Bus notification access
- External: Linux desktop environment with D-Bus notifications enabled

#### Implementation Requirements

- Capture Linux system notifications via D-Bus org.freedesktop.Notifications interface
- Support major desktop environments (GNOME, KDE, XFCE, Unity)
- Extract notification metadata: title, body, app name, timestamp, urgency level
- Handle D-Bus connection errors and desktop environment differences
- Emit standardized notification events for forwarding service integration

#### Success Criteria

- Linux notifications captured across major desktop environments
- D-Bus integration working correctly with proper error handling
- <100ms latency from system notification to captured event
- All unit tests passing with >90% code coverage
- Desktop environment compatibility verified

---

### Objective 3: macOS Notification Monitoring

#### Objective

Implement macOS PC notification capture to capture system notifications specifically on macOS platforms with appropriate handling of API limitations.

#### Architecture Requirements

- Apply Single Responsibility Principle: macOS monitor handles only macOS notification system
- Use Dependency Inversion Principle: Monitor depends on notification interface abstractions
- Follow Interface Segregation Principle: Separate interfaces for macOS monitoring and event handling
- Implement graceful degradation for limited macOS notification access

#### Files to Create

- `backend/app/src/monitors/MacOSMonitor.ts` - macOS notification monitoring implementation
- `backend/app/src/types/macos-notifications.ts` - macOS-specific notification type definitions
- `backend/app/tests/unit/monitors/MacOSMonitor.test.ts` - Unit tests for macOS monitoring

#### Dependencies

- External: macOS notification permissions and available notification APIs

#### Implementation Requirements

- Implement macOS notification capture using available system APIs
- Handle macOS-specific permission requirements (notification access)
- Extract available notification metadata within system limitations
- Provide clear documentation of macOS notification limitations
- Emit standardized notification events where possible

#### Success Criteria

- macOS notifications captured where system APIs allow
- Graceful handling of permission limitations and API restrictions
- Clear documentation of macOS-specific limitations provided
- All unit tests passing with >90% code coverage
- Proper fallback behavior when full access unavailable

---

### Objective 4: WebSocket Server Core

#### Objective

Implement basic WebSocket server foundation using Socket.io for establishing real-time connections with mobile devices.

#### Architecture Requirements

- Apply Single Responsibility Principle: WebSocket server only handles connection establishment and lifecycle
- Use Dependency Inversion Principle: Server depends on configuration interfaces, not concrete implementations
- Follow Interface Segregation Principle: Separate interfaces for server lifecycle and connection handling
- Implement proper error boundaries to prevent connection failures from crashing server

#### Files to Create

- `backend/app/src/websocket/SocketServer.ts` - Main WebSocket server implementation
- `backend/app/src/types/websocket-core.ts` - Core WebSocket type definitions
- `backend/app/tests/unit/websocket/SocketServer.test.ts` - WebSocket server unit tests

#### Dependencies

- Technical: `socket.io` package for WebSocket implementation
- External: Available network port for WebSocket binding

#### Implementation Requirements

- Initialize Socket.io WebSocket server with proper configuration
- Handle basic client connections and disconnections cleanly
- Implement server lifecycle management (start, stop, restart)
- Provide proper error handling to prevent server crashes
- Configure CORS and security settings for mobile device access

#### Success Criteria

- WebSocket server starts and accepts connections on configured port
- Basic connection and disconnection handling works correctly
- Server lifecycle management functional (start/stop without errors)
- All unit tests passing with >90% code coverage
- Proper error handling prevents server crashes

---

### Objective 5: Connection Management

#### Objective

Implement WebSocket connection management system to track multiple mobile device connections and monitor connection health.

#### Architecture Requirements

- Apply Single Responsibility Principle: Connection manager only handles connection tracking and health
- Use Dependency Inversion Principle: Manager depends on connection interfaces, not Socket.io directly
- Follow Interface Segregation Principle: Separate interfaces for connection tracking and health monitoring
- Implement proper state management to prevent memory leaks from abandoned connections

#### Files to Create

- `backend/app/src/websocket/ConnectionManager.ts` - Client connection tracking and management
- `backend/app/src/types/connection.ts` - Connection-specific type definitions
- `backend/app/tests/unit/websocket/ConnectionManager.test.ts` - Connection management tests

#### Dependencies

- Objective: WebSocket Server Core must exist for connection handling
- External: Network connectivity for health monitoring

#### Implementation Requirements

- Track multiple concurrent mobile device connections with unique identifiers
- Implement connection health monitoring using heartbeat/ping-pong mechanism
- Handle connection drops gracefully with proper cleanup
- Maintain connection state and metadata for each connected device
- Provide connection statistics and monitoring capabilities

#### Success Criteria

- Multiple concurrent connections supported and tracked correctly
- Connection health monitoring functional with heartbeat system
- Graceful handling of connection drops with proper cleanup
- All unit tests passing with >90% code coverage
- Connection statistics and monitoring working

---

### Objective 6: Device Authentication

#### Objective

Implement simple device token authentication system for WebSocket connections to ensure only registered devices can connect.

#### Architecture Requirements

- Apply Single Responsibility Principle: Authentication middleware only handles device verification
- Use Dependency Inversion Principle: Authentication depends on token service interfaces
- Follow Interface Segregation Principle: Separate interfaces for authentication and authorization
- Implement secure token validation to prevent unauthorized access

#### Files to Create

- `backend/app/src/websocket/middleware/AuthMiddleware.ts` - Device authentication for WebSocket connections
- `backend/app/src/types/auth.ts` - Authentication type definitions
- `backend/app/tests/unit/websocket/AuthMiddleware.test.ts` - Authentication middleware tests

#### Dependencies

- Objective: Connection Management must exist for connection handling
- Future: Will integrate with Token Authentication system (Objective 10)

#### Implementation Requirements

- Authenticate devices using simple tokens during WebSocket handshake
- Reject unauthorized connection attempts with appropriate error messages
- Map authenticated connections to registered device identities
- Handle authentication failures gracefully without server disruption
- Provide authentication logging for security monitoring

#### Success Criteria

- Device authentication working correctly during WebSocket connection
- Unauthorized connections properly rejected with clear error messages
- Device identity mapping functional for authenticated connections
- All unit tests passing with >90% code coverage
- Authentication logging provides security visibility

---

### Objective 7: Message Routing

#### Objective

Implement WebSocket message broadcasting and routing system to deliver notifications to connected mobile devices.

#### Architecture Requirements

- Apply Single Responsibility Principle: Message handler only manages message routing and delivery
- Use Dependency Inversion Principle: Handler depends on connection manager interfaces
- Follow Interface Segregation Principle: Separate interfaces for broadcasting and targeted messaging
- Implement efficient message delivery to minimize latency

#### Files to Create

- `backend/app/src/websocket/MessageHandler.ts` - Handle incoming/outgoing WebSocket messages
- `backend/app/src/types/messages.ts` - Message type definitions
- `backend/app/tests/unit/websocket/MessageHandler.test.ts` - Message handling tests

#### Dependencies

- Objective: Connection Management must exist for device targeting
- Objective: Device Authentication must exist for secure messaging

#### Implementation Requirements

- Broadcast notifications to all connected devices efficiently
- Handle targeted messaging to specific devices by device ID
- Implement message queuing for temporarily disconnected devices
- Standardize message format for consistent mobile device handling
- Provide message delivery confirmation and error handling

#### Success Criteria

- Broadcast messaging to all connected devices works correctly
- Targeted messaging to specific devices functional
- Message queuing for offline devices implemented
- <50ms message delivery latency for connected devices
- All unit tests passing with >90% code coverage

---

### Objective 8: Device Registration

#### Objective

Implement device registration system to register new mobile devices with unique identifiers and human-readable names.

#### Architecture Requirements

- Apply Single Responsibility Principle: Registration service only handles device registration logic
- Use Dependency Inversion Principle: Service depends on repository interfaces for data persistence
- Follow Interface Segregation Principle: Separate interfaces for registration and validation
- Implement proper data validation to ensure device data integrity

#### Files to Create

- `backend/app/src/services/DeviceRegistrationService.ts` - Device registration business logic
- `backend/app/src/models/Device.ts` - Device data model and validation
- `backend/app/src/types/device.ts` - Device-related type definitions
- `backend/app/tests/unit/services/DeviceRegistrationService.test.ts` - Registration service tests

#### Dependencies

- External: None (standalone feature for registration logic)

#### Implementation Requirements

- Register devices with auto-generated unique device IDs and user-provided names
- Generate cryptographically secure device identifiers
- Validate device data including name length limits and character restrictions
- Handle duplicate registration attempts with appropriate error responses
- Provide device registration confirmation with generated credentials

#### Success Criteria

- Device registration with unique IDs working correctly
- Device name validation preventing invalid data
- Duplicate registration handling works with clear error messages
- All unit tests passing with >90% code coverage
- Registration confirmation provides necessary device credentials

---

### Objective 9: Database Operations

#### Objective

Implement SQLite database operations system for persistent storage and retrieval of device information.

#### Architecture Requirements

- Apply Single Responsibility Principle: Repository only handles data access operations
- Use Dependency Inversion Principle: Higher-level services depend on repository interfaces
- Follow Interface Segregation Principle: Separate interfaces for different data operations
- Implement proper transaction handling to ensure data consistency

#### Files to Create

- `backend/app/src/repositories/DeviceRepository.ts` - SQLite database operations for devices
- `backend/app/src/database/connection.ts` - SQLite connection management
- `backend/app/src/database/migrations/001_devices.sql` - Initial device table creation
- `backend/app/tests/unit/repositories/DeviceRepository.test.ts` - Repository unit tests

#### Dependencies

- Technical: `sqlite3` package for database operations
- External: File system access for SQLite database file storage

#### Implementation Requirements

- Establish SQLite database connection with proper error handling
- Create and manage device table schema through migrations
- Implement CRUD operations for device records (Create, Read, Update, Delete)
- Handle database connection failures and provide appropriate error messages
- Ensure proper database cleanup and connection management

#### Success Criteria

- SQLite database operations functional with proper error handling
- Device CRUD operations working correctly for all scenarios
- Database migrations execute successfully on first run
- All unit tests passing with >90% code coverage
- Database connection management prevents resource leaks

---

### Objective 10: Token Authentication

#### Objective

Implement authentication token management system to generate, store, and validate secure authentication tokens for registered devices.

#### Architecture Requirements

- Apply Single Responsibility Principle: Token service only handles token lifecycle management
- Use Dependency Inversion Principle: Service depends on repository interfaces for token storage
- Follow Interface Segregation Principle: Separate interfaces for token generation and validation
- Implement cryptographically secure token generation and validation

#### Files to Create

- `backend/app/src/services/TokenService.ts` - Authentication token generation and validation
- `backend/app/src/types/token.ts` - Token-related type definitions
- `backend/app/tests/unit/services/TokenService.test.ts` - Token service tests

#### Dependencies

- Objective: Database Operations (Objective 9) must exist for token persistence

#### Implementation Requirements

- Generate cryptographically secure authentication tokens for registered devices
- Store and retrieve tokens from database with proper indexing
- Implement token validation logic with expiration checking
- Provide token refresh mechanism for long-lived devices
- Handle token expiration and cleanup of expired tokens

#### Success Criteria

- Secure token generation using cryptographically strong random values
- Token validation functional with proper expiration handling
- Database token storage and retrieval working correctly
- All unit tests passing with >90% code coverage
- Token refresh mechanism prevents authentication interruption

---

### Objective 11: Device Status Tracking

#### Objective

Implement device status monitoring system to track device connection status and maintain last-seen timestamps.

#### Architecture Requirements

- Apply Single Responsibility Principle: Status service only handles device status updates
- Use Dependency Inversion Principle: Service depends on repository interfaces for status persistence
- Follow Interface Segregation Principle: Separate interfaces for status updates and queries
- Implement efficient status updates to minimize database operations

#### Files to Create

- `backend/app/src/services/DeviceStatusService.ts` - Device status tracking and updates
- `backend/app/src/types/device-status.ts` - Status-related type definitions
- `backend/app/tests/unit/services/DeviceStatusService.test.ts` - Status service tests

#### Dependencies

- Objective: Database Operations (Objective 9) must exist for status persistence

#### Implementation Requirements

- Track device connection status (online, offline, last_seen timestamps)
- Update device status automatically on connection and disconnection events
- Provide device status queries for monitoring and management
- Implement efficient batch status updates for multiple devices
- Handle status update failures gracefully without affecting device functionality

#### Success Criteria

- Device status tracking functional across connection lifecycle
- Status updates triggered correctly on connection events
- Last seen timestamps accurate and properly maintained
- All unit tests passing with >90% code coverage
- Status queries provide accurate real-time device information

---

### Objective 12: HTTP Server Setup

#### Objective

Implement Express.js HTTP server foundation with middleware configuration for API endpoints and cross-origin access.

#### Architecture Requirements

- Apply Single Responsibility Principle: HTTP server setup only handles server initialization and middleware
- Use Dependency Inversion Principle: Server depends on configuration interfaces
- Follow Interface Segregation Principle: Separate interfaces for server lifecycle and middleware
- Implement proper middleware ordering and error handling

#### Files to Create

- `backend/app/src/server.ts` - Express server setup and configuration
- `backend/app/src/middleware/errorHandler.ts` - Global error handling middleware
- `backend/app/tests/unit/server.test.ts` - Server setup tests

#### Dependencies

- Technical: `express`, `cors` packages for HTTP server functionality
- External: Available HTTP port for server binding

#### Implementation Requirements

- Initialize Express.js server with proper configuration and security settings
- Configure CORS middleware for frontend and mobile application access
- Implement global error handling middleware for consistent error responses
- Set up request logging and basic security headers
- Provide server lifecycle management with graceful shutdown

#### Success Criteria

- HTTP server starts successfully and accepts requests on configured port
- CORS properly configured for cross-origin requests from authorized sources
- Error handling returns appropriate HTTP status codes and error messages
- All unit tests passing with >90% code coverage
- Server lifecycle management works correctly (start/stop/restart)

---

### Objective 13: Device API Endpoints

#### Objective

Implement RESTful API endpoints for device management operations including registration, listing, updating, and deletion.

#### Architecture Requirements

- Apply Single Responsibility Principle: Each controller method handles one specific API operation
- Use Dependency Inversion Principle: Controllers depend on service interfaces, not implementations
- Follow Interface Segregation Principle: Separate interfaces for different API operations
- Implement proper input validation and sanitization for all endpoints

#### Files to Create

- `backend/app/src/routes/devices.ts` - Device management API routes
- `backend/app/src/controllers/DeviceController.ts` - Device API request handlers
- `backend/app/src/middleware/validation.ts` - Request validation middleware
- `backend/app/tests/integration/api/device-endpoints.test.ts` - API endpoint integration tests

#### Dependencies

- Objective: HTTP Server Setup (Objective 12) must exist for route handling
- Objective: Device Registration (Objective 8), Database Operations (Objective 9), Token Authentication (Objective 10) must exist

#### Implementation Requirements

- Implement REST endpoints: POST /devices (register), GET /devices (list), PUT /devices/:id (update), DELETE /devices/:id (delete)
- Validate all request data using middleware to prevent invalid operations
- Return consistent JSON responses with appropriate HTTP status codes
- Handle API errors gracefully with informative error messages
- Provide API request logging for debugging and monitoring

#### Success Criteria

- All device API endpoints functional (register, list, update, delete)
- Request validation prevents invalid data from reaching business logic
- Consistent JSON response format across all endpoints
- All API integration tests passing with comprehensive coverage
- API error handling provides clear, actionable error messages

---

### Objective 14: Health Monitoring API

#### Objective

Implement system health check API endpoints for monitoring server status, system resources, and service availability.

#### Architecture Requirements

- Apply Single Responsibility Principle: Health controller only handles system status reporting
- Use Dependency Inversion Principle: Controller depends on monitoring service interfaces
- Follow Interface Segregation Principle: Separate interfaces for different health checks
- Implement lightweight health checks to minimize performance impact

#### Files to Create

- `backend/app/src/routes/health.ts` - Health check and status endpoints
- `backend/app/src/controllers/HealthController.ts` - Health check handlers
- `backend/app/tests/integration/api/health-endpoints.test.ts` - Health endpoint tests

#### Dependencies

- Objective: HTTP Server Setup (Objective 12) must exist for route handling

#### Implementation Requirements

- Implement health check endpoint for basic server availability (GET /health)
- Provide system status endpoint with uptime, memory usage, and connected device count
- Check database connectivity and report database health status
- Include service-specific health information (WebSocket server status)
- Provide detailed error information for troubleshooting when services are unhealthy

#### Success Criteria

- Health check endpoint returns server status quickly (<50ms response time)
- System metrics reporting functional with accurate resource information
- Database health check correctly identifies connectivity issues
- All integration tests passing with comprehensive health scenario coverage
- Health information useful for system monitoring and troubleshooting

---

### Objective 15: Notification Processing Pipeline

#### Objective

Implement notification processing system to receive notifications from platform monitors, format them for mobile delivery, and prepare them for forwarding.

#### Architecture Requirements

- Apply Single Responsibility Principle: Processing service only handles notification transformation
- Use Dependency Inversion Principle: Processor depends on monitor and formatter interfaces
- Follow Interface Segregation Principle: Separate interfaces for processing and formatting
- Implement efficient processing to minimize notification delivery latency

#### Files to Create

- `backend/app/src/services/NotificationProcessingService.ts` - Core notification processing logic
- `backend/app/src/utils/NotificationFormatter.ts` - Format notifications for mobile delivery
- `backend/app/src/types/processing.ts` - Notification processing type definitions
- `backend/app/tests/unit/services/NotificationProcessingService.test.ts` - Processing service tests

#### Dependencies

- Objectives: Platform monitoring objectives (1-3) must exist for notification input
- Objectives: WebSocket objectives (4-7) must exist for notification output delivery

#### Implementation Requirements

- Listen for notification events from all platform monitors (Windows, Linux, macOS)
- Transform platform-specific notifications into standardized mobile-friendly format
- Handle processing failures gracefully without losing notifications
- Implement notification queuing for high-volume scenarios
- Provide processing activity logging for debugging and monitoring

#### Success Criteria

- Notifications from all platform monitors processed successfully
- Standardized mobile format created correctly with all required fields
- Processing failures handled gracefully with notification preservation
- All unit tests passing with >90% code coverage
- Processing latency optimized for real-time notification delivery

---

### Objective 16: System Orchestration

#### Objective

Implement complete system integration to coordinate startup, shutdown, and orchestration of all system components into a functioning notification forwarding system.

#### Architecture Requirements

- Apply Single Responsibility Principle: Orchestrator only handles system coordination and lifecycle
- Use Dependency Inversion Principle: Orchestrator depends on service interfaces for all components
- Follow Interface Segregation Principle: Separate interfaces for system lifecycle and service management
- Implement proper dependency management to ensure services start in correct order

#### Files to Create

- `backend/app/index.ts` - Main application entry point orchestrating all services
- `backend/app/src/services/SystemOrchestrator.ts` - System component coordination
- `backend/app/tests/e2e/complete-system.test.ts` - Full system integration tests
- `backend/app/tests/integration/notification-flow.test.ts` - End-to-end notification flow tests

#### Dependencies

- **ALL previous objectives (1-15) must be completed** - this is the final integration objective

#### Implementation Requirements

- Coordinate startup sequence of all system components with proper dependency ordering
- Handle system shutdown gracefully with resource cleanup
- Integrate all services: monitors, WebSocket server, database, HTTP API, processing pipeline
- Implement system-wide error handling and recovery mechanisms
- Provide complete end-to-end notification flow from PC capture to mobile delivery

#### Success Criteria

- Complete system startup and shutdown procedures working correctly
- All services integrate properly with correct dependency resolution
- End-to-end notification flow functional (PC notification → mobile device delivery)
- All integration and e2e tests passing with comprehensive system coverage
- System handles errors gracefully with appropriate recovery mechanisms

---

## 🏗️ Clean Architecture Enforcement

### SOLID Principles Application

#### Single Responsibility Principle (SRP)

**Enforcement Rules:**
- Each objective implements exactly one focused feature
- Maximum 150 lines per implementation file
- Each class/service has single, well-defined purpose
- No mixing of concerns within a single component

**Technology-Specific Examples:**

✅ **Correct Implementation:**
```typescript
// WindowsMonitor.ts - Only handles Windows notification monitoring
class WindowsMonitor implements INotificationMonitor {
  private listener: UserNotificationListener;
  
  async startMonitoring(): Promise<void> {
    // Only Windows notification setup logic
  }
}

// DeviceRegistrationService.ts - Only handles device registration
class DeviceRegistrationService {
  async registerDevice(deviceData: DeviceInput): Promise<Device> {
    // Only registration logic, no database operations
    return this.repository.create(validatedData);
  }
}
```

❌ **Violation Examples:**
```typescript
// DON'T: Mixed responsibilities
class NotificationManager {
  startWindowsMonitoring() { /* Windows logic */ }
  startLinuxMonitoring() { /* Linux logic */ }
  sendToWebSocket() { /* Communication logic */ }
  saveToDatabase() { /* Persistence logic */ }
}
```

#### Open/Closed Principle (OCP)

**Extension Patterns:**
- Abstract base classes for platform monitors
- Interface-based service contracts
- Configuration-driven behavior modification

**Implementation:**
```typescript
// Open for extension, closed for modification
abstract class BaseMonitor implements INotificationMonitor {
  abstract startMonitoring(): Promise<void>;
  
  // Common functionality available to all monitors
  protected emitNotification(notification: StandardNotification): void {
    this.eventEmitter.emit('notification', notification);
  }
}

// Extend without modifying existing code
class WindowsMonitor extends BaseMonitor {
  async startMonitoring(): Promise<void> {
    // Windows-specific implementation
  }
}
```

#### Liskov Substitution Principle (LSP)

**Interface Implementation Rules:**
- All monitor implementations must be interchangeable
- Repository implementations must provide consistent behavior
- Service implementations must honor interface contracts

**Type Safety Requirements:**
```typescript
// All monitors must be substitutable
function createMonitor(platform: Platform): INotificationMonitor {
  switch (platform) {
    case 'windows': return new WindowsMonitor();
    case 'linux': return new LinuxMonitor();
    case 'macos': return new MacOSMonitor();
  }
}
```

#### Interface Segregation Principle (ISP)

**Interface Design Guidelines:**
- Separate interfaces for different concerns
- Clients depend only on methods they use
- Avoid fat interfaces with unused methods

**Service Contract Definitions:**
```typescript
// Segregated interfaces
interface IDeviceRegistration {
  registerDevice(data: DeviceInput): Promise<Device>;
}

interface IDeviceStatus {
  updateStatus(deviceId: string, status: DeviceStatus): Promise<void>;
}

interface IDeviceRepository {
  findById(id: string): Promise<Device | null>;
  save(device: Device): Promise<Device>;
}

// Controllers depend only on what they need
class DeviceController {
  constructor(
    private registration: IDeviceRegistration,
    private status: IDeviceStatus
  ) {}
}
```

#### Dependency Inversion Principle (DIP)

**Dependency Injection Implementation:**
- Services depend on abstractions, not concrete implementations
- Repository pattern abstracts database operations
- Interface-based service dependencies

**Abstraction Layer Design:**
```typescript
// High-level service depends on abstraction
class NotificationProcessingService {
  constructor(
    private monitors: INotificationMonitor[],
    private formatter: INotificationFormatter,
    private websocket: IWebSocketServer
  ) {}
}

// Concrete implementations injected at runtime
const processingService = new NotificationProcessingService(
  [windowsMonitor, linuxMonitor, macosMonitor],
  notificationFormatter,
  socketServer
);
```

### DRY Principle Implementation

**Code Reuse Strategies:**
- Shared utility functions for common operations
- Base classes for common behavior patterns
- Configuration-driven behavior to eliminate code duplication

**Abstraction Techniques:**
- Generic repository pattern for all database entities
- Common error handling patterns
- Shared validation utilities

**Utility Function Organization:**
- `src/utils/` directory for shared functionality
- Type-safe utility functions with proper generics
- Comprehensive test coverage for all utilities

### Anti-Pattern Prevention Rules

#### Spaghetti Code Prevention

**Clear Component Boundaries:**
- Each service has well-defined responsibility
- Dependencies flow in one direction (no circular dependencies)
- Clear interfaces between layers

**Dependency Direction Rules:**
```
Controllers → Services → Repositories → Database
Monitors → Processing Service → WebSocket Server → Mobile Devices
```

**Coupling Minimization Strategies:**
- Event-driven communication between loosely coupled components
- Interface-based dependencies to enable testing and flexibility
- Configuration injection to avoid hardcoded dependencies

#### Monster Class Prevention

**Enforceable Size Limits:**
- Maximum 150 lines per implementation file
- Maximum 20 lines per method/function
- Maximum 5 parameters per method
- Maximum 3 levels of nesting

**Single Responsibility Enforcement:**
- If class approaches size limits, split into focused components
- Each method should have single, clear purpose
- Classes should not require extensive comments to explain purpose

**Service Decomposition Strategies:**
```typescript
// DON'T: Monster service
class DeviceManager {
  registerDevice() { /* 50 lines */ }
  validateDevice() { /* 30 lines */ }
  saveToDatabase() { /* 40 lines */ }
  generateToken() { /* 25 lines */ }
  updateStatus() { /* 35 lines */ }
  sendNotification() { /* 45 lines */ }
}

// DO: Decomposed services
class DeviceRegistrationService { /* Only registration logic */ }
class DeviceValidationService { /* Only validation logic */ }
class TokenService { /* Only token operations */ }
class DeviceStatusService { /* Only status operations */ }
```

#### God Object Prevention

**Responsibility Distribution Rules:**
- No single class handles more than one major system concern
- Business logic separated from data access
- Presentation layer separated from business logic

**Service Decomposition:**
- Each objective creates focused, single-purpose services
- Services communicate through well-defined interfaces
- No service has knowledge of all other services

**State Management Boundaries:**
- Each service manages only its own state
- Shared state handled through proper abstractions
- No global state accessible by all components

### Component Size Limits

**File/Class Limits:**
- Implementation files: 150 lines maximum
- Test files: 200 lines maximum
- Interface files: 50 lines maximum
- Configuration files: 100 lines maximum

**Method/Function Limits:**
- Regular methods: 20 lines maximum
- Test methods: 30 lines maximum
- Setup/teardown methods: 15 lines maximum
- Utility functions: 10 lines maximum

**Complexity Limits:**
- Cyclomatic complexity: 5 maximum per method
- Parameter count: 5 maximum per method/function
- Nesting levels: 3 maximum
- Import statements: 15 maximum per file

**Refactoring Triggers:**
- When any limit is approached (80% of maximum), refactor
- Extract methods, create helper functions, split classes
- Use composition over inheritance to manage complexity

### Quality Gates

**Code Coverage Requirements:**
- Unit tests: >90% code coverage for all services
- Integration tests: >80% coverage for API endpoints
- E2E tests: 100% coverage for critical user flows
- All tests must pass before objective completion

**TypeScript Compliance:**
- Strict TypeScript configuration enforced
- Zero TypeScript compilation errors required
- All public APIs must have proper type definitions
- No `any` types allowed in production code

**Architecture Compliance:**
- No circular dependencies between modules
- All SOLID principles must be demonstrably applied
- Component size limits must be enforced
- Interface segregation must be maintained

**Performance Standards:**
- API endpoint response times: <100ms for simple operations
- Notification processing latency: <50ms from capture to forwarding
- Memory usage: <100MB during normal operation
- WebSocket message delivery: <50ms for connected devices

## 📊 Progress Tracking

| Objective | Feature | Status | Files Created | Tests Passing | Completion Date |
| --------- | ------- | ------ | ------------- | ------------- | --------------- |
| 1 | Windows Notification Monitoring | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 2 | Linux Notification Monitoring | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 3 | macOS Notification Monitoring | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 4 | WebSocket Server Core | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 5 | Connection Management | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 6 | Device Authentication | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 7 | Message Routing | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 8 | Device Registration | ❌ **NOT STARTED** | 0/4 | 0/1 | - |
| 9 | Database Operations | ❌ **NOT STARTED** | 0/4 | 0/1 | - |
| 10 | Token Authentication | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 11 | Device Status Tracking | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 12 | HTTP Server Setup | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 13 | Device API Endpoints | ❌ **NOT STARTED** | 0/4 | 0/1 | - |
| 14 | Health Monitoring API | ❌ **NOT STARTED** | 0/3 | 0/1 | - |
| 15 | Notification Processing Pipeline | ❌ **NOT STARTED** | 0/4 | 0/1 | - |
| 16 | System Orchestration | ❌ **NOT STARTED** | 0/4 | 0/2 | - |

**Total Progress: 0/16 objectives completed (0%)**

**Implementation Phase Recommendations:**
- **Phase 1 (Foundation)**: Objectives 8-11 (Device Management)
- **Phase 2 (Communication)**: Objectives 4-7 (WebSocket)  
- **Phase 3 (API)**: Objectives 12-14 (HTTP API)
- **Phase 4 (Monitoring)**: Objectives 1-3 (Platform Monitoring)
- **Phase 5 (Integration)**: Objectives 15-16 (Processing & Orchestration)