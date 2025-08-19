# BeepMyPhone Frontend Project Structure (Simple Format)

This document provides a simplified, parser-friendly version of the frontend project structure that matches the IMPLEMENTATION_PLAN.md objectives.

## FILE_LIST

### Configuration Files
package.json
tsconfig.json
tsconfig.node.json
vite.config.ts
jest.config.js
tailwind.config.js

### Public Assets
index.html
public/favicon.ico
public/manifest.json

### Source Code - Core Application
src/main.tsx
src/App.tsx

### Source Code - Layout Components (Objectives 1-5)
src/components/layout/AppLayout.tsx
src/components/layout/AppLayout.module.css
src/components/layout/TitleBar.tsx
src/components/layout/TitleBar.module.css
src/components/layout/Sidebar.tsx
src/components/layout/Sidebar.module.css
src/components/layout/MainContent.tsx
src/components/layout/MainContent.module.css
src/components/layout/StatusBar.tsx
src/components/layout/StatusBar.module.css

### Source Code - Navigation Components (Objectives 6-8)
src/components/navigation/NavigationMenu.tsx
src/components/navigation/NavigationMenu.module.css
src/components/navigation/NavigationItem.tsx
src/components/navigation/Breadcrumb.tsx
src/components/navigation/Breadcrumb.module.css

### Source Code - Dashboard Components (Objectives 9-12)
src/components/dashboard/StatsWidget.tsx
src/components/dashboard/StatsWidget.module.css
src/components/dashboard/StatCard.tsx
src/components/dashboard/ActivityFeed.tsx
src/components/dashboard/ActivityFeed.module.css
src/components/dashboard/ActivityItem.tsx
src/components/dashboard/QuickActions.tsx
src/components/dashboard/QuickActions.module.css
src/components/dashboard/ActionButton.tsx

### Source Code - Status Components (Objective 10)
src/components/status/ConnectionStatus.tsx
src/components/status/ConnectionStatus.module.css
src/components/status/StatusUpdater.tsx

### Source Code - UI Components
src/components/ui/LoadingSpinner.tsx
src/components/ui/Button.tsx
src/components/ui/Input.tsx
src/components/ui/Modal.tsx
src/components/ui/Card.tsx
src/components/ui/DateRangePicker.tsx
src/components/ui/DateRangePicker.module.css
src/components/ui/CalendarView.tsx

### Source Code - Device Components (Objectives 13-16)
src/components/devices/DeviceList.tsx
src/components/devices/DeviceList.module.css
src/components/devices/DeviceListItem.tsx
src/components/devices/DeviceDetails.tsx
src/components/devices/DeviceDetails.module.css
src/components/devices/DeviceStats.tsx
src/components/devices/DeviceForm.tsx
src/components/devices/DeviceForm.module.css
src/components/devices/QRCodeGenerator.tsx
src/components/devices/DeviceEdit.tsx
src/components/devices/DeviceEdit.module.css
src/components/devices/InlineEdit.tsx

### Source Code - Settings Components (Objectives 17-20)
src/components/settings/GeneralSettings.tsx
src/components/settings/GeneralSettings.module.css
src/components/settings/SettingItem.tsx
src/components/settings/NotificationSettings.tsx
src/components/settings/NotificationSettings.module.css
src/components/settings/FilterRule.tsx
src/components/settings/SecuritySettings.tsx
src/components/settings/SecuritySettings.module.css
src/components/settings/EncryptionConfig.tsx
src/components/settings/AdvancedSettings.tsx
src/components/settings/AdvancedSettings.module.css
src/components/settings/DebugPanel.tsx

### Source Code - Notification Components (Objectives 21, 27)
src/components/notifications/NotificationHistory.tsx
src/components/notifications/NotificationHistory.module.css
src/components/notifications/NotificationListItem.tsx
src/components/notifications/NotificationStream.tsx

### Source Code - Search Components (Objective 22)
src/components/search/AdvancedSearch.tsx
src/components/search/AdvancedSearch.module.css
src/components/search/SearchBuilder.tsx

### Source Code - Export Components (Objectives 24, 37)
src/components/export/ExportManager.tsx
src/components/export/ExportManager.module.css
src/components/export/ExportProgress.tsx
src/components/export/BulkExporter.tsx
src/components/export/BulkExporter.module.css
src/components/export/ExportCriteria.tsx

### Source Code - Diagnostics Components (Objective 28)
src/components/diagnostics/ConnectionDiagnostics.tsx
src/components/diagnostics/ConnectionDiagnostics.module.css
src/components/diagnostics/NetworkTest.tsx

### Source Code - Monitoring Components (Objective 29)
src/components/monitoring/HealthMonitor.tsx
src/components/monitoring/HealthMonitor.module.css
src/components/monitoring/MetricChart.tsx

### Source Code - Testing Components (Objective 30)
src/components/testing/TestSender.tsx
src/components/testing/TestSender.module.css
src/components/testing/NotificationPreview.tsx

### Source Code - Metrics Components (Objective 31)
src/components/metrics/MetricsDisplay.tsx
src/components/metrics/MetricsDisplay.module.css
src/components/metrics/PerformanceChart.tsx

### Source Code - Rules Components (Objectives 32-33)
src/components/rules/RuleBuilder.tsx
src/components/rules/RuleBuilder.module.css
src/components/rules/RuleCondition.tsx
src/components/rules/RulePreview.tsx
src/components/rules/RulePreview.module.css
src/components/rules/SimulationResult.tsx

### Source Code - Filters Components (Objective 34)
src/components/filters/FilterTemplates.tsx
src/components/filters/FilterTemplates.module.css
src/components/filters/TemplateCard.tsx

### Source Code - Backup Components (Objective 35)
src/components/backup/ConfigBackup.tsx
src/components/backup/ConfigBackup.module.css
src/components/backup/BackupList.tsx

### Source Code - Import Components (Objective 36)
src/components/import/ImportWizard.tsx
src/components/import/ImportWizard.module.css
src/components/import/DataMapping.tsx

### Source Code - Accessibility Components (Objectives 38-40)
src/components/accessibility/FocusManager.tsx
src/components/accessibility/LiveRegion.tsx
src/components/accessibility/ContrastToggle.tsx

### Source Code - Loading Components (Objective 41)
src/components/loading/LazyLoader.tsx

### Source Code - Animation Components (Objective 43)
src/components/animations/TransitionGroup.tsx

### Source Code - Theme Components (Objective 44)
src/components/themes/ThemeSelector.tsx

### Source Code - Routing
src/router/AppRouter.tsx
src/router/routes.ts
src/router/RouteGuard.tsx

### Source Code - Hooks (From Implementation Plan)
src/hooks/useTheme.ts
src/hooks/useSidebarState.ts
src/hooks/useConnectionStatus.ts
src/hooks/useConnectionMonitor.ts
src/hooks/useBreadcrumb.ts
src/hooks/useWebSocket.ts
src/hooks/useRealTimeStatus.ts
src/hooks/useNotificationStream.ts
src/hooks/useKeyboardNavigation.ts
src/hooks/useARIA.ts
src/hooks/useHighContrast.ts
src/hooks/useLazyLoading.ts
src/hooks/useCaching.ts
src/hooks/useAnimations.ts
src/hooks/useThemeManager.ts

### Source Code - Services
src/services/websocket/WebSocketManager.ts
src/services/cache/CacheManager.ts
src/services/base/BaseService.ts

### Source Code - Types
src/types/layout.ts
src/types/websocket.ts

### Source Code - Utils
src/utils/updateBatcher.ts
src/utils/streamBuffer.ts
src/utils/keyboardShortcuts.ts
src/utils/semanticMarkup.ts
src/utils/codeSplitting.ts
src/utils/cacheStrategies.ts
src/utils/animationPresets.ts
src/utils/themeUtils.ts

### Source Code - Styles
src/styles/index.css
src/styles/highContrast.module.css

### Test Files - Layout Components
src/tests/unit/components/layout/AppLayout.test.tsx
src/tests/unit/components/layout/TitleBar.test.tsx
src/tests/unit/components/layout/Sidebar.test.tsx
src/tests/unit/components/layout/MainContent.test.tsx
src/tests/unit/components/layout/StatusBar.test.tsx

### Test Files - Navigation Components
src/tests/unit/components/navigation/NavigationMenu.test.tsx
src/tests/unit/components/navigation/Breadcrumb.test.tsx

### Test Files - Router
src/tests/unit/router/AppRouter.test.tsx

### Test Files - Dashboard Components
src/tests/unit/components/dashboard/StatsWidget.test.tsx
src/tests/unit/components/dashboard/ActivityFeed.test.tsx
src/tests/unit/components/dashboard/QuickActions.test.tsx

### Test Files - Status Components
src/tests/unit/components/status/ConnectionStatus.test.tsx
src/tests/unit/components/status/StatusUpdater.test.tsx

### Test Files - UI Components
src/tests/unit/components/ui/DateRangePicker.test.tsx

### Test Files - Device Components
src/tests/unit/components/devices/DeviceList.test.tsx
src/tests/unit/components/devices/DeviceDetails.test.tsx
src/tests/unit/components/devices/DeviceForm.test.tsx
src/tests/unit/components/devices/DeviceEdit.test.tsx

### Test Files - Settings Components
src/tests/unit/components/settings/GeneralSettings.test.tsx
src/tests/unit/components/settings/NotificationSettings.test.tsx
src/tests/unit/components/settings/SecuritySettings.test.tsx
src/tests/unit/components/settings/AdvancedSettings.test.tsx

### Test Files - Notification Components
src/tests/unit/components/notifications/NotificationHistory.test.tsx
src/tests/unit/components/notifications/NotificationStream.test.tsx

### Test Files - Search Components
src/tests/unit/components/search/AdvancedSearch.test.tsx

### Test Files - Export Components
src/tests/unit/components/export/ExportManager.test.tsx
src/tests/unit/components/export/BulkExporter.test.tsx

### Test Files - Diagnostics Components
src/tests/unit/components/diagnostics/ConnectionDiagnostics.test.tsx

### Test Files - Monitoring Components
src/tests/unit/components/monitoring/HealthMonitor.test.tsx

### Test Files - Testing Components
src/tests/unit/components/testing/TestSender.test.tsx

### Test Files - Metrics Components
src/tests/unit/components/metrics/MetricsDisplay.test.tsx

### Test Files - Rules Components
src/tests/unit/components/rules/RuleBuilder.test.tsx
src/tests/unit/components/rules/RulePreview.test.tsx

### Test Files - Filters Components
src/tests/unit/components/filters/FilterTemplates.test.tsx

### Test Files - Backup Components
src/tests/unit/components/backup/ConfigBackup.test.tsx

### Test Files - Import Components
src/tests/unit/components/import/ImportWizard.test.tsx

### Test Files - Services
src/tests/unit/services/websocket/WebSocketManager.test.ts
src/tests/unit/services/cache/CacheManager.test.ts

### Test Files - Hooks
src/tests/unit/hooks/useKeyboardNavigation.test.ts
src/tests/unit/hooks/useARIA.test.ts
src/tests/unit/hooks/useHighContrast.test.ts

### Test Files - Utils
src/tests/unit/utils/codeSplitting.test.ts

### Build Scripts
scripts/build.sh
scripts/dev.sh
scripts/test.sh
scripts/lint.sh
scripts/type-check.sh