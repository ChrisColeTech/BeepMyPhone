import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBell, LuExternalLink } from 'react-icons/lu';
import type { NotificationStats } from '../../services/NotificationHistoryService';

interface NotificationStatsCardProps {
  stats: NotificationStats | null;
  loading: boolean;
  latestNotificationTime?: string;
}

export const NotificationStatsCard: React.FC<NotificationStatsCardProps> = ({
  stats,
  loading,
  latestNotificationTime
}) => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-background-card border border-border-default rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" 
      onClick={() => navigate('/notifications')}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-1">Today's Activity</h3>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-text-primary">
              {loading ? '...' : stats?.notificationsToday || 0}
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
      
      {latestNotificationTime && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">
            Last: {new Date(latestNotificationTime).toLocaleTimeString()}
          </span>
          <span className="text-brand-primary font-medium">View All →</span>
        </div>
      )}
    </div>
  );
};