import React, { useState, useEffect, useCallback } from 'react';
import { useDevices } from '../../hooks/useDevices';
import { useToast } from '../../hooks/useToast';
import { X, Smartphone, QrCode, Copy } from 'lucide-react';
import type { DeviceRegistrationRequest } from '../../services/DeviceService';
import QRCode from 'qrcode';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose }) => {
  const { registerDevice } = useDevices();
  const toast = useToast();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionCode, setConnectionCode] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [pairingInstructions, setPairingInstructions] = useState<{
    qrCode: string;
    manualCode: string;
    instructions: string;
  } | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  // Generate QR code when pairing instructions change
  useEffect(() => {
    if (pairingInstructions?.qrCode) {
      const generateQRCode = async () => {
        try {
          const qrDataUrl = await QRCode.toDataURL(pairingInstructions.qrCode, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeDataUrl(qrDataUrl);
        } catch (err) {
          console.error('Failed to generate QR code:', err);
        }
      };
      generateQRCode();
    }
  }, [pairingInstructions]);

  const handleClose = useCallback(() => {
    // Reset all state to initial values
    setStep('form');
    setDeviceName('');
    setPlatform('ios');
    setConnectionCode('');
    setQrCodeDataUrl('');
    setPairingInstructions(null);
    setError(null);
    setValidationErrors({});
    setTouched({});
    setLoading(false); // Make sure to reset loading state
    
    // Call the parent's onClose
    onClose();
  }, [onClose]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, handleClose]);

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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeviceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDeviceName(value);
    
    if (touched.deviceName) {
      // Real-time validation for touched fields
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
    
    if (!validateForm()) {
      setError('Please correct the errors above');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: DeviceRegistrationRequest = {
        name: deviceName.trim(),
        platform,
      };

      const result = await registerDevice(request);
      setConnectionCode(result.connectionCode);
      setPairingInstructions(result.pairingInstructions);
      setStep('success');
      toast.success('Device Added Successfully', `${deviceName} is ready for pairing`, 4000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register device';
      setError(errorMessage);
      toast.error('Failed to Add Device', errorMessage, 6000);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const codeToCopy = pairingInstructions?.manualCode || connectionCode;
      await navigator.clipboard.writeText(codeToCopy);
      toast.success('Copied!', 'Connection code copied to clipboard', 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toast.error('Copy Failed', 'Unable to copy to clipboard', 4000);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      onClick={handleBackdropClick}
    >
      <div className="bg-background-card border border-border-default rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-default">
          <h2 className="text-lg font-semibold text-text-primary">
            {step === 'form' ? 'Add Device' : 'Device Added Successfully'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-text-muted hover:bg-interactive-hover rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="e.g., John's iPhone"
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

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlatform('ios')}
                    className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                      platform === 'ios'
                        ? 'border-brand-primary bg-brand-primary bg-opacity-10 text-brand-primary'
                        : 'border-border-default hover:bg-interactive-hover text-text-secondary'
                    }`}
                  >
                    <Smartphone size={20} className="mr-2" />
                    iOS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('android')}
                    className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                      platform === 'android'
                        ? 'border-brand-primary bg-brand-primary bg-opacity-10 text-brand-primary'
                        : 'border-border-default hover:bg-interactive-hover text-text-secondary'
                    }`}
                  >
                    <Smartphone size={20} className="mr-2" />
                    Android
                  </button>
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
                  className="flex-1 px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Device'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <QrCode size={32} className="text-green-600 dark:text-green-400" />
              </div>

              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Device "{deviceName}" Added
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {pairingInstructions?.instructions || 'Use this connection code in your mobile app to connect:'}
                </p>
              </div>

              {/* Connection Code and QR Code */}
              <div className="bg-background-elevated border border-border-default rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <h4 className="text-sm font-medium text-text-primary mb-3">Scan QR Code</h4>
                    {qrCodeDataUrl ? (
                      <div className="bg-white p-4 rounded-lg border border-border-default">
                        <img src={qrCodeDataUrl} alt="Connection QR Code" className="w-32 h-32" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-background-app border border-border-default rounded-lg flex items-center justify-center">
                        <QrCode size={32} className="text-text-muted" />
                      </div>
                    )}
                    <p className="text-xs text-text-secondary mt-2 text-center">
                      Scan with your phone's camera or QR code app
                    </p>
                  </div>

                  {/* Manual Code Entry */}
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-text-primary mb-3">Or Enter Code Manually</h4>
                    <div className="flex items-center space-x-2 flex-1">
                      <code className="flex-1 text-2xl font-mono text-brand-primary bg-background-app px-4 py-3 rounded border border-border-default text-center tracking-wider">
                        {pairingInstructions?.manualCode || connectionCode}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="p-2 text-text-muted hover:bg-interactive-hover rounded-lg transition-colors flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-text-secondary mt-2">
                      Enter this 6-digit code in the BeepMyPhone mobile app
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-left bg-background-elevated border border-border-default rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">Next Steps:</h4>
                <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                  <li>Open the BeepMyPhone app on your {platform === 'ios' ? 'iPhone' : 'Android device'}</li>
                  <li>Tap "Connect to PC" or "Add Device"</li>
                  <li>Enter the connection code above</li>
                  <li>Your device will appear as connected once paired</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};