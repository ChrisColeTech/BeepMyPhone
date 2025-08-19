// WindowsMonitor
import { BaseMonitor, StandardNotification } from '../base/BaseMonitor';
import { WindowsNotificationData, WindowsMonitorConfig } from '../../types/windows-notifications';

export class WindowsMonitor extends BaseMonitor {
  private config: WindowsMonitorConfig;
  private notificationHandler?: (data: WindowsNotificationData) => void;
  private listener?: any;
  private managementModule?: any;

  constructor(config: WindowsMonitorConfig = { enabled: true }) {
    super();
    this.config = config;
  }

  async start(): Promise<void> {
    if (!this.config.enabled) {
      throw new Error('Windows monitoring is disabled');
    }

    if (this.isMonitoringActive) {
      return;
    }

    try {
      this.notificationHandler = this.handleWindowsNotification.bind(this);
      await this.setupWindowsListener();
      this.isMonitoringActive = true;
    } catch (error) {
      throw new Error(`Failed to start Windows monitor: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async stop(): Promise<void> {
    if (!this.isMonitoringActive) {
      return;
    }

    try {
      await this.cleanupWindowsListener();
      this.notificationHandler = undefined;
      this.listener = undefined;
      this.managementModule = undefined;
      this.isMonitoringActive = false;
    } catch (error) {
      throw new Error(`Failed to stop Windows monitor: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async setupWindowsListener(): Promise<void> {
    // Validate Windows platform
    if (process.platform !== 'win32') {
      throw new Error('Windows monitor only works on Windows platform');
    }

    try {
      // Import Windows.UI.Notifications.Management NodeRT module
      this.managementModule = require('@nodert-win10-rs4/windows.ui.notifications.management');
      
      // Get UserNotificationListener instance
      this.listener = this.managementModule.UserNotificationListener.current;
      
      if (!this.listener) {
        throw new Error('UserNotificationListener not available on this Windows version');
      }

      // Request access to notifications (requires user permission)
      const accessStatus = await this.listener.requestAccessAsync();
      
      if (accessStatus !== this.managementModule.UserNotificationListenerAccessStatus.allowed) {
        throw new Error(`Access denied to notifications. Status: ${accessStatus}`);
      }

      // Set up notification change event handler
      this.listener.on('notificationChanged', this.onNotificationChanged.bind(this));

      // Get existing notifications
      await this.loadExistingNotifications();

    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'MODULE_NOT_FOUND') {
        throw new Error('Windows notification management module not installed. Run: npm install @nodert-win10-rs4/windows.ui.notifications.management');
      }
      throw error;
    }
  }

  private async cleanupWindowsListener(): Promise<void> {
    if (this.listener) {
      try {
        // Remove event listeners
        this.listener.removeAllListeners('notificationChanged');
      } catch (error) {
        // Log error but don't fail cleanup
        console.warn('Error cleaning up Windows notification listener:', error);
      }
    }
  }

  private async loadExistingNotifications(): Promise<void> {
    if (!this.listener || !this.managementModule) return;

    try {
      // Get existing toast notifications
      const notifications = await this.listener.getNotificationsAsync(
        this.managementModule.NotificationKinds.toast
      );

      // Process each existing notification
      for (const notification of notifications) {
        this.processWindowsNotification(notification);
      }
    } catch (error) {
      console.warn('Failed to load existing notifications:', error);
    }
  }

  private onNotificationChanged(args: any): void {
    try {
      if (args && args.userNotification) {
        this.processWindowsNotification(args.userNotification);
      }
    } catch (error) {
      console.error('Error processing notification change:', error);
    }
  }

  private processWindowsNotification(userNotification: any): void {
    try {
      // Extract notification data from Windows UserNotification
      const appInfo = userNotification.appDisplayInfo;
      const notification = userNotification.notification;
      const content = notification?.visual?.bindings?.[0]?.template;

      const windowsData: WindowsNotificationData = {
        title: this.extractText(content, 0) || 'No Title',
        body: this.extractText(content, 1) || '',
        appName: appInfo?.displayName || 'Unknown App',
        timestamp: userNotification.creationTime ? new Date(userNotification.creationTime) : new Date(),
        iconPath: appInfo?.iconUri?.absoluteUri,
        windowsId: userNotification.id,
        appId: appInfo?.appUserModelId
      };

      this.handleWindowsNotification(windowsData);
    } catch (error) {
      console.error('Error processing Windows notification:', error);
    }
  }

  private extractText(template: any, index: number): string | undefined {
    try {
      return template?.textElements?.[index]?.text;
    } catch {
      return undefined;
    }
  }

  private handleWindowsNotification(data: WindowsNotificationData): void {
    if (this.shouldExcludeApp(data.appName)) {
      return;
    }

    const standardNotification: StandardNotification = {
      id: this.generateNotificationId(),
      title: data.title,
      body: data.body,
      appName: data.appName,
      timestamp: data.timestamp,
      platform: 'windows',
      iconPath: data.iconPath
    };

    this.emitNotification(standardNotification);
  }

  private shouldExcludeApp(appName: string): boolean {
    if (!this.config.excludedApps) {
      return false;
    }
    return this.config.excludedApps.includes(appName);
  }
}
