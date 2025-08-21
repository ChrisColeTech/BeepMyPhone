import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LuSmartphone, LuExternalLink } from 'react-icons/lu';
import type { RegisteredDevice } from '../../services/DeviceService';

interface DevicesOverviewCardProps {
  devices: RegisteredDevice[];
  loading: boolean;
}

export const DevicesOverviewCard: React.FC<DevicesOverviewCardProps> = ({
  devices,
  loading
}) => {
  const navigate = useNavigate();
  const connectedDevicesCount = devices.filter(d => d.isConnected).length;

  return (
    <div 
      className="bg-background-card border border-border-default rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" 
      onClick={() => navigate('/devices')}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-1">Connected Devices</h3>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-text-primary">
              {loading ? '...' : connectedDevicesCount}
            </p>
            <span className="text-text-muted">/</span>
            <p className="text-lg text-text-secondary">
              {devices.length}
            </p>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            <div className={`w-2 h-2 rounded-full ${connectedDevicesCount > 0 ? 'bg-green-600' : 'bg-gray-400'}`}></div>
            <p className="text-xs text-text-muted">
              {connectedDevicesCount > 0 ? 'Active' : 'No devices'} • Total: {devices.length}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <LuSmartphone className="h-8 w-8 text-text-muted" />
          <LuExternalLink size={12} className="text-text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
      {devices.length > 0 && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span>📱</span>
              <span className="text-text-secondary">
                {devices.filter(d => d.platform === 'ios').length} iOS
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🤖</span>
              <span className="text-text-secondary">
                {devices.filter(d => d.platform === 'android').length} Android
              </span>
            </div>
          </div>
          <span className="text-brand-primary font-medium">View →</span>
        </div>
      )}
    </div>
  );
};