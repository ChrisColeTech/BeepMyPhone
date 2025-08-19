// BaseMonitor
import { EventEmitter } from 'events';

export interface INotificationMonitor {
  start(): Promise<void>;
  stop(): Promise<void>;
  isActive(): boolean;
  on(event: 'notification', listener: (notification: any) => void): this;
  removeAllListeners(): this;
}

export interface StandardNotification {
  id: string;
  title: string;
  body: string;
  appName: string;
  timestamp: Date;
  platform: 'windows' | 'linux' | 'macos';
  iconPath?: string;
}

export abstract class BaseMonitor extends EventEmitter implements INotificationMonitor {
  protected isMonitoringActive: boolean = false;

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;

  isActive(): boolean {
    return this.isMonitoringActive;
  }

  protected emitNotification(notification: StandardNotification): void {
    this.emit('notification', notification);
  }

  protected generateNotificationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
