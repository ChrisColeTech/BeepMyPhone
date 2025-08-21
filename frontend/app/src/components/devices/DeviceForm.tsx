import React from 'react';
import { Smartphone } from 'lucide-react';
import { DeviceValidation, deviceNameRules } from '../../utils/DeviceValidation';

interface DeviceFormProps {
  deviceName: string;
  platform: 'ios' | 'android';
  onDeviceNameChange: (name: string) => void;
  onPlatformChange: (platform: 'ios' | 'android') => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitText?: string;
  touched: { [field: string]: boolean };
  onFieldBlur: (field: string) => void;
  showPlatformSelector?: boolean;
}

export const DeviceForm: React.FC<DeviceFormProps> = ({
  deviceName,
  platform,
  onDeviceNameChange,
  onPlatformChange,
  onSubmit,
  isSubmitting = false,
  submitText = 'Submit',
  touched,
  onFieldBlur,
  showPlatformSelector = true,
}) => {
  const deviceNameError = touched.deviceName ? DeviceValidation.validateDeviceName(deviceName) : null;
  const hasErrors = !!deviceNameError;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Device Name */}
      <div>
        <label htmlFor="deviceName" className="block text-sm font-medium text-text-primary mb-2">
          Device Name <span className="text-red-500">*</span>
        </label>
        <input
          id="deviceName"
          type="text"
          value={deviceName}
          onChange={(e) => onDeviceNameChange(e.target.value)}
          onBlur={() => onFieldBlur('deviceName')}
          placeholder="e.g., John's iPhone"
          className={`w-full px-3 py-2 border rounded-lg bg-background-app text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            deviceNameError 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-border-default focus:ring-brand-primary'
          }`}
          required
          maxLength={deviceNameRules.maxLength}
        />
        {deviceNameError && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <span>⚠️</span>
            <span>{deviceNameError}</span>
          </p>
        )}
        <div className="mt-1 flex justify-between text-xs text-text-muted">
          <span>{deviceNameRules.patternMessage}</span>
          <span className={deviceName.length > 40 ? 'text-yellow-600' : ''}>
            {deviceName.length}/{deviceNameRules.maxLength}
          </span>
        </div>
      </div>

      {/* Platform Selector */}
      {showPlatformSelector && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Platform
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onPlatformChange('ios')}
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
              onClick={() => onPlatformChange('android')}
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
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !deviceName.trim() || hasErrors}
        className="w-full px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Processing...' : submitText}
      </button>
    </form>
  );
};
