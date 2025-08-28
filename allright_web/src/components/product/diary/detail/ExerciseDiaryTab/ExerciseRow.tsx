"use client";

import { memo } from 'react';
import { Exercise } from '@/types/Exercise';

interface ExerciseRowProps {
  exercise: Exercise;
  maxSets: number;
  onUpdateExerciseName: (exerciseId: string, name: string) => void;
  onUpdateSet: (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => void;
  onInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const ExerciseRow = memo(({ 
  exercise, 
  maxSets, 
  onUpdateExerciseName, 
  onUpdateSet, 
  onInputFocus 
}: ExerciseRowProps) => {
  return (
    <div className="flex border-b border-gray-700 last:border-b-0">
      {/* 운동종목 입력 */}
      <div className="w-32 px-3 py-2 flex-shrink-0 border-r border-gray-700">
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => onUpdateExerciseName(exercise.id, e.target.value)}
          placeholder="운동명 입력"
          className="w-full px-2 py-1 text-xs border border-gray-700 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none"
        />
      </div>
      
      {/* 세트별 무게/횟수 입력 */}
      {Array.from({ length: maxSets }, (_, i) => i).map((index) => (
        <div key={index} className="w-20 px-1 py-2 flex-shrink-0 border-r border-gray-700">
          <div className="flex gap-1">
            <input
              type="text"
              placeholder="무게"
              value={exercise.sets[index]?.weight ?? '0'}
              onChange={(e) => onUpdateSet(exercise.id, index, 'weight', e.target.value)}
              onFocus={onInputFocus}
              className="w-8 px-1 py-1 text-xs border border-gray-700 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none"
            />
            <input
              type="text"
              placeholder="횟수"
              value={exercise.sets[index]?.reps ?? '0'}
              onChange={(e) => onUpdateSet(exercise.id, index, 'reps', e.target.value)}
              onFocus={onInputFocus}
              className="w-8 px-1 py-1 text-xs border border-gray-700 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
});

ExerciseRow.displayName = 'ExerciseRow';

export default ExerciseRow;
