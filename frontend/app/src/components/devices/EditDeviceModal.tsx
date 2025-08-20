import React, { useState, useEffect } from 'react';
import { useDevices } from '../../hooks/useDevices';
import { useToast } from '../../hooks/useToast';
import { X, Smartphone, Save } from 'lucide-react';
import type { RegisteredDevice, DeviceUpdateRequest } from '../../services/DeviceService';

interface EditDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: RegisteredDevice | null;
}

export const EditDeviceModal: React.FC<EditDeviceModalProps> = ({ isOpen, onClose, device }) => {
  const { updateDevice } = useDevices();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  // Form state
  const [deviceName, setDeviceName] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState({
    allowAll: true,
    blockedApps: [] as string[],
    onlyFromApps: [] as string[],
  });
  
  const [newBlockedApp, setNewBlockedApp] = useState('');
  const [newAllowedApp, setNewAllowedApp] = useState('');

  // Initialize form with device data
  useEffect(() => {
    if (device) {
      setDeviceName(device.deviceName);
      setNotificationPreferences(device.notificationPreferences || {
        allowAll: true,
        blockedApps: [],
        onlyFromApps: [],
      });
    }
  }, [device]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Device name validation
    if (!deviceName.trim()) {
      errors.deviceName = 'Device name is required';
    } else if (deviceName.trim().length < 2) {
      errors.deviceName = 'Device name must be at least 2 characters long';
    } else if (deviceName.trim().length > 50) {
      errors.deviceName = 'Device name cannot exceed 50 characters';
    } else if (!/^[a-zA-Z0-9\s\-_']+$/.test(deviceName.trim())) {
      errors.deviceName = 'Device name contains invalid characters';
    }

    // App name validation for blocked/allowed apps
    if (newBlockedApp.trim() && !/^[a-zA-Z0-9\s\-_.']+$/.test(newBlockedApp.trim())) {
      errors.newBlockedApp = 'App name contains invalid characters';
    }
    
    if (newAllowedApp.trim() && !/^[a-zA-Z0-9\s\-_.']+$/.test(newAllowedApp.trim())) {
      errors.newAllowedApp = 'App name contains invalid characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeviceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDeviceName(value);
    
    if (touched.deviceName) {
      const errors = { ...validationErrors };
      if (!value.trim()) {
        errors.deviceName = 'Device name is required';
      } else if (value.trim().length < 2) {
        errors.deviceName = 'Device name must be at least 2 characters long';
      } else if (value.trim().length > 50) {
        errors.deviceName = 'Device name cannot exceed 50 characters';
      } else if (!/^[a-zA-Z0-9\s\-_']+$/.test(value.trim())) {
        errors.deviceName = 'Device name contains invalid characters';
      } else {
        delete errors.deviceName;
      }
      setValidationErrors(errors);
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ deviceName: true });
    
    if (!device) {
      setError('Device information not available');
      return;
    }

    if (!validateForm()) {
      setError('Please correct the errors above');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData: DeviceUpdateRequest = {
        name: deviceName.trim(),
        notificationPreferences,
      };

      await updateDevice(device.deviceId, updateData);
      toast.success('Device Updated', `${deviceName} settings saved successfully`);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update device';
      setError(errorMessage);
      toast.error('Update Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (device) {
      setDeviceName(device.deviceName);
      setNotificationPreferences(device.notificationPreferences || {
        allowAll: true,
        blockedApps: [],
        onlyFromApps: [],
      });
    }
    setError(null);
    setValidationErrors({});
    setTouched({});
    setNewBlockedApp('');
    setNewAllowedApp('');
    onClose();
  };

  const addBlockedApp = () => {
    if (newBlockedApp.trim() && !notificationPreferences.blockedApps.includes(newBlockedApp.trim())) {
      setNotificationPreferences({
        ...notificationPreferences,
        blockedApps: [...notificationPreferences.blockedApps, newBlockedApp.trim()]
      });
      setNewBlockedApp('');
    }
  };

  const removeBlockedApp = (app: string) => {
    setNotificationPreferences({
      ...notificationPreferences,
      blockedApps: notificationPreferences.blockedApps.filter(a => a !== app)
    });
  };

  const addAllowedApp = () => {
    if (newAllowedApp.trim() && !notificationPreferences.onlyFromApps.includes(newAllowedApp.trim())) {
      setNotificationPreferences({
        ...notificationPreferences,
        onlyFromApps: [...notificationPreferences.onlyFromApps, newAllowedApp.trim()]
      });
      setNewAllowedApp('');
    }
  };

  const removeAllowedApp = (app: string) => {
    setNotificationPreferences({
      ...notificationPreferences,
      onlyFromApps: notificationPreferences.onlyFromApps.filter(a => a !== app)
    });
  };

  if (!isOpen || !device) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background-card border border-border-default rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-default">
          <h2 className="text-lg font-semibold text-text-primary">
            Edit Device
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-text-muted hover:bg-interactive-hover rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Device Info */}
          <div className="flex items-center space-x-3 p-4 bg-background-elevated rounded-lg">
            <Smartphone size={24} className="text-brand-primary" />
            <div>
              <p className="text-sm text-text-muted">Platform</p>
              <p className="font-medium text-text-primary">{device.deviceType.toUpperCase()}</p>
            </div>
            <div className="ml-auto">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                device.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {device.isActive ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Device Name */}
          <div>
            <label htmlFor="deviceName" className="block text-sm font-medium text-text-primary mb-2">
              Device Name <span className="text-red-500">*</span>
            </label>
            <input
              id="deviceName"
              type="text"
              value={deviceName}
              onChange={handleDeviceNameChange}
              onBlur={() => handleBlur('deviceName')}
              className={`w-full px-3 py-2 border rounded-lg bg-background-app text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                validationErrors.deviceName 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-border-default focus:ring-brand-primary'
              }`}
              required
              maxLength={50}
            />
            {validationErrors.deviceName && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{validationErrors.deviceName}</span>
              </p>
            )}
            <div className="mt-1 flex justify-between text-xs text-text-muted">
              <span>Letters, numbers, spaces, hyphens, underscores allowed</span>
              <span className={deviceName.length > 40 ? 'text-yellow-600' : ''}>
                {deviceName.length}/50
              </span>
            </div>
          </div>

          {/* Notification Preferences */}
          <div>
            <h3 className="text-sm font-medium text-text-primary mb-3">Notification Preferences</h3>
            
            <div className="space-y-4">
              {/* Allow All Toggle */}
              <div className="flex items-center">
                <input
                  id="allowAll"
                  type="checkbox"
                  checked={notificationPreferences.allowAll}
                  onChange={(e) => setNotificationPreferences({
                    ...notificationPreferences,
                    allowAll: e.target.checked
                  })}
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-border-default rounded"
                />
                <label htmlFor="allowAll" className="ml-2 block text-sm text-text-primary">
                  Allow all notifications (recommended)
                </label>
              </div>

              {!notificationPreferences.allowAll && (
                <>
                  {/* Blocked Apps */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Blocked Applications
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newBlockedApp}
                          onChange={(e) => setNewBlockedApp(e.target.value)}
                          onBlur={() => handleBlur('newBlockedApp')}
                          placeholder="Enter app name to block"
                          className={`flex-1 px-3 py-2 border rounded-lg bg-background-app text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                            validationErrors.newBlockedApp 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-border-default focus:ring-brand-primary'
                          }`}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBlockedApp())}
                        />
                        <button
                          type="button"
                          onClick={addBlockedApp}
                          disabled={!newBlockedApp.trim() || !!validationErrors.newBlockedApp}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Block
                        </button>
                      </div>
                      {validationErrors.newBlockedApp && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>{validationErrors.newBlockedApp}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {notificationPreferences.blockedApps.map((app) => (
                        <span
                          key={app}
                          className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm rounded-full"
                        >
                          {app}
                          <button
                            type="button"
                            onClick={() => removeBlockedApp(app)}
                            className="ml-2 hover:text-red-900 dark:hover:text-red-100"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Allowed Apps */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Only Allow From Applications (leave empty to allow all except blocked)
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newAllowedApp}
                          onChange={(e) => setNewAllowedApp(e.target.value)}
                          onBlur={() => handleBlur('newAllowedApp')}
                          placeholder="Enter app name to allow"
                          className={`flex-1 px-3 py-2 border rounded-lg bg-background-app text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                            validationErrors.newAllowedApp 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-border-default focus:ring-brand-primary'
                          }`}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllowedApp())}
                        />
                        <button
                          type="button"
                          onClick={addAllowedApp}
                          disabled={!newAllowedApp.trim() || !!validationErrors.newAllowedApp}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Allow
                        </button>
                      </div>
                      {validationErrors.newAllowedApp && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>{validationErrors.newAllowedApp}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {notificationPreferences.onlyFromApps.map((app) => (
                        <span
                          key={app}
                          className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm rounded-full"
                        >
                          {app}
                          <button
                            type="button"
                            onClick={() => removeAllowedApp(app)}
                            className="ml-2 hover:text-green-900 dark:hover:text-green-100"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-border-default rounded-lg hover:bg-interactive-hover transition-colors text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !deviceName.trim() || Object.keys(validationErrors).length > 0}
              className="flex-1 px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};