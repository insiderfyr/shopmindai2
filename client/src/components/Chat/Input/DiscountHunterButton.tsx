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
      className={`flex items-center px-2.5 py-2 sm:px-3 text-sm rounded-lg border transition-all duration-300 ease-in-out transform ${
        isActive
          ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-lg hover:bg-[#2563eb] hover:border-[#2563eb] scale-105'
          : 'bg-white text-[#3b82f6] border-[#3b82f6] hover:bg-blue-50 hover:border-[#2563eb] hover:text-[#2563eb]'
      }`}
      title="Find the best discounts and price drops"
    >
      <span className="hidden sm:inline">Discount Hunter</span>
      <span className="sm:hidden">Hunt</span>
    </button>
  );
};

export default DiscountHunterButton;
