import React from 'react';
import Sidebar from './Sidebar';

const SidebarDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-20 lg:ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Sidebar Demo
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Demo Cards */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Feature 1
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This is a demo card showing how the sidebar integrates with the main content.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Feature 2
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  The sidebar automatically adjusts the main content layout with proper margins.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Feature 3
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Hover over the sidebar to see the smooth expansion animation.
                </p>
              </div>
            </div>
            
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                How to Use
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  <strong>Hover Expansion:</strong> Simply hover over the sidebar to see it expand from 80px to 256px width.
                </p>
                <p>
                  <strong>Auto-collapse:</strong> The sidebar automatically collapses after 300ms when you move your mouse away.
                </p>
                <p>
                  <strong>Responsive:</strong> On mobile devices, the sidebar adapts to a horizontal layout.
                </p>
                <p>
                  <strong>Navigation:</strong> Click on any item to navigate or perform actions.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarDemo;
