"use client";

import { forwardRef, memo } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full h-[50px] px-4 py-3 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none bg-transparent resize-none ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default memo(Textarea);
