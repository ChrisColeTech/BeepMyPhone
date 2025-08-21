import { useState, useEffect } from 'react';
import { deviceService } from '../services/DeviceService';
import type { RegisteredDevice } from '../services/DeviceService';

export const useDeviceData = () => {
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDevices = await deviceService.getDevices();
      setDevices(fetchedDevices);
      setLastFetch(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch devices';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshDevices = async () => {
    await fetchDevices();
  };

  // Initial fetch
  useEffect(() => {
    fetchDevices();
  }, []);

  return {
    devices,
    loading,
    error,
    lastFetch,
    refreshDevices,
    setDevices, // For optimistic updates
  };
};