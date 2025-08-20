export interface ValidationResult {
  isValid: boolean;
  errors: { [field: string]: string };
}

export interface DeviceFormData {
  deviceName: string;
  platform?: 'ios' | 'android';
}

export class DeviceValidation {
  static validateDeviceName(deviceName: string): string | null {
    if (!deviceName.trim()) {
      return 'Device name is required';
    }
    
    if (deviceName.trim().length < 2) {
      return 'Device name must be at least 2 characters long';
    }
    
    if (deviceName.trim().length > 50) {
      return 'Device name cannot exceed 50 characters';
    }
    
    if (!/^[a-zA-Z0-9\s\-_']+$/.test(deviceName.trim())) {
      return 'Device name contains invalid characters';
    }
    
    return null;
  }

  static validateDeviceForm(data: DeviceFormData): ValidationResult {
    const errors: { [field: string]: string } = {};

    const deviceNameError = this.validateDeviceName(data.deviceName);
    if (deviceNameError) {
      errors.deviceName = deviceNameError;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateAppName(appName: string): string | null {
    if (!appName.trim()) {
      return 'App name is required';
    }
    
    if (!/^[a-zA-Z0-9\s\-_.']+$/.test(appName.trim())) {
      return 'App name contains invalid characters';
    }
    
    return null;
  }
}

export const deviceNameRules = {
  required: true,
  minLength: 2,
  maxLength: 50,
  pattern: /^[a-zA-Z0-9\s\-_']+$/,
  patternMessage: 'Letters, numbers, spaces, hyphens, underscores allowed',
};