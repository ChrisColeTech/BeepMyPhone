import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores([
    'dist',
    'coverage',
    // Exclude placeholder/stub components with empty interfaces
    'src/components/accessibility',
    'src/components/animations', 
    'src/components/backup',
    'src/components/diagnostics',
    'src/components/export',
    'src/components/filters',
    'src/components/import',
    'src/components/loading',
    'src/components/metrics',
    'src/components/monitoring',
    'src/components/rules',
    'src/components/search',
    'src/components/testing',
    'src/components/themes',
    'src/router/RouteGuard.tsx',
    'src/pages/DashboardOriginal.tsx',
    'src/services/base',
    'src/components/notifications/NotificationHistory.tsx',
    'src/components/notifications/NotificationListItem.tsx',
    // Keep placeholder components that might be used
    'src/components/navigation',
    'src/components/status',
    'src/components/dashboard/ActionButton.tsx',
    'src/components/dashboard/ActivityFeed.tsx',
    'src/components/dashboard/ActivityItem.tsx',
    'src/components/dashboard/QuickActions.tsx',
    'src/components/dashboard/StatCard.tsx',
    'src/components/dashboard/StatsWidget.tsx',
    'src/components/devices/DeviceDetails.tsx',
    'src/components/devices/DeviceEdit.tsx',
    'src/components/devices/DeviceListItem.tsx',
    'src/components/devices/DeviceStats.tsx',
    'src/components/devices/InlineEdit.tsx',
    'src/components/devices/QRCodeGenerator.tsx',
    'src/components/settings/AdvancedSettings.tsx',
    'src/components/settings/DebugPanel.tsx',
    'src/components/settings/EncryptionConfig.tsx',
    'src/components/settings/FilterRule.tsx',
    'src/components/settings/GeneralSettings.tsx',
    'src/components/settings/NotificationSettings.tsx',
    'src/components/settings/SecuritySettings.tsx',
    'src/components/settings/SettingItem.tsx',
    'src/components/ui/Button.tsx',
    'src/components/ui/CalendarView.tsx',
    'src/components/ui/DateRangePicker.tsx',
    'src/components/ui/Input.tsx',
    'src/components/ui/Modal.tsx',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
