import React from 'react';
import { TitleBar } from './TitleBar';
import { MainContent } from './MainContent';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showTitleBar?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title = "BeepMyPhone",
  showTitleBar = true 
}) => {
  return (
    <div className="layout-container" data-testid="app-layout">
      {showTitleBar && (
        <TitleBar title={title} />
      )}
      <MainContent>
        {children}
      </MainContent>
    </div>
  );
};

export default AppLayout;