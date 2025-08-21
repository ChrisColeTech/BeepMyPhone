import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';

interface ConnectionStatusProps {
  isConnected: boolean;
  notificationCount: number;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  notificationCount,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-end space-y-2 ${className}`}>
      <StatusBadge 
        status={isConnected ? 'online' : 'offline'}
        size="sm"
      />
      <span className="text-xs text-gray-500">
        {notificationCount} notification{notificationCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
};