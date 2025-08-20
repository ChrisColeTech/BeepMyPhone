export interface NotificationHistoryItem {
  id: string;
  appName: string;
  title: string;
  message: string;
  timestamp: string;
  deviceId?: string;
  deviceName?: string;
  delivered: boolean;
  deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'failed';
  failureReason?: string;
}

export interface NotificationStats {
  totalNotifications: number;
  deliveredNotifications: number;
  failedNotifications: number;
  connectedDevices: number;
  notificationsToday: number;
}

export class NotificationHistoryService {
  private baseUrl = 'http://localhost:5001/api';

  async getNotifications(limit?: number, offset?: number): Promise<NotificationHistoryItem[]> {
    const params = new URLSearchParams();
    if (limit) params.append('count', limit.toString()); // Backend expects 'count' not 'limit'
    if (offset) params.append('offset', offset.toString());
    
    const response = await fetch(`${this.baseUrl}/notifications/recent?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }
    return response.json();
  }

  async getNotification(id: string): Promise<NotificationHistoryItem> {
    const response = await fetch(`${this.baseUrl}/notifications/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch notification: ${response.statusText}`);
    }
    return response.json();
  }

  async getStats(): Promise<NotificationStats> {
    try {
      // Try to get stats from backend (endpoint may not exist yet)
      const response = await fetch(`${this.baseUrl}/notifications/stats`);
      if (!response.ok) {
        throw new Error(`Stats endpoint not available: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      // Graceful degradation: calculate basic stats from recent notifications
      console.warn('Stats endpoint not available, calculating from recent notifications:', error);
      
      try {
        const notifications = await this.getNotifications(100); // Get more for better stats
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const stats: NotificationStats = {
          totalNotifications: notifications.length,
          deliveredNotifications: notifications.filter(n => n.delivered).length,
          failedNotifications: notifications.filter(n => !n.delivered).length,
          connectedDevices: 0, // Will be updated by device service
          notificationsToday: notifications.filter(n => new Date(n.timestamp) >= today).length
        };
        
        return stats;
      } catch (fallbackError) {
        // Final fallback: return empty stats
        console.error('Could not calculate fallback stats:', fallbackError);
        return {
          totalNotifications: 0,
          deliveredNotifications: 0,
          failedNotifications: 0,
          connectedDevices: 0,
          notificationsToday: 0
        };
      }
    }
  }

  async searchNotifications(query: string): Promise<NotificationHistoryItem[]> {
    const response = await fetch(`${this.baseUrl}/notifications/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Failed to search notifications: ${response.statusText}`);
    }
    return response.json();
  }

  async deleteNotification(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/notifications/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete notification: ${response.statusText}`);
    }
  }

  async clearAllNotifications(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/notifications/clear`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to clear notifications: ${response.statusText}`);
    }
  }
}

export const notificationHistoryService = new NotificationHistoryService();