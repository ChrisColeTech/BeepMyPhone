import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { WindowsMonitor } from '../../../src/monitors/windows/WindowsMonitor';
import { WindowsMonitorConfig, WindowsNotificationData } from '../../../src/types/windows-notifications';
import { StandardNotification } from '../../../src/monitors/base/BaseMonitor';

describe('WindowsMonitor', () => {
  let monitor: WindowsMonitor;
  let mockConfig: WindowsMonitorConfig;

  beforeEach(() => {
    mockConfig = {
      enabled: true,
      excludedApps: ['TestApp'],
      minImportance: 'normal'
    };
    monitor = new WindowsMonitor(mockConfig);
  });

  afterEach(async () => {
    if (monitor.isActive()) {
      await monitor.stop();
    }
    monitor.removeAllListeners();
  });

  describe('constructor', () => {
    it('should create monitor with default config', () => {
      const defaultMonitor = new WindowsMonitor();
      expect(defaultMonitor).toBeDefined();
      expect(defaultMonitor.isActive()).toBe(false);
    });

    it('should create monitor with custom config', () => {
      expect(monitor).toBeDefined();
      expect(monitor.isActive()).toBe(false);
    });
  });

  describe('start', () => {
    it('should start monitoring when enabled', async () => {
      // Mock platform check
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      await monitor.start();
      expect(monitor.isActive()).toBe(true);

      // Restore platform
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should throw error when disabled', async () => {
      const disabledMonitor = new WindowsMonitor({ enabled: false });
      await expect(disabledMonitor.start()).rejects.toThrow('Windows monitoring is disabled');
    });

    it('should throw error on non-Windows platform', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux' });

      await expect(monitor.start()).rejects.toThrow('Windows monitor only works on Windows platform');

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should not start twice', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      await monitor.start();
      expect(monitor.isActive()).toBe(true);

      // Starting again should not throw
      await monitor.start();
      expect(monitor.isActive()).toBe(true);

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });

  describe('stop', () => {
    it('should stop monitoring when active', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      await monitor.start();
      expect(monitor.isActive()).toBe(true);

      await monitor.stop();
      expect(monitor.isActive()).toBe(false);

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should not error when stopping inactive monitor', async () => {
      expect(monitor.isActive()).toBe(false);
      await monitor.stop();
      expect(monitor.isActive()).toBe(false);
    });
  });

  describe('notification handling', () => {
    beforeEach(() => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });
    });

    it('should emit standardized notification', (done) => {
      const testNotification: WindowsNotificationData = {
        title: 'Test Title',
        body: 'Test Body',
        appName: 'AllowedApp',
        timestamp: new Date(),
        iconPath: '/path/to/icon.png',
        windowsId: 'test-id',
        appId: 'test-app-id'
      };

      monitor.on('notification', (notification: StandardNotification) => {
        expect(notification.title).toBe(testNotification.title);
        expect(notification.body).toBe(testNotification.body);
        expect(notification.appName).toBe(testNotification.appName);
        expect(notification.platform).toBe('windows');
        expect(notification.iconPath).toBe(testNotification.iconPath);
        expect(notification.id).toBeDefined();
        expect(typeof notification.id).toBe('string');
        done();
      });

      // Simulate notification via private method (testing internal behavior)
      (monitor as any).handleWindowsNotification(testNotification);
    });

    it('should exclude notifications from excluded apps', () => {
      const excludedNotification: WindowsNotificationData = {
        title: 'Excluded Title',
        body: 'Excluded Body',
        appName: 'TestApp', // This is in excludedApps
        timestamp: new Date()
      };

      let notificationReceived = false;
      monitor.on('notification', () => {
        notificationReceived = true;
      });

      (monitor as any).handleWindowsNotification(excludedNotification);
      expect(notificationReceived).toBe(false);
    });

    it('should generate unique notification IDs', () => {
      const id1 = (monitor as any).generateNotificationId();
      const id2 = (monitor as any).generateNotificationId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });
  });

  describe('configuration', () => {
    it('should respect excludedApps configuration', () => {
      const configWithExclusion = { enabled: true, excludedApps: ['Chrome', 'Firefox'] };
      const monitorWithExclusion = new WindowsMonitor(configWithExclusion);

      expect((monitorWithExclusion as any).shouldExcludeApp('Chrome')).toBe(true);
      expect((monitorWithExclusion as any).shouldExcludeApp('Firefox')).toBe(true);
      expect((monitorWithExclusion as any).shouldExcludeApp('NotExcluded')).toBe(false);
    });

    it('should handle empty excludedApps', () => {
      const configWithoutExclusion = { enabled: true };
      const monitorWithoutExclusion = new WindowsMonitor(configWithoutExclusion);

      expect((monitorWithoutExclusion as any).shouldExcludeApp('AnyApp')).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle start errors gracefully', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      // Mock setupWindowsListener to throw error
      const originalSetup = (monitor as any).setupWindowsListener;
      (monitor as any).setupWindowsListener = jest.fn(() => Promise.reject(new Error('Setup failed')));

      await expect(monitor.start()).rejects.toThrow('Failed to start Windows monitor: Setup failed');
      expect(monitor.isActive()).toBe(false);

      // Restore
      (monitor as any).setupWindowsListener = originalSetup;
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should handle stop errors gracefully', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      await monitor.start();
      expect(monitor.isActive()).toBe(true);

      // Mock cleanupWindowsListener to throw error
      const originalCleanup = (monitor as any).cleanupWindowsListener;
      (monitor as any).cleanupWindowsListener = jest.fn(() => Promise.reject(new Error('Cleanup failed')));

      await expect(monitor.stop()).rejects.toThrow('Failed to stop Windows monitor: Cleanup failed');

      // Restore
      (monitor as any).cleanupWindowsListener = originalCleanup;
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });
});
