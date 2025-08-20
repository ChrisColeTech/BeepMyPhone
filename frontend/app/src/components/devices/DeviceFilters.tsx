import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface DeviceFiltersProps {
  searchQuery: string;
  statusFilter: 'all' | 'connected' | 'offline';
  platformFilter: 'all' | 'ios' | 'android';
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: 'all' | 'connected' | 'offline') => void;
  onPlatformFilterChange: (platform: 'all' | 'ios' | 'android') => void;
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export const DeviceFilters: React.FC<DeviceFiltersProps> = ({
  searchQuery,
  statusFilter,
  platformFilter,
  onSearchChange,
  onStatusFilterChange,
  onPlatformFilterChange,
  onClearFilters,
  filteredCount,
  totalCount,
}) => {
  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || platformFilter !== 'all';

  return (
    <div className="mb-6 bg-background-card border border-border-default rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search devices by name..."
            className="w-full pl-10 pr-10 py-2 border border-border-default rounded-lg bg-background-app text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'connected' | 'offline')}
            className="px-3 py-2 border border-border-default rounded-lg bg-background-app text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="connected">Connected</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        
        {/* Platform Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={platformFilter}
            onChange={(e) => onPlatformFilterChange(e.target.value as 'all' | 'ios' | 'android')}
            className="px-3 py-2 border border-border-default rounded-lg bg-background-app text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            <option value="ios">iOS</option>
            <option value="android">Android</option>
          </select>
        </div>
      </div>
      
      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-border-muted">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              Showing {filteredCount} of {totalCount} devices
            </span>
            <button
              onClick={onClearFilters}
              className="text-brand-primary hover:text-blue-600 font-medium"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};