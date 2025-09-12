// client/src/components/StoresDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';

interface Store {
  id: string;
  name: string;
  initials: string;
  color: string;
  bgColor: string;
  url?: string;
}

const STORES: Store[] = [
  { id: 'alibaba', name: 'Alibaba', initials: 'AL', color: 'text-orange-600', bgColor: 'bg-orange-100', url: 'https://alibaba.com' },
  { id: 'amazon', name: 'Amazon', initials: 'AM', color: 'text-yellow-600', bgColor: 'bg-yellow-100', url: 'https://amazon.com' },
  { id: 'asos', name: 'ASOS', initials: 'AS', color: 'text-black', bgColor: 'bg-gray-100', url: 'https://asos.com' },
  { id: 'ebay', name: 'eBay', initials: 'EB', color: 'text-blue-600', bgColor: 'bg-blue-100', url: 'https://ebay.com' },
  { id: 'etsy', name: 'Etsy', initials: 'ET', color: 'text-orange-500', bgColor: 'bg-orange-50', url: 'https://etsy.com' },
  { id: 'flipkart', name: 'Flipkart', initials: 'FK', color: 'text-blue-500', bgColor: 'bg-blue-50', url: 'https://flipkart.com' },
  { id: 'rakuten', name: 'Rakuten', initials: 'RK', color: 'text-red-600', bgColor: 'bg-red-100', url: 'https://rakuten.com' },
  { id: 'shopify', name: 'Shopify', initials: 'SH', color: 'text-green-600', bgColor: 'bg-green-100', url: 'https://shopify.com' },
  { id: 'target', name: 'Target', initials: 'TG', color: 'text-red-500', bgColor: 'bg-red-50', url: 'https://target.com' },
  { id: 'walmart', name: 'Walmart', initials: 'WM', color: 'text-blue-700', bgColor: 'bg-blue-50', url: 'https://walmart.com' },
];

// Store Icon SVG Component
const StoreIcon: React.FC = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m-6 4h6"
    />
  </svg>
);

interface StoresDropdownProps {
  onStoreSelect?: (store: Store) => void;
  className?: string;
}

const StoresDropdown: React.FC<StoresDropdownProps> = ({ 
  onStoreSelect,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => (prev < STORES.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : STORES.length - 1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0) {
          handleStoreSelect(STORES[focusedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
    }
  };

  const handleStoreSelect = (store: Store) => {
    onStoreSelect?.(store);
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(0);
    } else {
      setFocusedIndex(-1);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select store"
      >
        <StoreIcon />
        <span>Stores</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
          role="listbox"
          aria-label="Store options"
        >
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              Popular Stores
            </div>
            {STORES.map((store, index) => (
              <button
                key={store.id}
                onClick={() => handleStoreSelect(store)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors duration-150 ${
                  focusedIndex === index ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
                role="option"
                aria-selected={focusedIndex === index}
              >
                {/* Store Initial Circle */}
                <div className={`flex-shrink-0 w-8 h-8 ${store.bgColor} rounded-full flex items-center justify-center`}>
                  <span className={`text-xs font-bold ${store.color}`}>
                    {store.initials}
                  </span>
                </div>
                
                {/* Store Name */}
                <div className="flex-1">
                  <div className="font-medium">{store.name}</div>
                </div>

                {/* External Link Icon */}
                <svg 
                  className="w-4 h-4 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresDropdown;
