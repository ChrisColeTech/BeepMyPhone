import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent: React.FC<MainContentProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <main 
      className={`flex-1 overflow-auto ${className}`}
      data-testid="main-content"
    >
      <div className="h-full w-full p-6">
        {children}
      </div>
    </main>
  );
};

export default MainContent;