"use client";

import { memo, forwardRef } from 'react';

interface SimpleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const SimpleInput = memo(forwardRef<HTMLInputElement, SimpleInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`px-2 py-1 text-xs border border-gray-700 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none bg-transparent ${className}`}
        {...props}
      />
    );
  }
));

SimpleInput.displayName = 'SimpleInput';

export default SimpleInput;
