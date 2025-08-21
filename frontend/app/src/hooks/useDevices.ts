import { useState, useEffect, useCallback } from 'react';
import type { RegisteredDevice, DeviceRegistrationRequest, DeviceUpdateRequest } from '../services/DeviceService';
import { deviceService } from '../services/DeviceService';

export interface UseDevicesReturn {
  devices: RegisteredDevice[];
  loading: boolean;
  error: string | null;
  refreshDevices: () => Promise<void>;
  registerDevice: (device: DeviceRegistrationRequest) => Promise<{ device: RegisteredDevice; connectionCode: string; pairingInstructions: { qrCode: string; manualCode: string; instructions: string } }>;
  updateDevice: (id: string, updates: DeviceUpdateRequest) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  testNotification: (id: string, message?: string) => Promise<void>;
}

export const useDevices = (): UseDevicesReturn => {
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDevices = await deviceService.getDevices();
      setDevices(fetchedDevices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch devices';
      setError(errorMessage);
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const registerDevice = useCallback(async (device: DeviceRegistrationRequest) => {
    try {
      setError(null);
      const result = await deviceService.registerDevice(device);
      // Refresh the entire list to ensure consistency with backend
      await refreshDevices();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register device';
      setError(errorMessage);
      throw err;
    }
  }, [refreshDevices]);

  const updateDevice = useCallback(async (id: string, updates: DeviceUpdateRequest) => {
    try {
      setError(null);
      await deviceService.updateDevice(id, updates);
      // Refresh the entire list to ensure consistency with backend
      await refreshDevices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update device';
      setError(errorMessage);
      throw err;
    }
  }, [refreshDevices]);

  const deleteDevice = useCallback(async (id: string) => {
    try {
      setError(null);
      await deviceService.deleteDevice(id);
      // Refresh the entire list to ensure consistency with backend
      await refreshDevices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete device';
      setError(errorMessage);
      throw err;
    }
  }, [refreshDevices]);

  const testNotification = useCallback(async (id: string, message?: string) => {
    try {
      setError(null);
      await deviceService.testNotification(id, message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test notification';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Load devices on mount
  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  return {
    devices,
    loading,
    error,
    refreshDevices,
    registerDevice,
    updateDevice,
    deleteDevice,
    testNotification,
  };
};