import React, { useState } from 'react';
import { TitleBar } from './TitleBar';
import { MainContent } from './MainContent';
import { StatusBar } from './StatusBar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showTitleBar?: boolean;
  showStatusBar?: boolean;
  showSidebar?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title = "BeepMyPhone",
  showTitleBar = true,
  showStatusBar = true,
  showSidebar = true
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="layout-container" data-testid="app-layout">
      {showTitleBar && (
        <TitleBar title={title} />
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <Sidebar 
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            width={250}
          />
        )}
        
        <MainContent className="flex-1">
          {children}
        </MainContent>
      </div>

      {showStatusBar && (
        <StatusBar 
          connectionStatus="disconnected"
          connectedDevices={0}
          serviceStatus="stopped"
          version="1.0.0"
        />
      )}
    </div>
  );
};

export default AppLayout;