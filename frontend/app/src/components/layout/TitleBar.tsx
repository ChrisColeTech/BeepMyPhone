import React, { useState, useEffect } from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { VscChromeMinimize, VscChromeMaximize, VscChromeRestore, VscChromeClose } from 'react-icons/vsc';
import { MdSecurity } from 'react-icons/md';

interface TitleBarProps {
  title: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ 
  title,
  onMinimize,
  onMaximize,
  onClose
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Listen for window state changes if in Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
      // We'll need to add this IPC listener
      const checkMaximized = async () => {
        try {
          const maximized = await window.electronAPI.isMaximized?.();
          setIsMaximized(maximized || false);
        } catch {
          console.log('Unable to check maximized state');
        }
      };
      
      checkMaximized();
      
      // Check state periodically or on window events
      const interval = setInterval(checkMaximized, 1000);
      return () => clearInterval(interval);
    }
  }, []);
  const handleMinimize = () => {
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    } else if (onMinimize) {
      onMinimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximize) {
      window.electronAPI.maximize();
      // Toggle state immediately for responsive UI
      setIsMaximized(!isMaximized);
    } else if (onMaximize) {
      onMaximize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="desktop-title-bar" data-testid="title-bar">
      {/* Draggable area */}
      <div className="title-bar-drag-area">
        <div className="flex items-center h-full px-4">
          {/* App icon and title */}
          <div className="flex items-center space-x-3">
            <div className="title-bar-icon">
              <MdSecurity size={16} />
            </div>
            <span className="title-bar-text">{title}</span>
          </div>
          
          {/* Theme toggle in center area */}
          <div className="flex-1 flex justify-end pr-4">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Window controls */}
      <div className="title-bar-controls">
        <button 
          className="title-bar-button title-bar-minimize"
          onClick={handleMinimize}
          aria-label="Minimize"
        >
          <VscChromeMinimize size={10} />
        </button>
        
        <button 
          className="title-bar-button title-bar-maximize"
          onClick={handleMaximize}
          aria-label={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <VscChromeRestore size={10} />
          ) : (
            <VscChromeMaximize size={10} />
          )}
        </button>
        
        <button 
          className="title-bar-button title-bar-close"
          onClick={handleClose}
          aria-label="Close"
        >
          <VscChromeClose size={10} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;