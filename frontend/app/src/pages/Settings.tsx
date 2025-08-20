import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useToast } from '../hooks/useToast';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Settings as SettingsIcon, Bell, Server, RefreshCw, Download, Upload, Trash2, Plus, X } from 'lucide-react';

type SettingsTab = 'general' | 'notifications';

export const Settings: React.FC = () => {
  const toast = useToast();
  const {
    settings,
    loading,
    error,
    updateNotificationSettings,
    updateGeneralSettings,
    addNotificationFilter,
    removeNotificationFilter,
    resetSettings,
    exportSettings,
    importSettings,
    refreshSettings
  } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [newFilterApp, setNewFilterApp] = useState('');
  const [removingFilterId, setRemovingFilterId] = useState<string | null>(null);

  // Local state for form editing
  const [generalForm, setGeneralForm] = useState(settings?.general || null);
  const [notificationForm, setNotificationForm] = useState(settings?.notifications || null);

  React.useEffect(() => {
    if (settings) {
      setGeneralForm(settings.general);
      setNotificationForm(settings.notifications);
    }
  }, [settings]);

  const validateGeneralForm = () => {
    if (!generalForm) return false;
    
    // Port validation
    if (generalForm.server?.port) {
      const port = generalForm.server.port;
      if (port < 1024 || port > 65535) {
        return false;
      }
    }

    // Server URL validation
    if (generalForm.server?.baseUrl) {
      const url = generalForm.server.baseUrl.trim();
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        return false;
      }
    }

    return true;
  };

  const validateNotificationForm = () => {
    if (!notificationForm) return false;
    
    // App filter validation
    if (newFilterApp.trim() && !/^[a-zA-Z0-9\s\-_.']+$/.test(newFilterApp.trim())) {
      return false;
    }

    return true;
  };

  const handleSaveGeneral = async () => {
    if (!generalForm) return;
    
    if (!validateGeneralForm()) {
      toast.warning('Validation Error', 'Please correct the errors in the form');
      return;
    }
    
    setSavingGeneral(true);
    try {
      await updateGeneralSettings(generalForm);
      toast.success('Settings Saved', 'General settings updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save general settings';
      toast.error('Save Failed', errorMessage);
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!notificationForm) return;
    
    if (!validateNotificationForm()) {
      toast.warning('Validation Error', 'Please correct the errors in the form');
      return;
    }
    
    setSavingNotifications(true);
    try {
      await updateNotificationSettings(notificationForm);
      toast.success('Settings Saved', 'Notification settings updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save notification settings';
      toast.error('Save Failed', errorMessage);
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleAddFilter = async () => {
    if (!newFilterApp.trim()) return;
    
    if (!validateNotificationForm()) {
      return;
    }
    
    try {
      await addNotificationFilter(newFilterApp.trim());
      setNewFilterApp('');
      toast.success('Filter Added', `${newFilterApp} has been added to the filter list`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add notification filter';
      toast.error('Add Filter Failed', errorMessage);
    }
  };

  const handleRemoveFilter = async (filterId: string) => {
    setRemovingFilterId(filterId);
    try {
      await removeNotificationFilter(filterId);
      toast.success('Filter Removed', 'Filter has been removed from the list');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove notification filter';
      toast.error('Remove Filter Failed', errorMessage);
    } finally {
      setRemovingFilterId(null);
    }
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importSettings(file).then(() => {
        toast.success('Import Complete', 'Settings imported successfully!', 4000);
      }).catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to import settings';
        toast.error('Import Failed', errorMessage, 6000);
      });
    }
  };

  const handleResetSettings = async () => {
    setResetting(true);
    try {
      await resetSettings();
      toast.success('Reset Complete', 'Settings reset to defaults successfully!', 4000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset settings';
      toast.error('Reset Failed', errorMessage, 6000);
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <RefreshCw className="animate-spin" size={20} />
              <span className="text-text-secondary">Loading settings...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary mb-2">
              Settings
            </h1>
            <p className="text-text-secondary">
              Configure your BeepMyPhone preferences and behavior
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={refreshSettings}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-border-default rounded-lg hover:bg-interactive-hover transition-colors disabled:opacity-50"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportSettings}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-border-default rounded-lg hover:bg-interactive-hover transition-colors"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            <label className="flex items-center space-x-2 px-3 py-2 text-sm border border-border-default rounded-lg hover:bg-interactive-hover transition-colors cursor-pointer">
              <Upload size={16} />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 error-container rounded-lg">
            <p className="error-text">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-border-default">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'general'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-muted'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Server size={16} />
                  <span>General</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'notifications'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-muted'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Bell size={16} />
                  <span>Notifications</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && generalForm && (
          <div className="space-y-6">
            {/* Server Settings */}
            <div className="bg-background-card border border-border-default rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Server Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="serverUrl" className="block text-sm font-medium text-text-primary mb-2">
                    Server URL
                  </label>
                  <input
                    id="serverUrl"
                    type="text"
                    value={generalForm.server.url}
                    onChange={(e) => setGeneralForm({
                      ...generalForm,
                      server: { ...generalForm.server, url: e.target.value }
                    })}
                    placeholder="http://localhost:5001"
                    className="w-full px-3 py-2 border border-border-default rounded-lg bg-background-app text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="timeout" className="block text-sm font-medium text-text-primary mb-2">
                      Timeout (ms)
                    </label>
                    <input
                      id="timeout"
                      type="number"
                      min="1000"
                      max="30000"
                      value={generalForm.server.timeout}
                      onChange={(e) => setGeneralForm({
                        ...generalForm,
                        server: { ...generalForm.server, timeout: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-border-default rounded-lg bg-background-app text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="retryAttempts" className="block text-sm font-medium text-text-primary mb-2">
                      Retry Attempts
                    </label>
                    <input
                      id="retryAttempts"
                      type="number"
                      min="0"
                      max="10"
                      value={generalForm.server.retryAttempts}
                      onChange={(e) => setGeneralForm({
                        ...generalForm,
                        server: { ...generalForm.server, retryAttempts: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-border-default rounded-lg bg-background-app text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Startup Settings */}
            <div className="bg-background-card border border-border-default rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Startup Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="autoStart"
                    type="checkbox"
                    checked={generalForm.startup.autoStart}
                    onChange={(e) => setGeneralForm({
                      ...generalForm,
                      startup: { ...generalForm.startup, autoStart: e.target.checked }
                    })}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-border-default rounded"
                  />
                  <label htmlFor="autoStart" className="ml-2 block text-sm text-text-primary">
                    Start automatically with Windows
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="startMinimized"
                    type="checkbox"
                    checked={generalForm.startup.startMinimized}
                    onChange={(e) => setGeneralForm({
                      ...generalForm,
                      startup: { ...generalForm.startup, startMinimized: e.target.checked }
                    })}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-border-default rounded"
                  />
                  <label htmlFor="startMinimized" className="ml-2 block text-sm text-text-primary">
                    Start minimized to system tray
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="showSplash"
                    type="checkbox"
                    checked={generalForm.startup.showSplash}
                    onChange={(e) => setGeneralForm({
                      ...generalForm,
                      startup: { ...generalForm.startup, showSplash: e.target.checked }
                    })}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-border-default rounded"
                  />
                  <label htmlFor="showSplash" className="ml-2 block text-sm text-text-primary">
                    Show splash screen on startup
                  </label>
                </div>
              </div>
            </div>

            {/* Logging Settings */}
            <div className="bg-background-card border border-border-default rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Logging & Debugging</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="loggingEnabled"
                    type="checkbox"
                    checked={generalForm.logging.enabled}
                    onChange={(e) => setGeneralForm({
                      ...generalForm,
                      logging: { ...generalForm.logging, enabled: e.target.checked }
                    })}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-border-default rounded"
                  />
                  <label htmlFor="loggingEnabled" className="ml-2 block text-sm text-text-primary">
                    Enable detailed logging
                  </label>
                </div>
                
                <div>
                  <label htmlFor="logLevel" className="block text-sm font-medium text-text-primary mb-2">
                    Log Level
                  </label>
                  <select
                    id="logLevel"
                    value={generalForm.logging.level}
                    onChange={(e) => setGeneralForm({
                      ...generalForm,
                      logging: { ...generalForm.logging, level: e.target.value as 'error' | 'warn' | 'info' | 'debug' }
                    })}
                    disabled={!generalForm.logging.enabled}
                    className="w-full px-3 py-2 border border-border-default rounded-lg bg-background-app text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug (Verbose)</option>
                  </select>
                  <p className="text-xs text-text-muted mt-1">
                    Higher levels include all lower levels (Debug includes all messages)
                  </p>
                </div>
                
                <div>
                  <label htmlFor="maxFileSize" className="block text-sm font-medium text-text-primary mb-2">
                    Max Log File Size (MB)
                  </label>
                  <input
                    id="maxFileSize"
                    type="number"
                    min="1"
                    max="1000"
                    value={generalForm.logging.maxFileSize}
                    onChange={(e) => setGeneralForm({
                      ...generalForm,
                      logging: { ...generalForm.logging, maxFileSize: parseInt(e.target.value) }
                    })}
                    disabled={!generalForm.logging.enabled}
                    className="w-full px-3 py-2 border border-border-default rounded-lg bg-background-app text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:opacity-50"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Log files will rotate when they exceed this size
                  </p>
                </div>
                
                <div className="bg-background-elevated border border-border-default rounded-lg p-4">
                  <h4 className="text-sm font-medium text-text-primary mb-2">Log File Locations</h4>
                  <div className="text-xs text-text-muted space-y-1">
                    <div><strong>Windows:</strong> %APPDATA%\BeepMyPhone\logs\</div>
                    <div><strong>Application:</strong> app.log</div>
                    <div><strong>Errors:</strong> error.log</div>
                  </div>
                </div>
                
                {generalForm.logging.enabled && generalForm.logging.level === 'debug' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="icon-warning mt-1">⚠️</div>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Debug Logging Enabled</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Debug mode will log detailed information including network requests and device communications. 
                          This may impact performance and create large log files.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveGeneral}
                disabled={savingGeneral}
                className="flex items-center space-x-2 px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingGeneral ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <SettingsIcon size={16} />
                )}
                <span>{savingGeneral ? 'Saving...' : 'Save General Settings'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && notificationForm && (
          <div className="space-y-6">
            {/* Notification Types */}
            <div className="bg-background-card border border-border-default rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Notification Types</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    id="enableToast"
                    type="checkbox"
                    checked={notificationForm.enabledTypes.toast}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      enabledTypes: { ...notificationForm.enabledTypes, toast: e.target.checked }
                    })}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-border-default rounded"
                  />
                  <label htmlFor="enableToast" className="ml-2 block text-sm text-text-primary">
                    Toast Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="enableBanner"
                    type="checkbox"
                    checked={notificationForm.enabledTypes.banner}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      enabledTypes: { ...notificationForm.enabledTypes, banner: e.target.checked }
                    })}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-border-default rounded"
                  />
                  <label htmlFor="enableBanner" className="ml-2 block text-sm text-text-primary">
                    Banner Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="enableBadge"
                    type="checkbox"
                    checked={notificationForm.enabledTypes.badge}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      enabledTypes: { ...notificationForm.enabledTypes, badge: e.target.checked }
                    })}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-border-default rounded"
                  />
                  <label htmlFor="enableBadge" className="ml-2 block text-sm text-text-primary">
                    Badge Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="enableSound"
                    type="checkbox"
                    checked={notificationForm.enabledTypes.sound}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      enabledTypes: { ...notificationForm.enabledTypes, sound: e.target.checked }
                    })}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-border-default rounded"
                  />
                  <label htmlFor="enableSound" className="ml-2 block text-sm text-text-primary">
                    Sound Notifications
                  </label>
                </div>
              </div>
            </div>

            {/* App Filters */}
            <div className="bg-background-card border border-border-default rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">App Filters</h3>
              <p className="text-text-secondary text-sm mb-4">
                Control which applications can send notifications to your devices.
              </p>
              
              {/* Add Filter */}
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="text"
                  value={newFilterApp}
                  onChange={(e) => setNewFilterApp(e.target.value)}
                  placeholder="App name (e.g., Microsoft Outlook)"
                  className="flex-1 px-3 py-2 border border-border-default rounded-lg bg-background-app text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                <button
                  onClick={handleAddFilter}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              {/* Filter List */}
              {notificationForm.filters.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  No app filters configured. Add an app name above to create a filter.
                </div>
              ) : (
                <div className="space-y-2">
                  {notificationForm.filters.map((filter) => (
                    <div key={filter.id} className="flex items-center justify-between p-3 border border-border-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={filter.enabled}
                          onChange={(e) => {
                            const updatedFilters = notificationForm.filters.map(f => 
                              f.id === filter.id ? { ...f, enabled: e.target.checked } : f
                            );
                            setNotificationForm({
                              ...notificationForm,
                              filters: updatedFilters
                            });
                          }}
                          className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-border-default rounded"
                        />
                        <span className="text-text-primary font-medium">{filter.appName}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFilter(filter.id)}
                        disabled={removingFilterId === filter.id}
                        className="btn-danger-outline disabled:cursor-not-allowed"
                      >
                        {removingFilterId === filter.id ? (
                          <RefreshCw className="animate-spin" size={16} />
                        ) : (
                          <X size={16} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveNotifications}
                disabled={savingNotifications}
                className="flex items-center space-x-2 px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingNotifications ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <Bell size={16} />
                )}
                <span>{savingNotifications ? 'Saving...' : 'Save Notification Settings'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetSettings}
        title="Reset Settings"
        message="Are you sure you want to reset all settings to defaults? This action cannot be undone and will restore all original configuration values."
        confirmText="Reset to Defaults"
        cancelText="Cancel"
        type="danger"
        loading={resetting}
      />
    </div>
  );
};

export default Settings;