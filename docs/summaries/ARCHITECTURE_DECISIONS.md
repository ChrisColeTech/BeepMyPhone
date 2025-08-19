# BeepMyPhone Architecture Decisions

## Core Architectural Principles

### 1. Simplicity Over Enterprise Complexity

**Decision**: Keep the architecture focused on core notification forwarding functionality.

**Rationale**: 
- PC-to-phone notification forwarding is inherently simple
- Enterprise patterns add unnecessary complexity for this use case
- User wants reliability and ease of use, not advanced features

**Implementation**:
- Backend: 5 objectives instead of 15+ enterprise objectives
- Frontend: 5 objectives instead of 44+ enterprise UI components
- No complex filtering, analytics, or monitoring systems

### 2. No Notification Filtering

**Decision**: Forward all captured PC notifications without filtering.

**Rationale**:
- If a notification appears on PC, the user probably wants it on their phone
- Complex filtering rules add cognitive overhead for users
- Filtering doesn't serve the core use case of notification forwarding

**Implementation**:
- Remove all rule builders, filters, and conditional forwarding logic
- Simple pass-through from PC capture to mobile delivery
- Exception: Basic enable/disable toggle for the entire service

### 3. Simple Authentication Over JWT

**Decision**: Use simple device tokens instead of JWT authentication.

**Rationale**:
- PC-to-phone communication is inherently trusted (same user)
- JWT adds complexity without significant security benefit for this use case
- Simple tokens are easier to implement and debug

**Implementation**:
- Generate simple UUIDs as device tokens
- Store tokens in SQLite database
- No token expiration or refresh logic needed

### 4. Direct Database Access Over Repository Pattern

**Decision**: Use direct database access instead of repository abstraction layers.

**Rationale**:
- Simple CRUD operations don't benefit from repository abstraction
- Reduces code complexity and maintenance overhead
- SQLite operations are straightforward enough to use directly

**Implementation**:
- Direct SQLite queries in service classes
- Simple error handling and connection management
- No ORM or complex data access layers

### 5. Component Size Limits

**Decision**: Enforce strict component size limits to prevent complexity creep.

**Rationale**:
- Large components become hard to understand and maintain
- Forces proper separation of concerns
- Prevents god object anti-pattern

**Implementation**:
- React components: Maximum 120-150 lines
- Service classes: Maximum 150-200 lines  
- Functions: Maximum 15-20 lines
- Split components that exceed limits

### 6. Single Responsibility Per Objective

**Decision**: Each implementation objective handles exactly one feature.

**Rationale**:
- Prevents scope creep within objectives
- Makes progress tracking accurate
- Ensures focused, testable implementations

**Implementation**:
- Backend: 5 objectives, each with single clear purpose
- Frontend: 5 objectives, each with single UI concern
- No multi-feature objectives

## Technology Stack Decisions

### Backend Technology Choices

**Node.js + TypeScript**:
- **Pros**: Cross-platform, good ecosystem, type safety
- **Cons**: Single-threaded (but not a concern for this use case)
- **Alternatives Considered**: Python (rejected for desktop integration complexity), C# (rejected for Linux support)

**Express.js**:
- **Pros**: Simple HTTP server, well-documented, minimal overhead
- **Cons**: Basic feature set (but sufficient for our needs)
- **Alternatives Considered**: Fastify (rejected as unnecessary optimization), Koa (rejected for complexity)

**Socket.io**:
- **Pros**: Real-time WebSocket communication, automatic fallbacks
- **Cons**: Larger bundle size (acceptable for desktop app)
- **Alternatives Considered**: Native WebSocket (rejected for lacking fallbacks)

**SQLite**:
- **Pros**: Local database, no server setup, simple deployment
- **Cons**: Not scalable (not needed for personal use case)
- **Alternatives Considered**: PostgreSQL (rejected for complexity), JSON files (rejected for reliability)

### Frontend Technology Choices

**React + TypeScript**:
- **Pros**: Component architecture, large ecosystem, type safety
- **Cons**: Learning curve (but team is familiar)
- **Alternatives Considered**: Vue.js (rejected for smaller ecosystem), Electron native (rejected for complexity)

**Vite**:
- **Pros**: Fast development, modern build tooling, excellent TypeScript support
- **Cons**: Newer ecosystem (but stable enough)
- **Alternatives Considered**: Create React App (rejected for slower builds), Webpack (rejected for complexity)

**Tailwind CSS**:
- **Pros**: Utility-first approach, consistent design, rapid development
- **Cons**: Large class names (acceptable trade-off)
- **Alternatives Considered**: CSS Modules (rejected for verbosity), Styled Components (rejected for runtime overhead)

## Cross-Platform Decisions

### Notification Monitoring Approach

**Decision**: Use platform-specific native APIs for notification capture.

**Rationale**:
- Native APIs provide most reliable notification access
- Cross-platform abstraction would miss platform-specific features
- Performance benefits from native integration

**Implementation**:
- Windows: UserNotificationListener API
- Linux: D-Bus notification interface  
- macOS: NSUserNotification (limited support)

### Desktop Integration Strategy

**Decision**: Build as Electron app with system tray integration.

**Rationale**:
- Cross-platform desktop app requirements
- System tray provides unobtrusive background operation
- File system access needed for configuration

**Implementation**:
- Electron wrapper around React frontend
- System tray icon and context menu
- Auto-start integration with OS

## Data Flow Architecture

### Notification Flow

```
PC Notifications → Platform Monitor → WebSocket → Mobile Device
                                  ↓
                              Activity Log
```

**Decision**: Direct flow without complex processing pipeline.

**Rationale**:
- Minimal latency for real-time forwarding
- Simple debugging and troubleshooting
- No complex state management needed

### State Management

**Decision**: Use React Context for global state, local state for components.

**Rationale**:
- Simple state requirements don't justify Redux complexity
- Component-local state for UI-specific concerns
- Context for cross-component shared state

**Implementation**:
- Settings context for app preferences
- Device context for device list and status
- Local state for forms and UI interactions

## Security Architecture

### Network Security

**Decision**: Allow both local network and internet connections.

**Rationale**:
- Users may want to receive notifications when away from home
- VPN scenarios require internet connectivity
- Local-only restriction doesn't match real usage patterns

**Implementation**:
- HTTPS for web interfaces (when deployed)
- WSS for secure WebSocket connections
- Simple device token authentication

### Data Privacy

**Decision**: Local-only data storage with no cloud services.

**Rationale**:
- User privacy concerns with notification content
- Reduced complexity without cloud infrastructure
- Faster operation with local storage

**Implementation**:
- SQLite database stored locally
- Configuration files in user data directory
- No telemetry or analytics collection

## Performance Architecture

### Scalability Boundaries

**Decision**: Optimize for single-user, small device count scenarios.

**Rationale**:
- Personal use case typically involves 1-5 devices
- Over-engineering for enterprise scale adds unnecessary complexity
- Simple solutions perform better for target use case

**Implementation**:
- Support for up to 20 devices per user
- No complex caching or performance optimization
- Simple database queries without optimization

### Resource Usage

**Decision**: Prioritize reliability over absolute minimum resource usage.

**Rationale**:
- Modern computers have sufficient resources for this application
- Reliability more important than micro-optimizations
- Simple code is easier to maintain and debug

**Implementation**:
- Reasonable memory usage (< 100MB typical)
- Minimal CPU usage during idle
- No complex resource management