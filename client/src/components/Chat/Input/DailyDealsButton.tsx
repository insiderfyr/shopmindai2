import React from 'react';

const DailyDealsButton = () => {
  return (
    <button
      type="button"
      className="flex items-center px-2 py-1.5 sm:px-2.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
      title="Discover today's best deals and offers"
    >
      <span className="hidden sm:inline">Daily Deals</span>
      <span className="sm:hidden">Deals</span>
    </button>
  );
};

export default DailyDealsButton;
