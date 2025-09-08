import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToolCallsMapContextType {
  toolCallsMap: Record<string, any>;
  setToolCall: (id: string, toolCall: any) => void;
  getToolCall: (id: string) => any;
  removeToolCall: (id: string) => void;
  clearToolCalls: () => void;
}

const ToolCallsMapContext = createContext<ToolCallsMapContextType | undefined>(undefined);

interface ToolCallsMapProviderProps {
  children: ReactNode;
  conversationId?: string;
}

export const ToolCallsMapProvider: React.FC<ToolCallsMapProviderProps> = ({ 
  children, 
  conversationId 
}) => {
  const [toolCallsMap, setToolCallsMap] = useState<Record<string, any>>({});

  const setToolCall = useCallback((id: string, toolCall: any) => {
    setToolCallsMap(prev => ({
      ...prev,
      [id]: toolCall
    }));
  }, []);

  const getToolCall = useCallback((id: string) => {
    return toolCallsMap[id];
  }, [toolCallsMap]);

  const removeToolCall = useCallback((id: string) => {
    setToolCallsMap(prev => {
      const newMap = { ...prev };
      delete newMap[id];
      return newMap;
    });
  }, []);

  const clearToolCalls = useCallback(() => {
    setToolCallsMap({});
  }, []);

  const value: ToolCallsMapContextType = {
    toolCallsMap,
    setToolCall,
    getToolCall,
    removeToolCall,
    clearToolCalls,
  };

  return (
    <ToolCallsMapContext.Provider value={value}>
      {children}
    </ToolCallsMapContext.Provider>
  );
};

export const useToolCallsMapContext = (): ToolCallsMapContextType => {
  const context = useContext(ToolCallsMapContext);
  if (context === undefined) {
    throw new Error('useToolCallsMapContext must be used within a ToolCallsMapProvider');
  }
  return context;
};

export default ToolCallsMapProvider;
