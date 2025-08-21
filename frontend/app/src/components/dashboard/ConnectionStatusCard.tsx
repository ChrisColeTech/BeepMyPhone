import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LuActivity, LuClock, LuRefreshCw } from 'react-icons/lu';

interface ConnectionStatusCardProps {
  isConnected: boolean;
  connectionState?: string;
  connectionUptime: number;
  lastConnectedTime: Date | null;
  signalRError?: string;
  reconnecting: boolean;
  onReconnect: () => void;
}

export const ConnectionStatusCard: React.FC<ConnectionStatusCardProps> = ({
  isConnected,
  connectionState,
  connectionUptime,
  lastConnectedTime,
  signalRError,
  reconnecting,
  onReconnect
}) => {
  const navigate = useNavigate();

  const formatUptime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getConnectionStatus = () => {
    if (reconnecting) return { text: 'Reconnecting...', color: 'text-status-warning', bgColor: 'bg-status-warning' };
    if (isConnected) return { text: 'Connected', color: 'text-status-success', bgColor: 'bg-status-success' };
    if (signalRError) return { text: 'Error', color: 'text-status-error', bgColor: 'bg-status-error' };
    return { text: 'Disconnected', color: 'text-text-muted', bgColor: 'bg-text-muted' };
  };

  const status = getConnectionStatus();

  return (
    <div className="bg-background-card border border-border-default rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text-muted">Connection Status</h3>
            <LuActivity className={`h-5 w-5 ${isConnected ? 'text-status-success' : 'text-text-muted'}`} />
          </div>
          
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-3 h-3 rounded-full ${status.bgColor} ${isConnected ? 'animate-pulse' : ''}`}></div>
            <div>
              <span className={`text-lg font-semibold ${status.color}`}>
                {status.text}
              </span>
              {connectionState && (
                <p className="text-xs text-text-muted">{connectionState}</p>
              )}
            </div>
          </div>

          {isConnected && connectionUptime > 0 && (
            <div className="flex items-center space-x-2 mb-2">
              <LuClock size={14} className="text-text-muted" />
              <span className="text-sm text-text-secondary">
                Uptime: {formatUptime(connectionUptime)}
              </span>
            </div>
          )}

          {lastConnectedTime && (
            <div className="text-xs text-text-muted mb-3">
              {isConnected ? 'Connected' : 'Last connected'}: {lastConnectedTime.toLocaleString()}
            </div>
          )}

          {signalRError && (
            <div className="error-container rounded-lg p-3 mb-3">
              <p className="error-text text-sm">
                {signalRError}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex space-x-2">
        {(signalRError || !isConnected) && (
          <button 
            onClick={onReconnect}
            disabled={reconnecting}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-xs bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reconnecting ? (
              <>
                <LuRefreshCw className="animate-spin" size={14} />
                <span>Reconnecting...</span>
              </>
            ) : (
              <>
                <LuActivity size={14} />
                <span>Reconnect</span>
              </>
            )}
          </button>
        )}
        {isConnected && (
          <button 
            onClick={() => navigate('/settings')}
            className="flex-1 px-3 py-2 text-xs border border-border-default rounded-lg hover:bg-interactive-hover transition-colors text-text-primary"
          >
            Settings
          </button>
        )}
      </div>
    </div>
  );
};