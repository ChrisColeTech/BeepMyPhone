export interface ToastManager {
  success: (title: string, message: string, duration?: number) => void;
  error: (title: string, message: string, duration?: number) => void;
  warning: (title: string, message: string, duration?: number) => void;
  info: (title: string, message: string, duration?: number) => void;
}

export class NotificationHandling {
  static deviceOperations = {
    deviceAdded: (deviceName: string, toast: ToastManager) => {
      toast.success('Device Added Successfully', `${deviceName} is ready for pairing`, 4000);
    },

    deviceUpdated: (deviceName: string, toast: ToastManager) => {
      toast.success('Device Updated', `${deviceName} has been updated successfully`, 3000);
    },

    deviceDeleted: (deviceName: string, toast: ToastManager) => {
      toast.success('Device Deleted', `${deviceName} has been removed`, 4000);
    },

    testNotificationSent: (toast: ToastManager) => {
      toast.success('Test Sent', 'Test notification sent successfully!', 3000);
    },

    connectionCodeCopied: (toast: ToastManager) => {
      toast.success('Copied!', 'Connection code copied to clipboard', 2000);
    },
  };

  static deviceErrors = {
    addFailed: (error: string, toast: ToastManager) => {
      toast.error('Failed to Add Device', error, 6000);
    },

    updateFailed: (error: string, toast: ToastManager) => {
      toast.error('Update Failed', error, 6000);
    },

    deleteFailed: (error: string, toast: ToastManager) => {
      toast.error('Delete Failed', error, 6000);
    },

    testNotificationFailed: (error: string, toast: ToastManager) => {
      toast.error('Test Failed', error, 5000);
    },

    copyFailed: (toast: ToastManager) => {
      toast.error('Copy Failed', 'Unable to copy to clipboard', 4000);
    },

    validationError: (toast: ToastManager) => {
      toast.warning('Validation Error', 'Please correct the errors in the form', 4000);
    },
  };

  static formatErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  }
};