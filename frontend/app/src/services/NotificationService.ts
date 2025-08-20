import * as signalR from '@microsoft/signalr';

interface WindowsNotification {
  id: string;
  appName: string;
  title: string;
  message: string;
  timestamp: string;
  rawPayload: string;
  notificationType: number;
}

export type { WindowsNotification };

export class NotificationService {
  private connection: signalR.HubConnection | null = null;
  private listeners: Set<(notification: WindowsNotification) => void> = new Set();
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || this.getStoredBaseUrl() || this.getDefaultBaseUrl();
  }

  private getStoredBaseUrl(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('beepMyPhone_serverUrl');
    }
    return null;
  }

  private getDefaultBaseUrl(): string {
    // Default to localhost for better compatibility
    return 'http://localhost:5001';
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url;
    if (typeof window !== 'undefined') {
      localStorage.setItem('beepMyPhone_serverUrl', url);
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // Wait for backend to be ready
    await this.waitForBackend();

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/notificationHub`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          // Exponential backoff: 2s, 4s, 8s, then 15s max
          if (retryContext.previousRetryCount < 3) {
            return Math.pow(2, retryContext.previousRetryCount + 1) * 1000;
          }
          return 15000;
        }
      })
      .build();

    this.connection.on('NotificationReceived', (notification: WindowsNotification) => {
      console.log('📨 New notification received:', notification);
      this.listeners.forEach(listener => listener(notification));
    });

    this.connection.on('RecentNotifications', (notifications: WindowsNotification[]) => {
      console.log('📋 Recent notifications received:', notifications);
      notifications.forEach(notification => {
        this.listeners.forEach(listener => listener(notification));
      });
    });

    try {
      await this.connection.start();
      console.log('✅ SignalR connected successfully');
    } catch (error) {
      console.error('❌ SignalR connection failed:', error);
      // Don't throw the error to prevent breaking the app initialization
      // The automatic reconnect will handle retries
      console.log('🔄 Will retry connection automatically...');
    }
  }

  private async waitForBackend(maxRetries: number = 5, delayMs: number = 1000): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}/health`, { 
          method: 'GET',
          headers: { 'Accept': 'text/plain' }
        });
        if (response.ok) {
          console.log('✅ Backend is ready for SignalR connection');
          return;
        }
      } catch (error) {
        console.log(`⏳ Waiting for backend... (attempt ${i + 1}/${maxRetries})`);
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    console.log('⚠️ Backend health check failed, attempting SignalR connection anyway');
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  onNotification(callback: (notification: WindowsNotification) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  async getRecentNotifications(): Promise<WindowsNotification[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/recent`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch recent notifications:', error);
      throw error;
    }
  }

  async getStatus(): Promise<{ isMonitoring: boolean; serviceName: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/status`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch service status:', error);
      throw error;
    }
  }

  async requestRecentNotifications(count: number = 10): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('RequestRecentNotifications', count);
    }
  }
}

export const notificationService = new NotificationService();