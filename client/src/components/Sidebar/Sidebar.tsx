import React, { useState, useRef, useEffect } from 'react';
import { cn } from '~/utils';
import './Sidebar.css';
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  User, 
  Search,
  ChevronRight,
  Home,
  Bookmark,
  FileText,
  Zap
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: number;
  isActive?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  


  // Auto-expand on hover, auto-collapse after delay
  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsExpanded(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 300); // Delay before collapsing
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Sidebar navigation items
  const sidebarItems: SidebarItem[] = [
    {
      id: 'home',
      icon: <Home size={20} />,
      label: 'Home',
      href: '/',
      isActive: true
    },
    {
      id: 'new-chat',
      icon: <Plus size={20} />,
      label: 'New Chat',
      onClick: () => {
        // Handle new chat creation
        console.log('New chat clicked');
      }
    },
    {
      id: 'conversations',
      icon: <MessageSquare size={20} />,
      label: 'Conversations',
      badge: 0, // Will be updated when conversation system is integrated
      isActive: false
    },
    {
      id: 'bookmarks',
      icon: <Bookmark size={20} />,
      label: 'Bookmarks',
      badge: 0,
      isActive: false
    },
    {
      id: 'files',
      icon: <FileText size={20} />,
      label: 'Files',
      badge: 0,
      isActive: false
    },
    {
      id: 'tools',
      icon: <Zap size={20} />,
      label: 'Tools',
      isActive: false
    }
  ];

  // Bottom sidebar items
  const bottomItems: SidebarItem[] = [
    {
      id: 'search',
      icon: <Search size={20} />,
      label: 'Search',
      isActive: false
    },
    {
      id: 'settings',
      icon: <Settings size={20} />,
      label: 'Settings',
      isActive: false
    },
    {
      id: 'profile',
      icon: <User size={20} />,
      label: 'Profile',
      isActive: false
    }
  ];

  const renderSidebarItem = (item: SidebarItem) => (
    <div
      key={item.id}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ease-in-out sidebar-item',
        'hover:bg-white/60 hover:shadow-sm',
        'dark:hover:bg-gray-700/60',
        item.isActive && 'bg-white/80 shadow-sm dark:bg-gray-700/80 active',
        isExpanded ? 'justify-start' : 'justify-center'
      )}
      onClick={item.onClick}
    >
      {/* Icon */}
      <div className={cn(
        'flex items-center justify-center transition-all duration-200 sidebar-icon',
        item.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400',
        'group-hover:text-blue-600 dark:group-hover:text-blue-400'
      )}>
        {item.icon}
      </div>

      {/* Label and Badge */}
      {isExpanded && (
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className={cn(
            'text-sm font-medium transition-all duration-200 sidebar-text',
            item.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300',
            'group-hover:text-gray-900 dark:group-hover:text-white'
          )}>
            {item.label}
          </span>
          
          {/* Badge */}
          {item.badge !== undefined && item.badge > 0 && (
            <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full sidebar-badge">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </div>
      )}

      {/* Active indicator */}
      {item.isActive && (
        <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </div>
  );

  return (
    <div
      ref={sidebarRef}
      className={cn(
        'fixed left-0 top-0 h-full bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
        'transition-all duration-300 ease-in-out z-50 shadow-sm sidebar-container',
        isExpanded ? 'w-64 sidebar-expanded' : 'w-20',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center px-3 py-4 border-b border-gray-200 dark:border-gray-700',
        isExpanded ? 'justify-between' : 'justify-center'
      )}>
        {isExpanded && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center sidebar-logo">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ShopMind
            </span>
          </div>
        )}
        
        <div className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-gray-700 shadow-sm',
          'transition-all duration-200',
          isExpanded ? 'opacity-100' : 'opacity-0'
        )}>
          <ChevronRight 
            size={16} 
            className={cn(
              'text-gray-500 dark:text-gray-400 transition-transform duration-200',
              isExpanded ? 'rotate-180' : 'rotate-0'
            )} 
          />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {sidebarItems.map(renderSidebarItem)}
      </nav>

      {/* Bottom Items */}
      <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {bottomItems.map(renderSidebarItem)}
      </div>

      {/* Expand Indicator */}
      {!isExpanded && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-16 bg-blue-500 rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 sidebar-expand-indicator" />
      )}
    </div>
  );
};

export default Sidebar;
