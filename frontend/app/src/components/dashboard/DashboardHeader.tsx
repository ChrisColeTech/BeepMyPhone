import React from 'react';
import { LuRefreshCw } from 'react-icons/lu';

interface DashboardHeaderProps {
  isConnected: boolean;
  autoRefresh: boolean;
  loading: boolean;
  onAutoRefreshChange: (enabled: boolean) => void;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isConnected,
  autoRefresh,
  loading,
  onAutoRefreshChange,
  onRefresh
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          Dashboard
        </h1>
        <div className="text-text-secondary">
          Monitor your Windows notifications and device connections
          {isConnected && autoRefresh && (
            <span className="inline-flex items-center ml-2 px-2 py-1 text-xs status-success rounded-full">
              <span className="w-1.5 h-1.5 bg-status-success rounded-full mr-1.5 animate-pulse block"></span>
              Live
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <label className="flex items-center space-x-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => onAutoRefreshChange(e.target.checked)}
            className="rounded border-border-default text-brand-primary focus:ring-brand-primary"
          />
          <span>Auto-refresh</span>
        </label>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 text-sm border border-border-default rounded-lg hover:bg-interactive-hover transition-colors disabled:opacity-50"
        >
          <LuRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};