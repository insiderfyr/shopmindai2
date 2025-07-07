import { useEffect, useRef, useCallback } from 'react';
import { useRecoilSnapshot } from 'recoil';

/**
 * Hook personalizat pentru debugging LibreChat
 * Oferă funcționalități avansate de debugging și performance monitoring
 */
export const useLibreChatDebug = () => {
  const renderCountRef = useRef(0);
  const snapshot = useRecoilSnapshot();

  // Counter pentru re-renders
  useEffect(() => {
    renderCountRef.current += 1;
  });

  // Log Recoil state changes în development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('🔄 Recoil Snapshot:', snapshot.getLoadable);
    }
  }, [snapshot]);

  // Component performance tracker
  const trackPerformance = useCallback((componentName, operation) => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 16) { // Longer than 1 frame (60fps)
          console.warn(`🐌 Slow operation in ${componentName}: ${operation} took ${duration.toFixed(2)}ms`);
        } else {
          console.debug(`⚡ ${componentName}: ${operation} completed in ${duration.toFixed(2)}ms`);
        }
      };
    }
    return () => {}; // No-op în production
  }, []);

  // Memory usage tracker
  const trackMemory = useCallback(() => {
    if (process.env.NODE_ENV === 'development' && performance.memory) {
      const memory = performance.memory;
      console.debug('💾 Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    }
  }, []);

  // Component render tracker
  const logRender = useCallback((componentName, props = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`🎨 ${componentName} rendered (${renderCountRef.current}x)`, props);
    }
  }, []);

  // State change logger
  const logStateChange = useCallback((stateName, oldValue, newValue) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`📊 State change: ${stateName}`, {
        from: oldValue,
        to: newValue
      });
    }
  }, []);

  // API call tracker
  const trackApiCall = useCallback((endpoint, method = 'GET') => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      
      return (response) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.debug(`📡 API Call: ${method} ${endpoint}`, {
          duration: `${duration.toFixed(2)}ms`,
          status: response?.status,
          cached: duration < 10 // Probabil din cache dacă e foarte rapid
        });
      };
    }
    return () => {};
  }, []);

  return {
    renderCount: renderCountRef.current,
    trackPerformance,
    trackMemory,
    logRender,
    logStateChange,
    trackApiCall,
    // Utility functions
    highlightComponent: (selector) => {
      if (process.env.NODE_ENV === 'development') {
        const element = document.querySelector(selector);
        if (element) {
          element.style.outline = '2px solid #ff0000';
          element.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
          setTimeout(() => {
            element.style.outline = '';
            element.style.backgroundColor = '';
          }, 2000);
        }
      }
    },
    logComponentTree: () => {
      if (process.env.NODE_ENV === 'development' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.debug('🌳 React Component Tree available in DevTools');
      }
    }
  };
};

export default useLibreChatDebug;