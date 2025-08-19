# BeepMyPhone Backend Project Structure (Simple Format)

This document provides a simplified, parser-friendly version of the backend project structure that matches the IMPLEMENTATION_PLAN.md objectives.

## FILE_LIST

### Configuration Files
package.json
package-lock.json
tsconfig.json
.env.example
.env
.gitignore
.eslintrc.js
.prettierrc
jest.config.js

### Application Entry Point
index.ts

### Notification Monitoring (Objective 1)
src/monitors/base/BaseMonitor.ts
src/monitors/windows/WindowsMonitor.ts
src/monitors/linux/LinuxMonitor.ts
src/monitors/macos/MacOSMonitor.ts
src/monitors/MonitorFactory.ts

### WebSocket Communication (Objective 2)
src/websocket/SocketServer.ts
src/websocket/ConnectionManager.ts
src/websocket/MessageHandler.ts
src/websocket/middleware/AuthMiddleware.ts

### Device Management (Objective 3)
src/services/base/BaseService.ts
src/services/DeviceService.ts
src/repositories/base/BaseRepository.ts
src/repositories/DeviceRepository.ts
src/models/Device.ts
src/database/connection.ts
src/database/migrations/001_devices.sql

### HTTP API Server (Objective 4)
src/server.ts
src/routes/devices.ts
src/routes/health.ts
src/controllers/base/BaseController.ts
src/controllers/DeviceController.ts
src/controllers/HealthController.ts
src/middleware/errorHandler.ts
src/middleware/validation.ts

### Notification Forwarding (Objective 5)
src/services/NotificationService.ts
src/services/ForwardingService.ts
src/utils/NotificationFormatter.ts

### Type Definitions
src/types/notifications.ts
src/types/websocket.ts
src/types/device.ts
src/types/forwarding.ts

### Unit Tests - Monitors (Objective 1)
tests/unit/monitors/WindowsMonitor.test.ts
tests/unit/monitors/LinuxMonitor.test.ts
tests/unit/monitors/MacOSMonitor.test.ts
tests/unit/monitors/MonitorFactory.test.ts

### Unit Tests - WebSocket (Objective 2)
tests/unit/websocket/SocketServer.test.ts
tests/unit/websocket/ConnectionManager.test.ts

### Unit Tests - Device Management (Objective 3)
tests/unit/services/DeviceService.test.ts
tests/unit/repositories/DeviceRepository.test.ts

### Unit Tests - HTTP API (Objective 4)
tests/unit/controllers/DeviceController.test.ts

### Unit Tests - Notification Forwarding (Objective 5)
tests/unit/services/NotificationService.test.ts
tests/unit/services/ForwardingService.test.ts

### Integration Tests - WebSocket (Objective 2)
tests/integration/websocket/realtime.test.ts

### Integration Tests - Database (Objective 3)
tests/integration/database/device-operations.test.ts

### Integration Tests - API (Objective 4)
tests/integration/api/device-endpoints.test.ts
tests/integration/api/health-endpoints.test.ts

### Integration Tests - Notification Flow (Objective 5)
tests/integration/notification-flow.test.ts

### End-to-End Tests (Objective 5)
tests/e2e/complete-system.test.ts

### Test Support Files
tests/setup.ts
tests/helpers/database.ts
tests/helpers/mocks.ts