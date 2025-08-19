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
      className={`flex-1 overflow-auto p-6 ${className}`}
      data-testid="main-content"
    >
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  );
};

export default MainContent;