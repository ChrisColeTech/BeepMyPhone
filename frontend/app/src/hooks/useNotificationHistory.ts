import { useState, useEffect, useCallback } from 'react';
import type { NotificationHistoryItem, NotificationStats } from '../services/NotificationHistoryService';
import { notificationHistoryService } from '../services/NotificationHistoryService';

export interface UseNotificationHistoryReturn {
  notifications: NotificationHistoryItem[];
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  refreshStats: () => Promise<void>;
  searchNotifications: (query: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

export const useNotificationHistory = (initialLimit = 50): UseNotificationHistoryReturn => {
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    try {
      setError(null);
      const fetchedNotifications = await notificationHistoryService.getNotifications(initialLimit);
      setNotifications(fetchedNotifications);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Failed to fetch notifications:', err);
    }
  }, [initialLimit]);

  const refreshStats = useCallback(async () => {
    try {
      setError(null);
      const fetchedStats = await notificationHistoryService.getStats();
      setStats(fetchedStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const searchNotifications = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const searchResults = await notificationHistoryService.searchNotifications(query);
      setNotifications(searchResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search notifications';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      setError(null);
      await notificationHistoryService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Refresh stats after deletion
      refreshStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(errorMessage);
      throw err;
    }
  }, [refreshStats]);

  const clearAllNotifications = useCallback(async () => {
    try {
      setError(null);
      await notificationHistoryService.clearAllNotifications();
      setNotifications([]);
      refreshStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear notifications';
      setError(errorMessage);
      throw err;
    }
  }, [refreshStats]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          refreshNotifications(),
          refreshStats()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshNotifications, refreshStats]);

  return {
    notifications,
    stats,
    loading,
    error,
    refreshNotifications,
    refreshStats,
    searchNotifications,
    deleteNotification,
    clearAllNotifications,
  };
};