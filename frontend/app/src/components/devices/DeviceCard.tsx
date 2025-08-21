import React from 'react';
import { Smartphone, ExternalLink } from 'lucide-react';
import { DeviceTransformation } from '../../utils/DeviceTransformation';
import type { RegisteredDevice } from '../../services/DeviceService';

interface DeviceCardProps {
  device: RegisteredDevice;
  onNavigate: (deviceId: string) => void;
  children?: React.ReactNode; // For action buttons
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onNavigate,
  children,
}) => {
  const { text: statusText, className: statusClassName } = DeviceTransformation.getConnectionText(device.isActive);
  const platformEmoji = DeviceTransformation.getPlatformEmoji(device.deviceType);
  const formattedLastSeen = DeviceTransformation.formatLastSeen(device.lastSeen);

  return (
    <div className="bg-background-card border border-border-default rounded-lg p-4 hover:bg-interactive-hover transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="p-2 bg-brand-primary bg-opacity-10 rounded-lg flex-shrink-0">
            <Smartphone size={20} className="text-brand-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <button
              onClick={() => onNavigate(device.deviceId)}
              className="text-sm font-medium text-brand-primary hover:text-blue-600 transition-colors flex items-center space-x-1 group"
            >
              <span className="truncate">{device.deviceName}</span>
              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-text-muted">
                {platformEmoji} {DeviceTransformation.formatPlatform(device.deviceType)}
              </span>
              <span className={`text-xs ${statusClassName}`}>
                {statusText}
              </span>
            </div>
            
            <p className="text-xs text-text-muted mt-1">
              Last seen: {formattedLastSeen}
            </p>
          </div>
        </div>
        
        {children && (
          <div className="flex items-center space-x-1 ml-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};