import React from 'react';

const DiscountHunterButton = () => {
  return (
    <button
      type="button"
      className="flex items-center px-2.5 py-2 sm:px-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
      title="Find the best discounts and price drops"
    >
      <span className="hidden sm:inline">Discount Hunter</span>
      <span className="sm:hidden">Hunt</span>
    </button>
  );
};

export default DiscountHunterButton;
