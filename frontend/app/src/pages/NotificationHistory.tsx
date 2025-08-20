import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { LuSearch, LuTrash2, LuRefreshCw, LuFilter, LuBell, LuX, LuCalendar, LuSmartphone, LuChevronLeft, LuChevronRight, LuExternalLink } from 'react-icons/lu';

export const NotificationHistory: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    stats,
    loading,
    error,
    refreshNotifications,
    refreshStats,
    searchNotifications,
    deleteNotification,
    clearAllNotifications
  } = useNotificationHistory(100);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Calculate pagination
  const totalPages = Math.ceil(notifications.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedNotifications = notifications.slice(startIndex, endIndex);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    if (!searchQuery.trim()) {
      refreshNotifications();
      return;
    }

    setSearchLoading(true);
    try {
      await searchNotifications(searchQuery.trim());
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1); // Reset to first page
    refreshNotifications();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the notification "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteNotification(id);
    } catch {
      alert('Failed to delete notification');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all notification history? This action cannot be undone.')) {
      return;
    }

    setClearingAll(true);
    try {
      await clearAllNotifications();
    } catch {
      alert('Failed to clear notifications');
    } finally {
      setClearingAll(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refreshNotifications(),
      refreshStats()
    ]);
  };

  const getDeliveryStatusBadge = (notification: { delivered: boolean }) => {
    if (notification.delivered) {
      return (
        <span className="badge-success">
          Delivered
        </span>
      );
    } else {
      return (
        <span className="badge-error">
          Failed
        </span>
      );
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <LuRefreshCw className="animate-spin" size={20} />
              <span className="text-text-secondary">Loading notification history...</span>
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
          <div>
            <h1 className="text-2xl font-semibold text-text-primary mb-2">
              Notification History
            </h1>
            <p className="text-text-secondary">
              View and manage all forwarded notifications
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm border border-border-default rounded-lg transition-colors ${
                showFilters ? 'bg-brand-primary text-white' : 'hover:bg-interactive-hover'
              }`}
            >
              <LuFilter size={16} />
              <span>Filters</span>
            </button>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-border-default rounded-lg hover:bg-interactive-hover transition-colors disabled:opacity-50"
            >
              <LuRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
              <span>Refresh</span>
            </button>
            {notifications.length > 0 && (
              <button 
                onClick={handleClearAll}
                disabled={clearingAll}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <LuTrash2 size={16} />
                <span>{clearingAll ? 'Clearing...' : 'Clear All'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 error-container rounded-lg">
            <p className="error-text">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications by app, title, or message..."
                className="w-full pl-10 pr-10 py-2 border border-border-default rounded-lg bg-background-app text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <LuX size={16} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {searchLoading ? (
                <LuRefreshCw className="animate-spin" size={16} />
              ) : (
                <LuSearch size={16} />
              )}
            </button>
          </form>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-background-card border border-border-default rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-text-muted mb-1">Total</h3>
                  <p className="text-2xl font-bold text-text-primary">{stats.totalNotifications}</p>
                </div>
                <LuBell className="h-8 w-8 text-text-muted" />
              </div>
            </div>
            <div className="bg-background-card border border-border-default rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-text-muted mb-1">Delivered</h3>
                  <p className="text-2xl font-bold text-status-success">{stats.deliveredNotifications}</p>
                </div>
                <LuSmartphone className="h-8 w-8 icon-success" />
              </div>
            </div>
            <div className="bg-background-card border border-border-default rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-text-muted mb-1">Failed</h3>
                  <p className="text-2xl font-bold text-status-error">{stats.failedNotifications}</p>
                </div>
                <LuX className="h-8 w-8 icon-error" />
              </div>
            </div>
            <div className="bg-background-card border border-border-default rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-text-muted mb-1">Today</h3>
                  <p className="text-2xl font-bold text-text-primary">{stats.notificationsToday}</p>
                </div>
                <LuCalendar className="h-8 w-8 text-text-muted" />
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-background-card border border-border-default rounded-lg p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {searchQuery ? 'No matching notifications' : 'No notifications yet'}
              </h3>
              <p className="text-text-secondary mb-4">
                {searchQuery 
                  ? 'Try adjusting your search criteria'
                  : 'Generate some Windows notifications to see them here!'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-background-card border border-border-default rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-elevated">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      App & Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {paginatedNotifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-interactive-hover">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-text-primary">
                            {notification.appName}
                          </div>
                          <button
                            onClick={() => navigate(`/notifications/${notification.id}`)}
                            className="text-sm link-primary truncate max-w-xs flex items-center space-x-1"
                          >
                            <span>{notification.title}</span>
                            <LuExternalLink size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-text-secondary max-w-md truncate">
                          {notification.message || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-text-secondary">
                          {notification.deviceName || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getDeliveryStatusBadge(notification)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {new Date(notification.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(notification.id, notification.title)}
                          disabled={deletingId === notification.id}
                          className="btn-danger-outline disabled:cursor-not-allowed"
                          title="Delete notification"
                        >
                          {deletingId === notification.id ? (
                            <LuRefreshCw className="animate-spin" size={16} />
                          ) : (
                            <LuTrash2 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {notifications.length > pageSize && (
              <div className="px-6 py-4 border-t border-border-default">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-text-secondary">
                      Showing {startIndex + 1} to {Math.min(endIndex, notifications.length)} of {notifications.length} notifications
                    </div>
                    <div className="flex items-center space-x-2">
                      <label htmlFor="pageSize" className="text-sm text-text-secondary">
                        Per page:
                      </label>
                      <select
                        id="pageSize"
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(parseInt(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 text-sm border border-border-default rounded bg-background-app text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-border-default rounded-lg hover:bg-interactive-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Previous page"
                    >
                      <LuChevronLeft size={16} />
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? 'bg-brand-primary text-white'
                                : 'hover:bg-interactive-hover text-text-primary'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-border-default rounded-lg hover:bg-interactive-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Next page"
                    >
                      <LuChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationHistory;