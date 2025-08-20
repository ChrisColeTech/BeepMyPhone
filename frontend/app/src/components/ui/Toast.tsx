import React, { useState, useEffect, ReactNode } from 'react';
import { LuCheck, LuX, LuInfo } from 'react-icons/lu';
import { ToastContext } from '../../contexts/ToastContext';
import type { Toast, ToastContextType } from '../../types/toast';
import { injectToastStyles } from '../../utils/toastStyles';

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Inject styles on component mount
  useEffect(() => {
    injectToastStyles();
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => removeToast(id), newToast.duration);
    }
  };

  const success = (title: string, message?: string, duration?: number) => {
    showToast({ type: 'success', title, message, duration });
  };

  const error = (title: string, message?: string, duration?: number) => {
    showToast({ type: 'error', title, message, duration });
  };

  const warning = (title: string, message?: string, duration?: number) => {
    showToast({ type: 'warning', title, message, duration });
  };

  const info = (title: string, message?: string, duration?: number) => {
    showToast({ type: 'info', title, message, duration });
  };

  const contextValue: ToastContextType = {
    showToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <LuCheck className="text-status-success" size={20} />;
      case 'error':
        return <LuX className="text-status-error" size={20} />;
      case 'warning':
        return <div className="w-5 h-5 bg-status-warning rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">!</span>
        </div>;
      case 'info':
        return <LuInfo className="text-blue-600" size={20} />;
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-background-card border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-background-card border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-background-card border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-background-card border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div
      className={`
        min-w-80 max-w-md p-4 rounded-lg border shadow-lg transition-all duration-300 transform
        ${getColorClasses()}
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium text-text-primary">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="mt-1 text-sm text-text-secondary">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="ml-4 flex-shrink-0 p-1 text-text-muted hover:text-text-primary transition-colors rounded-full hover:bg-interactive-hover"
              aria-label="Close notification"
            >
              <LuX size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      {toast.duration && toast.duration > 0 && (
        <div className="mt-3 h-1 bg-border-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ease-linear ${
              toast.type === 'success' ? 'bg-status-success' :
              toast.type === 'error' ? 'bg-status-error' :
              toast.type === 'warning' ? 'bg-status-warning' : 'bg-blue-600'
            }`}
            style={{
              width: '100%',
              animation: `shrink ${toast.duration}ms linear`,
            }}
          />
        </div>
      )}
    </div>
  );
};

