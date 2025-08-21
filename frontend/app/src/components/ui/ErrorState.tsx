import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
  centered?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Error',
  message,
  onRetry,
  retrying = false,
  centered = true,
}) => {
  const content = (
    <div className="error-container rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium error-text">{title}</h3>
          <p className="text-sm error-text mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={retrying}
              className="mt-3 flex items-center space-x-2 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {retrying ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : (
                <RefreshCw size={16} />
              )}
              <span>{retrying ? 'Retrying...' : 'Retry'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (centered) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="max-w-md w-full">
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return content;
};