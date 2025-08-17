"use client";

import { useState } from 'react';

interface StatusOption {
  value: 'high' | 'medium' | 'low';
  label: string;
  color: string;
}

const statusOptions: StatusOption[] = [
  { value: 'high', label: '상', color: 'text-[#16a34a]' },
  { value: 'medium', label: '중', color: 'text-yellow-500' },
  { value: 'low', label: '하', color: 'text-red-500' }
];

export default function StatusCheckTab() {
  const [sleepStatus, setSleepStatus] = useState<'high' | 'medium' | 'low'>('medium');
  const [condition, setCondition] = useState<'high' | 'medium' | 'low'>('medium');
  const [activityLevel, setActivityLevel] = useState<'high' | 'medium' | 'low'>('medium');

  const StatusRadioGroup = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: 'high' | 'medium' | 'low'; 
    onChange: (value: 'high' | 'medium' | 'low') => void; 
    label: string; 
  }) => (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-white mb-4">{label}</h3>
      <div className="flex gap-6">
        {statusOptions.map((option) => (
          <label key={option.value} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value as 'high' | 'medium' | 'low')}
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
              value === option.value ? option.color : 'text-gray-400'
            }`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="text-white">
      <div className="space-y-6">
        <StatusRadioGroup
          label="숙면상태"
          value={sleepStatus}
          onChange={setSleepStatus}
        />
        
        <StatusRadioGroup
          label="컨디션"
          value={condition}
          onChange={setCondition}
        />
        
        <StatusRadioGroup
          label="활동강도"
          value={activityLevel}
          onChange={setActivityLevel}
        />
      </div>
    </div>
  );
}
