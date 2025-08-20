import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DeviceCard } from './DeviceCard';
import { DeviceActions } from './DeviceActions';
import type { RegisteredDevice } from '../../services/DeviceService';

interface DeviceListProps {
  devices: RegisteredDevice[];
  onEdit: (device: RegisteredDevice) => void;
  onDelete: (id: string, name: string) => void;
  onTest: (id: string) => void;
  isDeleting: (deviceId: string) => boolean;
  isTesting: (deviceId: string) => boolean;
  layout?: 'table' | 'grid' | 'cards';
}

export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  onEdit,
  onDelete,
  onTest,
  isDeleting,
  isTesting,
  layout = 'cards',
}) => {
  const navigate = useNavigate();

  if (layout === 'cards') {
    return (
      <div className="space-y-3">
        {devices.map((device) => (
          <DeviceCard
            key={device.deviceId}
            device={device}
            onNavigate={(id) => navigate(`/devices/${id}`)}
          >
            <DeviceActions
              device={device}
              onEdit={() => onEdit(device)}
              onDelete={() => onDelete(device.deviceId, device.deviceName)}
              onTest={() => onTest(device.deviceId)}
              isTesting={isTesting(device.deviceId)}
              isDeleting={isDeleting(device.deviceId)}
              size="sm"
            />
          </DeviceCard>
        ))}
      </div>
    );
  }

  // Grid layout could be added here in the future
  return null;
}
