import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  centered?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  centered = true,
}) => {
  const iconSizes = { sm: 16, md: 20, lg: 24 };
  const iconSize = iconSizes[size];

  const content = (
    <div className="flex items-center space-x-3">
      <RefreshCw className="animate-spin" size={iconSize} />
      <span className="text-text-secondary">{message}</span>
    </div>
  );

  if (centered) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
};