# Frontend Project Structure (Simplified)

This document provides a simplified, parser-friendly version of the project structure for the BeepMyPhone frontend application.

## FILE_LIST

### Configuration Files
package.json
package-lock.json
vite.config.ts
tsconfig.json
tsconfig.node.json

### Basic Layout & Status - Objective 1
app/src/components/layout/AppLayout.tsx
app/src/components/layout/TitleBar.tsx
app/src/components/layout/StatusBar.tsx
app/src/components/layout/MainContent.tsx
app/src/styles/layout.css
app/tests/unit/components/layout/AppLayout.test.tsx

### Device Management Interface - Objective 2
app/src/components/devices/DeviceList.tsx
app/src/components/devices/DeviceItem.tsx
app/src/components/devices/AddDeviceForm.tsx
app/src/components/devices/DeviceStatus.tsx
app/src/hooks/useDevices.ts
app/tests/unit/components/devices/DeviceList.test.tsx

### Connection Monitoring - Objective 3
app/src/components/status/ConnectionStatus.tsx
app/src/components/status/ServiceStatus.tsx
app/src/hooks/useConnectionMonitor.ts
app/src/services/websocket.ts
app/tests/unit/components/status/ConnectionStatus.test.tsx

### Settings Interface - Objective 4
app/src/components/settings/SettingsPanel.tsx
app/src/components/settings/ServiceSettings.tsx
app/src/components/settings/AppSettings.tsx
app/src/hooks/useSettings.ts
app/tests/unit/components/settings/SettingsPanel.test.tsx

### Test & Activity Features - Objective 5
app/src/components/test/TestNotification.tsx
app/src/components/activity/ActivityFeed.tsx
app/src/components/activity/ActivityItem.tsx
app/src/hooks/useTestNotification.ts
app/src/hooks/useActivity.ts
app/tests/unit/components/test/TestNotification.test.tsx

### Core Application Files
app/src/main.tsx
app/src/App.tsx
app/src/index.css
app/public/index.html
app/src/vite-env.d.ts