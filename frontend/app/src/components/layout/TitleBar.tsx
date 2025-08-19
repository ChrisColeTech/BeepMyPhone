import React from 'react';

interface TitleBarProps {
  title: string;
  showControls?: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({ 
  title, 
  showControls = false 
}) => {
  return (
    <div 
      className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 select-none"
      data-testid="title-bar"
    >
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">B</span>
        </div>
        <h1 className="text-sm font-medium text-gray-900">{title}</h1>
      </div>
      
      {showControls && (
        <div className="flex items-center space-x-1">
          <button 
            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors"
            aria-label="Minimize"
          />
          <button 
            className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors"
            aria-label="Maximize"  
          />
          <button 
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            aria-label="Close"
          />
        </div>
      )}
    </div>
  );
};

export default TitleBar;