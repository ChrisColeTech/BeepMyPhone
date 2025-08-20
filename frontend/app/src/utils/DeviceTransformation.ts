import type { RegisteredDevice, DeviceRegistrationRequest, DeviceUpdateRequest } from '../services/DeviceService';

export class DeviceTransformation {
  static formToRegistrationRequest(formData: {
    deviceName: string;
    platform: 'ios' | 'android';
  }): DeviceRegistrationRequest {
    return {
      name: formData.deviceName.trim(),
      platform: formData.platform,
    };
  }

  static formToUpdateRequest(formData: {
    deviceName: string;
    notificationPreferences?: object;
  }): DeviceUpdateRequest {
    return {
      name: formData.deviceName.trim(),
      notificationPreferences: formData.notificationPreferences,
    };
  }

  static formatLastSeen(lastSeen: string | Date): string {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleString();
    }
  }

  static formatPlatform(platform: string): string {
    return platform.toUpperCase();
  }

  static getPlatformEmoji(platform: string): string {
    return platform.toLowerCase() === 'ios' ? '📱' : '🤖';
  }

  static generateDisplayName(device: RegisteredDevice): string {
    return `${device.deviceName} (${this.formatPlatform(device.deviceType)})`;
  }

  static sortDevicesByStatus(devices: RegisteredDevice[]): RegisteredDevice[] {
    return [...devices].sort((a, b) => {
      // Connected devices first
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      
      // Then by last seen (most recent first)
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });
  }

  static getConnectionText(isConnected: boolean): { text: string; className: string } {
    return isConnected 
      ? { text: 'Connected', className: 'badge-success' }
      : { text: 'Offline', className: 'badge-error' };
  }
};