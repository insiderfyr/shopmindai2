import React, { useState } from 'react';

const DiscountHunterButton = () => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30'
      }`}
      title="Find the best discounts and price drops"
    >
      <span className="hidden sm:inline">Deal Hunter</span>
      <span className="sm:hidden">Hunt</span>
    </button>
  );
};

export default DiscountHunterButton;
