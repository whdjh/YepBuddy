"use client";

import { useState } from 'react';
import BodyPartsSelector from './ExerciseDiaryTab/BodyPartsSelector';
import ExerciseControls from './ExerciseDiaryTab/ExerciseControls';
import ExerciseTable from './ExerciseDiaryTab/ExerciseTable';
import { Exercise, ExerciseData } from '@/types/Diary';

interface ExerciseDiaryTabProps {
  data?: ExerciseData;
  onChange?: (data: ExerciseData) => void;
}

const MAX_SETS = 10;

export default function ExerciseDiaryTab({ data, onChange }: ExerciseDiaryTabProps) {
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>(data?.selectedBodyParts || ['chest']);
  const [exercises, setExercises] = useState<Exercise[]>(data?.exercises || []);

  // TODO: 데이터 변경 시 부모 컴포넌트에 알림
  const handleDataChange = (newData: Partial<ExerciseData>) => {
    const updatedData = {
      selectedBodyParts,
      exercises,
      ...newData
    };
    onChange?.(updatedData);
  };

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: Array.from({ length: MAX_SETS }, () => ({ weight: '0', reps: '0' }))
    };
    const newExercises = [...exercises, newExercise];
    setExercises(newExercises);
    handleDataChange({ exercises: newExercises });
  };

  const handleUpdateExerciseName = (exerciseId: string, name: string) => {
    const newExercises = exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return { ...exercise, name };
      }
      return exercise;
    });
    setExercises(newExercises);
    handleDataChange({ exercises: newExercises });
  };

  const handleUpdateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    const newExercises = exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const newSets = [...exercise.sets];
        // Ensure the array is long enough to update the set
        while (newSets.length <= setIndex) {
          newSets.push({ weight: '0', reps: '0' });
        }
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...exercise, sets: newSets };
      }
      return exercise;
    });
    setExercises(newExercises);
    handleDataChange({ exercises: newExercises });
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleRemoveExercise = (exerciseId: string) => {
    const newExercises = exercises.filter(exercise => exercise.id !== exerciseId);
    setExercises(newExercises);
    handleDataChange({ exercises: newExercises });
  };

  const handleRemoveLastExercise = () => {
    if (exercises.length > 1) {
      handleRemoveExercise(exercises[exercises.length - 1].id);
    }
  };

  const handleToggleBodyPart = (bodyPart: string) => {
    const newSelectedBodyParts = selectedBodyParts.includes(bodyPart)
      ? (selectedBodyParts.length > 1 ? selectedBodyParts.filter(part => part !== bodyPart) : selectedBodyParts)
      : [...selectedBodyParts, bodyPart];
    
    setSelectedBodyParts(newSelectedBodyParts);
    handleDataChange({ selectedBodyParts: newSelectedBodyParts });
  };

  return (
    <div className="text-white">
      {/* 운동 부위 선택 */}
      <BodyPartsSelector
        selectedBodyParts={selectedBodyParts}
        onToggleBodyPart={handleToggleBodyPart}
      />

      {/* 운동 기록 */}
      <div className="mb-4">
        <ExerciseTable
          exercises={exercises}
          onAddExercise={handleAddExercise}
          onRemoveLastExercise={handleRemoveLastExercise}
          canRemove={exercises.length > 1}
          onUpdateExerciseName={handleUpdateExerciseName}
          onUpdateSet={handleUpdateSet}
          onInputFocus={handleInputFocus}
        />
      </div>
    </div>
  );
}
