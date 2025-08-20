import React from 'react';
import { NotificationItem } from './NotificationItem';
import type { WindowsNotification } from '../../services/NotificationService';

interface NotificationListProps {
  notifications: WindowsNotification[];
  className?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  className = ''
}) => {
  if (notifications.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No notifications yet
          </h3>
          <p className="text-gray-500 mb-4">
            Generate some Windows notifications to see them here!
          </p>
          <p className="text-sm text-gray-400 italic">
            Try: Windows + A to open Action Center, or receive emails/messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
};