import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationList } from './NotificationList';
import { ConnectionStatus } from './ConnectionStatus';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Card } from '../ui/Card';
import { withErrorBoundary } from '../ui/ErrorBoundary';

export const NotificationStreamComponent: React.FC = () => {
  const { 
    notifications, 
    isConnected, 
    loading, 
    error 
  } = useNotifications();

  if (loading) {
    return (
      <div className="notification-container">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Connecting to notification service...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification-container">
        <Card className="border-red-200 bg-red-50">
          <Card.Header>
            <h3 className="text-lg font-semibold text-red-800">
              ❌ Connection Error
            </h3>
          </Card.Header>
          <Card.Body>
            <p className="text-red-700 mb-4">{error}</p>
            <p className="text-sm text-red-600">
              Make sure the backend service is running on http://localhost:5001
            </p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h2 className="notification-title">
          🔔 Live Windows Notifications
        </h2>
        <ConnectionStatus 
          isConnected={isConnected}
          notificationCount={notifications.length}
        />
      </div>

      <div className="notification-grid">
        <NotificationList notifications={notifications} />
      </div>
    </div>
  );
};

// Export with error boundary HOC
export const NotificationStream = withErrorBoundary(NotificationStreamComponent);