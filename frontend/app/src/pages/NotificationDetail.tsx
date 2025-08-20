import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { useToast } from '../hooks/useToast';
import type { NotificationHistoryItem } from '../services/NotificationHistoryService';
import { 
  LuArrowLeft, 
  LuBell, 
  LuTrash2,
  LuRefreshCw,
  LuSmartphone,
  LuClock,
  LuCheck,
  LuX,
  LuInfo,
  LuCalendar
} from 'react-icons/lu';

export const NotificationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { notifications, loading, error, deleteNotification } = useNotificationHistory(1000);
  
  const [notification, setNotification] = useState<NotificationHistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Find the notification by ID
  useEffect(() => {
    if (!loading && notifications.length > 0 && id) {
      const foundNotification = notifications.find(n => n.id === id);
      if (foundNotification) {
        setNotification(foundNotification);
      } else {
        navigate('/notifications'); // Redirect if notification not found
      }
    }
  }, [notifications, loading, id, navigate]);

  const handleDelete = async () => {
    if (!notification) return;
    
    if (!confirm(`Are you sure you want to delete this notification? This action cannot be undone.`)) {
      return;
    }
    
    setDeleting(true);
    try {
      await deleteNotification(notification.id);
      toast.success('Notification Deleted', 'The notification has been removed');
      navigate('/notifications');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      toast.error('Delete Failed', errorMessage);
      setDeleting(false);
    }
  };

  const getStatusIcon = (delivered: boolean, deliveryStatus?: string) => {
    if (delivered) {
      return <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center"><LuCheck className="text-white" size={14} /></div>;
    } else if (deliveryStatus === 'failed') {
      return <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"><LuX className="text-white" size={14} /></div>;
    } else if (deliveryStatus === 'pending') {
      return <LuClock className="text-yellow-600" size={24} />;
    } else {
      return <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"><LuX className="text-white" size={14} /></div>;
    }
  };

  const getStatusText = (delivered: boolean, deliveryStatus?: string) => {
    if (delivered) return 'Delivered Successfully';
    if (deliveryStatus === 'failed') return 'Delivery Failed';
    if (deliveryStatus === 'pending') return 'Delivery Pending';
    return 'Delivery Failed';
  };

  const getStatusColor = (delivered: boolean, deliveryStatus?: string) => {
    if (delivered) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    if (deliveryStatus === 'failed') return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    if (deliveryStatus === 'pending') return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <LuRefreshCw className="animate-spin" size={20} />
              <span className="text-text-secondary">Loading notification details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Notification Not Found
              </h3>
              <p className="text-text-secondary mb-4">
                The requested notification could not be found.
              </p>
              <button
                onClick={() => navigate('/notifications')}
                className="px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Back to Notifications
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
              onClick={() => navigate('/notifications')}
              className="p-2 text-text-muted hover:bg-interactive-hover rounded-lg transition-colors"
              title="Back to notifications"
            >
              <LuArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                Notification Details
              </h1>
              <p className="text-text-secondary">
                From {notification.appName}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <LuRefreshCw className="animate-spin" size={16} />
              ) : (
                <LuTrash2 size={16} />
              )}
              <span>{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notification Content Card */}
            <div className="bg-background-card border border-border-default rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-brand-primary bg-opacity-10 rounded-lg flex-shrink-0">
                  <LuBell size={24} className="text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-text-primary mb-2">
                    {notification.title}
                  </h2>
                  <p className="text-text-secondary text-sm mb-4">
                    From <span className="font-medium text-text-primary">{notification.appName}</span>
                  </p>
                  {notification.message && (
                    <div className="bg-background-elevated border border-border-default rounded-lg p-4">
                      <h3 className="text-sm font-medium text-text-primary mb-2">Message Content</h3>
                      <p className="text-text-primary whitespace-pre-wrap break-words">
                        {notification.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Status Card */}
            <div className={`border rounded-lg p-6 ${getStatusColor(notification.delivered, notification.deliveryStatus)}`}>
              <div className="flex items-center space-x-4">
                {getStatusIcon(notification.delivered, notification.deliveryStatus)}
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {getStatusText(notification.delivered, notification.deliveryStatus)}
                  </h3>
                  <p className="text-sm opacity-90">
                    {notification.delivered 
                      ? 'This notification was successfully delivered to your device.'
                      : notification.failureReason || 'The notification could not be delivered to your device.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Failure Details */}
            {!notification.delivered && notification.failureReason && (
              <div className="bg-background-card border border-border-default rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <LuInfo className="text-red-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">Failure Details</h3>
                    <p className="text-text-secondary">
                      {notification.failureReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Device Information */}
            {notification.deviceName && (
              <div className="bg-background-card border border-border-default rounded-lg p-6">
                <h3 className="text-lg font-medium text-text-primary mb-4">Target Device</h3>
                <div className="flex items-center space-x-3">
                  <LuSmartphone className="text-brand-primary" size={20} />
                  <div>
                    <p className="font-medium text-text-primary">{notification.deviceName}</p>
                    {notification.deviceId && (
                      <button
                        onClick={() => navigate(`/devices/${notification.deviceId}`)}
                        className="text-sm text-brand-primary hover:text-blue-600 transition-colors"
                      >
                        View device details →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Timing Information */}
            <div className="bg-background-card border border-border-default rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Timing</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <LuCalendar className="text-text-muted mt-1 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-sm text-text-muted">Received</p>
                    <p className="font-medium text-text-primary">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <LuClock className="text-text-muted mt-1 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-sm text-text-muted">Time</p>
                    <p className="font-medium text-text-primary">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border-muted">
                  <p className="text-xs text-text-muted">
                    Relative: {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-background-card border border-border-default rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Technical Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Notification ID</span>
                  <code className="text-xs bg-background-elevated px-2 py-1 rounded border border-border-default font-mono">
                    {notification.id.length > 12 ? `${notification.id.substring(0, 12)}...` : notification.id}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Delivery Status</span>
                  <span className="font-medium text-text-primary">
                    {notification.deliveryStatus || (notification.delivered ? 'delivered' : 'failed')}
                  </span>
                </div>
                {notification.deviceId && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Device ID</span>
                    <code className="text-xs bg-background-elevated px-2 py-1 rounded border border-border-default font-mono">
                      {notification.deviceId.length > 8 ? `${notification.deviceId.substring(0, 8)}...` : notification.deviceId}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;