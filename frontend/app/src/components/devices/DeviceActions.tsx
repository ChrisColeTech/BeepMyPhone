import React from 'react';
import { Send, Pencil, Trash2, RefreshCw } from 'lucide-react';
import type { RegisteredDevice } from '../../services/DeviceService';

interface DeviceActionsProps {
  device: RegisteredDevice;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  isTesting: boolean;
  isDeleting: boolean;
  size?: 'sm' | 'md';
}

export const DeviceActions: React.FC<DeviceActionsProps> = ({
  device,
  onEdit,
  onDelete,
  onTest,
  isTesting,
  isDeleting,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 14 : 16;
  const buttonClass = size === 'sm' 
    ? 'p-1.5' 
    : 'p-2';

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={onTest}
        disabled={isTesting || !device.isActive}
        className={`${buttonClass} text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Send test notification"
      >
        {isTesting ? (
          <RefreshCw className="animate-spin" size={iconSize} />
        ) : (
          <Send size={iconSize} />
        )}
      </button>
      
      <button 
        onClick={onEdit}
        className={`${buttonClass} text-text-muted hover:bg-interactive-hover rounded-lg transition-colors`}
        title="Edit device"
      >
        <Pencil size={iconSize} />
      </button>
      
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className={`${buttonClass} text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50`}
        title="Delete device"
      >
        {isDeleting ? (
          <RefreshCw className="animate-spin" size={iconSize} />
        ) : (
          <Trash2 size={iconSize} />
        )}
      </button>
    </div>
  );
};