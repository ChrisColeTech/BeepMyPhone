# BeepMyPhone Backend Implementation Plan V2
## One Feature Per Objective - Properly Focused

## 📝 CORE PRINCIPLE: ONE FEATURE PER OBJECTIVE

**Each objective implements exactly ONE focused feature**
- No compound features or multiple concerns
- Clear, single-purpose implementation
- Minimal dependencies between objectives  
- Each objective can be completed independently

## 🛠️ IMPLEMENTATION TOOLS & REQUIREMENTS

### **📋 MANDATORY PRE-WORK FOR ALL OBJECTIVES**

**Before beginning ANY objective work, you MUST:**

1. **📖 Read Project Knowledge Base**
   - **Location**: `/mnt/c/Projects/BeepMyPhone/docs/summaries/`
   - **Requirement**: Read ALL relevant project knowledge documents
   - **Purpose**: Understand existing architecture, patterns, and decisions

2. **📚 Read Complete Implementation Plan**
   - **This Document**: `/mnt/c/Projects/BeepMyPhone/backend/docs/IMPLEMENTATION_PLAN_V2.md`
   - **Understanding**: Methodology, terminology, success criteria
   - **Context**: How current objective fits into overall strategy

### **⚡ REQUIRED ANALYSIS TOOLS**

**Use Serena MCP Tools for ALL code analysis and updates:**

- **🎯 Project Activation**: **ALWAYS** activate the `BeepMyPhone` project first
- **🔍 Code Analysis**: Use `mcp__serena__search_for_pattern`, `mcp__serena__find_symbol`, `mcp__serena__get_symbols_overview`
- **📊 Code Understanding**: Use `mcp__serena__find_referencing_symbols` to understand dependencies
- **✏️ Code Updates**: Use `mcp__serena__replace_symbol_body`, `mcp__serena__insert_after_symbol`, etc.
- **💾 Knowledge Management**: Use `mcp__serena__write_memory`, `mcp__serena__read_memory` for findings

### **🎯 IMPLEMENTATION APPROACH**

**Required Process for Each Objective:**

1. **Analysis & Discovery** - Examine requirements and existing code structure
2. **Design & Planning** - Create focused technical approach for single feature
3. **Implementation** - Execute planned code changes with build verification
4. **Testing & Validation** - Verify single feature works correctly
5. **Documentation & Tracking** - Create phase documentation and update tracking
6. **Git & Deployment Workflow** - Commit, push, and deploy changes
7. **Quality Assurance Final Check** - Verify completion criteria

### **🚀 AUTONOMOUS EXECUTION REQUIREMENTS**

**CRITICAL: Complete objectives autonomously without stopping to ask questions.**

**🛭 FIX ALL ISSUES ENCOUNTERED:**
- Fix any TypeScript errors, interface mismatches, missing methods
- Ensure `npm run build` passes after your changes
- Handle integration issues within objective scope
- Never stop to ask "should I fix this?" - just fix it

**🎯 COMPLETE ALL 7 STEPS:**
- **Step 5**: Documentation & Tracking - **MANDATORY** 
- **Step 6**: Git & Deployment - **MANDATORY**
- **Step 7**: Quality Assurance - **MANDATORY**

## 📋 BACKEND OBJECTIVES (16 Features)

### **PLATFORM MONITORING (Objectives 1-3)**

### Objective 1: Windows Notification Monitoring

#### Single Feature
**Windows PC Notification Capture** - Capture system notifications specifically on Windows using UserNotificationListener API.

#### Files to Create
- `app/src/monitors/WindowsMonitor.ts` - Windows UserNotificationListener implementation
- `app/src/types/windows-notifications.ts` - Windows-specific notification types
- `app/tests/unit/monitors/WindowsMonitor.test.ts` - Unit tests for Windows monitoring

#### Dependencies
- Technical: `@nodert-win10-rs4/windows.ui.notifications` package
- External: Windows notification permissions

#### Implementation Requirements
- Capture Windows system notifications without interfering with display
- Extract notification metadata: title, body, app name, timestamp
- Handle Windows-specific permissions and error cases
- Emit standardized notification events

#### Success Criteria
- Windows notifications captured successfully
- Notification metadata extracted correctly
- <100ms latency from system notification to captured event
- All unit tests passing with >90% code coverage

---

### Objective 2: Linux Notification Monitoring

#### Single Feature
**Linux PC Notification Capture** - Capture system notifications specifically on Linux using D-Bus notification monitoring.

#### Files to Create
- `app/src/monitors/LinuxMonitor.ts` - Linux D-Bus notification monitoring
- `app/src/types/linux-notifications.ts` - Linux-specific notification types
- `app/tests/unit/monitors/LinuxMonitor.test.ts` - Unit tests for Linux monitoring

#### Dependencies
- Technical: `dbus` package for Linux notification access
- External: Linux desktop environment with D-Bus notifications

#### Implementation Requirements
- Capture Linux system notifications via D-Bus interface
- Support different desktop environments (GNOME, KDE, XFCE)
- Extract notification metadata: title, body, app name, timestamp
- Handle Linux-specific permissions and D-Bus errors

#### Success Criteria
- Linux notifications captured across major desktop environments
- D-Bus integration working correctly
- <100ms latency from system notification to captured event
- All unit tests passing with >90% code coverage

---

### Objective 3: macOS Notification Monitoring

#### Single Feature
**macOS PC Notification Capture** - Capture system notifications specifically on macOS (with limitations due to API restrictions).

#### Files to Create
- `app/src/monitors/MacOSMonitor.ts` - macOS notification monitoring implementation
- `app/src/types/macos-notifications.ts` - macOS-specific notification types  
- `app/tests/unit/monitors/MacOSMonitor.test.ts` - Unit tests for macOS monitoring

#### Dependencies
- External: macOS notification permissions and API access

#### Implementation Requirements
- Implement macOS notification capture with available APIs
- Handle macOS-specific permission requirements
- Extract available notification metadata
- Provide graceful degradation when full access unavailable

#### Success Criteria
- macOS notifications captured where possible
- Graceful handling of permission limitations
- Clear documentation of macOS limitations
- All unit tests passing with >90% code coverage

---

### **WEBSOCKET COMMUNICATION (Objectives 4-7)**

### Objective 4: WebSocket Server Core

#### Single Feature
**WebSocket Server Foundation** - Basic WebSocket server using Socket.io for mobile device connections.

#### Files to Create
- `app/src/websocket/SocketServer.ts` - Main WebSocket server implementation
- `app/src/types/websocket-core.ts` - Core WebSocket type definitions
- `app/tests/unit/websocket/SocketServer.test.ts` - WebSocket server unit tests

#### Dependencies
- Technical: `socket.io` package
- External: Available WebSocket port

#### Implementation Requirements
- Initialize Socket.io WebSocket server
- Handle basic client connections and disconnections
- Implement proper error boundaries
- Server lifecycle management (start/stop)

#### Success Criteria
- WebSocket server starts and accepts connections
- Basic connection/disconnection handling works
- Proper error handling prevents server crashes
- All unit tests passing

---

### Objective 5: Connection Management

#### Single Feature
**WebSocket Connection Management** - Manage multiple mobile device connections, tracking, and health monitoring.

#### Files to Create
- `app/src/websocket/ConnectionManager.ts` - Client connection tracking and management
- `app/src/types/connection.ts` - Connection-specific type definitions
- `app/tests/unit/websocket/ConnectionManager.test.ts` - Connection management tests

#### Dependencies
- Objective: WebSocket Server Core must exist
- External: Network connectivity

#### Implementation Requirements
- Track multiple concurrent mobile device connections
- Implement connection health monitoring with heartbeat/ping-pong
- Handle connection drops and cleanup
- Connection state management and logging

#### Success Criteria
- Multiple concurrent connections supported
- Connection health monitoring functional
- Graceful handling of connection drops
- All unit tests passing

---

### Objective 6: Device Authentication

#### Single Feature
**WebSocket Device Authentication** - Simple device token authentication for WebSocket connections.

#### Files to Create
- `app/src/websocket/middleware/AuthMiddleware.ts` - Device authentication for WebSocket connections
- `app/src/types/auth.ts` - Authentication type definitions
- `app/tests/unit/websocket/AuthMiddleware.test.ts` - Authentication middleware tests

#### Dependencies
- Objective: Connection Management must exist
- Future: Will need device tokens from device management system

#### Implementation Requirements
- Authenticate devices using simple tokens during WebSocket handshake
- Reject unauthorized connection attempts
- Map authenticated connections to device identities
- Handle authentication failures gracefully

#### Success Criteria
- Device authentication working during WebSocket connection
- Unauthorized connections properly rejected
- Device identity mapping functional
- All unit tests passing

---

### Objective 7: Message Routing

#### Single Feature
**WebSocket Message Broadcasting** - Route and broadcast messages to connected mobile devices.

#### Files to Create
- `app/src/websocket/MessageHandler.ts` - Handle incoming/outgoing WebSocket messages
- `app/src/types/messages.ts` - Message type definitions
- `app/tests/unit/websocket/MessageHandler.test.ts` - Message handling tests

#### Dependencies
- Objective: Connection Management must exist
- Objective: Device Authentication must exist

#### Implementation Requirements
- Broadcast notifications to all connected devices
- Handle targeted messaging to specific devices
- Message queuing for temporary connection failures
- Message format standardization

#### Success Criteria
- Broadcast messaging to all connected devices works
- Message queuing for offline devices functional
- <50ms message delivery latency for connected devices
- All unit tests passing

---

### **DEVICE MANAGEMENT (Objectives 8-11)**

### Objective 8: Device Registration

#### Single Feature
**Device Registration System** - Register new mobile devices with unique IDs and names.

#### Files to Create
- `app/src/services/DeviceRegistrationService.ts` - Device registration business logic
- `app/src/models/Device.ts` - Device data model and validation
- `app/src/types/device.ts` - Device-related type definitions
- `app/tests/unit/services/DeviceRegistrationService.test.ts` - Registration service tests

#### Dependencies
- External: None (standalone feature)

#### Implementation Requirements
- Register devices with unique device IDs and human-readable names
- Generate unique device identifiers
- Basic validation for device data (name length, ID format)
- Handle duplicate registration attempts

#### Success Criteria
- Device registration with unique IDs working
- Device name validation functional
- Duplicate registration handling works
- All unit tests passing with >90% code coverage

---

### Objective 9: Database Operations

#### Single Feature
**Device Data Persistence** - SQLite database operations for storing and retrieving device information.

#### Files to Create
- `app/src/repositories/DeviceRepository.ts` - SQLite database operations for devices
- `app/src/database/connection.ts` - SQLite connection management
- `app/src/database/migrations/001_devices.sql` - Initial device table creation
- `app/tests/unit/repositories/DeviceRepository.test.ts` - Repository unit tests

#### Dependencies
- Technical: `sqlite3` package
- External: File system access for database storage

#### Implementation Requirements
- SQLite database connection and table creation
- CRUD operations for device records
- Database migration system
- Proper error handling for database operations

#### Success Criteria
- SQLite database operations functional
- Device CRUD operations working correctly
- Database migrations execute successfully
- All unit tests passing

---

### Objective 10: Token Authentication

#### Single Feature
**Device Token Management** - Generate, store, and validate authentication tokens for devices.

#### Files to Create
- `app/src/services/TokenService.ts` - Authentication token generation and validation
- `app/src/types/token.ts` - Token-related type definitions
- `app/tests/unit/services/TokenService.test.ts` - Token service tests

#### Dependencies
- Objective: Database Operations must exist for token storage

#### Implementation Requirements
- Generate secure authentication tokens for registered devices
- Store and retrieve tokens from database
- Token validation for authentication
- Token expiration and refresh mechanisms

#### Success Criteria
- Secure token generation working
- Token validation functional
- Database token storage working
- All unit tests passing

---

### Objective 11: Device Status Tracking

#### Single Feature
**Device Status Monitoring** - Track device connection status and last seen timestamps.

#### Files to Create
- `app/src/services/DeviceStatusService.ts` - Device status tracking and updates
- `app/src/types/device-status.ts` - Status-related type definitions
- `app/tests/unit/services/DeviceStatusService.test.ts` - Status service tests

#### Dependencies
- Objective: Database Operations must exist for status storage

#### Implementation Requirements
- Track device connection status (online/offline)
- Record last seen timestamps
- Update device status on connection/disconnection events
- Device status retrieval for monitoring

#### Success Criteria
- Device status tracking functional
- Status updates on connection events working
- Last seen timestamps accurate
- All unit tests passing

---

### **HTTP API (Objectives 12-14)**

### Objective 12: HTTP Server Setup

#### Single Feature
**Express HTTP Server Foundation** - Basic Express.js server setup with middleware configuration.

#### Files to Create
- `app/src/server.ts` - Express server setup and configuration
- `app/src/middleware/errorHandler.ts` - Global error handling middleware
- `app/tests/unit/server.test.ts` - Server setup tests

#### Dependencies
- Technical: `express`, `cors` packages
- External: Available HTTP port

#### Implementation Requirements
- Express.js server initialization and configuration
- CORS configuration for web interface access
- Global error handling middleware
- Server lifecycle management (start/stop)

#### Success Criteria
- HTTP server starts and accepts requests on configured port
- CORS properly configured for cross-origin requests
- Error handling returns appropriate HTTP status codes
- All unit tests passing

---

### Objective 13: Device API Endpoints

#### Single Feature
**Device Management REST API** - RESTful API endpoints for device registration and management operations.

#### Files to Create
- `app/src/routes/devices.ts` - Device management API routes
- `app/src/controllers/DeviceController.ts` - Device API request handlers
- `app/src/middleware/validation.ts` - Request validation middleware
- `app/tests/integration/api/device-endpoints.test.ts` - API endpoint integration tests

#### Dependencies
- Objective: HTTP Server Setup must exist
- Objective: Device Registration, Database Operations, Token Authentication must exist

#### Implementation Requirements
- RESTful API endpoints for device operations (register, list, update, delete)
- Request validation and sanitization
- JSON API responses with consistent format
- Proper HTTP status codes for different scenarios

#### Success Criteria
- Device API endpoints functional (register, list, update, delete)
- Request validation prevents invalid data
- Consistent JSON response format
- All API integration tests passing

---

### Objective 14: Health Monitoring API

#### Single Feature
**System Health Check API** - Health check endpoints for monitoring server and system status.

#### Files to Create
- `app/src/routes/health.ts` - Health check and status endpoints
- `app/src/controllers/HealthController.ts` - Health check handlers
- `app/tests/integration/api/health-endpoints.test.ts` - Health endpoint tests

#### Dependencies
- Objective: HTTP Server Setup must exist

#### Implementation Requirements
- Health check endpoint for monitoring server status
- System status information (uptime, memory, connected devices)
- Database connectivity health check
- Request logging for debugging and monitoring

#### Success Criteria
- Health check endpoint returns server status
- System metrics reporting functional
- Database health check working
- All integration tests passing

---

### **NOTIFICATION PROCESSING (Objectives 15-16)**

### Objective 15: Notification Processing Pipeline

#### Single Feature
**Notification Processing and Formatting** - Process captured notifications and format them for mobile delivery.

#### Files to Create
- `app/src/services/NotificationProcessingService.ts` - Core notification processing logic
- `app/src/utils/NotificationFormatter.ts` - Format notifications for mobile delivery
- `app/src/types/processing.ts` - Notification processing type definitions
- `app/tests/unit/services/NotificationProcessingService.test.ts` - Processing service tests

#### Dependencies
- Objectives: Platform monitoring objectives (1-3) must exist for input
- Objectives: WebSocket objectives (4-7) must exist for output

#### Implementation Requirements
- Listen for notification events from platform monitors
- Format notifications into standardized mobile-friendly format
- Handle processing failures gracefully without losing notifications
- Log processing activities for debugging

#### Success Criteria
- Notifications from monitors processed successfully
- Standardized mobile format created correctly
- Processing failures handled gracefully
- All unit tests passing

---

### Objective 16: System Orchestration

#### Single Feature
**Complete System Integration** - Coordinate startup, shutdown, and integration of all system components.

#### Files to Create
- `app/index.ts` - Main application entry point orchestrating all services
- `app/src/services/SystemOrchestrator.ts` - System component coordination
- `app/tests/e2e/complete-system.test.ts` - Full system integration tests
- `app/tests/integration/notification-flow.test.ts` - End-to-end notification flow tests

#### Dependencies
- **ALL previous objectives must be completed** - this is the final integration

#### Implementation Requirements
- Coordinate startup and shutdown of all system components
- Handle service dependencies and initialization order
- System-wide error handling and recovery
- Complete end-to-end notification flow coordination

#### Success Criteria
- Complete system startup/shutdown procedures working
- All services integrate correctly
- End-to-end notification flow functional (PC → mobile)
- All integration and e2e tests passing

---

## 🏗️ CLEAN ARCHITECTURE ENFORCEMENT

### Single Responsibility Principle (SRP)
- Each objective implements exactly one feature
- No mixing of concerns within a single objective
- Clear boundaries between different features

### Component Size Limits
- Maximum 150 lines per implementation file
- Maximum 50 lines per function/method
- Maximum 3 levels of nesting
- If approaching limits, refactor into smaller focused components

### Quality Gates
- All unit tests must pass with >80% code coverage
- TypeScript strict mode compliance required
- No circular dependencies between modules
- All interfaces properly documented

## 📊 PROGRESS TRACKING

| Objective | Single Feature                          | Status | Files | Tests | Completion |
|-----------|----------------------------------------|--------|-------|-------|------------|
| 1         | Windows Notification Monitoring        | ❌     | 0/3   | 0/1   | -          |
| 2         | Linux Notification Monitoring          | ❌     | 0/3   | 0/1   | -          |
| 3         | macOS Notification Monitoring          | ❌     | 0/3   | 0/1   | -          |
| 4         | WebSocket Server Core                   | ❌     | 0/3   | 0/1   | -          |
| 5         | Connection Management                   | ❌     | 0/3   | 0/1   | -          |
| 6         | Device Authentication                   | ❌     | 0/3   | 0/1   | -          |
| 7         | Message Routing                         | ❌     | 0/3   | 0/1   | -          |
| 8         | Device Registration                     | ❌     | 0/4   | 0/1   | -          |
| 9         | Database Operations                     | ❌     | 0/4   | 0/1   | -          |
| 10        | Token Authentication                    | ❌     | 0/3   | 0/1   | -          |
| 11        | Device Status Tracking                  | ❌     | 0/3   | 0/1   | -          |
| 12        | HTTP Server Setup                       | ❌     | 0/3   | 0/1   | -          |
| 13        | Device API Endpoints                    | ❌     | 0/4   | 0/1   | -          |
| 14        | Health Monitoring API                   | ❌     | 0/3   | 0/1   | -          |
| 15        | Notification Processing Pipeline        | ❌     | 0/4   | 0/1   | -          |
| 16        | System Orchestration                    | ❌     | 0/4   | 0/2   | -          |

**Total Progress: 0/16 objectives completed (0%)**

## 🎯 IMPLEMENTATION ORDER RECOMMENDATION

**Phase 1 (Foundation)**: Objectives 8, 9, 10, 11 (Device Management)
**Phase 2 (Communication)**: Objectives 4, 5, 6, 7 (WebSocket)  
**Phase 3 (API)**: Objectives 12, 13, 14 (HTTP API)
**Phase 4 (Monitoring)**: Objectives 1, 2, 3 (Platform Monitoring)
**Phase 5 (Integration)**: Objectives 15, 16 (Processing & Orchestration)

Each objective is now a single, focused feature that can be implemented, tested, and completed independently.