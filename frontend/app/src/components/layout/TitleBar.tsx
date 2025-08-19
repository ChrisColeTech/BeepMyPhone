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
      className="layout-title-bar"
      data-testid="title-bar"
    >
      <div className="flex items-center space-x-2">
        <div className="title-bar-logo">
          <span className="title-bar-logo-text">B</span>
        </div>
        <h1 className="title-bar-title">{title}</h1>
      </div>
      
      {showControls && (
        <div className="title-bar-controls">
          <button 
            className="title-bar-control-minimize"
            aria-label="Minimize"
          />
          <button 
            className="title-bar-control-maximize"
            aria-label="Maximize"  
          />
          <button 
            className="title-bar-control-close"
            aria-label="Close"
          />
        </div>
      )}
    </div>
  );
};

export default TitleBar;