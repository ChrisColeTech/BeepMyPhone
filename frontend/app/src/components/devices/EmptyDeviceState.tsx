import React from 'react';

interface EmptyDeviceStateProps {
  totalDevices: number;
  onClearFilters: () => void;
}

export const EmptyDeviceState: React.FC<EmptyDeviceStateProps> = ({
  totalDevices,
  onClearFilters,
}) => {
  const isNoDevices = totalDevices === 0;
  
  return (
    <div className="bg-background-card border border-border-default rounded-lg p-6">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📱</div>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          {isNoDevices ? 'No devices connected' : 'No devices match your filters'}
        </h3>
        <p className="text-text-secondary mb-4">
          {isNoDevices 
            ? 'Connect your phone to start receiving notifications'
            : 'Try adjusting your search or filter criteria'
          }
        </p>
        {!isNoDevices && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};