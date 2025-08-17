"use client";

import { memo } from 'react';
import ExerciseTableHeader from './ExerciseTableHeader';
import ExerciseRow from './ExerciseRow';

interface Exercise {
  id: string;
  name: string;
  sets: Array<{
    weight: string;
    reps: string;
  }>;
}

interface ExerciseTableProps {
  exercises: Exercise[];
  onUpdateExerciseName: (exerciseId: string, name: string) => void;
  onUpdateSet: (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => void;
  onInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const MAX_SETS = 10;

const ExerciseTable = memo(({ 
  exercises, 
  onUpdateExerciseName, 
  onUpdateSet, 
  onInputFocus 
}: ExerciseTableProps) => {
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden max-w-[940px]">
      <div className="overflow-x-auto hide-scrollbar">
        <ExerciseTableHeader maxSets={MAX_SETS} />

        {/* 운동 목록 */}
        {exercises.map((exercise) => (
          <ExerciseRow
            key={exercise.id}
            exercise={exercise}
            maxSets={MAX_SETS}
            onUpdateExerciseName={onUpdateExerciseName}
            onUpdateSet={onUpdateSet}
            onInputFocus={onInputFocus}
          />
        ))}
      </div>
    </div>
  );
});

ExerciseTable.displayName = 'ExerciseTable';

export default ExerciseTable;
