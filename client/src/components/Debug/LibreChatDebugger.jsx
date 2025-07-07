import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

// LibreChat Debug Component
const LibreChatDebugger = () => {
  const [isDevToolsConnected, setIsDevToolsConnected] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  useEffect(() => {
    // Check if React DevTools is connected
    const checkDevTools = () => {
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        setIsDevToolsConnected(true);
        console.log('🚀 LibreChat: React DevTools connected!');
      }
    };

    checkDevTools();
    
    // Enable highlight updates by default in development
    if (process.env.NODE_ENV === 'development' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.settings.highlightUpdates = true;
    }

    // Keyboard shortcut to toggle debug panel (Ctrl/Cmd + Shift + D)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDebugPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Debug Status Indicator */}
      <div 
        className="fixed top-4 right-4 z-50 bg-green-500 text-white px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-green-600 transition-colors"
        onClick={() => setShowDebugPanel(!showDebugPanel)}
        title="Click to toggle debug panel (Ctrl/Cmd + Shift + D)"
      >
        {isDevToolsConnected ? '🔧 DevTools Connected' : '⚠️ DevTools Disconnected'}
      </div>

      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl z-50 max-w-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">🚀 LibreChat Debug</h3>
            <button 
              onClick={() => setShowDebugPanel(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>DevTools Status:</span>
              <span className={isDevToolsConnected ? 'text-green-400' : 'text-red-400'}>
                {isDevToolsConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="border-t border-gray-700 pt-2">
              <div className="font-semibold mb-2">Quick Actions:</div>
              <button 
                onClick={() => {
                  if (window.LibreChatDebug) {
                    window.LibreChatDebug.enableHighlightUpdates();
                  }
                }}
                className="block w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded mb-1"
              >
                Enable Highlight Updates
              </button>
              <button 
                onClick={() => {
                  if (window.LibreChatDebug) {
                    window.LibreChatDebug.disableHighlightUpdates();
                  }
                }}
                className="block w-full bg-red-600 hover:bg-red-700 px-2 py-1 rounded mb-1"
              >
                Disable Highlight Updates
              </button>
              <button 
                onClick={() => {
                  console.log('🔍 Available debug commands:');
                  console.log('LibreChatDebug.enableHighlightUpdates()');
                  console.log('LibreChatDebug.disableHighlightUpdates()');
                  console.log('LibreChatDebug.inspectComponent("selector")');
                }}
                className="block w-full bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded"
              >
                Show Console Commands
              </button>
            </div>
            
            <div className="border-t border-gray-700 pt-2 text-xs text-gray-400">
              Press Ctrl/Cmd + Shift + D to toggle this panel
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LibreChatDebugger;