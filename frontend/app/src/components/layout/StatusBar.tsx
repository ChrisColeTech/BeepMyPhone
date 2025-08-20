import React, { useState, useEffect } from 'react';
import { 
  LuWifi, 
  LuWifiOff, 
  LuRotateCcw, 
  LuSmartphone, 
  LuMonitor,
  LuCircle
} from 'react-icons/lu';

interface StatusBarProps {
  connectionStatus?: 'connected' | 'connecting' | 'disconnected';
  connectedDevices?: number;
  serviceStatus?: 'running' | 'stopped' | 'error';
  version?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  connectionStatus = 'disconnected',
  connectedDevices = 0,
  serviceStatus = 'stopped',
  version = '1.0.0'
}) => {
  const [platform, setPlatform] = useState('WEB');

  useEffect(() => {
    // Detect platform
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Running in Electron
      window.electronAPI.getSystemInfo().then((info: { platform: string }) => {
        const platformMap: { [key: string]: string } = {
          'win32': 'WIN',
          'darwin': 'MAC', 
          'linux': 'LINUX'
        };
        setPlatform(platformMap[info.platform] || 'DESKTOP');
      }).catch(() => {
        setPlatform('DESKTOP');
      });
    } else {
      // Running in browser
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('win')) {
        setPlatform('WIN');
      } else if (userAgent.includes('mac')) {
        setPlatform('MAC');
      } else if (userAgent.includes('linux')) {
        setPlatform('LINUX');
      } else {
        setPlatform('WEB');
      }
    }
  }, []);
  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-status-success';
      case 'connecting': return 'text-status-warning';
      case 'disconnected': return 'text-status-error';
      default: return 'text-text-muted';
    }
  };

  const getConnectionIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <LuWifi size={12} />;
      case 'connecting':
        return <LuRotateCcw size={12} className="animate-spin" />;
      case 'disconnected':
      default:
        return <LuWifiOff size={12} />;
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-status-success';
      case 'error': return 'text-status-error';
      case 'stopped': return 'text-text-muted';
      default: return 'text-text-muted';
    }
  };

  return (
    <div className="desktop-status-bar" data-testid="status-bar">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section - Connection and device status */}
        <div className="flex items-center space-x-6">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`flex items-center ${getConnectionStatusColor(connectionStatus)}`}>
              {getConnectionIcon(connectionStatus)}
            </div>
            <span className="status-text text-sm">
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </span>
          </div>

          {/* Connected Devices */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-text-muted">
              <LuSmartphone size={14} />
            </div>
            <span className="status-text text-sm text-text-secondary">
              {connectedDevices} device{connectedDevices !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Service Status */}
          <div className="flex items-center space-x-2">
            <div className={`flex items-center ${getServiceStatusColor(serviceStatus)}`}>
              <LuCircle size={8} fill="currentColor" />
            </div>
            <span className="status-text text-sm text-text-secondary">
              Service {serviceStatus}
            </span>
          </div>
        </div>

        {/* Right section - Version and system info */}
        <div className="flex items-center space-x-4">
          {/* Version */}
          <div className="flex items-center space-x-2">
            <span className="status-text text-sm text-text-muted">
              v{version}
            </span>
          </div>

          {/* Platform indicator */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center text-text-muted">
              <LuMonitor size={12} />
            </div>
            <span className="status-text text-xs text-text-muted uppercase tracking-wide">
              {platform}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
