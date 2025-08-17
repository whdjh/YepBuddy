"use client";

import Button from '@/components/common/Button';

interface BodyPartsSelectorProps {
  selectedBodyParts: string[];
  onToggleBodyPart: (bodyPart: string) => void;
}

const BODY_PARTS = [
  { value: 'chest', label: '가슴' },
  { value: 'back', label: '등' },
  { value: 'legs', label: '하체' },
  { value: 'arms', label: '팔' },
  { value: 'shoulders', label: '어깨' }
];

export default function BodyPartsSelector({ selectedBodyParts, onToggleBodyPart }: BodyPartsSelectorProps) {
  return (
    <div className="mb-6 flex flex-col gap-1">
      <label className="text-base font-medium text-white mb-3">오늘 운동 부위</label>
      <div className="flex gap-2 flex-wrap">
        {BODY_PARTS.map((part) => (
          <Button
            key={part.value}
            variant={selectedBodyParts.includes(part.value) ? "solid" : "outline"}
            onClick={() => onToggleBodyPart(part.value)}
            className="px-3 py-1.5 text-sm h-auto"
          >
            {part.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
