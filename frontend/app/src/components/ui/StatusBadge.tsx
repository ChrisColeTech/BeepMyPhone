import React from 'react';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'connecting' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  className = ''
}) => {
  const statusStyles = {
    online: 'status-online',
    offline: 'status-offline', 
    connecting: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm', 
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`
      status-badge
      ${statusStyles[status]} 
      ${sizeStyles[size]}
      ${className}
    `}>
      {status}
    </span>
  );
};