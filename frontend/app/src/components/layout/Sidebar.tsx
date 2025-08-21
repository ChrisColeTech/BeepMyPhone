import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Smartphone, 
  Bell, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard,
  History,
  Send
} from 'lucide-react';

interface SidebarSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  children?: React.ReactNode;
}

interface SidebarProps {
  sections?: SidebarSection[];
  width?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const defaultSections: SidebarSection[] = [
  {
    id: 'notifications',
    title: 'Recent Notifications',
    icon: <Bell size={16} />,
    isCollapsible: true,
    children: (
      <div className="sidebar-section-content">
        <div className="sidebar-item">No recent notifications</div>
      </div>
    )
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  sections = defaultSections,
  width = 250,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  if (isCollapsed) {
    return (
      <div className="desktop-sidebar-collapsed" data-testid="sidebar-collapsed">
        {/* Collapsed Header with expand button */}
        <div className="sidebar-header">
          <button 
            className="sidebar-collapse-button w-full h-8 flex items-center justify-center"
            onClick={onToggleCollapse}
            title="Expand Sidebar"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        
        {/* Main Navigation Icons */}
        <div className="sidebar-icons">
          <button 
            className={`sidebar-icon-button ${location.pathname === '/' ? 'active' : ''}`} 
            title="Dashboard"
            onClick={() => navigate('/')}
          >
            <LayoutDashboard size={16} />
          </button>
          
          <button 
            className={`sidebar-icon-button ${location.pathname === '/devices' ? 'active' : ''}`} 
            title="Connected Devices"
            onClick={() => navigate('/devices')}
          >
            <Smartphone size={16} />
          </button>
          
          <button 
            className={`sidebar-icon-button ${location.pathname === '/notifications' ? 'active' : ''}`} 
            title="Notification History"
            onClick={() => navigate('/notifications')}
          >
            <History size={16} />
          </button>
          
          <button 
            className={`sidebar-icon-button ${location.pathname === '/test' ? 'active' : ''}`} 
            title="Test Notifications"
            onClick={() => navigate('/test')}
          >
            <Send size={16} />
          </button>
        </div>
        
        {/* Collapsed Footer Settings */}
        <div className="sidebar-footer mt-auto">
          <button 
            className={`sidebar-icon-button ${location.pathname === '/settings' ? 'active' : ''}`} 
            title="Settings"
            onClick={() => navigate('/settings')}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="desktop-sidebar" 
      style={{ width }}
      data-testid="sidebar"
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-header-content">
          <span className="sidebar-header-title">BeepMyPhone</span>
          {onToggleCollapse && (
            <button 
              className="sidebar-collapse-button"
              onClick={onToggleCollapse}
              title="Collapse Sidebar"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="sidebar-navigation">
        <button 
          className={`sidebar-nav-button ${location.pathname === '/' ? 'active' : ''}`} 
          title="Dashboard"
          onClick={() => navigate('/')}
        >
          <div className="flex items-center space-x-3 w-full">
            <div className="sidebar-section-icon">
              <LayoutDashboard size={16} />
            </div>
            <span className="sidebar-section-title">Dashboard</span>
          </div>
        </button>
        
        <button 
          className={`sidebar-nav-button ${location.pathname === '/devices' ? 'active' : ''}`} 
          title="Connected Devices"
          onClick={() => navigate('/devices')}
        >
          <div className="flex items-center space-x-3 w-full">
            <div className="sidebar-section-icon">
              <Smartphone size={16} />
            </div>
            <span className="sidebar-section-title">Connected Devices</span>
          </div>
        </button>
        
        <button 
          className={`sidebar-nav-button ${location.pathname === '/notifications' ? 'active' : ''}`} 
          title="Notification History"
          onClick={() => navigate('/notifications')}
        >
          <div className="flex items-center space-x-3 w-full">
            <div className="sidebar-section-icon">
              <History size={16} />
            </div>
            <span className="sidebar-section-title">Notification History</span>
          </div>
        </button>
        
        <button 
          className={`sidebar-nav-button ${location.pathname === '/test' ? 'active' : ''}`} 
          title="Test Notifications"
          onClick={() => navigate('/test')}
        >
          <div className="flex items-center space-x-3 w-full">
            <div className="sidebar-section-icon">
              <Send size={16} />
            </div>
            <span className="sidebar-section-title">Test Notifications</span>
          </div>
        </button>
      </div>

      {/* Sidebar Sections */}
      <div className="sidebar-sections">
        {sections.map((section) => {
          const isSectionCollapsed = collapsedSections.has(section.id) || section.defaultCollapsed;
          
          return (
            <div key={section.id} className="sidebar-section">
              {/* Section Header */}
              <div 
                className="sidebar-section-header"
                onClick={() => section.isCollapsible && toggleSection(section.id)}
              >
                <div className="sidebar-section-header-content">
                  {section.isCollapsible && (
                    <div className="sidebar-section-chevron">
                      <ChevronRight 
                        size={12}
                        style={{
                          transform: isSectionCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </div>
                  )}
                  <div className="sidebar-section-icon">
                    {section.icon}
                  </div>
                  <span className="sidebar-section-title">{section.title}</span>
                </div>
              </div>

              {/* Section Content */}
              {!isSectionCollapsed && section.children && (
                <div className="sidebar-section-body">
                  {section.children}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fixed Settings Button */}
      <div className="sidebar-footer">
        <button 
          className={`sidebar-settings-button ${location.pathname === '/settings' ? 'active' : ''}`} 
          title="Settings"
          onClick={() => navigate('/settings')}
        >
          <div className="flex items-center space-x-3 w-full">
            <div className="sidebar-section-icon">
              <Settings size={16} />
            </div>
            <span className="sidebar-section-title">Settings</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
