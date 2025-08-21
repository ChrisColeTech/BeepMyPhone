import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { useDevices } from '../hooks/useDevices';
import { useSettings } from '../hooks/useSettings';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { ConnectionStatusCard } from '../components/dashboard/ConnectionStatusCard';
import { DevicesOverviewCard } from '../components/dashboard/DevicesOverviewCard';
import { NotificationStatsCard } from '../components/dashboard/NotificationStatsCard';

export const Dashboard: React.FC = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  // Data hooks
  const { 
    isConnected, 
    connectionState, 
    error: signalRError,
    reconnect 
  } = useNotifications();

  const {
    notifications,
    stats,
    loading: historyLoading,
    error: historyError,
    refreshNotifications,
    refreshStats
  } = useNotificationHistory(10);

  const {
    devices,
    loading: devicesLoading,
    error: devicesError
  } = useDevices();

  const {
    error: settingsError
  } = useSettings();

  // Connection status hook
  const { connectionUptime, lastConnectedTime } = useConnectionStatus({ isConnected });

  const hasErrors = signalRError || historyError || devicesError || settingsError;

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refreshNotifications(),
      refreshStats()
    ]);
  }, [refreshNotifications, refreshStats]);

  // Auto refresh when connected and enabled
  useEffect(() => {
    if (!autoRefresh || !isConnected) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, isConnected, handleRefresh]);

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      await reconnect();
    } catch (err) {
      console.error('Reconnection failed:', err);
    } finally {
      setReconnecting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        <DashboardHeader
          isConnected={isConnected}
          autoRefresh={autoRefresh}
          loading={historyLoading}
          onAutoRefreshChange={setAutoRefresh}
          onRefresh={handleRefresh}
        />

        {/* Error Messages */}
        {hasErrors && (
          <div className="mb-6 p-4 error-container rounded-lg">
            {signalRError && <p className="error-text">SignalR: {signalRError}</p>}
            {historyError && <p className="error-text">History: {historyError}</p>}
            {devicesError && <p className="error-text">Devices: {devicesError}</p>}
            {settingsError && <p className="error-text">Settings: {settingsError}</p>}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <ConnectionStatusCard
            isConnected={isConnected}
            connectionState={connectionState}
            connectionUptime={connectionUptime}
            lastConnectedTime={lastConnectedTime}
            signalRError={signalRError}
            reconnecting={reconnecting}
            onReconnect={handleReconnect}
          />

          <DevicesOverviewCard
            devices={devices}
            loading={devicesLoading}
          />

          <NotificationStatsCard
            stats={stats}
            loading={historyLoading}
            latestNotificationTime={notifications[0]?.timestamp}
          />

          {/* Success Rate Card - keeping this simple for now */}
          <div className="bg-background-card border border-border-default rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-1">Success Rate</h3>
                <p className="text-2xl font-bold text-status-success">
                  {historyLoading ? '...' : (
                    stats && stats.totalNotifications > 0 
                      ? Math.round((stats.deliveredNotifications / stats.totalNotifications) * 100)
                      : 0
                  )}%
                </p>
                <p className="text-xs text-text-muted">
                  {stats?.deliveredNotifications || 0} delivered • {(stats?.totalNotifications || 0) - (stats?.deliveredNotifications || 0)} failed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for more components */}
        <div className="bg-background-card border border-border-default rounded-lg p-6">
          <h3 className="text-lg font-medium text-text-primary mb-4">
            Dashboard Refactored ✅
          </h3>
          <p className="text-text-secondary">
            The massive Dashboard component has been broken down into focused, single-responsibility components:
          </p>
          <ul className="mt-2 text-sm text-text-muted space-y-1">
            <li>• DashboardHeader - handles header UI and refresh controls</li>
            <li>• ConnectionStatusCard - manages connection display and reconnection</li>
            <li>• DevicesOverviewCard - shows device summary and navigation</li>
            <li>• NotificationStatsCard - displays notification statistics</li>
            <li>• useConnectionStatus - custom hook for connection state logic</li>
          </ul>
        </div>
      </div>
    </div>
  );
};