import { useState } from 'react';
import { DeviceService } from '../services/DeviceService';
import type { 
  DeviceRegistrationRequest, 
  DeviceUpdateRequest 
} from '../services/DeviceService';

export const useDeviceActions = () => {
  const [operationStates, setOperationStates] = useState<{
    registering: boolean;
    updating: string | null; // device ID being updated
    deleting: string | null; // device ID being deleted
    testing: string | null; // device ID being tested
  }>({
    registering: false,
    updating: null,
    deleting: null,
    testing: null,
  });

  const registerDevice = async (request: DeviceRegistrationRequest) => {
    setOperationStates(prev => ({ ...prev, registering: true }));
    try {
      const result = await DeviceService.registerDevice(request);
      return result;
    } finally {
      setOperationStates(prev => ({ ...prev, registering: false }));
    }
  };

  const updateDevice = async (deviceId: string, request: DeviceUpdateRequest) => {
    setOperationStates(prev => ({ ...prev, updating: deviceId }));
    try {
      const result = await DeviceService.updateDevice(deviceId, request);
      return result;
    } finally {
      setOperationStates(prev => ({ ...prev, updating: null }));
    }
  };

  const deleteDevice = async (deviceId: string) => {
    setOperationStates(prev => ({ ...prev, deleting: deviceId }));
    try {
      await DeviceService.deleteDevice(deviceId);
    } finally {
      setOperationStates(prev => ({ ...prev, deleting: null }));
    }
  };

  const testNotification = async (deviceId: string, message: string) => {
    setOperationStates(prev => ({ ...prev, testing: deviceId }));
    try {
      await DeviceService.testNotification(deviceId, message);
    } finally {
      setOperationStates(prev => ({ ...prev, testing: null }));
    }
  };

  return {
    // Actions
    registerDevice,
    updateDevice,
    deleteDevice,
    testNotification,
    
    // Loading states
    isRegistering: operationStates.registering,
    isUpdating: (deviceId: string) => operationStates.updating === deviceId,
    isDeleting: (deviceId: string) => operationStates.deleting === deviceId,
    isTesting: (deviceId: string) => operationStates.testing === deviceId,
    
    // State getters
    getDeletingId: () => operationStates.deleting,
    getTestingId: () => operationStates.testing,
  };
};