# BeepMyPhone Backend Project Structure (Simple Format)

This document provides a simplified, parser-friendly version of the backend project structure.

## FILE_LIST

### Configuration Files
package.json
tsconfig.json
jest.config.js

### Source Code - Core Application
src/index.ts
src/app.ts
src/server.ts

### Source Code - Configuration
src/config/index.ts
src/config/database.ts
src/config/server.ts
src/config/security.ts
src/config/validation.ts

### Source Code - Controllers Base
src/controllers/base/BaseController.ts
src/controllers/base/ApiController.ts

### Source Code - Controllers Devices
src/controllers/devices/DeviceController.ts
src/controllers/devices/RegistrationController.ts
src/controllers/devices/DiscoveryController.ts

### Source Code - Controllers Notifications
src/controllers/notifications/NotificationController.ts
src/controllers/notifications/FilterController.ts
src/controllers/notifications/HistoryController.ts

### Source Code - Controllers Auth
src/controllers/auth/AuthController.ts
src/controllers/auth/TokenController.ts

### Source Code - Controllers System
src/controllers/system/HealthController.ts
src/controllers/system/ConfigController.ts
src/controllers/system/MetricsController.ts
src/controllers/index.ts

### Source Code - Services Base
src/services/base/BaseService.ts

### Source Code - Services Notifications
src/services/notifications/NotificationService.ts
src/services/notifications/FilteringService.ts
src/services/notifications/QueueService.ts
src/services/notifications/DeliveryService.ts

### Source Code - Services Devices
src/services/devices/DeviceService.ts
src/services/devices/RegistrationService.ts
src/services/devices/DiscoveryService.ts
src/services/devices/ConnectionService.ts

### Source Code - Services Auth
src/services/auth/AuthService.ts
src/services/auth/TokenService.ts
src/services/auth/CryptoService.ts

### Source Code - Services System
src/services/system/HealthService.ts
src/services/system/MetricsService.ts
src/services/system/ConfigService.ts

### Source Code - Services Discovery
src/services/discovery/DiscoveryService.ts
src/services/discovery/MDNSService.ts
src/services/discovery/UDPBroadcast.ts

### Source Code - Services Filtering
src/services/filtering/FilteringService.ts
src/services/filtering/RuleEngine.ts
src/services/filtering/FilterRule.ts

### Source Code - Services Config
src/services/config/ConfigService.ts
src/services/config/FileConfigProvider.ts
src/services/config/DatabaseConfigProvider.ts

### Source Code - Services Connections
src/services/connections/ConnectionManager.ts
src/services/connections/ConnectionPool.ts
src/services/connections/LoadBalancer.ts

### Source Code - Services Monitoring
src/services/monitoring/MetricsService.ts
src/services/monitoring/HealthService.ts
src/services/monitoring/AlertingService.ts
src/services/monitoring/index.ts

### Source Code - Platform Monitors
src/monitors/base/BaseMonitor.ts
src/monitors/base/MonitorFactory.ts
src/monitors/windows/WindowsMonitor.ts
src/monitors/windows/WinRTWrapper.ts
src/monitors/windows/PermissionHandler.ts
src/monitors/linux/LinuxMonitor.ts
src/monitors/linux/DBusWrapper.ts
src/monitors/linux/DesktopDetector.ts
src/monitors/macos/MacOSMonitor.ts
src/monitors/macos/AccessibilityMonitor.ts
src/monitors/macos/NotificationDB.ts
src/monitors/index.ts

### Source Code - Database
src/data/database/connection.ts
src/data/migrations/001_initial.sql
src/data/migrations/002_devices.sql
src/data/migrations/003_notifications.sql
src/data/migrations/004_configurations.sql
src/data/seeds/development.sql
src/data/seeds/test.sql

### Source Code - Repositories
src/data/repositories/BaseRepository.ts
src/data/repositories/DeviceRepository.ts
src/data/repositories/NotificationRepository.ts
src/data/repositories/ConfigRepository.ts
src/data/repositories/FilterRepository.ts
src/data/repositories/UserRepository.ts

### Source Code - Models
src/data/models/BaseModel.ts
src/data/models/Device.ts
src/data/models/Notification.ts
src/data/models/User.ts
src/data/models/Configuration.ts

### Source Code - API Routes
src/api/routes/v1/devices.ts
src/api/routes/v1/notifications.ts
src/api/routes/v1/auth.ts
src/api/routes/v1/system.ts
src/api/routes/v1/index.ts

### Source Code - Middleware
src/api/middleware/authentication.ts
src/api/middleware/authorization.ts
src/api/middleware/rateLimit.ts
src/api/middleware/logging.ts
src/api/middleware/errorHandler.ts
src/api/middleware/cors.ts
src/api/middleware/validation.ts
src/api/middleware/index.ts

### Source Code - WebSocket
src/websocket/SocketServer.ts
src/websocket/handlers/ConnectionHandler.ts
src/websocket/handlers/AuthenticationHandler.ts
src/websocket/handlers/NotificationHandler.ts
src/websocket/handlers/DeviceHandler.ts

### Source Code - Security
src/security/encryption/AESCrypto.ts
src/security/encryption/KeyManager.ts
src/security/encryption/CertificateManager.ts
src/security/auth/JWTManager.ts
src/security/auth/PasswordManager.ts
src/security/auth/SessionManager.ts

### Source Code - Network
src/network/discovery/NetworkDetector.ts
src/network/tunneling/SSHTunnel.ts
src/network/tunneling/TunnelManager.ts
src/network/tunneling/KeyManager.ts
src/network/tunneling/index.ts

### Source Code - Queue System
src/queue/NotificationQueue.ts
src/queue/PriorityQueue.ts
src/queue/DeadLetterQueue.ts
src/queue/QueueManager.ts
src/queue/index.ts

### Source Code - Utilities
src/utils/logger.ts
src/utils/crypto.ts
src/utils/network.ts
src/utils/platform.ts
src/utils/errors.ts
src/utils/constants.ts
src/utils/formatters.ts
src/utils/validation.ts
src/utils/index.ts

### Source Code - Types
src/types/api.ts
src/types/devices.ts
src/types/notifications.ts
src/types/auth.ts
src/types/config.ts
src/types/database.ts
src/types/websocket.ts
src/types/monitoring.ts
src/types/index.ts

### Source Code - Schemas
src/schemas/devices.ts
src/schemas/notifications.ts
src/schemas/auth.ts
src/schemas/common.ts
src/schemas/index.ts

### Test Files - Setup
tests/setup.ts
tests/helpers/database.ts
tests/helpers/mocks.ts
tests/helpers/fixtures.ts

### Test Files - Unit Tests Services
tests/unit/services/notifications/NotificationService.test.ts
tests/unit/services/devices/DeviceService.test.ts
tests/unit/services/auth/AuthService.test.ts
tests/unit/services/filtering/FilteringService.test.ts
tests/unit/services/config/ConfigService.test.ts

### Test Files - Unit Tests Controllers
tests/unit/controllers/devices/DeviceController.test.ts
tests/unit/controllers/notifications/NotificationController.test.ts
tests/unit/controllers/auth/AuthController.test.ts

### Test Files - Unit Tests Monitors
tests/unit/monitors/windows/WindowsMonitor.test.ts
tests/unit/monitors/linux/LinuxMonitor.test.ts
tests/unit/monitors/macos/MacOSMonitor.test.ts
tests/unit/monitors/platform.test.ts

### Test Files - Unit Tests Utils
tests/unit/utils/crypto.test.ts
tests/unit/utils/validation.test.ts
tests/unit/utils/formatters.test.ts

### Test Files - Unit Tests Repositories
tests/unit/data/repositories/DeviceRepository.test.ts
tests/unit/data/repositories/NotificationRepository.test.ts

### Test Files - Unit Tests Models
tests/unit/data/models/Device.test.ts
tests/unit/data/models/Notification.test.ts

### Test Files - Unit Tests API
tests/unit/api/routes/devices.test.ts
tests/unit/api/routes/notifications.test.ts
tests/unit/api/routes/auth.test.ts

### Test Files - Unit Tests WebSocket
tests/unit/websocket/realtime.test.ts

### Test Files - Unit Tests Database
tests/unit/data/database/repositories.test.ts

### Test Files - Integration Tests
tests/integration/workflows/notification-flow.test.ts
tests/integration/workflows/device-registration.test.ts
tests/integration/security/security.test.ts

### Test Files - E2E Tests
tests/e2e/api/device-registration.test.ts
tests/e2e/api/notification-flow.test.ts
tests/e2e/security/security.test.ts

### Test Files - Performance Tests
tests/performance/load.test.ts
tests/performance/stress.test.ts
tests/performance/memory.test.ts

### Test Files - Mocks
tests/mocks/MockDatabase.ts
tests/mocks/MockWebSocket.ts
tests/mocks/MockNotifications.ts
tests/mocks/MockDevices.ts

### Build Scripts
scripts/build.sh
scripts/dev.sh
scripts/test.sh
scripts/lint.sh
scripts/type-check.sh
scripts/db-migrate.js