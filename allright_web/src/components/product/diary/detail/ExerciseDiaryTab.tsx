"use client";

import { useState } from 'react';
import Button from '@/components/common/Button';

interface Exercise {
  id: string;
  name: string;
  sets: Array<{
    weight: string;
    reps: string;
  }>;
}

const BODY_PARTS = [
  { value: 'chest', label: '가슴' },
  { value: 'back', label: '등' },
  { value: 'legs', label: '하체' },
  { value: 'arms', label: '팔' },
  { value: 'shoulders', label: '어깨' }
];

const MAX_SETS = 10;

export default function ExerciseDiaryTab() {
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>(['chest']);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: Array.from({ length: 10 }, () => ({ weight: '0', reps: '0' }))
    };
    setExercises([...exercises, newExercise]);
  };

  const handleUpdateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return { ...exercise, name };
      }
      return exercise;
    }));
  };

  const handleUpdateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const newSets = [...exercise.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...exercise, sets: newSets };
      }
      return exercise;
    }));
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== exerciseId));
  };

  const handleRemoveLastExercise = () => {
    if (exercises.length > 1) {
      handleRemoveExercise(exercises[exercises.length - 1].id);
    }
  };

  const handleToggleBodyPart = (bodyPart: string) => {
    setSelectedBodyParts(prev => {
      if (prev.includes(bodyPart)) {
        // 이미 선택된 경우 제거 (단, 최소 1개는 유지)
        if (prev.length > 1) {
          return prev.filter(part => part !== bodyPart);
        }
        return prev;
      } else {
        // 선택되지 않은 경우 추가
        return [...prev, bodyPart];
      }
    });
  };

  return (
    <div className="text-white">
      {/* 운동 부위 표시 */}
      <div className="mb-6 flex flex-col gap-1">
        <label className="text-base font-medium text-white mb-3">오늘 운동 부위</label>
        <div className="flex gap-2 flex-wrap">
          {BODY_PARTS.map((part) => (
            <Button
              key={part.value}
              variant={selectedBodyParts.includes(part.value) ? "solid" : "outline"}
              onClick={() => handleToggleBodyPart(part.value)}
              className="px-3 py-1.5 text-sm h-auto"
            >
              {part.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 운동 기록 테이블 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <label className="text-base font-medium text-white">운동기록</label>
          <div className="flex gap-2">
            <Button
              variant="solid"
              onClick={handleAddExercise}
              className="px-2 text-sm h-[2rem]"
            >
              운동 추가
            </Button>
            <Button
              variant="outline"
              onClick={handleRemoveLastExercise}
              disabled={exercises.length <= 1}
              className="px-2 text-sm h-[2rem]"
            >
              운동 삭제
            </Button> 
          </div>
        </div>

        <div className="border border-gray-700 rounded-lg overflow-hidden max-w-[940px]">
          <div className="overflow-x-auto hide-scrollbar">
            {/* 헤더 */}
            <div className="flex">
              <div className="w-32 py-2 text-center text-xs font-medium text-gray-300 flex-shrink-0 border-r border-gray-600 flex items-center justify-center">
                운동종목
              </div>
              {Array.from({ length: MAX_SETS }, (_, i) => i + 1).map((setNum) => (
                <div key={setNum} className="w-20 px-1 py-2 text-center text-xs font-medium text-gray-300 flex-shrink-0 border-b border-gray-700 border-r">
                  {setNum}세트
                </div>
              ))}
            </div>
            
            {/* 서브헤더 */}
            <div className="flex">
              <div className="w-32 px-3 py-1 flex-shrink-0 border-r border-gray-600 border-b"></div>
              {Array.from({ length: MAX_SETS }, (_, i) => i + 1).map((setNum) => (
                <div key={setNum} className="w-20 px-1 py-1 text-center text-xs font-medium text-gray-300 flex-shrink-0 border-b border-gray-700 border-r">
                  <div className="flex gap-1">
                    <span className="w-8">무게</span>
                    <span className="w-8">횟수</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 운동 목록 */}
            {exercises.map((exercise) => (
              <div key={exercise.id} className="flex border-b border-gray-700 last:border-b-0">
                {/* 운동종목 입력 */}
                <div className="w-32 px-3 py-2 flex-shrink-0 border-r border-gray-600">
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => handleUpdateExerciseName(exercise.id, e.target.value)}
                    placeholder="운동명 입력"
                    className="w-full px-2 py-1 text-xs border border-gray-600 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none"
                  />
                </div>
                
                {/* 세트별 무게/횟수 입력 */}
                {Array.from({ length: MAX_SETS }, (_, i) => i).map((index) => (
                  <div key={index} className="w-20 px-1 py-2 flex-shrink-0 border-r border-gray-700">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="무게"
                        value={exercise.sets[index]?.weight || '0'}
                        onChange={(e) => handleUpdateSet(exercise.id, index, 'weight', e.target.value)}
                        className="w-8 px-1 py-1 text-xs border border-gray-600 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="횟수"
                        value={exercise.sets[index]?.reps || '0'}
                        onChange={(e) => handleUpdateSet(exercise.id, index, 'reps', e.target.value)}
                        className="w-8 px-1 py-1 text-xs border border-gray-600 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
