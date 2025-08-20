import React, { useState, useEffect } from 'react';
import { useDevices } from '../hooks/useDevices';
import { useToast } from '../hooks/useToast';
import { deviceService } from '../services/DeviceService';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { 
  Send, 
  Smartphone, 
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Power,
  PowerOff
} from 'lucide-react';
import type { RegisteredDevice } from '../services/DeviceService';

export const TestNotifications: React.FC = () => {
  const { devices, loading: devicesLoading, error: devicesError, refreshDevices } = useDevices();
  const toast = useToast();
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [customMessage, setCustomMessage] = useState('');
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [testingDevices, setTestingDevices] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Map<string, { success: boolean; message?: string }>>(new Map());
  const [togglingDevices, setTogglingDevices] = useState<Set<string>>(new Set());

  // Pre-defined test messages
  const predefinedMessages = [
    'Test notification from BeepMyPhone',
    'Hello from your PC! 👋',
    'Testing notification forwarding...',
    'This is a sample notification',
    'PC notification test message',
  ];

  useEffect(() => {
    // Select all active devices by default
    const activeDevices = devices.filter(device => device.isActive);
    setSelectedDevices(new Set(activeDevices.map(device => device.deviceId)));
  }, [devices]);

  const handleDeviceToggle = (deviceId: string) => {
    const newSelection = new Set(selectedDevices);
    if (newSelection.has(deviceId)) {
      newSelection.delete(deviceId);
    } else {
      newSelection.add(deviceId);
    }
    setSelectedDevices(newSelection);
  };

  const toggleDeviceActivation = async (device: RegisteredDevice, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent device selection toggle
    
    try {
      setTogglingDevices(prev => new Set(prev).add(device.deviceId));
      
      await deviceService.updateDevice(device.deviceId, {
        isActive: !device.isActive
      });
      
      toast.success(
        `Device ${!device.isActive ? 'Activated' : 'Deactivated'}`, 
        `${device.deviceName} is now ${!device.isActive ? 'online' : 'offline'}`
      );
      
      // Refresh devices to get updated status
      await refreshDevices();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to Update Device', errorMessage);
    } finally {
      setTogglingDevices(prev => {
        const newSet = new Set(prev);
        newSet.delete(device.deviceId);
        return newSet;
      });
    }
  };

  const sendTestToDevice = async (device: RegisteredDevice, message: string): Promise<boolean> => {
    try {
      setTestingDevices(prev => new Set(prev).add(device.deviceId));
      
      const fullMessage = customMessage || message;
      await deviceService.testNotification(device.deviceId, fullMessage);
      
      setTestResults(prev => new Map(prev).set(device.deviceId, { success: true }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResults(prev => new Map(prev).set(device.deviceId, { 
        success: false, 
        message: errorMessage 
      }));
      return false;
    } finally {
      setTestingDevices(prev => {
        const newSet = new Set(prev);
        newSet.delete(device.deviceId);
        return newSet;
      });
    }
  };

  const sendTestNotifications = async () => {
    if (selectedDevices.size === 0) {
      toast.error('No Devices Selected', 'Please select at least one device to send test notifications');
      return;
    }

    const selectedDeviceList = devices.filter(device => selectedDevices.has(device.deviceId));
    const offlineDevices = selectedDeviceList.filter(device => !device.isActive);
    
    if (offlineDevices.length > 0) {
      const deviceNames = offlineDevices.map(d => d.deviceName).join(', ');
      toast.warning('Offline Devices Selected', `Some devices are offline: ${deviceNames}. Test may fail.`);
    }

    const message = customMessage || predefinedMessages[0];
    
    setIsTestingAll(true);
    setTestResults(new Map());

    try {
      const results = await Promise.allSettled(
        selectedDeviceList.map(device => sendTestToDevice(device, message))
      );

      const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
      const failCount = results.length - successCount;

      if (successCount > 0 && failCount === 0) {
        toast.success('Test Sent!', `Successfully sent to ${successCount} device${successCount !== 1 ? 's' : ''}`);
      } else if (successCount > 0 && failCount > 0) {
        toast.warning('Partially Successful', `Sent to ${successCount} device${successCount !== 1 ? 's' : ''}, failed on ${failCount}`);
      } else {
        toast.error('Test Failed', `Failed to send to all ${failCount} selected device${failCount !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      toast.error('Error', 'Failed to send test notifications');
    } finally {
      setIsTestingAll(false);
    }
  };

  const activeDevices = devices.filter(device => device.isActive);

  if (devicesLoading) {
    return <LoadingState message="Loading devices..." />;
  }

  if (devicesError) {
    return <ErrorState message={devicesError} onRetry={refreshDevices} />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            Test Notifications
          </h1>
          <div className="flex space-x-3">
            <button 
              onClick={refreshDevices}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-border-default rounded-lg hover:bg-interactive-hover transition-colors"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={sendTestNotifications}
              disabled={selectedDevices.size === 0 || isTestingAll}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTestingAll ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Test</span>
                </>
              )}
            </button>
          </div>
        </div>

        {devices.length === 0 ? (
          <div className="text-center py-12">
            <Smartphone className="mx-auto mb-4 text-text-muted" size={48} />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Registered Devices</h3>
            <p className="text-text-muted">Register devices in the Devices page to send test notifications</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Message Input */}
            <div className="bg-background-card border border-border-default rounded-lg p-4">
              <h3 className="text-sm font-medium text-text-primary mb-3">Test Message</h3>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter a custom test message or leave blank for default"
                rows={2}
                className="w-full px-3 py-2 border border-border-default rounded-lg bg-background-app text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {predefinedMessages.slice(1).map((message, index) => (
                  <button
                    key={index}
                    onClick={() => setCustomMessage(message)}
                    className="px-2 py-1 text-xs border border-border-default rounded hover:bg-interactive-hover transition-colors text-text-secondary"
                  >
                    {message}
                  </button>
                ))}
              </div>
            </div>

            {/* Device Selection */}
            <div className="bg-background-card border border-border-default rounded-lg">
              <div className="p-4 border-b border-border-default">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-text-primary">
                    Registered Devices ({selectedDevices.size} of {devices.length} selected)
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedDevices(new Set(devices.map(d => d.deviceId)))}
                      className="text-xs text-brand-primary hover:text-blue-600 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedDevices(new Set())}
                      className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                      disabled={selectedDevices.size === 0}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {devices.map((device) => {
                    const isSelected = selectedDevices.has(device.deviceId);
                    const isTesting = testingDevices.has(device.deviceId);
                    const testResult = testResults.get(device.deviceId);
                    const isToggling = togglingDevices.has(device.deviceId);

                    return (
                      <div
                        key={device.deviceId}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-brand-primary bg-brand-primary bg-opacity-5'
                            : 'border-border-default hover:bg-interactive-hover'
                        } ${!device.isActive ? 'opacity-60' : ''}`}
                        onClick={() => handleDeviceToggle(device.deviceId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <Smartphone size={16} className="text-text-muted flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-text-primary truncate">{device.deviceName}</div>
                              <div className="text-xs text-text-secondary flex items-center space-x-2">
                                <span>{device.deviceType}</span>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                  device.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {device.isActive ? 'Connected' : 'Offline'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {isTesting && <Loader2 className="animate-spin text-brand-primary" size={14} />}
                            {testResult && (
                              testResult.success ? (
                                <CheckCircle className="text-green-500" size={14} />
                              ) : (
                                <AlertCircle className="text-red-500" size={14} />
                              )
                            )}
                            <button
                              onClick={(e) => toggleDeviceActivation(device, e)}
                              disabled={isToggling}
                              className={`p-1 rounded-full transition-colors ${
                                device.isActive 
                                  ? 'text-green-600 hover:bg-green-100' 
                                  : 'text-gray-500 hover:bg-gray-100'
                              } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={`${device.isActive ? 'Deactivate' : 'Activate'} device`}
                            >
                              {isToggling ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : device.isActive ? (
                                <Power size={16} />
                              ) : (
                                <PowerOff size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                        {testResult && !testResult.success && (
                          <div className="mt-1 text-xs text-red-600 truncate">
                            {testResult.message}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};