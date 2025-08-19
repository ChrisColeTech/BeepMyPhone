/**
 * Windows-specific notification type definitions
 * Using Windows UserNotificationListener API
 */

export interface WindowsNotificationData {
  /** Notification title from Windows API */
  title: string;
  
  /** Notification body content */
  body: string;
  
  /** Application name that created the notification */
  appName: string;
  
  /** Timestamp when notification was received */
  timestamp: Date;
  
  /** Path to notification icon if available */
  iconPath?: string;
  
  /** Windows-specific notification ID */
  windowsId?: string;
  
  /** Application ID from Windows */
  appId?: string;
}

export interface WindowsMonitorConfig {
  /** Enable Windows notification monitoring */
  enabled: boolean;
  
  /** Applications to exclude from monitoring */
  excludedApps?: string[];
  
  /** Minimum notification importance level */
  minImportance?: 'low' | 'normal' | 'high';
}

export interface WindowsNotificationListener {
  /** Start monitoring Windows notifications */
  start(): Promise<void>;
  
  /** Stop monitoring Windows notifications */
  stop(): Promise<void>;
  
  /** Check if monitoring is currently active */
  isActive(): boolean;
}