"use client";

import { useState } from 'react';

interface StatusOption {
  value: 'high' | 'medium' | 'low';
  label: string;
  color: string;
}

interface StatusData {
  sleepStatus: 'high' | 'medium' | 'low';
  condition: 'high' | 'medium' | 'low';
  activityLevel: 'high' | 'medium' | 'low';
}

interface StatusCheckTabProps {
  data?: StatusData;
  onChange?: (data: StatusData) => void;
}

const statusOptions: StatusOption[] = [
  { value: 'high', label: '상', color: 'text-[#16a34a]' },
  { value: 'medium', label: '중', color: 'text-yellow-500' },
  { value: 'low', label: '하', color: 'text-red-500' }
];

export default function StatusCheckTab({ data, onChange }: StatusCheckTabProps) {
  const [sleepStatus, setSleepStatus] = useState<'high' | 'medium' | 'low'>(data?.sleepStatus || 'medium');
  const [condition, setCondition] = useState<'high' | 'medium' | 'low'>(data?.condition || 'medium');
  const [activityLevel, setActivityLevel] = useState<'high' | 'medium' | 'low'>(data?.activityLevel || 'medium');

  const handleUpdateData = (newData: Partial<StatusData>) => {
    const updatedData = {
      sleepStatus,
      condition,
      activityLevel,
      ...newData
    };
    onChange?.(updatedData);
  };

  const StatusRadioGroup = ({
    value,
    onChange: handleChange,
    label,
    field
  }: {
    value: 'high' | 'medium' | 'low';
    onChange: (value: 'high' | 'medium' | 'low') => void;
    label: string;
    field: keyof StatusData;
  }) => (
    <div className="mb-8 flex flex-col gap-1">
      <label className="text-lg font-medium text-white mb-4">{label}</label>
      <div className="flex gap-6">
        {statusOptions.map((option) => (
          <label key={option.value} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => {
                const newValue = e.target.value as 'high' | 'medium' | 'low';
                handleChange(newValue);
                handleUpdateData({ [field]: newValue });
              }}
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
          field="sleepStatus"
        />

        <StatusRadioGroup
          label="컨디션"
          value={condition}
          onChange={setCondition}
          field="condition"
        />

        <StatusRadioGroup
          label="활동강도"
          value={activityLevel}
          onChange={setActivityLevel}
          field="activityLevel"
        />
      </div>
    </div>
  );
}
