import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, User } from 'lucide-react';
import { cn } from '~/utils';
import './Sidebar.css';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleHistory = () => {
    // Navigate to history or main page
    navigate('/');
  };

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-50 h-full w-16 border-r border-gray-200/50 bg-white/80 backdrop-blur-sm',
        'flex flex-col items-center gap-4 py-3',
        className,
      )}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-100 transition-all duration-200 hover:from-blue-100 hover:to-indigo-200 hover:border-blue-300/70 hover:shadow-md dark:border-blue-800/50 dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 dark:hover:border-blue-700/70">
          <span className="text-sm font-bold text-blue-600">S</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => navigate('/c/new')}
          className="group flex size-10 items-center justify-center rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-100 transition-all duration-200 hover:from-blue-100 hover:to-indigo-200 hover:border-blue-300/70 hover:shadow-md dark:border-blue-800/50 dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 dark:hover:border-blue-700/70"
        >
          <svg
            className="h-5 w-5 text-blue-600 group-hover:text-blue-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <span className="text-2xs font-medium text-gray-500">New</span>
      </div>

      {/* History */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleHistory}
          className="group flex size-10 items-center justify-center rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-100 transition-all duration-200 hover:from-blue-100 hover:to-indigo-200 hover:border-blue-300/70 hover:shadow-md dark:border-blue-800/50 dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 dark:hover:border-blue-700/70"
        >
          <History className="h-5 w-5 text-blue-600 group-hover:text-blue-800" />
        </button>
        <span className="text-2xs font-medium text-gray-500">History</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <div className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-100 transition-all duration-200 hover:from-blue-100 hover:to-indigo-200 hover:border-blue-300/70 hover:shadow-md dark:border-blue-800/50 dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 dark:hover:border-blue-700/70">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          {/* Online status indicator */}
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
        </div>
        <span className="text-2xs font-medium text-gray-500">Cont</span>
      </div>
    </div>
  );
};

export default Sidebar;
