"use client";

import { useState } from 'react';
import RadioGroup from '@/components/common/RadioGroup';

interface StatusData {
  sleepStatus: 'high' | 'medium' | 'low';
  condition: 'high' | 'medium' | 'low';
  activityLevel: 'high' | 'medium' | 'low';
}

interface StatusCheckTabProps {
  data?: StatusData;
  onChange?: (data: StatusData) => void;
}

const statusOptions = [
  { value: 'high', label: '상', color: 'text-[#16a34a]' },
  { value: 'medium', label: '중', color: 'text-yellow-500' },
  { value: 'low', label: '하', color: 'text-red-500' }
];

const statusFields = [
  { key: 'sleepStatus' as const, label: '숙면상태', name: 'sleepStatus' },
  { key: 'condition' as const, label: '컨디션', name: 'condition' },
  { key: 'activityLevel' as const, label: '활동강도', name: 'activityLevel' }
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

  const handleStatusChange = (field: keyof StatusData, value: string) => {
    const newValue = value as 'high' | 'medium' | 'low';
    
    // 상태 업데이트
    switch (field) {
      case 'sleepStatus':
        setSleepStatus(newValue);
        break;
      case 'condition':
        setCondition(newValue);
        break;
      case 'activityLevel':
        setActivityLevel(newValue);
        break;
    }
    
    // 부모 컴포넌트에 알림
    handleUpdateData({ [field]: newValue });
  };

  const getStatusValue = (field: keyof StatusData) => {
    switch (field) {
      case 'sleepStatus':
        return sleepStatus;
      case 'condition':
        return condition;
      case 'activityLevel':
        return activityLevel;
    }
  };

  return (
    <div className="text-white">
      <div className="space-y-6">
        {statusFields.map((field) => (
          <RadioGroup
            key={field.key}
            label={field.label}
            options={statusOptions}
            value={getStatusValue(field.key)}
            onChange={(value) => handleStatusChange(field.key, value)}
            name={field.name}
            className="mb-8"
          />
        ))}
      </div>
    </div>
  );
}
