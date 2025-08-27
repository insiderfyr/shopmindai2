import React, { useState, useCallback } from 'react';
import { 
  Home, 
  Search, 
  FolderOpen, 
  User, 
  RefreshCw, 
  Download,
  Plus,
  Sparkles
} from 'lucide-react';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface SidebarItem {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  isActive?: boolean;
  hasNotification?: boolean;
  notificationColor?: 'blue' | 'red';
  onClick?: () => void;
}

interface SidebarProps {
  className?: string;
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  activeItem = 'home',
  onItemClick 
}) => {
  const localize = useLocalize();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleItemClick = useCallback((itemId: string) => {
    onItemClick?.(itemId);
  }, [onItemClick]);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'logo',
      icon: Sparkles,
      label: 'ShopMindAI',
      onClick: () => handleItemClick('logo')
    },
    {
      id: 'add',
      icon: Plus,
      label: 'Adaugă',
      onClick: () => handleItemClick('add')
    },
    {
      id: 'home',
      icon: Home,
      label: 'Acasă',
      isActive: activeItem === 'home',
      onClick: () => handleItemClick('home')
    },
    {
      id: 'discover',
      icon: Search,
      label: 'Descoperă',
      isActive: activeItem === 'discover',
      onClick: () => handleItemClick('discover')
    },
    {
      id: 'spaces',
      icon: FolderOpen,
      label: 'Spații',
      isActive: activeItem === 'spaces',
      onClick: () => handleItemClick('spaces')
    },
    {
      id: 'account',
      icon: User,
      label: 'Cont',
      isActive: activeItem === 'account',
      hasNotification: true,
      notificationColor: 'blue',
      onClick: () => handleItemClick('account')
    },
    {
      id: 'update',
      icon: RefreshCw,
      label: 'Actualizare',
      onClick: () => handleItemClick('update')
    },
    {
      id: 'install',
      icon: Download,
      label: 'Instalare',
      hasNotification: true,
      notificationColor: 'red',
      onClick: () => handleItemClick('install')
    }
  ];

  const renderSidebarItem = (item: SidebarItem) => {
    const IconComponent = item.icon;
    const isHovered = hoveredItem === item.id;
    const showLabel = isExpanded || isHovered;

    return (
      <div
        key={item.id}
        className="relative"
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        {/* Active indicator dot */}
        {item.isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1.5 bg-blue-500 rounded-full" />
        )}

        {/* Notification badge */}
        {item.hasNotification && (
          <div className={cn(
            "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full",
            item.notificationColor === 'blue' ? 'bg-blue-500' : 'bg-red-500'
          )} />
        )}

        <button
          onClick={item.onClick}
          className={cn(
            "group relative w-full flex items-center justify-center h-12 rounded-xl transition-all duration-200 ease-in-out",
            "hover:bg-gray-200/80 dark:hover:bg-gray-700/80",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2",
            item.isActive && "bg-blue-50 dark:bg-blue-900/20",
            item.id === 'logo' && "mb-6 h-16"
          )}
          style={{
            paddingLeft: item.isActive ? '1.5rem' : '1rem',
            paddingRight: '1rem'
          }}
        >
          <div className={cn(
            "flex items-center transition-all duration-200",
            showLabel ? "w-full justify-start gap-3" : "w-full justify-center"
          )}>
            <IconComponent 
              size={item.id === 'logo' ? 32 : 20} 
              className={cn(
                "transition-all duration-200",
                item.isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-600 dark:text-gray-400",
                item.id === 'logo' && "text-blue-500 dark:text-blue-400"
              )}
            />
            
            {showLabel && (
              <span className={cn(
                "text-sm font-medium transition-all duration-200",
                item.isActive 
                  ? "text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300",
                item.id === 'logo' && "text-lg font-bold text-blue-600 dark:text-blue-400"
              )}>
                {item.label}
              </span>
            )}
          </div>
        </button>

        {/* Tooltip for collapsed state */}
        {!isExpanded && !isHovered && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700",
        "transition-all duration-300 ease-in-out z-40",
        isExpanded ? "w-64" : "w-20",
        className
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Sidebar content */}
      <div className="flex flex-col h-full p-3">
        {/* Logo section */}
        <div className="flex-1">
          {sidebarItems.slice(0, 2).map(renderSidebarItem)}
        </div>

        {/* Navigation items */}
        <div className="flex-1 space-y-1">
          {sidebarItems.slice(2, 6).map(renderSidebarItem)}
        </div>

        {/* Bottom section */}
        <div className="flex-1 flex flex-col justify-end space-y-1">
          {sidebarItems.slice(6).map(renderSidebarItem)}
        </div>
      </div>

      {/* Mobile overlay */}
      <div className="lg:hidden absolute inset-0 bg-black/20" />
    </div>
  );
};

export default Sidebar;
