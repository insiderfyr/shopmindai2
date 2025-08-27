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
    <div className={cn(
      'fixed left-0 top-0 z-50 h-full w-18 bg-white/80 backdrop-blur-sm border-r border-gray-200/50',
      'flex flex-col items-center py-4 gap-6',
      className
    )}>
      {/* Logo */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer">
          <span className="text-white font-bold text-lg">S</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => navigate('/c/new')}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center hover:scale-105 active:scale-[0.97] transition-all duration-300 group"
        >
          <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <span className="text-2xs text-gray-500 font-medium">New</span>
      </div>

      {/* History */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleHistory}
          className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center hover:scale-105 active:scale-[0.97] transition-all duration-300 group"
        >
          <History className="w-5 h-5 text-blue-600 group-hover:text-blue-800" />
        </button>
        <span className="text-2xs text-gray-500 font-medium">History</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity duration-200 cursor-pointer">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          {/* Online status indicator */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <span className="text-2xs text-gray-500 font-medium">Cont</span>
      </div>
    </div>
  );
};

export default Sidebar;
