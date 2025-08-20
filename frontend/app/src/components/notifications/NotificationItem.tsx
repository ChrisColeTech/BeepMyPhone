import React from 'react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import type { WindowsNotification } from '../../services/NotificationService';

interface NotificationItemProps {
  notification: WindowsNotification;
  className?: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  className = '' 
}) => {
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getAppDisplayName = (appName: string): string => {
    // Clean up app names for better display
    if (appName.includes('powershell')) return 'PowerShell';
    if (appName.includes('chrome')) return 'Chrome';
    if (appName.includes('teams')) return 'Microsoft Teams';
    if (appName.includes('outlook')) return 'Outlook';
    if (appName.includes('ShellFeedsUI')) return 'Windows Widgets';
    return appName;
  };

  const getNotificationStatus = (notificationType: number): 'online' | 'offline' | 'connecting' | 'error' => {
    // Map notification types to status for display
    switch (notificationType) {
      case 0: return 'online';
      case 1: return 'connecting';
      case 2: return 'error';
      default: return 'offline';
    }
  };

  return (
    <Card className={`
      hover:shadow-md transition-shadow duration-200
      ${className}
    `}>
      <Card.Header className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-lg">📱</span>
            <span className="font-medium text-gray-900">
              {getAppDisplayName(notification.appName)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge 
              status={getNotificationStatus(notification.notificationType)}
              size="sm"
            />
            <span className="text-xs text-gray-500">
              {formatTimestamp(notification.timestamp)}
            </span>
          </div>
        </div>
      </Card.Header>
      
      <Card.Body className="py-3">
        <h4 className="font-semibold text-gray-900 mb-2">
          {notification.title}
        </h4>
        {notification.message && (
          <p className="text-gray-700 text-sm leading-relaxed">
            {notification.message}
          </p>
        )}
      </Card.Body>
      
      <Card.Footer className="pt-2 pb-3">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Type: {notification.notificationType}</span>
          <span>ID: {notification.id.slice(0, 8)}...</span>
        </div>
      </Card.Footer>
    </Card>
  );
};