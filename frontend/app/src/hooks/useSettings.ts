import { useState, useEffect, useCallback } from 'react';
import type { AppSettings, NotificationSettings, GeneralSettings } from '../services/SettingsService';
import { settingsService } from '../services/SettingsService';

export interface UseSettingsReturn {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  updateGeneralSettings: (settings: GeneralSettings) => Promise<void>;
  addNotificationFilter: (appName: string) => Promise<void>;
  removeNotificationFilter: (filterId: string) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => Promise<void>;
  importSettings: (file: File) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      setError(null);
      const fetchedSettings = await settingsService.getSettings();
      setSettings(fetchedSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings';
      setError(errorMessage);
      console.error('Failed to fetch settings:', err);
    }
  }, []);

  const updateNotificationSettings = useCallback(async (notificationSettings: NotificationSettings) => {
    try {
      setError(null);
      await settingsService.updateNotificationSettings(notificationSettings);
      
      // Update local state
      if (settings) {
        setSettings({
          ...settings,
          notifications: notificationSettings
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update notification settings';
      setError(errorMessage);
      throw err;
    }
  }, [settings]);

  const updateGeneralSettings = useCallback(async (generalSettings: GeneralSettings) => {
    try {
      setError(null);
      await settingsService.updateGeneralSettings(generalSettings);
      
      // Update local state
      if (settings) {
        setSettings({
          ...settings,
          general: generalSettings
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update general settings';
      setError(errorMessage);
      throw err;
    }
  }, [settings]);

  const addNotificationFilter = useCallback(async (appName: string) => {
    try {
      setError(null);
      const newFilter = await settingsService.addNotificationFilter(appName);
      
      // Update local state
      if (settings) {
        setSettings({
          ...settings,
          notifications: {
            ...settings.notifications,
            filters: [...settings.notifications.filters, newFilter]
          }
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add notification filter';
      setError(errorMessage);
      throw err;
    }
  }, [settings]);

  const removeNotificationFilter = useCallback(async (filterId: string) => {
    try {
      setError(null);
      await settingsService.removeNotificationFilter(filterId);
      
      // Update local state
      if (settings) {
        setSettings({
          ...settings,
          notifications: {
            ...settings.notifications,
            filters: settings.notifications.filters.filter(f => f.id !== filterId)
          }
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove notification filter';
      setError(errorMessage);
      throw err;
    }
  }, [settings]);

  const resetSettings = useCallback(async () => {
    try {
      setError(null);
      await settingsService.resetSettings();
      await refreshSettings(); // Reload settings after reset
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset settings';
      setError(errorMessage);
      throw err;
    }
  }, [refreshSettings]);

  const exportSettings = useCallback(async () => {
    try {
      setError(null);
      const blob = await settingsService.exportSettings();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beepmyphone-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export settings';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const importSettings = useCallback(async (file: File) => {
    try {
      setError(null);
      await settingsService.importSettings(file);
      await refreshSettings(); // Reload settings after import
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import settings';
      setError(errorMessage);
      throw err;
    }
  }, [refreshSettings]);

  // Load initial settings
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        await refreshSettings();
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [refreshSettings]);

  return {
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
    refreshSettings,
  };
};