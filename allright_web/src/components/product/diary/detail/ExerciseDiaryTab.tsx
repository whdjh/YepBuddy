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

const bodyParts = [
  { value: 'chest', label: '가슴' },
  { value: 'back', label: '등' },
  { value: 'legs', label: '하체' },
  { value: 'arms', label: '팔' },
  { value: 'shoulders', label: '어깨' }
];

export default function ExerciseDiaryTab() {
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>(['chest']);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: [
        { weight: '', reps: '' },
        { weight: '', reps: '' }
      ]
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return { ...exercise, name };
      }
      return exercise;
    }));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const newSets = [...exercise.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...exercise, sets: newSets };
      }
      return exercise;
    }));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId && exercise.sets.length < 10) {
        return {
          ...exercise,
          sets: [...exercise.sets, { weight: '', reps: '' }]
        };
      }
      return exercise;
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== exerciseId));
  };

  const handleRemoveExercise = () => {
    if (exercises.length > 1) {
      removeExercise(exercises[exercises.length - 1].id);
    }
  };

  const toggleBodyPart = (bodyPart: string) => {
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

  // 최대 세트 수 계산
  const maxSets = Math.max(...exercises.map(exercise => exercise.sets.length), 2);

  return (
    <div className="text-white">
      {/* 운동 부위 표시 */}
      <div className="mb-6 flex flex-col gap-1">
        <label className="text-base font-medium text-white mb-3">오늘 운동 부위</label>
        <div className="flex gap-2 flex-wrap">
          {bodyParts.map((part) => (
            <button
              key={part.value}
              onClick={() => toggleBodyPart(part.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${
                selectedBodyParts.includes(part.value)
                  ? 'border-[#16a34a] text-[#16a34a] bg-[#16a34a]/10'
                  : 'border-gray-600 text-gray-400'
              }`}
            >
              {part.label}
            </button>
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
              onClick={addExercise}
              className="px-2 text-sm h-[2rem]"
            >
              운동 추가
            </Button>
            <Button
              variant="outline"
              onClick={handleRemoveExercise}
              disabled={exercises.length <= 1}
              className="px-2 text-sm h-[2rem]"
            >
              운동 삭제
            </Button> 
          </div>
        </div>

        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full" style={{ minWidth: 'max-content' }}>
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 w-30">운동종목</th>
                  {Array.from({ length: maxSets }, (_, i) => i + 1).map((setNum) => (
                    <th key={setNum} className="w-10 px-1 py-2 text-center text-xs font-medium text-gray-300">
                      {setNum}세트
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => (
                  <tr key={exercise.id} className="border-b border-gray-700 last:border-b-0">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                        placeholder="운동명 입력"
                        className="w-full px-2 py-1 text-xs border border-gray-600 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none bg-transparent"
                      />
                    </td>
                    {Array.from({ length: maxSets }, (_, i) => i).map((index) => (
                      <td key={index} className="px-1 py-2">
                        {index < exercise.sets.length ? (
                          <div className="flex flex-row gap-1 w-20">
                            <input
                              type="text"
                              placeholder="무게"
                              value={exercise.sets[index].weight}
                              onChange={(e) => updateSet(exercise.id, index, 'weight', e.target.value)}
                              className="w-full px-1 py-1 text-xs border border-gray-600 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none bg-transparent"
                            />
                            <input
                              type="text"
                              placeholder="횟수"
                              value={exercise.sets[index].reps}
                              onChange={(e) => updateSet(exercise.id, index, 'reps', e.target.value)}
                              className="w-full px-1 py-1 text-xs border border-gray-600 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none bg-transparent"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              placeholder="무게"
                              disabled
                              className="w-full px-1 py-1 text-xs border border-gray-600 rounded text-gray-600 bg-gray-800 cursor-not-allowed"
                            />
                            <input
                              type="text"
                              placeholder="횟수"
                              disabled
                              className="w-full px-1 py-1 text-xs border border-gray-600 rounded text-gray-600 bg-gray-800 cursor-not-allowed"
                            />
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center">
                      <Button
                        variant="solid"
                        onClick={() => addSet(exercise.id)}
                        disabled={exercise.sets.length >= 10}
                        className="h-[1.5rem] px-2 text-xs h-6"
                      >
                        세트추가
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
