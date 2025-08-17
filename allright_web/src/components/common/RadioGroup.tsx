"use client";

import { memo } from 'react';

interface RadioOption {
  value: string;
  label: string;
  color?: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  className?: string;
}

const RadioGroup = memo(({ 
  options, 
  value, 
  onChange, 
  name, 
  label,
  className = "" 
}: RadioGroupProps) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-lg font-medium text-white mb-4">{label}</label>
      )}
      <div className="flex gap-6">
        {options.map((option) => (
          <label key={option.value} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
              value === option.value
                ? 'border-[#16a34a]'
                : 'border-gray-500'
            }`}>
              {value === option.value && (
                <div className="w-2 h-2 bg-[#16a34a] rounded-full"></div>
              )}
            </div>
            <span className={`text-base font-medium transition-colors ${
              value === option.value 
                ? (option.color || 'text-[#16a34a]') 
                : 'text-gray-400'
            }`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
