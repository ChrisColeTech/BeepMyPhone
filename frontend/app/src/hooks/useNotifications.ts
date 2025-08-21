import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/NotificationService';
import type { WindowsNotification } from '../services/NotificationService';

interface UseNotificationsReturn {
  notifications: WindowsNotification[];
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  addNotification: (notification: WindowsNotification) => void;
  clearNotifications: () => void;
  refetch: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<WindowsNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addNotification = useCallback((notification: WindowsNotification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep latest 50
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const fetchRecentNotifications = useCallback(async () => {
    try {
      setError(null);
      const recent = await notificationService.getRecentNotifications();
      setNotifications(recent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    }
  }, []);

  const initializeConnection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Connect to SignalR hub
      await notificationService.connect();
      setIsConnected(true);

      // Set up notification listener
      const unsubscribe = notificationService.onNotification(addNotification);

      // Load recent notifications
      await fetchRecentNotifications();

      return unsubscribe;
    } catch (err) {
      console.error('Failed to initialize notification service:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
      return () => {};
    } finally {
      setLoading(false);
    }
  }, [addNotification, fetchRecentNotifications]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupConnection = async () => {
      unsubscribe = await initializeConnection();
    };

    setupConnection();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      notificationService.disconnect();
    };
  }, [initializeConnection]);

  return {
    notifications,
    isConnected,
    loading,
    error,
    addNotification,
    clearNotifications,
    refetch: fetchRecentNotifications
  };
};