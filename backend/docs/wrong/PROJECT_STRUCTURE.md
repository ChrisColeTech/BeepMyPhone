# BeepMyPhone Backend Project Structure

This document serves as the centralized reference for all file and folder organization in the BeepMyPhone backend application, ensuring complete compliance with project requirements and architectural standards defined in ARCHITECTURE.md.

## 📁 Complete Directory Structure

```
backend/
├── docs/                               # Documentation (6 files)
│   ├── README.md                       # Comprehensive feature and requirements analysis
│   ├── IMPLEMENTATION_PLAN.md          # One objective per phase implementation plan
│   ├── PROJECT_STRUCTURE.md            # This file - centralized file organization reference
│   ├── ARCHITECTURE.md                 # SOLID/DRY principles + anti-pattern prevention
│   ├── API_REFERENCE.md                # Complete interface documentation
│   └── CODE_EXAMPLES.md                # Implementation pattern examples
│
├── scripts/                            # Build and utility scripts
│   └── init-app.sh                     # Application scaffolding automation script
│
└── app/                                # ALL application code goes here
    ├── README.md                       # Project setup and development instructions
    ├── package.json                    # Node.js dependencies and scripts
    ├── package-lock.json               # Dependency lock file
    ├── tsconfig.json                   # TypeScript configuration
    ├── .env.example                    # Environment variables template
    ├── .env                            # Local environment variables (git-ignored)
    ├── .gitignore                      # Git ignore patterns
    ├── .eslintrc.js                    # ESLint configuration
    ├── .prettierrc                     # Prettier code formatting
    ├── jest.config.js                  # Jest testing configuration
    │
    ├── src/                            # Main application source code
    │   ├── index.ts                    # Application entry point
    │   ├── app.ts                      # Express app configuration
    │   ├── server.ts                   # HTTP/WebSocket server setup
    │   │
    │   ├── config/                     # Configuration management
    │   │   ├── index.ts                # Configuration loader
    │   │   ├── database.ts             # Database configuration
    │   │   ├── server.ts               # Server configuration
    │   │   ├── security.ts             # Security configuration
    │   │   └── validation.ts           # Configuration validation schemas
    │   │
    │   ├── controllers/                # API request controllers
    │   │   ├── base/                   # Base controller classes
    │   │   │   ├── BaseController.ts   # Abstract base controller
    │   │   │   └── ApiController.ts    # API-specific base controller
    │   │   ├── devices/                # Device management controllers
    │   │   │   ├── DeviceController.ts # Device CRUD operations
    │   │   │   ├── RegistrationController.ts # Device registration
    │   │   │   └── DiscoveryController.ts # Network discovery
    │   │   ├── notifications/          # Notification controllers
    │   │   │   ├── NotificationController.ts # Notification management
    │   │   │   ├── FilterController.ts # Filtering rules management
    │   │   │   └── HistoryController.ts # Notification history
    │   │   ├── auth/                   # Authentication controllers
    │   │   │   ├── AuthController.ts   # Authentication endpoints
    │   │   │   └── TokenController.ts  # Token management
    │   │   ├── system/                 # System management controllers
    │   │   │   ├── HealthController.ts # Health check endpoints
    │   │   │   ├── ConfigController.ts # Configuration management
    │   │   │   └── MetricsController.ts # System metrics
    │   │   └── index.ts                # Controller exports
    │   │
    │   ├── services/                   # Business logic services
    │   │   ├── base/                   # Base service classes
    │   │   │   └── BaseService.ts      # Abstract base service
    │   │   ├── notifications/          # Notification services
    │   │   │   ├── NotificationService.ts # Core notification logic
    │   │   │   ├── FilteringService.ts # Notification filtering
    │   │   │   ├── QueueService.ts     # Notification queueing
    │   │   │   └── DeliveryService.ts  # Notification delivery
    │   │   ├── devices/                # Device services
    │   │   │   ├── DeviceService.ts    # Device management logic
    │   │   │   ├── RegistrationService.ts # Device registration logic
    │   │   │   ├── DiscoveryService.ts # Network discovery service
    │   │   │   └── ConnectionService.ts # Connection management
    │   │   ├── auth/                   # Authentication services
    │   │   │   ├── AuthService.ts      # Authentication logic
    │   │   │   ├── TokenService.ts     # JWT token management
    │   │   │   └── CryptoService.ts    # Encryption/decryption
    │   │   ├── system/                 # System services
    │   │   │   ├── HealthService.ts    # Health monitoring
    │   │   │   ├── MetricsService.ts   # Metrics collection
    │   │   │   └── ConfigService.ts    # Configuration management
    │   │   ├── discovery/              # Network discovery services
    │   │   │   ├── DiscoveryService.ts # Main discovery service
    │   │   │   ├── MDNSService.ts      # mDNS service advertisement
    │   │   │   └── UDPBroadcast.ts     # UDP broadcast discovery
    │   │   ├── filtering/              # Notification filtering services
    │   │   │   ├── FilteringService.ts # Main filtering service
    │   │   │   ├── RuleEngine.ts       # Rule evaluation engine
    │   │   │   └── FilterRule.ts       # Individual filter rule
    │   │   ├── config/                 # Configuration services
    │   │   │   ├── ConfigService.ts    # Main configuration service
    │   │   │   ├── FileConfigProvider.ts # File-based configuration
    │   │   │   └── DatabaseConfigProvider.ts # Database configuration
    │   │   ├── connections/            # Connection management services
    │   │   │   ├── ConnectionManager.ts # Connection lifecycle management
    │   │   │   ├── ConnectionPool.ts   # Connection pooling
    │   │   │   └── LoadBalancer.ts     # Load balancing
    │   │   ├── monitoring/             # Health monitoring services
    │   │   │   ├── MetricsService.ts   # Metrics collection
    │   │   │   ├── HealthService.ts    # Health checks
    │   │   │   └── AlertingService.ts  # Alerting system
    │   │   └── index.ts                # Service exports
    │   │
    │   ├── monitors/                   # Platform notification monitors
    │   │   ├── base/                   # Base monitor classes
    │   │   │   ├── BaseMonitor.ts      # Abstract notification monitor
    │   │   │   └── MonitorFactory.ts   # Platform-specific monitor factory
    │   │   ├── windows/                # Windows-specific monitoring
    │   │   │   ├── WindowsMonitor.ts   # UserNotificationListener integration
    │   │   │   ├── WinRTWrapper.ts     # WinRT API wrapper
    │   │   │   └── PermissionHandler.ts # Windows permission handling
    │   │   ├── linux/                  # Linux-specific monitoring
    │   │   │   ├── LinuxMonitor.ts     # D-Bus integration
    │   │   │   ├── DBusWrapper.ts      # D-Bus API wrapper
    │   │   │   └── DesktopDetector.ts  # Desktop environment detection
    │   │   ├── macos/                  # macOS-specific monitoring
    │   │   │   ├── MacOSMonitor.ts     # NSUserNotificationCenter integration
    │   │   │   ├── AccessibilityMonitor.ts # Accessibility API integration
    │   │   │   └── NotificationDB.ts   # Notification database monitoring
    │   │   └── index.ts                # Monitor exports
    │   │
    │   ├── data/                       # Data access layer
    │   │   ├── database/               # Database management
    │   │   │   ├── connection.ts       # Database connection management
    │   │   │   ├── migrations/         # Database migrations
    │   │   │   │   ├── 001_initial.sql # Initial schema creation
    │   │   │   │   ├── 002_devices.sql # Device table creation
    │   │   │   │   ├── 003_notifications.sql # Notification history table
    │   │   │   │   └── 004_configurations.sql # Configuration storage
    │   │   │   └── seeds/              # Test data seeds
    │   │   │       ├── development.sql # Development test data
    │   │   │       └── test.sql        # Test environment data
    │   │   ├── repositories/           # Data access repositories
    │   │   │   ├── base/               # Base repository classes
    │   │   │   │   └── BaseRepository.ts # Abstract base repository
    │   │   │   ├── DeviceRepository.ts # Device data access
    │   │   │   ├── NotificationRepository.ts # Notification data access
    │   │   │   ├── ConfigRepository.ts # Configuration data access
    │   │   │   ├── FilterRepository.ts # Filter rules data access
    │   │   │   └── UserRepository.ts   # User data access
    │   │   ├── models/                 # Data models and entities
    │   │   │   ├── base/               # Base model classes
    │   │   │   │   └── BaseModel.ts    # Abstract base model
    │   │   │   ├── Device.ts           # Device model
    │   │   │   ├── Notification.ts     # Notification model
    │   │   │   ├── User.ts             # User model
    │   │   │   ├── Configuration.ts    # Configuration model
    │   │   │   └── FilterRule.ts       # Filter rule model
    │   │   └── index.ts                # Data layer exports
    │   │
    │   ├── api/                        # API layer
    │   │   ├── routes/                 # Express route definitions
    │   │   │   ├── v1/                 # API version 1
    │   │   │   │   ├── index.ts        # v1 route aggregator
    │   │   │   │   ├── devices.ts      # Device management routes
    │   │   │   │   ├── notifications.ts # Notification routes
    │   │   │   │   ├── auth.ts         # Authentication routes
    │   │   │   │   └── system.ts       # System management routes
    │   │   │   └── index.ts            # Route exports
    │   │   ├── middleware/             # Express middleware
    │   │   │   ├── authentication.ts   # JWT authentication middleware
    │   │   │   ├── authorization.ts    # Role-based authorization
    │   │   │   ├── validation.ts       # Request validation middleware
    │   │   │   ├── rateLimit.ts        # Rate limiting middleware
    │   │   │   ├── logging.ts          # Request logging middleware
    │   │   │   ├── errorHandler.ts     # Global error handling
    │   │   │   └── cors.ts             # CORS configuration
    │   │   ├── schemas/                # Request/response validation schemas
    │   │   │   ├── devices.ts          # Device schema definitions
    │   │   │   ├── notifications.ts    # Notification schemas
    │   │   │   ├── auth.ts             # Authentication schemas
    │   │   │   └── common.ts           # Common schema components
    │   │   └── index.ts                # API layer exports
    │   │
    │   ├── websocket/                  # WebSocket implementation
    │   │   ├── SocketServer.ts         # Socket.io server setup
    │   │   ├── handlers/               # WebSocket event handlers
    │   │   │   ├── ConnectionHandler.ts # Connection lifecycle handling
    │   │   │   ├── AuthenticationHandler.ts # WebSocket authentication
    │   │   │   ├── NotificationHandler.ts # Notification event handling
    │   │   │   └── DeviceHandler.ts    # Device event handling
    │   │   ├── middleware/             # WebSocket middleware
    │   │   │   ├── authentication.ts   # WebSocket auth middleware
    │   │   │   └── rateLimit.ts        # WebSocket rate limiting
    │   │   └── index.ts                # WebSocket exports
    │   │
    │   ├── security/                   # Security implementations
    │   │   ├── encryption/             # Encryption services
    │   │   │   ├── AESCrypto.ts        # AES-256 encryption
    │   │   │   ├── KeyManager.ts       # Encryption key management
    │   │   │   └── CertificateManager.ts # SSL certificate management
    │   │   ├── auth/                   # Authentication implementations
    │   │   │   ├── JWTManager.ts       # JWT token management
    │   │   │   ├── PasswordManager.ts  # Password hashing/verification
    │   │   │   └── SessionManager.ts   # Session management
    │   │   └── index.ts                # Security exports
    │   │
    │   ├── network/                    # Network services
    │   │   ├── discovery/              # Network discovery
    │   │   │   ├── MDNSService.ts      # mDNS service advertisement
    │   │   │   ├── UDPBroadcast.ts     # UDP broadcast discovery
    │   │   │   └── NetworkDetector.ts  # Network topology detection
    │   │   ├── tunneling/              # SSH tunneling
    │   │   │   ├── SSHTunnel.ts        # SSH tunnel management
    │   │   │   ├── TunnelManager.ts    # Multiple tunnel coordination
    │   │   │   └── KeyManager.ts       # SSH key management
    │   │   └── index.ts                # Network exports
    │   │
    │   ├── queue/                      # Message queueing system
    │   │   ├── NotificationQueue.ts    # Main notification queue
    │   │   ├── PriorityQueue.ts        # Priority-based queue implementation
    │   │   ├── DeadLetterQueue.ts      # Failed message handling
    │   │   ├── QueueManager.ts         # Queue lifecycle management
    │   │   └── index.ts                # Queue exports
    │   │
    │   ├── utils/                      # Utility functions
    │   │   ├── logger.ts               # Logging configuration
    │   │   ├── validation.ts           # Input validation utilities
    │   │   ├── crypto.ts               # Cryptographic utilities
    │   │   ├── network.ts              # Network utility functions
    │   │   ├── platform.ts             # Platform detection utilities
    │   │   ├── errors.ts               # Custom error classes
    │   │   ├── constants.ts            # Application constants
    │   │   ├── formatters.ts           # Data formatting utilities
    │   │   └── index.ts                # Utils exports
    │   │
    │   └── types/                      # TypeScript type definitions
    │       ├── api.ts                  # API request/response types
    │       ├── database.ts             # Database model types
    │       ├── websocket.ts            # WebSocket event types
    │       ├── notifications.ts        # Notification-related types
    │       ├── devices.ts              # Device-related types
    │       ├── config.ts               # Configuration types
    │       ├── auth.ts                 # Authentication types
    │       ├── monitoring.ts           # Monitoring and metrics types
    │       └── index.ts                # Type exports
    │
    ├── tests/                          # Comprehensive testing infrastructure
    │   ├── setup.ts                    # Test environment setup
    │   ├── helpers/                    # Test helper utilities
    │   │   ├── database.ts             # Database test helpers
    │   │   ├── mocks.ts                # Mock implementations
    │   │   └── fixtures.ts             # Test data fixtures
    │   ├── unit/                       # Unit tests
    │   │   ├── services/               # Service layer tests
    │   │   │   ├── NotificationService.test.ts
    │   │   │   ├── DeviceService.test.ts
    │   │   │   ├── AuthService.test.ts
    │   │   │   ├── FilteringService.test.ts
    │   │   │   └── ConfigService.test.ts
    │   │   ├── controllers/            # Controller tests
    │   │   │   ├── DeviceController.test.ts
    │   │   │   ├── NotificationController.test.ts
    │   │   │   └── AuthController.test.ts
    │   │   ├── monitors/               # Monitor tests
    │   │   │   ├── WindowsMonitor.test.ts
    │   │   │   ├── LinuxMonitor.test.ts
    │   │   │   └── MacOSMonitor.test.ts
    │   │   ├── utils/                  # Utility tests
    │   │   │   ├── crypto.test.ts
    │   │   │   ├── validation.test.ts
    │   │   │   └── formatters.test.ts
    │   │   └── data/                   # Data layer tests
    │   │       ├── repositories/
    │   │       │   ├── DeviceRepository.test.ts
    │   │       │   └── NotificationRepository.test.ts
    │   │       └── models/
    │   │           ├── Device.test.ts
    │   │           └── Notification.test.ts
    │   ├── integration/                # Integration tests
    │   │   ├── api/                    # API integration tests
    │   │   │   ├── devices.test.ts
    │   │   │   ├── notifications.test.ts
    │   │   │   └── auth.test.ts
    │   │   ├── websocket/              # WebSocket integration tests
    │   │   │   └── realtime.test.ts
    │   │   ├── database/               # Database integration tests
    │   │   │   └── repositories.test.ts
    │   │   └── monitors/               # Monitor integration tests
    │   │       └── platform.test.ts
    │   ├── e2e/                        # End-to-end tests
    │   │   ├── notification-flow.test.ts # Complete notification flow
    │   │   ├── device-registration.test.ts # Device registration flow
    │   │   └── security.test.ts        # Security flow tests
    │   ├── performance/                # Performance tests
    │   │   ├── load.test.ts            # Load testing
    │   │   ├── stress.test.ts          # Stress testing
    │   │   └── memory.test.ts          # Memory usage tests
    │   └── mocks/                      # Mock implementations
    │       ├── MockDatabase.ts         # Database mocks
    │       ├── MockWebSocket.ts        # WebSocket mocks
    │       ├── MockNotifications.ts    # Notification system mocks
    │       └── MockDevices.ts          # Device mocks
    │
    ├── scripts/                        # Build and development scripts
    │   ├── build.sh                    # Production build script
    │   ├── dev.sh                      # Development server script
    │   ├── test.sh                     # Test execution script
    │   ├── lint.sh                     # Linting script
    │   ├── type-check.sh               # TypeScript type checking
    │   └── db-migrate.js               # Database migration runner
    │
    └── dist/                           # Build output (git-ignored)
        ├── index.js                    # Compiled entry point
        ├── app.js                      # Compiled app configuration
        ├── server.js                   # Compiled server setup
        ├── controllers/                # Compiled controllers
        ├── services/                   # Compiled services
        ├── data/                       # Compiled data layer
        ├── api/                        # Compiled API layer
        ├── monitors/                   # Compiled platform monitors
        ├── websocket/                  # Compiled WebSocket layer
        ├── security/                   # Compiled security layer
        ├── network/                    # Compiled network services
        ├── queue/                      # Compiled queue system
        ├── utils/                      # Compiled utilities
        └── types/                      # Compiled type definitions
```

## 🔗 Module Dependencies & Import Structure

### **Dependency Hierarchy**

The import structure follows a strict hierarchy to prevent circular dependencies and maintain clean architecture as defined in ARCHITECTURE.md:

```typescript
// Level 1: Foundation (No internal dependencies)
types/ → utils/ → constants → config/

// Level 2: Data Layer
data/models/ → data/repositories/ → data/database/

// Level 3: Core Services
services/auth/ → services/config/ → services/monitoring/

// Level 4: Business Services
services/notifications/ → services/devices/ → services/filtering/
services/discovery/ → services/connections/

// Level 5: Platform Integration
monitors/ → network/ → queue/

// Level 6: API Layer
controllers/ → api/middleware/ → websocket/handlers/

// Level 7: Application Layer
api/routes/ → websocket/SocketServer → app.ts

// Level 8: Entry Point
server.ts → index.ts
```

### **Component Relationship Flow**

```
index.ts (Application Entry Point)
└── server.ts (Server Setup)
    └── app.ts (Express App Configuration)
        ├── API Routes
        │   ├── Controllers → Services → Repositories → Models
        │   └── Middleware (Auth, Validation, CORS)
        ├── WebSocket Server
        │   ├── Event Handlers → Services
        │   └── WebSocket Middleware
        └── Platform Monitors
            ├── Windows Monitor → Services
            ├── Linux Monitor → Services
            └── macOS Monitor → Services
```

### **Data Flow Pattern**

```
Platform Monitors → Notification Services → Filtering → Queue → Delivery → WebSocket/HTTP
Device Registration → Auth Services → Device Services → Connection Management
Configuration → Config Services → Application Components
Health Monitoring → Metrics Services → Alerting → External Systems
```

## 📦 Component Organization

### **Service Layer Organization**

Following SOLID principles from ARCHITECTURE.md:

#### **Core Services (`services/`)**
- **Single Responsibility**: Each service handles one business domain
- **Dependency Inversion**: All services depend on interfaces
- **Open/Closed**: Extensible through composition and inheritance

#### **Data Access Layer (`data/`)**
- **Repository Pattern**: Clean data access abstraction
- **Model Layer**: Domain entities with business logic
- **Database Layer**: Connection and migration management

#### **API Layer (`api/` and `websocket/`)**
- **Controller Pattern**: Thin controllers delegating to services
- **Middleware Pipeline**: Composable request processing
- **Schema Validation**: Type-safe API contracts

#### **Platform Integration (`monitors/`)**
- **Factory Pattern**: Platform-specific monitor creation
- **Strategy Pattern**: Different monitoring approaches per platform
- **Observer Pattern**: Event-driven notification processing

## 🏗️ File Naming Conventions

### **TypeScript Files**
- **Classes**: `PascalCase.ts` (e.g., `NotificationService.ts`)
- **Interfaces**: `IPascalCase.ts` (e.g., `INotificationMonitor.ts`)
- **Types**: `camelCase.ts` (e.g., `notifications.ts`)
- **Utilities**: `camelCase.ts` (e.g., `validation.ts`)
- **Constants**: `camelCase.ts` (e.g., `constants.ts`)

### **Test Files**
- **Unit Tests**: `[FileName].test.ts`
- **Integration Tests**: `[FileName].integration.test.ts`
- **E2E Tests**: `[FileName].e2e.test.ts`

### **Configuration Files**
- **Environment Configs**: `[environment].json`
- **Schema Files**: `schema.json`
- **Migration Files**: `[timestamp]_[description].sql`

### **Directory Naming**
- **Kebab Case**: For multi-word directories (e.g., `websocket-handlers`)
- **Camel Case**: For single concept directories (e.g., `controllers`)

## 🔧 Build & Development Structure

### **Development Scripts**

#### **Primary Commands**
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "tsc && npm run copy-assets",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "type-check": "tsc --noEmit"
  }
}
```

#### **Quality Assurance Commands**
```json
{
  "scripts": {
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e"
  }
}
```

### **Build Configuration**

#### **TypeScript Configuration**
- **Strict Mode**: Enabled for maximum type safety
- **Path Mapping**: Absolute imports for clean dependencies
- **Declaration Files**: Generated for library usage
- **Source Maps**: Enabled for debugging

#### **Build Output Structure**
```
dist/
├── index.js                    # Application entry point
├── [service directories]/      # Compiled service modules
├── types/                      # Compiled type definitions
└── [other directories]/        # Complete compiled structure
```

## 📊 Code Organization Principles

### **Domain-Driven Organization**

Following ARCHITECTURE.md principles:

- **Clear Boundaries**: Each domain has well-defined responsibilities
- **Dependency Direction**: Dependencies flow towards abstractions
- **Interface Contracts**: All module interactions through interfaces
- **Separation of Concerns**: Business logic, data access, and presentation separated

### **SOLID Compliance**

- **Single Responsibility**: Each module has one reason to change
- **Open/Closed**: Extensible without modification
- **Liskov Substitution**: Implementations are fully substitutable
- **Interface Segregation**: Focused, cohesive interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

### **Anti-Pattern Prevention**

- **No God Objects**: Maximum 200 lines per class, 5 methods per interface
- **No Spaghetti Code**: Clear dependency direction, maximum 3 nesting levels
- **No Circular Dependencies**: Strict layered architecture
- **No Tight Coupling**: All dependencies through interfaces

This project structure supports the 15 implementation objectives outlined in the implementation plan, provides clear separation of concerns, and enables maintainable, scalable development of the BeepMyPhone backend system while strictly adhering to the architectural standards defined in ARCHITECTURE.md.