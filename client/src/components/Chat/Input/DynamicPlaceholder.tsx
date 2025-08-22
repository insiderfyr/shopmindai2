import React, { useState, useEffect } from 'react';
import { cn } from '~/utils';

const simpleEcommerceMessages = [
  "What are you looking for today?",
  "Describe your perfect product",
  "I can help you find anything",
  "Tell me your shopping needs",
  "What's your style preference?",
  "Looking for gifts or personal items?",
  "I'll find the best deals for you",
  "What's your budget range?",
  "Let me discover products you'll love",
  "I'm your personal shopping assistant"
];

interface DynamicPlaceholderProps {
  className?: string;
}

const DynamicPlaceholder: React.FC<DynamicPlaceholderProps> = ({ className }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => 
          (prevIndex + 1) % simpleEcommerceMessages.length
        );
        setIsVisible(true);
      }, 300); // Fade out duration
    }, 4000); // Change message every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4",
      "border border-gray-200 dark:border-gray-600",
      "shadow-sm",
      className
    )}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-indigo-100/20 to-purple-100/20 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 animate-pulse" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
          <div className="flex-1">
            <p className={cn(
              "text-gray-700 dark:text-gray-200 font-medium transition-all duration-300 ease-in-out",
              isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-2"
            )}>
              {simpleEcommerceMessages[currentMessageIndex]}
            </p>
          </div>
        </div>
        
        {/* Typewriter cursor effect */}
        <div className="mt-2 flex items-center space-x-1">
          <div className="w-1 h-4 bg-blue-500 rounded animate-pulse" />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            AI Shopping Assistant
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPlaceholder;
