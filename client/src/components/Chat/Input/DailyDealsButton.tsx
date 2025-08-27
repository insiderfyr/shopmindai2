import React, { useState } from 'react';

const DailyDealsButton = () => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center px-2.5 py-2 sm:px-3 text-sm rounded-lg border transition-all duration-300 ease-in-out transform ${
        isActive
          ? 'bg-blue-600 text-white border-blue-600 shadow-lg hover:bg-blue-700 hover:border-blue-700 scale-105'
          : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
      }`}
      title="Discover today's best deals and offers"
    >
      <span className="hidden sm:inline">Daily Deals</span>
      <span className="sm:hidden">Deals</span>
    </button>
  );
};

export default DailyDealsButton;
