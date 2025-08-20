import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDevices } from '../hooks/useDevices';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { useToast } from '../hooks/useToast';
import type { RegisteredDevice } from '../services/DeviceService';
import { EditDeviceModal } from '../components/devices/EditDeviceModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { 
  ArrowLeft, 
  Smartphone, 
  Pencil, 
  Trash2, 
  Send, 
  RefreshCw,
  Wifi,
  WifiOff,
  Bell,
  Clock,
  Activity,
  TrendingUp,
} from 'lucide-react';

export const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { devices, loading: devicesLoading, error: devicesError, deleteDevice, testNotification } = useDevices();
  const { notifications } = useNotificationHistory(1000);
  
  const [device, setDevice] = useState<RegisteredDevice | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Find the device by ID
  useEffect(() => {
    if (!devicesLoading && devices.length > 0 && id) {
      const foundDevice = devices.find(d => d.deviceId === id);
      if (foundDevice) {
        setDevice(foundDevice);
      } else {
        navigate('/devices'); // Redirect if device not found
      }
    }
  }, [devices, devicesLoading, id, navigate]);

  // Filter notifications for this device
  const deviceNotifications = notifications.filter(n => n.deviceId === id);
  const recentNotifications = deviceNotifications.slice(0, 10);

  // Calculate device statistics
  const stats = {
    totalNotifications: deviceNotifications.length,
    deliveredNotifications: deviceNotifications.filter(n => n.delivered).length,
    failedNotifications: deviceNotifications.filter(n => !n.delivered).length,
    todayNotifications: deviceNotifications.filter(n => {
      const today = new Date().toDateString();
      return new Date(n.timestamp).toDateString() === today;
    }).length,
    deliveryRate: deviceNotifications.length > 0 
      ? Math.round((deviceNotifications.filter(n => n.delivered).length / deviceNotifications.length) * 100)
      : 0
  };

  const handleTestNotification = async () => {
    if (!device) return;
    
    setTestingNotification(true);
    try {
      await testNotification(device.deviceId, `Test notification for ${device.deviceName}`);
      toast.success('Test Sent', 'Test notification sent successfully!', 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test notification';
      toast.error('Test Failed', errorMessage, 5000);
    } finally {
      setTestingNotification(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!device) return;
    
    setDeleting(true);
    try {
      await deleteDevice(device.deviceId);
      toast.success('Device Deleted', `${device.deviceName} has been removed`, 4000);
      navigate('/devices');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete device';
      toast.error('Delete Failed', errorMessage, 6000);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const getStatusBadge = (isConnected: boolean) => (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
      isConnected 
        ? 'badge-success'
        : 'badge-error'
    }`}>
      {isConnected ? (
        <>
          <Wifi size={14} className="mr-2" />
          Connected
        </>
      ) : (
        <>
          <WifiOff size={14} className="mr-2" />
          Offline
        </>
      )}
    </div>
  );

  if (devicesLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <RefreshCw className="animate-spin" size={20} />
              <span className="text-text-secondary">Loading device details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Device Not Found
              </h3>
              <p className="text-text-secondary mb-4">
                The requested device could not be found.
              </p>
              <button
                onClick={() => navigate('/devices')}
                className="px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Back to Devices
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/devices')}
              className="p-2 text-text-muted hover:bg-interactive-hover rounded-lg transition-colors"
              title="Back to devices"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                {device.deviceName}
              </h1>
              <p className="text-text-secondary">
                Device Details and Statistics
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleTestNotification}
              disabled={testingNotification || !device.isActive}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-border-default rounded-lg hover:bg-interactive-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingNotification ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
              <span>Test Notification</span>
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-border-default rounded-lg hover:bg-interactive-hover transition-colors"
            >
              <Pencil size={16} />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : (
                <Trash2 size={16} />
              )}
              <span>{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>

        {devicesError && (
          <div className="mb-6 p-4 error-container rounded-lg">
            <p className="error-text">{devicesError}</p>
          </div>
        )}

        {/* Device Info Card */}
        <div className="bg-background-card border border-border-default rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-brand-primary bg-opacity-10 rounded-lg">
                <Smartphone size={24} className="text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Device Name</p>
                <p className="text-lg font-medium text-text-primary">{device.deviceName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-background-elevated rounded-lg">
                <span className="text-lg">
                  {device.deviceType.toLowerCase() === 'ios' ? '📱' : '🤖'}
                </span>
              </div>
              <div>
                <p className="text-sm text-text-muted">Platform</p>
                <p className="text-lg font-medium text-text-primary">
                  {device.deviceType.toUpperCase()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-text-muted">Status</p>
                {getStatusBadge(device.isActive)}
              </div>
              <div className="ml-auto">
                <p className="text-sm text-text-muted">Last Seen</p>
                <p className="text-sm text-text-primary">
                  {new Date(device.lastSeen).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-background-card border border-border-default rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-1">Total Notifications</h3>
                <p className="text-2xl font-bold text-text-primary">{stats.totalNotifications}</p>
              </div>
              <Bell className="h-8 w-8 text-text-muted" />
            </div>
          </div>
          
          <div className="bg-background-card border border-border-default rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-1">Today</h3>
                <p className="text-2xl font-bold text-text-primary">{stats.todayNotifications}</p>
              </div>
              <Clock className="h-8 w-8 text-text-muted" />
            </div>
          </div>
          
          <div className="bg-background-card border border-border-default rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-1">Delivered</h3>
                <p className="text-2xl font-bold text-status-success">{stats.deliveredNotifications}</p>
                <p className="text-xs text-text-muted">
                  {stats.failedNotifications} failed
                </p>
              </div>
              <Activity className="h-8 w-8 icon-success" />
            </div>
          </div>
          
          <div className="bg-background-card border border-border-default rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-1">Success Rate</h3>
                <p className="text-2xl font-bold text-text-primary">{stats.deliveryRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-text-muted" />
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-background-card border border-border-default rounded-lg p-6">
          <h3 className="text-lg font-medium text-text-primary mb-4">Recent Notifications</h3>
          
          {recentNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h4 className="text-lg font-medium text-text-primary mb-2">
                No notifications yet
              </h4>
              <p className="text-text-secondary">
                This device hasn't received any notifications yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="flex items-start space-x-4 p-4 border border-border-muted rounded-lg hover:bg-interactive-hover transition-colors"
                >
                  <div className="w-10 h-10 bg-brand-primary bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-primary text-lg">📱</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-text-primary font-medium truncate">
                        {notification.appName}
                      </h4>
                      <div className="flex items-center space-x-3 ml-4">
                        {notification.delivered ? (
                          <span className="badge-success">
                            Delivered
                          </span>
                        ) : (
                          <span className="badge-error">
                            Failed
                          </span>
                        )}
                        <span className="text-text-muted text-sm">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-text-primary text-sm font-medium mt-1">
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-text-secondary text-sm mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {deviceNotifications.length > 10 && (
                <div className="text-center pt-4 border-t border-border-muted">
                  <button 
                    onClick={() => navigate(`/notifications?device=${device.deviceId}`)}
                    className="link-primary text-sm font-medium"
                  >
                    View all {deviceNotifications.length} notifications →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Device Modal */}
      <EditDeviceModal 
        isOpen={showEditModal} 
        device={device}
        onClose={() => setShowEditModal(false)} 
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Device"
        message={`Are you sure you want to delete "${device?.deviceName}"? This action cannot be undone and will remove all notification history for this device.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};

export default DeviceDetail;