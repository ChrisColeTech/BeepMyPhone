import { useState, useMemo } from 'react';
import type { RegisteredDevice } from '../services/DeviceService';

export interface DeviceFilters {
  searchQuery: string;
  statusFilter: 'all' | 'connected' | 'offline';
  platformFilter: 'all' | 'ios' | 'android';
}

export const useDeviceFilters = (devices: RegisteredDevice[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'offline'>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'ios' | 'android'>('all');

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      // Search filter
      const matchesSearch = device.deviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'connected' && device.isActive) ||
        (statusFilter === 'offline' && !device.isActive);
      
      // Platform filter
      const matchesPlatform = platformFilter === 'all' || device.deviceType?.toLowerCase() === platformFilter;
      
      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [devices, searchQuery, statusFilter, platformFilter]);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || platformFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPlatformFilter('all');
  };

  return {
    // Filter state
    searchQuery,
    statusFilter,
    platformFilter,
    
    // Filter setters
    setSearchQuery,
    setStatusFilter,
    setPlatformFilter,
    
    // Computed values
    filteredDevices,
    hasActiveFilters,
    
    // Actions
    clearFilters,
  };
};