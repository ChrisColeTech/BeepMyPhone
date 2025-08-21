import React, { useState, useEffect } from 'react';
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
    settings,
    loading: settingsLoading,
    error: settingsError
  } = useSettings();

  const connectedDevicesCount = devices.filter(d => d.isConnected).length;
  const hasErrors = signalRError || historyError || devicesError || settingsError;

  // Track connection status changes
  useEffect(() => {
    if (isConnected && !lastConnectedTime) {
      setLastConnectedTime(new Date());
      setConnectionUptime(0);
    } else if (!isConnected && lastConnectedTime) {
      setLastConnectedTime(null);
      setConnectionUptime(0);
    }
  }, [isConnected, lastConnectedTime]);

  // Update connection uptime
  useEffect(() => {
    if (!isConnected || !lastConnectedTime) return;
    
    const interval = setInterval(() => {
      setConnectionUptime(Date.now() - lastConnectedTime.getTime());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isConnected, lastConnectedTime]);

  // Track new notifications for visual indicators
  useEffect(() => {
    if (notifications.length > 0) {
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      const freshNotifications = notifications
        .filter(n => new Date(n.timestamp).getTime() > fiveMinutesAgo)
        .map(n => n.id);
      setNewNotificationIds(new Set(freshNotifications));
    }
  }, [notifications]);

  // Auto refresh when connected and enabled
  useEffect(() => {
    if (!autoRefresh || !isConnected) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, isConnected]);

  const handleRefresh = async () => {
    await Promise.all([
      refreshNotifications(),
      refreshStats()
    ]);
  };

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
    if (reconnecting) return { text: 'Reconnecting...', color: 'text-yellow-600', bgColor: 'bg-yellow-600' };
    if (isConnected) return { text: 'Connected', color: 'text-green-600', bgColor: 'bg-green-600' };
    if (signalRError) return { text: 'Error', color: 'text-red-600', bgColor: 'bg-red-600' };
    return { text: 'Disconnected', color: 'text-gray-600', bgColor: 'bg-gray-600' };
  };

  const getNotificationIcon = (notification: any) => {
    if (notification.delivered) {
      return <LuCheck className="text-green-600" size={16} />;
    } else if (notification.deliveryStatus === 'pending') {
      return <LuClock className="text-yellow-600" size={16} />;
    } else {
      return <LuX className="text-red-600" size={16} />;
    }
  };

  const isNotificationNew = (notificationId: string) => {
    return newNotificationIds.has(notificationId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary mb-2">
              Dashboard
            </h1>
            <p className="text-text-secondary">
              Monitor your Windows notifications and device connections
              {isConnected && autoRefresh && (
                <span className="inline-flex items-center ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5 animate-pulse"></div>
                  Live
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-border-default text-brand-primary focus:ring-brand-primary"
              />
              <span>Auto-refresh</span>
            </label>
            <button
              onClick={handleRefresh}
              disabled={historyLoading}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-border-default rounded-lg hover:bg-interactive-hover transition-colors disabled:opacity-50"
            >
              <LuRefreshCw className={historyLoading ? 'animate-spin' : ''} size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {hasErrors && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            {signalRError && <p className="text-red-800 dark:text-red-200">SignalR: {signalRError}</p>}
            {historyError && <p className="text-red-800 dark:text-red-200">History: {historyError}</p>}
            {devicesError && <p className="text-red-800 dark:text-red-200">Devices: {devicesError}</p>}
            {settingsError && <p className="text-red-800 dark:text-red-200">Settings: {settingsError}</p>}
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Enhanced Connection Status */}
          <div className="bg-background-card border border-border-default rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-text-muted">Connection Status</h3>
                  <LuActivity className={`h-5 w-5 ${isConnected ? 'text-green-600' : 'text-text-muted'}`} />
                </div>
                
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${getConnectionStatus().bgColor} ${isConnected ? 'animate-pulse' : ''}`}></div>
                  <div>
                    <span className={`text-lg font-semibold ${getConnectionStatus().color}`}>
                      {getConnectionStatus().text}
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
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                    <p className="text-red-800 dark:text-red-200 text-sm">
                      {signalRError}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {(signalRError || !isConnected) && (
                <button 
                  onClick={handleReconnect}
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

          {/* Enhanced Connected Devices */}
          <div className="bg-background-card border border-border-default rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/devices')}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-1">Connected Devices</h3>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-text-primary">
                    {devicesLoading ? '...' : connectedDevicesCount}
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
            
            {/* Device Platform Breakdown */}
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

          {/* Enhanced Today's Notifications */}
          <div className="bg-background-card border border-border-default rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/notifications')}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-1">Today's Activity</h3>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-text-primary">
                    {historyLoading ? '...' : stats?.notificationsToday || 0}
                  </p>
                  {stats && stats.notificationsToday > 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-4 bg-brand-primary rounded-full animate-pulse"></div>
                      <span className="text-xs text-brand-primary font-medium">Active</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-text-muted">notifications sent</p>
                  {stats && stats.notificationsToday > 0 && (
                    <span className="text-xs text-green-600">
                      +{Math.round(((stats.notificationsToday || 0) / Math.max(stats.totalNotifications || 1, 1)) * 100)}% of total
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <LuBell className={`h-8 w-8 ${stats && stats.notificationsToday > 0 ? 'text-brand-primary' : 'text-text-muted'}`} />
                <LuExternalLink size={12} className="text-text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            {/* Recent Activity Indicator */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  Last: {new Date(notifications[0].timestamp).toLocaleTimeString()}
                </span>
                <span className="text-brand-primary font-medium">View All →</span>
              </div>
            )}
          </div>

          {/* Enhanced Delivery Rate */}
          <div className="bg-background-card border border-border-default rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/notifications')}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-1">Success Rate</h3>
                <div className="flex items-center space-x-2">
                  <p className={`text-2xl font-bold ${
                    historyLoading ? 'text-text-primary' : 
                    stats && stats.totalNotifications > 0 
                      ? ((stats.deliveredNotifications / stats.totalNotifications) * 100) >= 90
                        ? 'text-green-600'
                        : ((stats.deliveredNotifications / stats.totalNotifications) * 100) >= 70
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      : 'text-text-primary'
                  }`}>
                    {historyLoading ? '...' : (
                      stats && stats.totalNotifications > 0 
                        ? Math.round((stats.deliveredNotifications / stats.totalNotifications) * 100)
                        : 0
                    )}%
                  </p>
                  {stats && stats.totalNotifications > 0 && (
                    <div className="flex items-center">
                      {((stats.deliveredNotifications / stats.totalNotifications) * 100) >= 90 ? (
                        <LuCheck size={16} className="text-green-600" />
                      ) : ((stats.deliveredNotifications / stats.totalNotifications) * 100) >= 70 ? (
                        <LuClock size={16} className="text-yellow-600" />
                      ) : (
                        <LuX size={16} className="text-red-600" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-text-muted">
                    {stats?.deliveredNotifications || 0} delivered
                  </p>
                  <span className="text-text-muted">•</span>
                  <p className="text-xs text-red-600">
                    {(stats?.totalNotifications || 0) - (stats?.deliveredNotifications || 0)} failed
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <LuTrendingUp className={`h-8 w-8 ${
                  stats && stats.totalNotifications > 0 
                    ? ((stats.deliveredNotifications / stats.totalNotifications) * 100) >= 90
                      ? 'text-green-600'
                      : 'text-text-muted'
                    : 'text-text-muted'
                }`} />
                <LuExternalLink size={12} className="text-text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            {/* Success Rate Visual Bar */}
            {stats && stats.totalNotifications > 0 && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      ((stats.deliveredNotifications / stats.totalNotifications) * 100) >= 90
                        ? 'bg-green-600'
                        : ((stats.deliveredNotifications / stats.totalNotifications) * 100) >= 70
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.round((stats.deliveredNotifications / stats.totalNotifications) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Total: {stats.totalNotifications}</span>
                  <span className="text-brand-primary font-medium">View Details →</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* System Performance */}
          <div className="bg-background-card border border-border-default rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-1 flex items-center space-x-2">
                  <LuActivity size={16} />
                  <span>System Health</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Connection</span>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {isConnected ? 'Healthy' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Devices</span>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${connectedDevicesCount > 0 ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
                      <span className={`text-xs font-medium ${connectedDevicesCount > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {connectedDevicesCount > 0 ? 'Active' : 'Idle'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Forwarding</span>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${settings?.notificationSettings?.enabled ? 'bg-green-600' : 'bg-gray-600'}`}></div>
                      <span className={`text-xs font-medium ${settings?.notificationSettings?.enabled ? 'text-green-600' : 'text-gray-600'}`}>
                        {settings?.notificationSettings?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isConnected && connectionUptime > 0 && (
              <div className="pt-4 border-t border-border-muted">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Uptime</span>
                  <span className="font-medium text-green-600">{formatUptime(connectionUptime)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-background-card border border-border-default rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-muted mb-4 flex items-center space-x-2">
              <LuClock size={16} />
              <span>Recent Activity</span>
            </h3>
            
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 4).map((notification, index) => {
                  const minutesAgo = Math.floor((Date.now() - new Date(notification.timestamp).getTime()) / (1000 * 60));
                  return (
                    <div key={notification.id} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${notification.delivered ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate">
                          {notification.appName}
                        </p>
                        <p className="text-xs text-text-muted">
                          {minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`} • {notification.delivered ? 'Delivered' : 'Failed'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <button 
                  onClick={() => navigate('/notifications')}
                  className="w-full text-center py-2 text-xs text-brand-primary hover:text-blue-600 font-medium"
                >
                  View all activity →
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-text-secondary mb-2">No recent activity</p>
                <p className="text-xs text-text-muted">Activity will appear here as notifications are processed</p>
              </div>
            )}
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-background-card border border-border-default rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-muted mb-4 flex items-center space-x-2">
              <LuTrendingUp size={16} />
              <span>Quick Overview</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Total Notifications</span>
                <span className="font-semibold text-text-primary">{stats?.totalNotifications || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Success Rate</span>
                <span className={`font-semibold ${
                  stats && stats.totalNotifications > 0 
                    ? ((stats.deliveredNotifications / stats.totalNotifications) * 100) >= 90
                      ? 'text-green-600'
                      : ((stats.deliveredNotifications / stats.totalNotifications) * 100) >= 70
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    : 'text-text-primary'
                }`}>
                  {stats && stats.totalNotifications > 0 
                    ? Math.round((stats.deliveredNotifications / stats.totalNotifications) * 100)
                    : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Active Devices</span>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-text-primary">{connectedDevicesCount}</span>
                  <span className="text-text-muted">/{devices.length}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">App Filters</span>
                <span className="font-semibold text-text-primary">
                  {settings?.notificationSettings?.appFilters?.length || 0}
                </span>
              </div>

              <div className="pt-3 border-t border-border-muted">
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full px-3 py-2 text-sm border border-border-default rounded-lg hover:bg-interactive-hover transition-colors text-text-primary"
                >
                  System Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Forwarding Rules */}
        <div className="bg-background-card border border-border-default rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-text-primary flex items-center space-x-2">
                <LuFilter size={20} className="text-brand-primary" />
                <span>Active Forwarding Rules</span>
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Current notification forwarding configuration
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate('/settings')}
                className="flex items-center space-x-2 px-3 py-2 text-sm border border-border-default rounded-lg hover:bg-interactive-hover transition-colors"
              >
                <LuSettings size={16} />
                <span>Configure</span>
              </button>
            </div>
          </div>

          {settingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <LuRefreshCw className="animate-spin" size={20} />
                <span className="text-text-secondary">Loading forwarding rules...</span>
              </div>
            </div>
          ) : !settings ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚙️</div>
              <h4 className="text-lg font-medium text-text-primary mb-2">
                Settings Not Available
              </h4>
              <p className="text-text-secondary mb-4">
                Unable to load forwarding configuration.
              </p>
              <button 
                onClick={() => navigate('/settings')}
                className="px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Configure Settings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notification Forwarding Status */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background-elevated border border-border-default rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${settings.notificationSettings?.enabled ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-900/20'} rounded-lg flex items-center justify-center`}>
                      {settings.notificationSettings?.enabled ? (
                        <LuToggleRight size={20} className="text-green-600" />
                      ) : (
                        <LuToggleLeft size={20} className="text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">
                        Global Forwarding
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {settings.notificationSettings?.enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="text-brand-primary hover:text-blue-600 text-sm font-medium"
                  >
                    {settings.notificationSettings?.enabled ? 'Configure' : 'Enable'}
                  </button>
                </div>

                {settings.notificationSettings?.enabled && (
                  <>
                    <div className="p-4 bg-background-elevated border border-border-default rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-text-primary">App Filters</h4>
                        <span className="text-xs text-text-muted">
                          {settings.notificationSettings.appFilters?.length || 0} rules
                        </span>
                      </div>
                      {settings.notificationSettings.appFilters && settings.notificationSettings.appFilters.length > 0 ? (
                        <div className="space-y-2">
                          {settings.notificationSettings.appFilters.slice(0, 3).map((filter, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                filter.action === 'allow' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                              }`}>
                                {filter.action === 'allow' ? '✓' : '✗'}
                              </span>
                              <span className="text-text-primary truncate">{filter.appName}</span>
                            </div>
                          ))}
                          {settings.notificationSettings.appFilters.length > 3 && (
                            <p className="text-xs text-text-muted text-center pt-2">
                              +{settings.notificationSettings.appFilters.length - 3} more rules
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-text-secondary mb-2">No app filters configured</p>
                          <button 
                            onClick={() => navigate('/settings')}
                            className="text-brand-primary hover:text-blue-600 text-sm font-medium"
                          >
                            Add filters
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Target Devices */}
              <div className="space-y-4">
                <div className="p-4 bg-background-elevated border border-border-default rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-text-primary flex items-center space-x-2">
                      <LuUsers size={16} />
                      <span>Target Devices</span>
                    </h4>
                    <span className="text-xs text-text-muted">
                      {connectedDevicesCount} of {devices.length} online
                    </span>
                  </div>
                  {devices.length > 0 ? (
                    <div className="space-y-2">
                      {devices.slice(0, 4).map((device) => (
                        <div key={device.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${device.isConnected ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">{device.name}</p>
                              <p className="text-xs text-text-secondary">{device.platform.toUpperCase()}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/devices/${device.id}`)}
                            className="text-brand-primary hover:text-blue-600"
                          >
                            <LuExternalLink size={14} />
                          </button>
                        </div>
                      ))}
                      {devices.length > 4 && (
                        <button 
                          onClick={() => navigate('/devices')}
                          className="w-full text-center py-2 text-sm text-brand-primary hover:text-blue-600 font-medium"
                        >
                          View all {devices.length} devices →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-text-secondary mb-2">No devices connected</p>
                      <button 
                        onClick={() => navigate('/devices')}
                        className="flex items-center justify-center space-x-1 text-brand-primary hover:text-blue-600 text-sm font-medium mx-auto"
                      >
                        <LuPlus size={14} />
                        <span>Add device</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-background-elevated border border-border-default rounded-lg">
                  <h4 className="font-medium text-text-primary mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => navigate('/settings')}
                      className="p-3 text-left border border-border-default rounded-lg hover:bg-interactive-hover transition-colors"
                    >
                      <LuSettings size={16} className="text-brand-primary mb-1" />
                      <p className="text-sm font-medium text-text-primary">Settings</p>
                      <p className="text-xs text-text-secondary">Configure rules</p>
                    </button>
                    <button 
                      onClick={() => navigate('/devices')}
                      className="p-3 text-left border border-border-default rounded-lg hover:bg-interactive-hover transition-colors"
                    >
                      <LuSmartphone size={16} className="text-brand-primary mb-1" />
                      <p className="text-sm font-medium text-text-primary">Devices</p>
                      <p className="text-xs text-text-secondary">Manage devices</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-background-card border border-border-default rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-text-primary">Recent Notifications</h3>
            {isConnected && (
              <div className="flex items-center space-x-2 text-xs text-text-muted">
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></div>
                <span>{autoRefresh ? 'Live updates' : 'Manual refresh'}</span>
              </div>
            )}
          </div>
          
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <LuRefreshCw className="animate-spin" size={20} />
                <span className="text-text-secondary">Loading notifications...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No notifications yet
              </h3>
              <p className="text-text-secondary mb-4">
                Generate some Windows notifications to see them here!
              </p>
              <p className="text-sm text-text-muted italic">
                Try: Windows + A to open Action Center, or receive emails/messages
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`group relative flex items-start space-x-4 p-4 border rounded-lg hover:bg-interactive-hover transition-all cursor-pointer ${
                    isNotificationNew(notification.id) 
                      ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/10' 
                      : 'border-border-muted'
                  }`}
                  onClick={() => navigate(`/notifications/${notification.id}`)}
                >
                  {isNotificationNew(notification.id) && (
                    <div className="absolute -left-1 top-4 w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                  )}
                  
                  <div className="w-10 h-10 bg-brand-primary bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <LuBell size={18} className="text-brand-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-text-primary font-medium truncate">
                          {notification.appName}
                        </h4>
                        {isNotificationNew(notification.id) && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-brand-primary text-white rounded-full animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <div className="flex items-center space-x-1">
                          {getNotificationIcon(notification)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            notification.delivered 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : notification.deliveryStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {notification.delivered ? 'Delivered' : notification.deliveryStatus === 'pending' ? 'Pending' : 'Failed'}
                          </span>
                        </div>
                        <span className="text-text-muted text-sm">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </span>
                        <LuExternalLink size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/notifications/${notification.id}`);
                      }}
                      className="text-text-primary text-sm font-medium mt-1 text-left hover:text-brand-primary transition-colors line-clamp-1"
                    >
                      {notification.title}
                    </button>
                    {notification.message && (
                      <p className="text-text-secondary text-sm mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {notification.deviceName && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (notification.deviceId) {
                              navigate(`/devices/${notification.deviceId}`);
                            }
                          }}
                          className="text-text-muted text-xs hover:text-brand-primary transition-colors flex items-center space-x-1"
                        >
                          <LuSmartphone size={12} />
                          <span>→ {notification.deviceName}</span>
                          <LuExternalLink size={10} />
                        </button>
                      )}
                      <span className="text-text-muted text-xs">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-4 border-t border-border-muted">
                <button 
                  onClick={() => navigate('/notifications')}
                  className="flex items-center justify-center space-x-2 text-brand-primary hover:text-blue-600 text-sm font-medium w-full py-2 rounded-lg hover:bg-interactive-hover transition-colors"
                >
                  <span>View all notifications</span>
                  <LuExternalLink size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};