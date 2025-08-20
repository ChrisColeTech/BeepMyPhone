export interface NotificationFilter {
  id: string;
  appName: string;
  enabled: boolean;
  allowedTypes: string[];
}

export interface NotificationSettings {
  enabledTypes: {
    toast: boolean;
    banner: boolean;
    badge: boolean;
    sound: boolean;
  };
  soundSettings: {
    enabled: boolean;
    volume: number;
    customSound?: string;
  };
  filters: NotificationFilter[];
  priority: {
    high: boolean;
    normal: boolean;
    low: boolean;
  };
}

export interface GeneralSettings {
  server: {
    url: string;
    timeout: number;
    retryAttempts: number;
  };
  startup: {
    autoStart: boolean;
    startMinimized: boolean;
    showSplash: boolean;
  };
  logging: {
    enabled: boolean;
    level: 'error' | 'warn' | 'info' | 'debug';
    maxFileSize: number;
  };
  theme: {
    mode: 'light' | 'dark' | 'system';
  };
}

export interface AppSettings {
  notifications: NotificationSettings;
  general: GeneralSettings;
}

export class SettingsService {
  private baseUrl = 'http://localhost:5001/api';

  async getSettings(): Promise<AppSettings> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`);
      if (!response.ok) {
        throw new Error(`Settings endpoint not available: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      // Graceful degradation: return default settings
      console.warn('Settings endpoint not available, using default settings:', error);
      
      const defaultSettings: AppSettings = {
        notifications: {
          enabledTypes: {
            toast: true,
            banner: true,
            badge: true,
            sound: true,
          },
          soundSettings: {
            enabled: true,
            volume: 0.7,
          },
          filters: [],
          priority: {
            high: true,
            normal: true,
            low: false,
          },
        },
        general: {
          server: {
            url: 'http://localhost:5001',
            timeout: 30000,
            retryAttempts: 3,
          },
          startup: {
            autoStart: false,
            startMinimized: false,
            showSplash: true,
          },
          logging: {
            enabled: false,
            level: 'info',
            maxFileSize: 10485760, // 10MB
          },
          theme: {
            mode: 'light',
          },
        },
      };
      
      return defaultSettings;
    }
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<void> {
    const response = await fetch(`${this.baseUrl}/settings/notifications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to update notification settings: ${response.statusText}`);
    }
  }

  async updateGeneralSettings(settings: GeneralSettings): Promise<void> {
    const response = await fetch(`${this.baseUrl}/settings/general`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to update general settings: ${response.statusText}`);
    }
  }

  async addNotificationFilter(appName: string): Promise<NotificationFilter> {
    const response = await fetch(`${this.baseUrl}/settings/filters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add notification filter: ${response.statusText}`);
    }
    return response.json();
  }

  async removeNotificationFilter(filterId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/settings/filters/${filterId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove notification filter: ${response.statusText}`);
    }
  }

  async resetSettings(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/settings/reset`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to reset settings: ${response.statusText}`);
    }
  }

  async exportSettings(): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/settings/export`);
    if (!response.ok) {
      throw new Error(`Failed to export settings: ${response.statusText}`);
    }
    return response.blob();
  }

  async importSettings(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('settings', file);

    const response = await fetch(`${this.baseUrl}/settings/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to import settings: ${response.statusText}`);
    }
  }
}

export const settingsService = new SettingsService();